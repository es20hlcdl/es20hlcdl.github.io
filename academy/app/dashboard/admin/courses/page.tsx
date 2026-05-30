import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { CourseForm } from "@/components/admin/CourseForm";
import { UnauthorizedAdmin } from "@/components/admin/UnauthorizedAdmin";
import { getAdminAuth } from "@/lib/auth/admin";
import { toggleCoursePublishAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminCoursesPage() {
  const auth = await getAdminAuth();

  if (!auth.isAdmin) {
    return <UnauthorizedAdmin />;
  }

  const { data: courses, error } = await auth.supabase
    .from("courses")
    .select("id, title, description, is_published, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error loading admin courses", {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    });
  }

  return (
    <AdminPageShell
      title="Gestionar cursos"
      description="Crea, edita y cambia el estado de publicacion."
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(280px,360px)_1fr]">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-950">
            Nuevo curso
          </h2>
          <CourseForm />
        </div>

        <div className="space-y-4">
          {error ? (
            <div className="rounded-lg border border-red-200 bg-red-50 p-5 text-sm text-red-700">
              No se pudieron cargar los cursos.
            </div>
          ) : null}

          {!error && courses?.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center text-slate-600">
              Todavia no hay cursos creados.
            </div>
          ) : null}

          {courses?.map((course) => (
            <article
              key={course.id}
              className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-slate-950">
                    {course.title}
                  </h2>
                  <p className="mt-1 text-xs text-slate-500">
                    {course.is_published ? "Publicado" : "Borrador"}
                  </p>
                </div>
                <form action={toggleCoursePublishAction}>
                  <input type="hidden" name="id" value={course.id} />
                  <input
                    type="hidden"
                    name="is_published"
                    value={String(course.is_published)}
                  />
                  <button
                    type="submit"
                    className="rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    {course.is_published ? "Despublicar" : "Publicar"}
                  </button>
                </form>
              </div>
              <CourseForm course={course} />
            </article>
          ))}
        </div>
      </div>
    </AdminPageShell>
  );
}
