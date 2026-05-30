"use client";

import { useActionState } from "react";
import { createEnrollmentAction } from "@/app/dashboard/admin/enrollments/actions";

type StudentOption = {
  id: string;
  label: string;
};

type CourseOption = {
  id: string;
  title: string;
};

type EnrollmentFormProps = {
  students: StudentOption[];
  courses: CourseOption[];
};

const initialState = {
  ok: false,
  message: "",
};

export function EnrollmentForm({ students, courses }: EnrollmentFormProps) {
  const [state, formAction, isPending] = useActionState(
    createEnrollmentAction,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-4">
      <label className="block">
        <span className="text-sm font-medium text-slate-700">Estudiante</span>
        <select
          name="user_id"
          required
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-slate-950"
        >
          <option value="">Seleccionar estudiante</option>
          {students.length > 0 ? (
            students.map((student) => (
              <option key={student.id} value={student.id}>
                {student.label}
              </option>
            ))
          ) : (
            <option value="" disabled>
              No hay estudiantes disponibles para inscribir.
            </option>
          )}
        </select>
      </label>

      <label className="block">
        <span className="text-sm font-medium text-slate-700">Curso</span>
        <select
          name="course_id"
          required
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-slate-950"
        >
          <option value="">Seleccionar curso</option>
          {courses.map((course) => (
            <option key={course.id} value={course.id}>
              {course.title}
            </option>
          ))}
        </select>
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
        {isPending ? "Inscribiendo..." : "Inscribir estudiante"}
      </button>
    </form>
  );
}
