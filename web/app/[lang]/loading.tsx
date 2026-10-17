export default function Loading() {
  return (
    <div aria-busy="true" aria-live="polite" className="animate-pulse space-y-4" role="status">
      <div className="h-12 rounded-xl bg-neutral-200" />
      <div className="h-6 w-2/3 rounded bg-neutral-200" />
      <div className="h-24 rounded-xl bg-neutral-200" />
      <div className="h-24 rounded-xl bg-neutral-200" />
    </div>
  );
}
