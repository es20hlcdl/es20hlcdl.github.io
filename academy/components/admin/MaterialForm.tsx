"use client";

import { useActionState } from "react";
import { createMaterialAction } from "@/app/dashboard/admin/modules/[moduleId]/lessons/actions";

type MaterialFormProps = {
  moduleId: string;
  lessonId: string;
};

const initialState = {
  ok: false,
  message: "",
};

export function MaterialForm({ moduleId, lessonId }: MaterialFormProps) {
  const [state, formAction, isPending] = useActionState(
    createMaterialAction,
    initialState,
  );

  return (
    <form action={formAction} className="mt-4 grid gap-3 md:grid-cols-[1fr_1fr_120px_auto]">
      <input type="hidden" name="module_id" value={moduleId} />
      <input type="hidden" name="lesson_id" value={lessonId} />
      <input
        name="title"
        required
        placeholder="Titulo del material"
        className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-950"
      />
      <input
        name="material_url"
        type="url"
        required
        placeholder="https://..."
        className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-950"
      />
      <input
        name="material_type"
        defaultValue="link"
        className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-950"
      />
      <button
        type="submit"
        disabled={isPending}
        className="rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isPending ? "Agregando..." : "Agregar"}
      </button>
      {state.message ? (
        <p
          className={`md:col-span-4 rounded-md px-3 py-2 text-sm ${
            state.ok
              ? "bg-emerald-50 text-emerald-800"
              : "bg-red-50 text-red-700"
          }`}
        >
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
