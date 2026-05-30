import Link from "next/link";

export default function HomePage() {
  return (
    <section className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-6xl flex-col justify-center px-6 py-16">
      <div className="max-w-3xl">
        <p className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">
          Academy
        </p>
        <h1 className="text-4xl font-semibold tracking-tight text-slate-950 sm:text-6xl">
          Plataforma LMS base para cursos privados.
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-700">
          Inicio de sesión, registro y dashboard protegido con Supabase Auth.
          Esta app vive aislada de la web estática publicada en la raíz del
          repositorio.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/register"
            className="rounded-md bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Crear cuenta
          </Link>
          <Link
            href="/login"
            className="rounded-md border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-white"
          >
            Iniciar sesión
          </Link>
        </div>
      </div>
    </section>
  );
}
