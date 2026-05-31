import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { completeLessonAction } from "../../actions";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{
    courseId: string;
    lessonId: string;
  }>;
};

export default async function StudentLessonPage({ params }: PageProps) {
  const { courseId, lessonId } = await params;
  const lessonPath = `/dashboard/courses/${courseId}/lessons/${lessonId}`;
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
    .in("status", ["active", "completed"])
    .maybeSingle();

  if (enrollmentError) {
    console.error("Error loading lesson enrollment", {
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
    console.error("Error loading lesson modules", {
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
        .select(
          "id, module_id, title, content, video_url, position, is_published, created_at",
        )
        .in("module_id", moduleIds)
        .eq("is_published", true)
        .order("position", { ascending: true })
    : { data: [], error: null };

  if (lessonsError) {
    console.error("Error loading published lessons", {
      message: lessonsError.message,
      details: lessonsError.details,
      hint: lessonsError.hint,
      code: lessonsError.code,
    });
  }

  const orderedLessons =
    modules?.flatMap((module) =>
      (lessons ?? []).filter((lesson) => lesson.module_id === module.id),
    ) ?? [];
  const selectedLessonIndex = orderedLessons.findIndex(
    (lesson) => lesson.id === lessonId,
  );
  const selectedLesson =
    selectedLessonIndex >= 0 ? orderedLessons[selectedLessonIndex] : null;

  if (!selectedLesson) {
    notFound();
  }

  const selectedModule =
    modules?.find((module) => module.id === selectedLesson.module_id) ?? null;

  if (!selectedModule) {
    notFound();
  }

  const [{ data: materials, error: materialsError }, { data: progress, error: progressError }] =
    await Promise.all([
      supabase
        .from("lesson_materials")
        .select("id, lesson_id, title, material_url, material_type, created_at")
        .eq("lesson_id", selectedLesson.id),
      supabase
        .from("lesson_progress")
        .select("id, user_id, lesson_id, completed, completed_at, created_at")
        .eq("user_id", user.id)
        .eq("lesson_id", selectedLesson.id)
        .maybeSingle(),
    ]);

  if (materialsError) {
    console.error("Error loading lesson materials", {
      message: materialsError.message,
      details: materialsError.details,
      hint: materialsError.hint,
      code: materialsError.code,
    });
  }

  if (progressError) {
    console.error("Error loading lesson progress", {
      message: progressError.message,
      details: progressError.details,
      hint: progressError.hint,
      code: progressError.code,
    });
  }

  const previousLesson = orderedLessons[selectedLessonIndex - 1] ?? null;
  const nextLesson = orderedLessons[selectedLessonIndex + 1] ?? null;
  const isCompleted = progress?.completed ?? false;

  return (
    <section className="mx-auto max-w-5xl px-6 py-10">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">
            {course.title}
          </p>
          <p className="mt-3 text-sm font-semibold text-slate-500">
            {selectedModule.title}
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-950">
            {selectedLesson.title}
          </h1>
        </div>
        <Link
          href={`/dashboard/courses/${courseId}?lesson=${selectedLesson.id}`}
          className="inline-flex items-center justify-center rounded-md border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50"
        >
          Volver al curso
        </Link>
      </div>

      <article className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
              Estado
            </p>
            <p
              className={`mt-1 text-sm font-semibold ${
                isCompleted ? "text-emerald-700" : "text-slate-700"
              }`}
            >
              {isCompleted ? "Lección completada" : "Lección pendiente"}
            </p>
          </div>
          {!isCompleted ? (
            <form action={completeLessonAction}>
              <input type="hidden" name="course_id" value={courseId} />
              <input type="hidden" name="lesson_id" value={selectedLesson.id} />
              <input type="hidden" name="current_path" value={lessonPath} />
              <button
                type="submit"
                className="rounded-md bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
              >
                Marcar como completada
              </button>
            </form>
          ) : (
            <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700">
              Completada
            </span>
          )}
        </div>

        <div className="prose prose-slate max-w-none whitespace-pre-line text-sm leading-7 text-slate-700">
          {selectedLesson.content ??
            "Esta lección aún no tiene contenido textual."}
        </div>

        {selectedLesson.video_url ? (
          <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-4">
            <h2 className="font-semibold text-slate-950">Video</h2>
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

        <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-4">
          <h2 className="font-semibold text-slate-950">Materiales</h2>
          {materials && materials.length > 0 ? (
            <ul className="mt-3 space-y-2 text-sm">
              {materials.map((material) => (
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
          ) : (
            <p className="mt-3 text-sm text-slate-600">
              Esta lección aún no tiene materiales.
            </p>
          )}
        </div>
      </article>

      <nav className="mt-6 grid gap-3 md:grid-cols-2">
        {previousLesson ? (
          <Link
            href={`/dashboard/courses/${courseId}/lessons/${previousLesson.id}`}
            className="rounded-lg border border-slate-200 bg-white p-4 text-sm shadow-sm hover:bg-slate-50"
          >
            <span className="block font-semibold text-slate-500">
              Lección anterior
            </span>
            <span className="mt-1 block font-semibold text-slate-950">
              {previousLesson.title}
            </span>
          </Link>
        ) : (
          <div className="rounded-lg border border-dashed border-slate-200 p-4 text-sm text-slate-500">
            No hay lección anterior.
          </div>
        )}

        {nextLesson ? (
          <Link
            href={`/dashboard/courses/${courseId}/lessons/${nextLesson.id}`}
            className="rounded-lg border border-slate-200 bg-white p-4 text-right text-sm shadow-sm hover:bg-slate-50"
          >
            <span className="block font-semibold text-slate-500">
              Siguiente lección
            </span>
            <span className="mt-1 block font-semibold text-slate-950">
              {nextLesson.title}
            </span>
          </Link>
        ) : (
          <div className="rounded-lg border border-dashed border-slate-200 p-4 text-right text-sm text-slate-500">
            No hay siguiente lección.
          </div>
        )}
      </nav>
    </section>
  );
}
