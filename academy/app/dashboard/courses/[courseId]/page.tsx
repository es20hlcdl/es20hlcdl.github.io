import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { issueCertificateAction } from "./certificate-actions";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{
    courseId: string;
  }>;
};

export default async function StudentCoursePage({ params }: PageProps) {
  const { courseId } = await params;
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
        .select(
          "id, module_id, title, content, video_url, position, is_published, created_at",
        )
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
  const { data: progress, error: progressError } = lessonIds.length
    ? await supabase
        .from("lesson_progress")
        .select("id, user_id, lesson_id, completed, completed_at, created_at")
        .eq("user_id", user.id)
        .in("lesson_id", lessonIds)
    : { data: [], error: null };

  if (progressError) {
    console.error("Error loading student lesson progress", {
      message: progressError.message,
      details: progressError.details,
      hint: progressError.hint,
      code: progressError.code,
    });
  }

  const { data: certificate, error: certificateError } = await supabase
    .from("certificates")
    .select("id, code, issued_at")
    .eq("user_id", user.id)
    .eq("course_id", courseId)
    .maybeSingle();

  if (certificateError) {
    console.error("Error loading course certificate", {
      message: certificateError.message,
      details: certificateError.details,
      hint: certificateError.hint,
      code: certificateError.code,
    });
  }

  const lessonsByModule = new Map<string, typeof lessons>();
  lessons?.forEach((lesson) => {
    const current = lessonsByModule.get(lesson.module_id) ?? [];
    current.push(lesson);
    lessonsByModule.set(lesson.module_id, current);
  });
  const visibleModules =
    modules?.filter((module) => (lessonsByModule.get(module.id) ?? []).length > 0) ??
    [];

  const completedLessonIds = new Set(
    progress
      ?.filter((item) => item.completed)
      .map((item) => item.lesson_id) ?? [],
  );
  const completedCount = completedLessonIds.size;
  const totalLessons = lessons?.length ?? 0;
  const progressPercent =
    totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;
  const isCourseCompleted =
    totalLessons > 0 && completedCount === totalLessons;

  return (
    <section className="mx-auto max-w-5xl px-6 py-10">
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
            <span>
              Avance: {completedCount} de {totalLessons} lecciones
            </span>
            <span>{progressPercent}%</span>
          </div>
          <div className="h-2 rounded-full bg-slate-200">
            <div
              className="h-2 rounded-full bg-emerald-600"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
        {certificate ? (
          <div className="mt-5">
            <Link
              href={`/dashboard/certificates/${certificate.id}`}
              className="inline-flex items-center justify-center rounded-md bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800"
            >
              Ver certificado
            </Link>
          </div>
        ) : isCourseCompleted ? (
          <form action={issueCertificateAction} className="mt-5">
            <input type="hidden" name="course_id" value={courseId} />
            <button
              type="submit"
              className="rounded-md bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
            >
              Generar certificado
            </button>
          </form>
        ) : null}
      </div>

      <div className="space-y-5">
        {visibleModules.length > 0 ? (
          visibleModules.map((module) => {
            const moduleLessons = lessonsByModule.get(module.id) ?? [];

            return (
              <section
                key={module.id}
                className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="mb-4">
                  <h2 className="text-lg font-semibold text-slate-950">
                    {module.title}
                  </h2>
                  {module.description ? (
                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      {module.description}
                    </p>
                  ) : null}
                </div>

                <div className="divide-y divide-slate-200 rounded-lg border border-slate-200">
                  {moduleLessons.map((lesson) => {
                    const isCompleted = completedLessonIds.has(lesson.id);

                    return (
                      <div
                        key={lesson.id}
                        className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between"
                      >
                        <div>
                          <h3 className="font-semibold text-slate-950">
                            {lesson.title}
                          </h3>
                          <span
                            className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                              isCompleted
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {isCompleted ? "Completada" : "Pendiente"}
                          </span>
                        </div>
                        <Link
                          href={`/dashboard/courses/${courseId}/lessons/${lesson.id}`}
                          className="inline-flex items-center justify-center rounded-md bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
                        >
                          Abrir leccion
                        </Link>
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })
        ) : (
          <div className="rounded-lg border border-dashed border-slate-300 p-8 text-center text-slate-600">
            Este curso aún no tiene lecciones publicadas.
          </div>
        )}
      </div>
    </section>
  );
}
