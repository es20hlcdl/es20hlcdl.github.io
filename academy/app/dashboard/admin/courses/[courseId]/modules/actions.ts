"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/admin";

type ActionState = {
  ok: boolean;
  message: string;
};

function isUniquePositionError(error: { code?: string }) {
  return error.code === "23505";
}

function readModuleForm(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();

  if (!title) {
    return { ok: false as const, message: "El titulo es obligatorio." };
  }

  return {
    ok: true as const,
    values: {
      title,
      description: description || null,
    },
  };
}

function readPosition(formData: FormData) {
  const rawPosition = String(formData.get("position") ?? "").trim();
  const position = Number(rawPosition);

  if (!rawPosition || !Number.isInteger(position) || position < 1) {
    return null;
  }

  return position;
}

async function getNextModulePosition(
  supabase: NonNullable<Awaited<ReturnType<typeof requireAdmin>>>["supabase"],
  courseId: string,
) {
  const { data, error } = await supabase
    .from("course_modules")
    .select("position")
    .eq("course_id", courseId)
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("Error calculating next module position", {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    });
    return null;
  }

  return (data?.position ?? 0) + 1;
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

  const position =
    readPosition(formData) ?? (await getNextModulePosition(auth.supabase, courseId));

  if (!position) {
    return { ok: false, message: "No se pudo calcular el orden del modulo." };
  }

  const { error } = await auth.supabase.from("course_modules").insert({
    course_id: courseId,
    ...parsed.values,
    position,
  });

  if (error) {
    console.error("Error creating module", {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    });
    if (isUniquePositionError(error)) {
      return { ok: false, message: "Ya existe un modulo con ese orden." };
    }
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

  const position = readPosition(formData);

  if (!position) {
    return { ok: false, message: "El orden debe ser un entero mayor o igual a 1." };
  }

  const { error } = await auth.supabase
    .from("course_modules")
    .update({
      ...parsed.values,
      position,
    })
    .eq("id", id);

  if (error) {
    console.error("Error updating module", {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    });
    if (isUniquePositionError(error)) {
      return { ok: false, message: "Ya existe un modulo con ese orden." };
    }
    return { ok: false, message: "No se pudo actualizar el modulo." };
  }

  revalidatePath(`/dashboard/admin/courses/${courseId}/modules`);
  return { ok: true, message: "Modulo actualizado correctamente." };
}
