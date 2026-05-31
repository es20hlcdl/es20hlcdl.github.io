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
    <form action={formAction} className="mt-4 grid gap-3">
      <input type="hidden" name="module_id" value={moduleId} />
      <input type="hidden" name="lesson_id" value={lessonId} />
      <div className="grid gap-3 md:grid-cols-[1fr_1fr_150px]">
        <label className="grid gap-1 text-sm font-medium text-slate-700">
          Título del material
          <input
            name="title"
            required
            placeholder="Guía de ejercicios"
            className="rounded-md border border-slate-300 px-3 py-2 text-sm font-normal outline-none focus:border-slate-950"
          />
        </label>
        <label className="grid gap-1 text-sm font-medium text-slate-700">
          URL del material
          <input
            name="material_url"
            type="url"
            required
            placeholder="https://ejemplo.com/material.pdf"
            className="rounded-md border border-slate-300 px-3 py-2 text-sm font-normal outline-none focus:border-slate-950"
          />
        </label>
        <label className="grid gap-1 text-sm font-medium text-slate-700">
          Tipo
          <select
            name="material_type"
            defaultValue="link"
            className="rounded-md border border-slate-300 px-3 py-2 text-sm font-normal outline-none focus:border-slate-950"
          >
            <option value="link">link</option>
            <option value="pdf">pdf</option>
            <option value="video">video</option>
            <option value="document">document</option>
            <option value="other">other</option>
          </select>
        </label>
      </div>
      <button
        type="submit"
        disabled={isPending}
        className="justify-self-start rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isPending ? "Agregando..." : "Agregar material"}
      </button>
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
    </form>
  );
}
