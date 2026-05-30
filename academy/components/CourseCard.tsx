type CourseCardProps = {
  title: string;
  description: string | null;
  status?: string | null;
};

export function CourseCard({ title, description, status }: CourseCardProps) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <h2 className="text-lg font-semibold text-slate-950">{title}</h2>
        {status ? (
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
            {status}
          </span>
        ) : null}
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-600">
        {description ?? "Sin descripción disponible."}
      </p>
    </article>
  );
}
