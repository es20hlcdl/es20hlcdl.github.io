type CourseCardProps = {
  title: string;
  description: string | null;
  status?: string | null;
  totalPublishedLessons?: number;
  completedLessons?: number;
  progressPercent?: number;
};

export function CourseCard({
  title,
  description,
  status,
  totalPublishedLessons = 0,
  completedLessons = 0,
  progressPercent = 0,
}: CourseCardProps) {
  const hasPublishedLessons = totalPublishedLessons > 0;

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
        {description ?? "Sin descripcion disponible."}
      </p>
      <div className="mt-5">
        {hasPublishedLessons ? (
          <>
            <div className="mb-2 flex justify-between gap-4 text-sm font-medium text-slate-700">
              <span>
                Avance: {completedLessons} de {totalPublishedLessons} lecciones
              </span>
              <span>{progressPercent}%</span>
            </div>
            <div className="h-2 rounded-full bg-slate-200">
              <div
                className="h-2 rounded-full bg-emerald-600"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </>
        ) : (
          <p className="rounded-md border border-dashed border-slate-300 p-3 text-sm text-slate-600">
            Este curso aún no tiene lecciones publicadas.
          </p>
        )}
      </div>
    </article>
  );
}
