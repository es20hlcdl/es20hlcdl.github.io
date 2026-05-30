import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { completeLessonAction } from "./actions";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{
    courseId: string;
  }>;
  searchParams: Promise<{
    lesson?: string;
  }>;
};

export default async function StudentCoursePage({
  params,
  searchParams,
}: PageProps) {
  const { courseId } = await params;
  const { lesson: selectedLessonId } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: enrollment, error: enrollmentError } = await supabase
    .from("enrollments")
    .select("id, user_id, course_id, status, enrolled_at")
    .eq("user_id", user.id)
    .eq("course_id", courseId)
    .eq("status", "active")
    .maybeSingle();

  if (enrollmentError) {
    console.error("Error loading course enrollment", {
      message: enrollmentError.message,
      details: enrollmentError.details,
      hint: enrollmentError.hint,
      code: enrollmentError.code,
    });
  }

  if (!enrollment) {
    notFound();
  }

  const { data: course } = await supabase
    .from("courses")
    .select("id, title, description, is_published, created_at")
    .eq("id", courseId)
    .maybeSingle();

  if (!course) {
    notFound();
  }

  const { data: modules, error: modulesError } = await supabase
    .from("course_modules")
    .select("id, course_id, title, description, position, created_at")
    .eq("course_id", courseId)
    .order("position", { ascending: true });

  if (modulesError) {
    console.error("Error loading student course modules", {
      message: modulesError.message,
      details: modulesError.details,
      hint: modulesError.hint,
      code: modulesError.code,
    });
  }

  const moduleIds = modules?.map((module) => module.id) ?? [];
  const { data: lessons, error: lessonsError } = moduleIds.length
    ? await supabase
        .from("lessons")
        .select("id, module_id, title, content, video_url, position, is_published, created_at")
        .in("module_id", moduleIds)
        .eq("is_published", true)
        .order("position", { ascending: true })
    : { data: [], error: null };

  if (lessonsError) {
    console.error("Error loading student course lessons", {
      message: lessonsError.message,
      details: lessonsError.details,
      hint: lessonsError.hint,
      code: lessonsError.code,
    });
  }

  const lessonIds = lessons?.map((lesson) => lesson.id) ?? [];
  const [{ data: materials, error: materialsError }, { data: progress, error: progressError }] =
    await Promise.all([
      lessonIds.length
        ? supabase
            .from("lesson_materials")
            .select("id, lesson_id, title, material_url, material_type, created_at")
            .in("lesson_id", lessonIds)
        : Promise.resolve({ data: [], error: null }),
      lessonIds.length
        ? supabase
            .from("lesson_progress")
            .select("id, user_id, lesson_id, completed, completed_at, created_at")
            .eq("user_id", user.id)
            .in("lesson_id", lessonIds)
        : Promise.resolve({ data: [], error: null }),
    ]);

  if (materialsError) {
    console.error("Error loading student lesson materials", {
      message: materialsError.message,
      details: materialsError.details,
      hint: materialsError.hint,
      code: materialsError.code,
    });
  }

  if (progressError) {
    console.error("Error loading student lesson progress", {
      message: progressError.message,
      details: progressError.details,
      hint: progressError.hint,
      code: progressError.code,
    });
  }

  const lessonsByModule = new Map<string, typeof lessons>();
  lessons?.forEach((lesson) => {
    const current = lessonsByModule.get(lesson.module_id) ?? [];
    current.push(lesson);
    lessonsByModule.set(lesson.module_id, current);
  });

  const materialsByLesson = new Map<string, typeof materials>();
  materials?.forEach((material) => {
    const current = materialsByLesson.get(material.lesson_id) ?? [];
    current.push(material);
    materialsByLesson.set(material.lesson_id, current);
  });

  const completedLessonIds = new Set(
    progress
      ?.filter((item) => item.completed)
      .map((item) => item.lesson_id) ?? [],
  );
  const completedCount = completedLessonIds.size;
  const totalLessons = lessons?.length ?? 0;
  const progressPercent =
    totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;
  const selectedLesson =
    lessons?.find((lesson) => lesson.id === selectedLessonId) ?? lessons?.[0] ?? null;
  const selectedMaterials = selectedLesson
    ? materialsByLesson.get(selectedLesson.id) ?? []
    : [];

  return (
    <section className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">
          Curso
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-950">
          {course.title}
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
          {course.description ?? "Sin descripcion disponible."}
        </p>
        <div className="mt-5">
          <div className="mb-2 flex justify-between text-sm font-medium text-slate-700">
            <span>Avance</span>
            <span>{progressPercent}%</span>
          </div>
          <div className="h-2 rounded-full bg-slate-200">
            <div
              className="h-2 rounded-full bg-emerald-600"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <aside className="space-y-4">
          {modules?.map((module) => (
            <div
              key={module.id}
              className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
            >
              <h2 className="font-semibold text-slate-950">{module.title}</h2>
              <div className="mt-3 space-y-2">
                {(lessonsByModule.get(module.id) ?? []).map((lesson) => (
                  <Link
                    key={lesson.id}
                    href={`/dashboard/courses/${courseId}?lesson=${lesson.id}`}
                    className={`block rounded-md border px-3 py-2 text-sm ${
                      selectedLesson?.id === lesson.id
                        ? "border-slate-950 bg-slate-950 text-white"
                        : "border-slate-200 text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {completedLessonIds.has(lesson.id) ? "Completada · " : ""}
                    {lesson.title}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </aside>

        <article className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          {selectedLesson ? (
            <>
              <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                    Leccion
                  </p>
                  <h2 className="mt-1 text-2xl font-semibold text-slate-950">
                    {selectedLesson.title}
                  </h2>
                </div>
                {!completedLessonIds.has(selectedLesson.id) ? (
                  <form action={completeLessonAction}>
                    <input type="hidden" name="course_id" value={courseId} />
                    <input
                      type="hidden"
                      name="lesson_id"
                      value={selectedLesson.id}
                    />
                    <button
                      type="submit"
                      className="rounded-md bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
                    >
                      Marcar completada
                    </button>
                  </form>
                ) : (
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700">
                    Completada
                  </span>
                )}
              </div>

              <div className="prose prose-slate max-w-none whitespace-pre-line text-sm leading-7 text-slate-700">
                {selectedLesson.content ?? "Esta leccion aun no tiene contenido textual."}
              </div>

              {selectedLesson.video_url ? (
                <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <h3 className="font-semibold text-slate-950">Video</h3>
                  <a
                    href={selectedLesson.video_url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-block text-sm font-semibold text-slate-950 underline"
                  >
                    Abrir video
                  </a>
                </div>
              ) : null}

              {selectedMaterials.length > 0 ? (
                <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <h3 className="font-semibold text-slate-950">Materiales</h3>
                  <ul className="mt-3 space-y-2 text-sm">
                    {selectedMaterials.map((material) => (
                      <li key={material.id}>
                        <a
                          href={material.material_url}
                          target="_blank"
                          rel="noreferrer"
                          className="font-semibold text-slate-950 underline"
                        >
                          {material.title}
                        </a>{" "}
                        <span className="text-slate-500">
                          ({material.material_type})
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </>
          ) : (
            <div className="rounded-lg border border-dashed border-slate-300 p-8 text-center text-slate-600">
              Este curso todavia no tiene lecciones publicadas.
            </div>
          )}
        </article>
      </div>
    </section>
  );
}
