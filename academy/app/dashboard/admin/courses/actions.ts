"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/admin";

type ActionState = {
  ok: boolean;
  message: string;
};

type CourseFormValues = {
  title: string;
  description: string | null;
  is_published: boolean;
};

type CourseFormResult =
  | {
      ok: true;
      values: CourseFormValues;
    }
  | {
      ok: false;
      error: string;
    };

function readCourseForm(formData: FormData): CourseFormResult {
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const isPublished = formData.get("is_published") === "on";

  if (!title) {
    return {
      ok: false,
      error: "El titulo es obligatorio.",
    };
  }

  return {
    ok: true,
    values: {
      title,
      description: description || null,
      is_published: isPublished,
    },
  };
}

export async function createCourseAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const auth = await requireAdmin();

  if (!auth) {
    return { ok: false, message: "Acceso no autorizado." };
  }

  const parsed = readCourseForm(formData);

  if (!parsed.ok) {
    return { ok: false, message: parsed.error };
  }

  const { error } = await auth.supabase.from("courses").insert(parsed.values);

  if (error) {
    console.error("Error creating course", {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    });
    return { ok: false, message: "No se pudo crear el curso." };
  }

  revalidatePath("/dashboard/admin/courses");
  return { ok: true, message: "Curso creado correctamente." };
}

export async function updateCourseAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const auth = await requireAdmin();

  if (!auth) {
    return { ok: false, message: "Acceso no autorizado." };
  }

  const id = String(formData.get("id") ?? "");
  const parsed = readCourseForm(formData);

  if (!id) {
    return { ok: false, message: "Curso invalido." };
  }

  if (!parsed.ok) {
    return { ok: false, message: parsed.error };
  }

  const { error } = await auth.supabase
    .from("courses")
    .update(parsed.values)
    .eq("id", id);

  if (error) {
    console.error("Error updating course", {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    });
    return { ok: false, message: "No se pudo actualizar el curso." };
  }

  revalidatePath("/dashboard/admin/courses");
  return { ok: true, message: "Curso actualizado correctamente." };
}

export async function toggleCoursePublishAction(formData: FormData) {
  const auth = await requireAdmin();

  if (!auth) {
    return;
  }

  const id = String(formData.get("id") ?? "");
  const isPublished = String(formData.get("is_published") ?? "") === "true";

  if (!id) {
    return;
  }

  const { error } = await auth.supabase
    .from("courses")
    .update({ is_published: !isPublished })
    .eq("id", id);

  if (error) {
    console.error("Error toggling course publish state", {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    });
  }

  revalidatePath("/dashboard/admin/courses");
}
