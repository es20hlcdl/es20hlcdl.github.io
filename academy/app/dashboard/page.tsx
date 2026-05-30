import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, email, role")
    .eq("id", user.id)
    .maybeSingle();

  const displayName =
    profile?.full_name ?? profile?.email ?? user.email ?? "Usuario";

  return (
    <section className="mx-auto max-w-6xl px-6 py-10">
      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">
          Dashboard
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-950">
          Hola, {displayName}
        </h1>
        <p className="mt-3 text-slate-600">
          Rol actual:{" "}
          <span className="font-semibold text-slate-950">
            {profile?.role ?? "student"}
          </span>
        </p>
        <div className="mt-6">
          <Link
            href="/dashboard/courses"
            className="rounded-md bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Ver mis cursos
          </Link>
        </div>
      </div>
    </section>
  );
}
