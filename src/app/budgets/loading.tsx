export default function Loading() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-10 animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-2/3 mb-8"></div>
      <div className="bg-white h-96 rounded-xl shadow-sm border border-gray-200"></div>
    </div>
  );
}
