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
              />
            </Link>
          ))}
        </div>
    </CoursesPageShell>
  );
}
