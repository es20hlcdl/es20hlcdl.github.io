"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/admin";

type ActionState = {
  ok: boolean;
  message: string;
};

const allowedMaterialTypes = new Set([
  "link",
  "pdf",
  "video",
  "document",
  "other",
]);

function readLessonForm(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();
  const videoUrl = String(formData.get("video_url") ?? "").trim();
  const position = Number(formData.get("position") ?? 0);
  const isPublished = formData.get("is_published") === "on";

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
      content: content || null,
      video_url: videoUrl || null,
      position,
      is_published: isPublished,
    },
  };
}

export async function createLessonAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const auth = await requireAdmin();

  if (!auth) {
    return { ok: false, message: "Acceso no autorizado." };
  }

  const moduleId = String(formData.get("module_id") ?? "");
  const parsed = readLessonForm(formData);

  if (!moduleId) {
    return { ok: false, message: "Modulo invalido." };
  }

  if (!parsed.ok) {
    return { ok: false, message: parsed.message };
  }

  const { error } = await auth.supabase.from("lessons").insert({
    module_id: moduleId,
    ...parsed.values,
  });

  if (error) {
    console.error("Error creating lesson", {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    });
    return { ok: false, message: "No se pudo crear la leccion." };
  }

  revalidatePath(`/dashboard/admin/modules/${moduleId}/lessons`);
  return { ok: true, message: "Leccion creada correctamente." };
}

export async function updateLessonAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const auth = await requireAdmin();

  if (!auth) {
    return { ok: false, message: "Acceso no autorizado." };
  }

  const id = String(formData.get("id") ?? "");
  const moduleId = String(formData.get("module_id") ?? "");
  const parsed = readLessonForm(formData);

  if (!id || !moduleId) {
    return { ok: false, message: "Leccion invalida." };
  }

  if (!parsed.ok) {
    return { ok: false, message: parsed.message };
  }

  const { error } = await auth.supabase
    .from("lessons")
    .update(parsed.values)
    .eq("id", id);

  if (error) {
    console.error("Error updating lesson", {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    });
    return { ok: false, message: "No se pudo actualizar la leccion." };
  }

  revalidatePath(`/dashboard/admin/modules/${moduleId}/lessons`);
  return { ok: true, message: "Leccion actualizada correctamente." };
}

export async function toggleLessonPublishAction(formData: FormData) {
  const auth = await requireAdmin();

  if (!auth) {
    return;
  }

  const id = String(formData.get("id") ?? "");
  const moduleId = String(formData.get("module_id") ?? "");
  const isPublished = String(formData.get("is_published") ?? "") === "true";

  if (!id || !moduleId) {
    return;
  }

  const { error } = await auth.supabase
    .from("lessons")
    .update({ is_published: !isPublished })
    .eq("id", id);

  if (error) {
    console.error("Error toggling lesson publish state", {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    });
  }

  revalidatePath(`/dashboard/admin/modules/${moduleId}/lessons`);
}

export async function createMaterialAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const auth = await requireAdmin();

  if (!auth) {
    return { ok: false, message: "Acceso no autorizado." };
  }

  const lessonId = String(formData.get("lesson_id") ?? "");
  const moduleId = String(formData.get("module_id") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const materialUrl = String(formData.get("material_url") ?? "").trim();
  const rawMaterialType = String(formData.get("material_type") ?? "").trim();
  const materialType = rawMaterialType.toLowerCase();
  const safeMaterialType = allowedMaterialTypes.has(materialType)
    ? materialType
    : "other";

  if (!lessonId || !moduleId || !title || !materialUrl || !materialType) {
    return {
      ok: false,
      message: "Leccion, titulo, URL y tipo de material son obligatorios.",
    };
  }

  const { error } = await auth.supabase.from("lesson_materials").insert({
    lesson_id: lessonId,
    title,
    material_url: materialUrl,
    material_type: safeMaterialType,
  });

  if (error) {
    console.error("Error creating material", {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    });
    return { ok: false, message: "No se pudo agregar el material." };
  }

  revalidatePath(`/dashboard/admin/modules/${moduleId}/lessons`);
  return { ok: true, message: "Material agregado correctamente." };
}
