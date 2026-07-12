export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white h-96 rounded-xl shadow-sm border border-gray-200"></div>
        </div>
        <div>
          <div className="bg-white h-80 rounded-xl shadow-sm border border-gray-200"></div>
        </div>
      </div>
    </div>
  );
}
