export default function ParentLoading() {
  return (
    <div className="flex-1 p-6 space-y-6 animate-pulse">
      <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded-lg w-52" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-gray-200 dark:bg-gray-700 rounded-2xl" />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(2)].map((_, i) => <div key={i} className="h-52 bg-gray-200 dark:bg-gray-700 rounded-2xl" />)}
      </div>
    </div>
  );
}
