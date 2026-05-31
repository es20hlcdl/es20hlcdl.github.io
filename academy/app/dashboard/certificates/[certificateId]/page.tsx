import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { PrintButton } from "@/components/PrintButton";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{
    certificateId: string;
  }>;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(value));
}

export default async function CertificatePage({ params }: PageProps) {
  const { certificateId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: certificate, error } = await supabase
    .from("certificates")
    .select(
      "id, user_id, course_id, code, student_name_snapshot, course_title_snapshot, issued_at",
    )
    .eq("id", certificateId)
    .maybeSingle();

  if (error) {
    console.error("Error loading certificate", {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    });
  }

  if (!certificate) {
    notFound();
  }

  return (
    <section className="mx-auto max-w-4xl px-6 py-10">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href={`/dashboard/courses/${certificate.course_id}`}
          className="text-sm font-semibold text-slate-700 underline"
        >
          Volver al curso
        </Link>
        <PrintButton />
      </div>

      <article className="rounded-lg border border-slate-200 bg-white p-8 text-center shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">
          Certificado valido
        </p>
        <h1 className="mt-4 text-3xl font-semibold text-slate-950">
          Certificado de finalizacion
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-sm leading-7 text-slate-600">
          Se certifica que
        </p>
        <p className="mt-2 text-2xl font-semibold text-slate-950">
          {certificate.student_name_snapshot ?? "Estudiante"}
        </p>
        <p className="mx-auto mt-6 max-w-2xl text-sm leading-7 text-slate-600">
          completo satisfactoriamente el curso
        </p>
        <p className="mt-2 text-xl font-semibold text-slate-950">
          {certificate.course_title_snapshot ?? "Curso"}
        </p>

        <dl className="mt-8 grid gap-4 rounded-lg border border-slate-200 bg-slate-50 p-5 text-left sm:grid-cols-3">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
              Fecha
            </dt>
            <dd className="mt-1 text-sm font-semibold text-slate-950">
              {formatDate(certificate.issued_at)}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
              Codigo
            </dt>
            <dd className="mt-1 break-all text-sm font-semibold text-slate-950">
              {certificate.code}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
              Estado
            </dt>
            <dd className="mt-1 text-sm font-semibold text-emerald-700">
              Valido
            </dd>
          </div>
        </dl>
      </article>
    </section>
  );
}
