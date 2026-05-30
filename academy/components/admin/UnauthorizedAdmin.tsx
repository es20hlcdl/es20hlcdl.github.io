import Link from "next/link";

export function UnauthorizedAdmin() {
  return (
    <section className="mx-auto max-w-3xl px-6 py-16">
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-6">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-700">
          Acceso no autorizado
        </p>
        <h1 className="mt-3 text-2xl font-semibold text-slate-950">
          No tienes permisos para entrar al panel administrador.
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-700">
          Esta seccion esta reservada para usuarios con rol admin.
        </p>
        <Link
          href="/dashboard"
          className="mt-5 inline-flex rounded-md bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
        >
          Volver al dashboard
        </Link>
      </div>
    </section>
  );
}
