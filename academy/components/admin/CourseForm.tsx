"use client";

import { useActionState } from "react";
import type { Database } from "@/types/database.types";
import {
  createCourseAction,
  updateCourseAction,
} from "@/app/dashboard/admin/courses/actions";

type Course = Database["public"]["Tables"]["courses"]["Row"];

type CourseFormProps = {
  course?: Course;
};

const initialState = {
  ok: false,
  message: "",
};

export function CourseForm({ course }: CourseFormProps) {
  const action = course ? updateCourseAction : createCourseAction;
  const [state, formAction, isPending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="space-y-4">
      {course ? <input type="hidden" name="id" value={course.id} /> : null}

      <label className="block">
        <span className="text-sm font-medium text-slate-700">Titulo</span>
        <input
          name="title"
          required
          defaultValue={course?.title ?? ""}
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-slate-950"
        />
      </label>

      <label className="block">
        <span className="text-sm font-medium text-slate-700">
          Descripcion
        </span>
        <textarea
          name="description"
          defaultValue={course?.description ?? ""}
          rows={3}
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-slate-950"
        />
      </label>

      <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
        <input
          type="checkbox"
          name="is_published"
          defaultChecked={course?.is_published ?? false}
          className="h-4 w-4 rounded border-slate-300"
        />
        Publicado
      </label>

      {state.message ? (
        <p
          className={`rounded-md px-3 py-2 text-sm ${
            state.ok
              ? "bg-emerald-50 text-emerald-800"
              : "bg-red-50 text-red-700"
          }`}
        >
          {state.message}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isPending}
        className="rounded-md bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isPending
          ? "Guardando..."
          : course
            ? "Guardar cambios"
            : "Crear curso"}
      </button>
    </form>
  );
}
