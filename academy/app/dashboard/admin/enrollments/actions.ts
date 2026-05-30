"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/admin";
import type { Database } from "@/types/database.types";

type EnrollmentStatus = Database["public"]["Enums"]["enrollment_status"];

type ActionState = {
  ok: boolean;
  message: string;
};

const validStatuses: EnrollmentStatus[] = ["active", "completed", "cancelled"];

export async function createEnrollmentAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const auth = await requireAdmin();

  if (!auth) {
    return { ok: false, message: "Acceso no autorizado." };
  }

  const userId = String(formData.get("user_id") ?? "");
  const courseId = String(formData.get("course_id") ?? "");

  if (!userId || !courseId) {
    return { ok: false, message: "Selecciona estudiante y curso." };
  }

  const { data: existingEnrollment, error: lookupError } = await auth.supabase
    .from("enrollments")
    .select("id")
    .eq("user_id", userId)
    .eq("course_id", courseId)
    .maybeSingle();

  if (lookupError) {
    console.error("Error checking existing enrollment", {
      message: lookupError.message,
      details: lookupError.details,
      hint: lookupError.hint,
      code: lookupError.code,
    });
    return { ok: false, message: "No se pudo validar la inscripcion." };
  }

  if (existingEnrollment) {
    return { ok: false, message: "El estudiante ya esta inscrito en ese curso." };
  }

  const { error } = await auth.supabase.from("enrollments").insert({
    user_id: userId,
    course_id: courseId,
    status: "active",
  });

  if (error) {
    console.error("Error creating enrollment", {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    });
    return { ok: false, message: "No se pudo crear la inscripcion." };
  }

  revalidatePath("/dashboard/admin/enrollments");
  return { ok: true, message: "Inscripcion creada correctamente." };
}

export async function updateEnrollmentStatusAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const auth = await requireAdmin();

  if (!auth) {
    return { ok: false, message: "Acceso no autorizado." };
  }

  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "") as EnrollmentStatus;

  if (!id || !validStatuses.includes(status)) {
    return { ok: false, message: "Estado invalido." };
  }

  const { error } = await auth.supabase
    .from("enrollments")
    .update({ status })
    .eq("id", id);

  if (error) {
    console.error("Error updating enrollment status", {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    });
    return { ok: false, message: "No se pudo actualizar la inscripcion." };
  }

  revalidatePath("/dashboard/admin/enrollments");
  return { ok: true, message: "Estado actualizado correctamente." };
}
