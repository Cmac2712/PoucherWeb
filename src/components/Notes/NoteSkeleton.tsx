export const NoteSkeleton = () => (
  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
    <div className="p-4 space-y-3">
      {/* Title */}
      <div className="space-y-2">
        <div className="h-4 w-5/6 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
        <div className="h-4 w-3/5 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
      </div>

      {/* Content preview */}
      <div className="space-y-1.5">
        <div className="h-3 w-full rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
        <div className="h-3 w-4/5 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
        <div className="h-3 w-3/5 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
      </div>

      {/* Date */}
      <div className="h-3 w-20 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
    </div>
  </div>
)
