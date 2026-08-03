export default function SearchLoading() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading">
      <div className="skeleton h-10 w-48 rounded" />
      <div className="skeleton h-12 w-full rounded-xl" />
      <div className="skeleton h-24 w-full rounded-xl" />
      <div className="skeleton h-24 w-full rounded-xl" />
    </div>
  );
}
