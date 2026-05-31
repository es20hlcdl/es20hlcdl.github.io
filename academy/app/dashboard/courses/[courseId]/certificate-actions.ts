"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function logCertificateError(context: string, error: {
  message: string;
  details: string | null;
  hint: string | null;
  code: string;
}) {
  console.error(context, {
    message: error.message,
    details: error.details,
    hint: error.hint,
    code: error.code,
  });
}

export async function issueCertificateAction(formData: FormData) {
  const courseId = String(formData.get("course_id") ?? "");
  const coursePath = courseId ? `/dashboard/courses/${courseId}` : "/dashboard/courses";
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  if (!courseId) {
    redirect("/dashboard/courses");
  }

  const { data: issuedCertificates, error } = await supabase.rpc(
    "issue_certificate",
    {
      p_course_id: courseId,
    },
  );

  if (error) {
    logCertificateError("Error issuing certificate", error);
    redirect(coursePath);
  }

  const certificate = issuedCertificates?.[0] ?? null;

  if (!certificate) {
    redirect(coursePath);
  }

  revalidatePath(coursePath);
  revalidatePath("/dashboard/courses");
  redirect(`/dashboard/certificates/${certificate.id}`);
}
