import { notFound } from "next/navigation";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import DeleteMaterialButton from "@/components/admin/DeleteMaterialButton";
import { LessonForm } from "@/components/admin/LessonForm";
import { MaterialForm } from "@/components/admin/MaterialForm";
import { UnauthorizedAdmin } from "@/components/admin/UnauthorizedAdmin";
import { getAdminAuth } from "@/lib/auth/admin";
import {
  deleteMaterialAction,
  toggleLessonPublishAction,
  updateMaterialAction,
} from "./actions";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{
    moduleId: string;
  }>;
};

export default async function AdminModuleLessonsPage({ params }: PageProps) {
  const { moduleId } = await params;
  const auth = await getAdminAuth();

  if (!auth.isAdmin) {
    return <UnauthorizedAdmin />;
  }

  const { data: module } = await auth.supabase
    .from("course_modules")
    .select("id, course_id, title, description, position, created_at")
    .eq("id", moduleId)
    .maybeSingle();

  if (!module) {
    notFound();
  }

  const { data: lessons, error: lessonsError } = await auth.supabase
    .from("lessons")
    .select(
      "id, module_id, title, content, video_url, position, is_published, created_at",
    )
    .eq("module_id", moduleId)
    .order("position", { ascending: true });

  if (lessonsError) {
    console.error("Error loading lessons", {
      message: lessonsError.message,
      details: lessonsError.details,
      hint: lessonsError.hint,
      code: lessonsError.code,
    });
  }

  const lessonIds = lessons?.map((lesson) => lesson.id) ?? [];
  const { data: materials, error: materialsError } = lessonIds.length
    ? await auth.supabase
        .from("lesson_materials")
        .select("id, lesson_id, title, material_url, material_type, created_at")
        .in("lesson_id", lessonIds)
        .order("created_at", { ascending: true })
    : { data: [], error: null };

  if (materialsError) {
    console.error("Error loading lesson materials", {
      message: materialsError.message,
      details: materialsError.details,
      hint: materialsError.hint,
      code: materialsError.code,
    });
  }

  const materialsByLesson = new Map<string, typeof materials>();

  materials?.forEach((material) => {
    const current = materialsByLesson.get(material.lesson_id) ?? [];
    current.push(material);
    materialsByLesson.set(material.lesson_id, current);
  });

  return (
    <AdminPageShell
      title={`Lecciones: ${module.title}`}
      description="Crea contenido, video y materiales externos."
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(280px,380px)_1fr]">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-950">
            Nueva leccion
          </h2>
          <LessonForm moduleId={moduleId} />
        </div>

        <div className="space-y-4">
          {lessonsError || materialsError ? (
            <div className="rounded-lg border border-red-200 bg-red-50 p-5 text-sm text-red-700">
              No se pudieron cargar las lecciones.
            </div>
          ) : null}

          {!lessonsError && lessons?.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center text-slate-600">
              Todavia no hay lecciones creadas.
            </div>
          ) : null}

          {lessons?.map((lesson) => (
            <article
              key={lesson.id}
              className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                    Posicion {lesson.position} ·{" "}
                    {lesson.is_published ? "Publicada" : "Borrador"}
                  </p>
                  <h2 className="mt-1 text-lg font-semibold text-slate-950">
                    {lesson.title}
                  </h2>
                </div>
                <form action={toggleLessonPublishAction}>
                  <input type="hidden" name="id" value={lesson.id} />
                  <input type="hidden" name="module_id" value={moduleId} />
                  <input
                    type="hidden"
                    name="is_published"
                    value={String(lesson.is_published)}
                  />
                  <button
                    type="submit"
                    className="rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    {lesson.is_published ? "Despublicar" : "Publicar"}
                  </button>
                </form>
              </div>

              <LessonForm moduleId={moduleId} lesson={lesson} />

              <div className="mt-5 border-t border-slate-200 pt-4">
                <h3 className="text-sm font-semibold text-slate-950">
                  Materiales
                </h3>
                {(materialsByLesson.get(lesson.id) ?? []).length > 0 ? (
                  <ul className="mt-3 space-y-3 text-sm">
                    {(materialsByLesson.get(lesson.id) ?? []).map(
                      (material) => (
                        <li
                          key={material.id}
                          className="rounded-md border border-slate-200 bg-slate-50 p-3"
                        >
                          <div className="mb-3 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                            <p className="font-semibold text-slate-950">
                              {material.title}
                            </p>
                            <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                              {material.material_type}
                            </span>
                            <a
                              href={material.material_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm font-semibold text-slate-950 underline"
                            >
                              Abrir material
                            </a>
                          </div>

                          <div className="grid gap-3 lg:grid-cols-[1fr_auto]">
                            <form
                              action={updateMaterialAction}
                              className="grid gap-3 md:grid-cols-[1fr_1fr_140px_auto]"
                            >
                              <input
                                type="hidden"
                                name="material_id"
                                value={material.id}
                              />
                              <input
                                type="hidden"
                                name="current_path"
                                value={`/dashboard/admin/modules/${moduleId}/lessons`}
                              />
                              <label className="grid gap-1 text-sm font-medium text-slate-700">
                                Título
                                <input
                                  name="title"
                                  required
                                  defaultValue={material.title}
                                  className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-normal outline-none focus:border-slate-950"
                                />
                              </label>
                              <label className="grid gap-1 text-sm font-medium text-slate-700">
                                URL
                                <input
                                  name="material_url"
                                  type="url"
                                  required
                                  defaultValue={material.material_url}
                                  className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-normal outline-none focus:border-slate-950"
                                />
                              </label>
                              <label className="grid gap-1 text-sm font-medium text-slate-700">
                                Tipo
                                <select
                                  name="material_type"
                                  required
                                  defaultValue={material.material_type}
                                  className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-normal outline-none focus:border-slate-950"
                                >
                                  <option value="link">link</option>
                                  <option value="pdf">pdf</option>
                                  <option value="video">video</option>
                                  <option value="document">document</option>
                                  <option value="other">other</option>
                                </select>
                              </label>
                              <button
                                type="submit"
                                className="self-end rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-white"
                              >
                                Guardar material
                              </button>
                            </form>
                            <form action={deleteMaterialAction}>
                              <input
                                type="hidden"
                                name="material_id"
                                value={material.id}
                              />
                              <input
                                type="hidden"
                                name="current_path"
                                value={`/dashboard/admin/modules/${moduleId}/lessons`}
                              />
                              <DeleteMaterialButton />
                            </form>
                          </div>
                        </li>
                      ),
                    )}
                  </ul>
                ) : (
                  <p className="mt-3 rounded-md border border-dashed border-slate-300 p-3 text-sm text-slate-600">
                    Esta lección aún no tiene materiales.
                  </p>
                )}
                <MaterialForm moduleId={moduleId} lessonId={lesson.id} />
              </div>
            </article>
          ))}
        </div>
      </div>
    </AdminPageShell>
  );
}
