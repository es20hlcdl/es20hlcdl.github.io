import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { ModuleForm } from "@/components/admin/ModuleForm";
import { UnauthorizedAdmin } from "@/components/admin/UnauthorizedAdmin";
import { getAdminAuth } from "@/lib/auth/admin";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{
    courseId: string;
  }>;
};

export default async function AdminCourseModulesPage({ params }: PageProps) {
  const { courseId } = await params;
  const auth = await getAdminAuth();

  if (!auth.isAdmin) {
    return <UnauthorizedAdmin />;
  }

  const { data: course } = await auth.supabase
    .from("courses")
    .select("id, title, description, is_published, created_at")
    .eq("id", courseId)
    .maybeSingle();

  if (!course) {
    notFound();
  }

  const { data: modules, error } = await auth.supabase
    .from("course_modules")
    .select("id, course_id, title, description, position, created_at")
    .eq("course_id", courseId)
    .order("position", { ascending: true });

  if (error) {
    console.error("Error loading modules", {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    });
  }

  const moduleIds = modules?.map((module) => module.id) ?? [];
  const { data: lessons, error: lessonsError } = moduleIds.length
    ? await auth.supabase
        .from("lessons")
        .select("module_id, is_published")
        .in("module_id", moduleIds)
    : { data: [], error: null };

  if (lessonsError) {
    console.error("Error loading module lesson visibility", {
      message: lessonsError.message,
      details: lessonsError.details,
      hint: lessonsError.hint,
      code: lessonsError.code,
    });
  }

  const lessonStatsByModule = new Map<
    string,
    { totalLessons: number; publishedLessons: number }
  >();

  lessons?.forEach((lesson) => {
    const current = lessonStatsByModule.get(lesson.module_id) ?? {
      totalLessons: 0,
      publishedLessons: 0,
    };

    lessonStatsByModule.set(lesson.module_id, {
      totalLessons: current.totalLessons + 1,
      publishedLessons:
        current.publishedLessons + (lesson.is_published ? 1 : 0),
    });
  });

  const nextModulePosition =
    Math.max(0, ...(modules?.map((module) => module.position) ?? [])) + 1;

  return (
    <AdminPageShell
      title={`Modulos: ${course.title}`}
      description="Crea y ordena modulos del curso."
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(280px,360px)_1fr]">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-950">
            Nuevo modulo
          </h2>
          <p className="mb-4 text-sm leading-6 text-slate-600">
            El orden define la secuencia academica del curso.
          </p>
          <ModuleForm courseId={courseId} defaultPosition={nextModulePosition} />
        </div>

        <div className="space-y-4">
          {error ? (
            <div className="rounded-lg border border-red-200 bg-red-50 p-5 text-sm text-red-700">
              No se pudieron cargar los modulos.
            </div>
          ) : null}

          {lessonsError ? (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800">
              No se pudo calcular la visibilidad de los modulos.
            </div>
          ) : null}

          {!error && modules?.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center text-slate-600">
              Todavia no hay modulos creados.
            </div>
          ) : null}

          {modules?.map((module) => {
            const stats = lessonStatsByModule.get(module.id) ?? {
              totalLessons: 0,
              publishedLessons: 0,
            };
            const isVisibleToStudent = stats.publishedLessons > 0;
            const lessonCountText =
              stats.totalLessons > 0
                ? `${stats.publishedLessons} lecciones publicadas de ${stats.totalLessons}`
                : "0 lecciones publicadas";

            return (
              <article
                key={module.id}
                className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                      Orden {module.position}
                    </p>
                    <h2 className="mt-1 text-lg font-semibold text-slate-950">
                      {module.title}
                    </h2>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          isVisibleToStudent
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {isVisibleToStudent
                          ? "Visible al estudiante"
                          : "Oculto al estudiante"}
                      </span>
                      <span className="text-sm text-slate-600">
                        {lessonCountText}
                      </span>
                    </div>
                  </div>
                  <Link
                    href={`/dashboard/admin/modules/${module.id}/lessons`}
                    className="rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Ver lecciones
                  </Link>
                </div>
                <ModuleForm
                  courseId={courseId}
                  module={module}
                  defaultPosition={nextModulePosition}
                />
              </article>
            );
          })}
        </div>
      </div>
    </AdminPageShell>
  );
}
