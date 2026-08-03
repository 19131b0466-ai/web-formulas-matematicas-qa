export default function SectionLoading() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading">
      <div className="skeleton h-4 w-40 rounded" />
      <div className="skeleton h-10 w-3/4 max-w-xl rounded" />
      <div className="skeleton h-24 w-full rounded-xl" />
      <div className="skeleton h-40 w-full rounded-xl" />
      <div className="skeleton h-40 w-full rounded-xl" />
    </div>
  );
}
