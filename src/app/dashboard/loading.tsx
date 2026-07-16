export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-8">
        <div className="bg-white dark:bg-white/5 h-32 rounded-xl shadow-sm border border-gray-200 dark:border-white/10"></div>
        <div className="bg-white dark:bg-white/5 h-32 rounded-xl shadow-sm border border-gray-200 dark:border-white/10"></div>
        <div className="bg-white dark:bg-white/5 h-32 rounded-xl shadow-sm border border-gray-200 dark:border-white/10"></div>
      </div>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 mb-8">
        <div className="lg:col-span-2 bg-white dark:bg-white/5 h-96 rounded-xl shadow-sm border border-gray-200 dark:border-white/10"></div>
        <div className="lg:col-span-1 bg-white dark:bg-white/5 h-96 rounded-xl shadow-sm border border-gray-200 dark:border-white/10"></div>
      </div>
    </div>
  );
}
