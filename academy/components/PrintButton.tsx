"use client";

type PrintButtonProps = {
  label?: string;
};

export function PrintButton({ label = "Imprimir" }: PrintButtonProps) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="rounded-md border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
    >
      {label}
    </button>
  );
}
