import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{
    code: string;
  }>;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(value));
}

export default async function VerifyCertificatePage({ params }: PageProps) {
  const { code } = await params;
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("verify_certificate", {
    certificate_code: code,
  });
  const certificate = data?.[0] ?? null;

  if (error) {
    console.error("Error verifying certificate", {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    });
  }

  return (
    <section className="mx-auto max-w-3xl px-6 py-10">
      <div className="rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">
          Verificacion de certificado
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-950">
          {certificate ? "Certificado valido" : "Certificado no valido"}
        </h1>

        {certificate ? (
          <dl className="mt-6 grid gap-4 rounded-lg border border-slate-200 bg-slate-50 p-5">
            <div>
              <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                Curso
              </dt>
              <dd className="mt-1 font-semibold text-slate-950">
                {certificate.course_title ?? "Curso"}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                Fecha de emision
              </dt>
              <dd className="mt-1 font-semibold text-slate-950">
                {formatDate(certificate.issued_at)}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                Codigo
              </dt>
              <dd className="mt-1 break-all font-semibold text-slate-950">
                {certificate.code}
              </dd>
            </div>
          </dl>
        ) : (
          <p className="mt-6 rounded-lg border border-dashed border-slate-300 p-5 text-sm text-slate-600">
            No encontramos un certificado emitido con este codigo.
          </p>
        )}

        <Link
          href="/"
          className="mt-6 inline-flex rounded-md border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          Volver
        </Link>
      </div>
    </section>
  );
}
