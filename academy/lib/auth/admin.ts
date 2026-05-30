import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type AdminAuthResult = {
  supabase: Awaited<ReturnType<typeof createClient>>;
  user: {
    id: string;
    email?: string;
  };
  profile: {
    full_name: string | null;
    email: string | null;
    role: "admin" | "student";
  } | null;
  isAdmin: boolean;
};

export async function getAdminAuth(): Promise<AdminAuthResult> {
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

  return {
    supabase,
    user: {
      id: user.id,
      email: user.email,
    },
    profile,
    isAdmin: profile?.role === "admin",
  };
}

export async function requireAdmin() {
  const auth = await getAdminAuth();

  if (!auth.isAdmin) {
    return null;
  }

  return auth;
}
