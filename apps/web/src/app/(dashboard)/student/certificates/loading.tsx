export default function CertificatesLoading() {
  return (
    <div className="flex-1 p-6 space-y-6 animate-pulse">
      <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded-lg w-56" />
      <div className="grid grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded-2xl" />)}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {[...Array(3)].map((_, i) => <div key={i} className="h-44 bg-gray-200 dark:bg-gray-700 rounded-2xl" />)}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-2xl" />)}
      </div>
    </div>
  );
}
