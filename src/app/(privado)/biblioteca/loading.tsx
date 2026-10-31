export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl px-5 pt-24" role="status" aria-label="Carregando atividades">
      <div className="h-6 w-28 animate-pulse rounded-full bg-rose-100" />
      <div className="mt-3 h-12 w-80 max-w-full animate-pulse rounded-2xl bg-sand-200" />
      <div className="mt-10 h-28 animate-pulse rounded-4xl bg-white" />
      <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="h-80 animate-pulse rounded-4xl bg-white ring-1 ring-sand-200" />
        ))}
      </div>
    </div>
  );
}
