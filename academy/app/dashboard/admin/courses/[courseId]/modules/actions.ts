"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/admin";

type ActionState = {
  ok: boolean;
  message: string;
};

function readModuleForm(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const position = Number(formData.get("position") ?? 0);

  if (!title) {
    return { ok: false as const, message: "El titulo es obligatorio." };
  }

  if (!Number.isInteger(position) || position < 0) {
    return { ok: false as const, message: "La posicion debe ser un entero positivo." };
  }

  return {
    ok: true as const,
    values: {
      title,
      description: description || null,
      position,
    },
  };
}

export async function createModuleAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const auth = await requireAdmin();

  if (!auth) {
    return { ok: false, message: "Acceso no autorizado." };
  }

  const courseId = String(formData.get("course_id") ?? "");
  const parsed = readModuleForm(formData);

  if (!courseId) {
    return { ok: false, message: "Curso invalido." };
  }

  if (!parsed.ok) {
    return { ok: false, message: parsed.message };
  }

  const { error } = await auth.supabase.from("course_modules").insert({
    course_id: courseId,
    ...parsed.values,
  });

  if (error) {
    console.error("Error creating module", {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    });
    return { ok: false, message: "No se pudo crear el modulo." };
  }

  revalidatePath(`/dashboard/admin/courses/${courseId}/modules`);
  return { ok: true, message: "Modulo creado correctamente." };
}

export async function updateModuleAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const auth = await requireAdmin();

  if (!auth) {
    return { ok: false, message: "Acceso no autorizado." };
  }

  const id = String(formData.get("id") ?? "");
  const courseId = String(formData.get("course_id") ?? "");
  const parsed = readModuleForm(formData);

  if (!id || !courseId) {
    return { ok: false, message: "Modulo invalido." };
  }

  if (!parsed.ok) {
    return { ok: false, message: parsed.message };
  }

  const { error } = await auth.supabase
    .from("course_modules")
    .update(parsed.values)
    .eq("id", id);

  if (error) {
    console.error("Error updating module", {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    });
    return { ok: false, message: "No se pudo actualizar el modulo." };
  }

  revalidatePath(`/dashboard/admin/courses/${courseId}/modules`);
  return { ok: true, message: "Modulo actualizado correctamente." };
}
