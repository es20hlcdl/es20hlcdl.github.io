import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { EnrollmentForm } from "@/components/admin/EnrollmentForm";
import { EnrollmentStatusForm } from "@/components/admin/EnrollmentStatusForm";
import { UnauthorizedAdmin } from "@/components/admin/UnauthorizedAdmin";
import { getAdminAuth } from "@/lib/auth/admin";
import type { Database } from "@/types/database.types";

export const dynamic = "force-dynamic";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type Course = Database["public"]["Tables"]["courses"]["Row"];
type Enrollment = Database["public"]["Tables"]["enrollments"]["Row"];
type StudentProfile = Pick<Profile, "id" | "email" | "full_name" | "role">;
type CourseModule = Pick<
  Database["public"]["Tables"]["course_modules"]["Row"],
  "id" | "course_id"
>;
type PublishedLesson = Pick<
  Database["public"]["Tables"]["lessons"]["Row"],
  "id" | "module_id"
>;
type LessonProgress = Pick<
  Database["public"]["Tables"]["lesson_progress"]["Row"],
  "user_id" | "lesson_id" | "completed"
>;

function logAdminError(context: string, error: {
  message: string;
  details: string | null;
  hint: string | null;
  code: string;
}) {
  console.error(context, {
    message: error.message,
    details: error.details,
    hint: error.hint,
    code: error.code,
  });
}

export default async function AdminEnrollmentsPage() {
  const auth = await getAdminAuth();

  if (!auth.isAdmin) {
    return <UnauthorizedAdmin />;
  }

  const [profilesResult, coursesResult, enrollmentsResult] = await Promise.all([
    auth.supabase
      .from("profiles")
      .select("id, email, full_name, role")
      .eq("role", "student")
      .returns<StudentProfile[]>(),
    auth.supabase
      .from("courses")
      .select("id, title, description, is_published, created_at")
      .eq("is_published", true)
      .order("created_at", { ascending: false })
      .returns<Course[]>(),
    auth.supabase
      .from("enrollments")
      .select("id, user_id, course_id, status, enrolled_at")
      .order("enrolled_at", { ascending: false })
      .returns<Enrollment[]>(),
  ]);

  if (profilesResult.error) {
    logAdminError("Error loading admin student profiles", profilesResult.error);
  }

  if (coursesResult.error) {
    logAdminError("Error loading admin published courses", coursesResult.error);
  }

  if (enrollmentsResult.error) {
    logAdminError("Error loading admin enrollments", enrollmentsResult.error);
  }

  const students = profilesResult.data ?? [];
  const courses = coursesResult.data ?? [];
  const enrollments = enrollmentsResult.data ?? [];
  const studentById = new Map(students.map((student) => [student.id, student]));
  const courseById = new Map(courses.map((course) => [course.id, course]));
  let hasError = Boolean(
    profilesResult.error || coursesResult.error || enrollmentsResult.error,
  );

  const courseIds = Array.from(
    new Set(enrollments.map((enrollment) => enrollment.course_id)),
  );
  const userIds = Array.from(
    new Set(enrollments.map((enrollment) => enrollment.user_id)),
  );

  const { data: modules, error: modulesError } = courseIds.length
    ? await auth.supabase
        .from("course_modules")
        .select("id, course_id")
        .in("course_id", courseIds)
        .returns<CourseModule[]>()
    : { data: [], error: null };

  if (modulesError) {
    logAdminError("Error loading enrollment course modules", modulesError);
    hasError = true;
  }

  const courseModules = modules ?? [];
  const moduleIds = courseModules.map((module) => module.id);
  const { data: lessons, error: lessonsError } = moduleIds.length
    ? await auth.supabase
        .from("lessons")
        .select("id, module_id")
        .in("module_id", moduleIds)
        .eq("is_published", true)
        .returns<PublishedLesson[]>()
    : { data: [], error: null };

  if (lessonsError) {
    logAdminError("Error loading enrollment published lessons", lessonsError);
    hasError = true;
  }

  const moduleCourseById = new Map(
    courseModules.map((module) => [module.id, module.course_id]),
  );
  const publishedLessons = lessons ?? [];
  const lessonsByCourse = new Map<string, PublishedLesson[]>();
  const lessonCourseById = new Map<string, string>();

  publishedLessons.forEach((lesson) => {
    const courseId = moduleCourseById.get(lesson.module_id);

    if (!courseId) {
      return;
    }

    const current = lessonsByCourse.get(courseId) ?? [];
    current.push(lesson);
    lessonsByCourse.set(courseId, current);
    lessonCourseById.set(lesson.id, courseId);
  });

  const publishedLessonIds = publishedLessons.map((lesson) => lesson.id);
  const { data: lessonProgress, error: lessonProgressError } =
    publishedLessonIds.length && userIds.length
      ? await auth.supabase
          .from("lesson_progress")
          .select("user_id, lesson_id, completed")
          .in("user_id", userIds)
          .in("lesson_id", publishedLessonIds)
          .eq("completed", true)
          .returns<LessonProgress[]>()
      : { data: [], error: null };

  if (lessonProgressError) {
    console.error("lessonProgressError", lessonProgressError);
    logAdminError("Error loading enrollment lesson progress", lessonProgressError);
    hasError = true;
  }

  const completedLessonsByEnrollment = new Map<string, Set<string>>();

  lessonProgress?.forEach((item) => {
    if (!item.completed) {
      return;
    }

    const courseId = lessonCourseById.get(item.lesson_id);

    if (!courseId) {
      return;
    }

    const enrollmentKey = `${item.user_id}:${courseId}`;
    const completedLessons =
      completedLessonsByEnrollment.get(enrollmentKey) ?? new Set<string>();

    completedLessons.add(item.lesson_id);
    completedLessonsByEnrollment.set(enrollmentKey, completedLessons);
  });

  return (
    <AdminPageShell
      title="Gestionar inscripciones"
      description="Inscribe estudiantes manualmente y actualiza estados."
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(280px,360px)_1fr]">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-950">
            Nueva inscripcion
          </h2>
          <EnrollmentForm
            students={students.map((student) => ({
              id: student.id,
              label: [student.full_name, student.email]
                .filter(Boolean)
                .join(" - "),
            }))}
            courses={courses.map((course) => ({
              id: course.id,
              title: course.title,
            }))}
          />
          {!profilesResult.error && students.length === 0 ? (
            <p className="mt-4 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">
              No hay estudiantes disponibles para inscribir.
            </p>
          ) : null}
          <p className="mt-4 text-xs leading-5 text-slate-500">
            El estado inactive no existe en el enum actual. Se usan active,
            completed y cancelled.
          </p>
        </div>

        <div className="space-y-4">
          {hasError ? (
            <div className="rounded-lg border border-red-200 bg-red-50 p-5 text-sm text-red-700">
              No se pudieron cargar todos los datos de inscripciones.
            </div>
          ) : null}

          {!hasError && enrollments.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center text-slate-600">
              Todavia no hay inscripciones.
            </div>
          ) : null}

          {enrollments.map((enrollment) => {
            const student = studentById.get(enrollment.user_id);
            const course = courseById.get(enrollment.course_id);
            const courseLessons = lessonsByCourse.get(enrollment.course_id) ?? [];
            const totalPublishedLessons = courseLessons.length;
            const enrollmentProgressKey = `${enrollment.user_id}:${enrollment.course_id}`;
            const completedLessons =
              completedLessonsByEnrollment.get(enrollmentProgressKey)?.size ?? 0;
            const progressPercent =
              totalPublishedLessons > 0
                ? Math.round((completedLessons / totalPublishedLessons) * 100)
                : 0;

            return (
              <article
                key={enrollment.id}
                className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="mb-4 grid gap-3 md:grid-cols-2">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                      Estudiante
                    </p>
                    <h2 className="mt-1 font-semibold text-slate-950">
                      {student?.full_name ??
                        enrollment.user_id}
                    </h2>
                    {student?.email ? (
                      <p className="mt-1 text-sm text-slate-600">
                        {student.email}
                      </p>
                    ) : null}
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                      Curso
                    </p>
                    <h3 className="mt-1 font-semibold text-slate-950">
                      {course?.title ?? enrollment.course_id}
                    </h3>
                  </div>
                </div>
                <EnrollmentStatusForm
                  id={enrollment.id}
                  status={enrollment.status}
                />
                <div className="mt-5 border-t border-slate-200 pt-4">
                  {totalPublishedLessons > 0 ? (
                    <>
                      <div className="mb-2 flex justify-between gap-4 text-sm font-medium text-slate-700">
                        <span>
                          Avance: {completedLessons} de {totalPublishedLessons}{" "}
                          lecciones
                        </span>
                        <span>{progressPercent}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-200">
                        <div
                          className="h-2 rounded-full bg-emerald-600"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    </>
                  ) : (
                    <p className="rounded-md border border-dashed border-slate-300 p-3 text-sm text-slate-600">
                      Este curso aún no tiene lecciones publicadas.
                    </p>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </AdminPageShell>
  );
}
