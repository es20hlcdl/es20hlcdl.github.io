import Link from "next/link";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { UnauthorizedAdmin } from "@/components/admin/UnauthorizedAdmin";
import { getAdminAuth } from "@/lib/auth/admin";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const auth = await getAdminAuth();

  if (!auth.isAdmin) {
    return <UnauthorizedAdmin />;
  }

  const displayName =
    auth.profile?.full_name ?? auth.profile?.email ?? auth.user.email ?? "Admin";

  return (
    <AdminPageShell
      title={`Hola, ${displayName}`}
      description="Panel basico para administrar cursos e inscripciones."
    >
      <div className="grid gap-4 md:grid-cols-2">
        <Link
          href="/dashboard/admin/courses"
          className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm hover:border-slate-300"
        >
          <h2 className="text-lg font-semibold text-slate-950">
            Gestionar cursos
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Crear, editar y publicar cursos de la plataforma.
          </p>
        </Link>
        <Link
          href="/dashboard/admin/enrollments"
          className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm hover:border-slate-300"
        >
          <h2 className="text-lg font-semibold text-slate-950">
            Gestionar inscripciones
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Inscribir estudiantes manualmente y revisar estados.
          </p>
        </Link>
      </div>
    </AdminPageShell>
  );
}
