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
  const hasError = Boolean(
    profilesResult.error || coursesResult.error || enrollmentsResult.error,
  );

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
              </article>
            );
          })}
        </div>
      </div>
    </AdminPageShell>
  );
}
