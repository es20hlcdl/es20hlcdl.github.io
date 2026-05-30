"use client";

import { useActionState } from "react";
import type { Database } from "@/types/database.types";
import { updateEnrollmentStatusAction } from "@/app/dashboard/admin/enrollments/actions";

type EnrollmentStatus = Database["public"]["Enums"]["enrollment_status"];

type EnrollmentStatusFormProps = {
  id: string;
  status: EnrollmentStatus;
};

const initialState = {
  ok: false,
  message: "",
};

export function EnrollmentStatusForm({
  id,
  status,
}: EnrollmentStatusFormProps) {
  const [state, formAction, isPending] = useActionState(
    updateEnrollmentStatusAction,
    initialState,
  );

  return (
    <form action={formAction} className="flex flex-col gap-2 sm:flex-row">
      <input type="hidden" name="id" value={id} />
      <select
        name="status"
        defaultValue={status}
        className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-950"
      >
        <option value="active">active</option>
        <option value="completed">completed</option>
        <option value="cancelled">cancelled</option>
      </select>
      <button
        type="submit"
        disabled={isPending}
        className="rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isPending ? "Guardando..." : "Actualizar"}
      </button>
      {state.message ? (
        <span
          className={`rounded-md px-3 py-2 text-sm ${
            state.ok
              ? "bg-emerald-50 text-emerald-800"
              : "bg-red-50 text-red-700"
          }`}
        >
          {state.message}
        </span>
      ) : null}
    </form>
  );
}
