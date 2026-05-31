import { redirect } from "next/navigation";
import Link from "next/link";
import { CourseCard } from "@/components/CourseCard";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type Enrollment = {
  id: string;
  course_id: string;
  status: string;
};

type CourseModule = {
  id: string;
  course_id: string;
};

type PublishedLesson = {
  id: string;
  module_id: string;
};

type LessonProgress = {
  lesson_id: string;
  completed: boolean;
};

type SupabaseError = {
  message: string;
  details: string | null;
  hint: string | null;
  code: string;
};

function logSupabaseError(context: string, error: SupabaseError) {
  console.error(context, {
    message: error.message,
    details: error.details,
    hint: error.hint,
    code: error.code,
  });
}

function CoursesPageShell({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <section className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">
          Dashboard
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-950">
          Mis cursos
        </h1>
      </div>
      {children}
    </section>
  );
}

function CoursesErrorMessage() {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-5 text-sm text-red-700">
      No se pudieron cargar tus cursos. Inténtalo nuevamente en unos minutos.
    </div>
  );
}

function EmptyCoursesMessage() {
  return (
    <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center text-slate-600">
      Todavía no tienes cursos inscritos.
    </div>
  );
}

export default async function MyCoursesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: enrollments, error: enrollmentsError } = await supabase
    .from("enrollments")
    .select("id, course_id, status")
    .eq("user_id", user.id)
    .returns<Enrollment[]>();

  if (enrollmentsError) {
    logSupabaseError("Error loading user enrollments", enrollmentsError);
    return (
      <CoursesPageShell>
        <CoursesErrorMessage />
      </CoursesPageShell>
    );
  }

  const userEnrollments = enrollments ?? [];

  if (userEnrollments.length === 0) {
    return (
      <CoursesPageShell>
        <EmptyCoursesMessage />
      </CoursesPageShell>
    );
  }

  const courseIds = userEnrollments.map((enrollment) => enrollment.course_id);

  const { data: courses, error: coursesError } = await supabase
    .from("courses")
    .select("id, title, description")
    .in("id", courseIds);

  if (coursesError) {
    logSupabaseError("Error loading enrolled courses", coursesError);
    return (
      <CoursesPageShell>
        <CoursesErrorMessage />
      </CoursesPageShell>
    );
  }

  const { data: modules, error: modulesError } = await supabase
    .from("course_modules")
    .select("id, course_id")
    .in("course_id", courseIds)
    .returns<CourseModule[]>();

  if (modulesError) {
    logSupabaseError("Error loading enrolled course modules", modulesError);
    return (
      <CoursesPageShell>
        <CoursesErrorMessage />
      </CoursesPageShell>
    );
  }

  const moduleIds = modules?.map((module) => module.id) ?? [];
  const { data: lessons, error: lessonsError } = moduleIds.length
    ? await supabase
        .from("lessons")
        .select("id, module_id")
        .in("module_id", moduleIds)
        .eq("is_published", true)
        .returns<PublishedLesson[]>()
    : { data: [], error: null };

  if (lessonsError) {
    logSupabaseError("Error loading enrolled course lessons", lessonsError);
    return (
      <CoursesPageShell>
        <CoursesErrorMessage />
      </CoursesPageShell>
    );
  }

  const moduleCourseById = new Map(
    modules?.map((module) => [module.id, module.course_id]) ?? [],
  );
  const lessonsByCourse = new Map<string, PublishedLesson[]>();
  lessons?.forEach((lesson) => {
    const courseId = moduleCourseById.get(lesson.module_id);

    if (!courseId) {
      return;
    }

    const current = lessonsByCourse.get(courseId) ?? [];
    current.push(lesson);
    lessonsByCourse.set(courseId, current);
  });

  const lessonIds = lessons?.map((lesson) => lesson.id) ?? [];
  const { data: progress, error: progressError } = lessonIds.length
    ? await supabase
        .from("lesson_progress")
        .select("lesson_id, completed")
        .eq("user_id", user.id)
        .in("lesson_id", lessonIds)
        .returns<LessonProgress[]>()
    : { data: [], error: null };

  if (progressError) {
    logSupabaseError("Error loading enrolled course progress", progressError);
    return (
      <CoursesPageShell>
        <CoursesErrorMessage />
      </CoursesPageShell>
    );
  }

  const completedLessonIds = new Set(
    progress
      ?.filter((item) => item.completed)
      .map((item) => item.lesson_id) ?? [],
  );
  const progressByCourse = new Map<
    string,
    {
      totalPublishedLessons: number;
      completedLessons: number;
      progressPercent: number;
    }
  >();

  courseIds.forEach((courseId) => {
    const courseLessons = lessonsByCourse.get(courseId) ?? [];
    const totalPublishedLessons = courseLessons.length;
    const completedLessons = courseLessons.filter((lesson) =>
      completedLessonIds.has(lesson.id),
    ).length;
    const progressPercent =
      totalPublishedLessons > 0
        ? Math.round((completedLessons / totalPublishedLessons) * 100)
        : 0;

    progressByCourse.set(courseId, {
      totalPublishedLessons,
      completedLessons,
      progressPercent,
    });
  });

  const courseById = new Map(
    courses?.map((course) => [
      course.id,
      {
        title: course.title,
        description: course.description,
      },
    ]) ?? [],
  );

  const visibleEnrollments = userEnrollments
    .map((enrollment) => ({
      ...enrollment,
      course: courseById.get(enrollment.course_id) ?? null,
    }))
    .filter((enrollment) => enrollment.course);

  if (visibleEnrollments.length === 0) {
    console.error("Enrolled courses are missing or blocked by RLS", {
      courseIds,
      userId: user.id,
    });
    return (
      <CoursesPageShell>
        <CoursesErrorMessage />
      </CoursesPageShell>
    );
  }

  return (
    <CoursesPageShell>
        <div className="grid gap-4 md:grid-cols-2">
          {visibleEnrollments.map((enrollment) => (
            <Link
              key={enrollment.id}
              href={`/dashboard/courses/${enrollment.course_id}`}
              className="block"
            >
              <CourseCard
                title={enrollment.course?.title ?? "Curso"}
                description={enrollment.course?.description ?? null}
                status={enrollment.status}
                totalPublishedLessons={
                  progressByCourse.get(enrollment.course_id)
                    ?.totalPublishedLessons ?? 0
                }
                completedLessons={
                  progressByCourse.get(enrollment.course_id)?.completedLessons ??
                  0
                }
                progressPercent={
                  progressByCourse.get(enrollment.course_id)?.progressPercent ??
                  0
                }
              />
            </Link>
          ))}
        </div>
    </CoursesPageShell>
  );
}
