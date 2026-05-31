"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function completeLessonAction(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const courseId = String(formData.get("course_id") ?? "");
  const lessonId = String(formData.get("lesson_id") ?? "");
  const currentPath = String(formData.get("current_path") ?? "");

  if (!courseId || !lessonId) {
    return;
  }

  const { error } = await supabase.from("lesson_progress").upsert(
    {
      user_id: user.id,
      lesson_id: lessonId,
      completed: true,
      completed_at: new Date().toISOString(),
    },
    {
      onConflict: "user_id,lesson_id",
    },
  );

  if (error) {
    console.error("Error completing lesson", {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    });
  }

  revalidatePath(`/dashboard/courses/${courseId}`);

  if (currentPath.startsWith(`/dashboard/courses/${courseId}`)) {
    revalidatePath(currentPath);
  }
}
