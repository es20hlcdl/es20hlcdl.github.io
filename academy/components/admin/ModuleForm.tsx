"use client";

import { useActionState } from "react";
import type { Database } from "@/types/database.types";
import {
  createModuleAction,
  updateModuleAction,
} from "@/app/dashboard/admin/courses/[courseId]/modules/actions";

type Module = Database["public"]["Tables"]["course_modules"]["Row"];

type ModuleFormProps = {
  courseId: string;
  module?: Module;
  defaultPosition?: number;
};

const initialState = {
  ok: false,
  message: "",
};

export function ModuleForm({ courseId, module, defaultPosition = 1 }: ModuleFormProps) {
  const action = module ? updateModuleAction : createModuleAction;
  const [state, formAction, isPending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="course_id" value={courseId} />
      {module ? <input type="hidden" name="id" value={module.id} /> : null}

      <label className="block">
        <span className="text-sm font-medium text-slate-700">Titulo</span>
        <input
          name="title"
          required
          defaultValue={module?.title ?? ""}
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-slate-950"
        />
      </label>

      <label className="block">
        <span className="text-sm font-medium text-slate-700">Descripcion</span>
        <textarea
          name="description"
          rows={3}
          defaultValue={module?.description ?? ""}
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-slate-950"
        />
      </label>

      <label className="block">
        <span className="text-sm font-medium text-slate-700">Orden</span>
        <input
          type="number"
          name="position"
          min={1}
          required
          placeholder="Ej. 1"
          defaultValue={module?.position ?? defaultPosition}
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-slate-950"
        />
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
        {isPending ? "Guardando..." : module ? "Guardar modulo" : "Crear modulo"}
      </button>
    </form>
  );
}
