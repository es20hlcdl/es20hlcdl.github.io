import Link from "next/link";

type AdminPageShellProps = {
  title: string;
  description?: string;
  children: React.ReactNode;
};

export function AdminPageShell({
  title,
  description,
  children,
}: AdminPageShellProps) {
  return (
    <section className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">
            Administracion
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-slate-950">
            {title}
          </h1>
          {description ? (
            <p className="mt-2 text-sm text-slate-600">{description}</p>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2 text-sm font-medium">
          <Link
            href="/dashboard/admin"
            className="rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-700 hover:bg-slate-50"
          >
            Admin
          </Link>
          <Link
            href="/dashboard/admin/courses"
            className="rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-700 hover:bg-slate-50"
          >
            Cursos
          </Link>
          <Link
            href="/dashboard/admin/enrollments"
            className="rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-700 hover:bg-slate-50"
          >
            Inscripciones
          </Link>
        </div>
      </div>
      {children}
    </section>
  );
}
