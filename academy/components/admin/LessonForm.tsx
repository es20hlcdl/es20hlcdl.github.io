"use client";

import { useActionState } from "react";
import type { Database } from "@/types/database.types";
import {
  createLessonAction,
  updateLessonAction,
} from "@/app/dashboard/admin/modules/[moduleId]/lessons/actions";

type Lesson = Database["public"]["Tables"]["lessons"]["Row"];

type LessonFormProps = {
  moduleId: string;
  lesson?: Lesson;
  defaultPosition?: number;
};

const initialState = {
  ok: false,
  message: "",
};

export function LessonForm({ moduleId, lesson, defaultPosition = 1 }: LessonFormProps) {
  const action = lesson ? updateLessonAction : createLessonAction;
  const [state, formAction, isPending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="module_id" value={moduleId} />
      {lesson ? <input type="hidden" name="id" value={lesson.id} /> : null}

      <label className="block">
        <span className="text-sm font-medium text-slate-700">Titulo</span>
        <input
          name="title"
          required
          defaultValue={lesson?.title ?? ""}
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-slate-950"
        />
      </label>

      <label className="block">
        <span className="text-sm font-medium text-slate-700">Contenido</span>
        <textarea
          name="content"
          rows={4}
          defaultValue={lesson?.content ?? ""}
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-slate-950"
        />
      </label>

      <label className="block">
        <span className="text-sm font-medium text-slate-700">Video URL</span>
        <input
          name="video_url"
          type="url"
          defaultValue={lesson?.video_url ?? ""}
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-slate-950"
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Orden</span>
          <input
            type="number"
            name="position"
            min={1}
            required
            placeholder="Ej. 1"
            defaultValue={lesson?.position ?? defaultPosition}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-slate-950"
          />
        </label>

        <label className="flex items-end gap-2 pb-2 text-sm font-medium text-slate-700">
          <input
            type="checkbox"
            name="is_published"
            defaultChecked={lesson?.is_published ?? false}
            className="h-4 w-4 rounded border-slate-300"
          />
          Publicada
        </label>
      </div>

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
        {isPending ? "Guardando..." : lesson ? "Guardar leccion" : "Crear leccion"}
      </button>
    </form>
  );
}
