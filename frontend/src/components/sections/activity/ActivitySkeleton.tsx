"use client";

// Cards Skeleton matching PublicHeroSkeleton Theme
export const ActivityStatsSkeleton = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className="border border-gray-200 bg-white dark:border-zinc-800 dark:bg-zinc-950 rounded-xl p-5 h-28 relative overflow-hidden flex flex-col justify-between"
        >
          <div className="h-3 bg-gray-200 dark:bg-zinc-800 rounded animate-pulse w-28" />
          <div className="flex items-baseline gap-3">
            <div className="h-6 bg-gray-200 dark:bg-zinc-800 rounded animate-pulse w-20" />
            <div className="h-3 bg-gray-100 dark:bg-zinc-900 rounded animate-pulse w-16" />
          </div>
        </div>
      ))}
    </div>
  );
};

// Table Skeleton matching PublicHeroSkeleton Theme
export const ActivityTableSkeleton = () => {
  return (
    <div className="w-full space-y-3">
      {/* Tabs Skeleton */}
      <div className="flex items-center gap-3">
        <div className="h-9 w-16 bg-gray-200 dark:bg-zinc-800 rounded-lg animate-pulse" />
        <div className="h-9 w-28 bg-gray-100 dark:bg-zinc-900 rounded-lg animate-pulse" />
      </div>

      {/* Table Outer Container Skeleton */}
      <div className="border border-gray-200 bg-white dark:border-zinc-800 dark:bg-zinc-950 rounded-xl overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left min-w-200 sm:min-w-0">
            <thead className="bg-gray-100/80 dark:bg-zinc-900/80 border-b border-gray-200 dark:border-zinc-800">
              <tr>
                <th className="py-3 px-4"><div className="h-4 bg-gray-200 dark:bg-zinc-800 rounded animate-pulse w-28" /></th>
                <th className="py-3 px-4"><div className="h-4 bg-gray-200 dark:bg-zinc-800 rounded animate-pulse w-16" /></th>
                <th className="py-3 px-4"><div className="h-4 bg-gray-200 dark:bg-zinc-800 rounded animate-pulse w-12" /></th>
                <th className="py-3 px-4"><div className="h-4 bg-gray-200 dark:bg-zinc-800 rounded animate-pulse w-12" /></th>
                <th className="py-3 px-4"><div className="h-4 bg-gray-200 dark:bg-zinc-800 rounded animate-pulse w-16" /></th>
                <th className="py-3 px-2 w-6 text-center"></th>
                <th className="py-3 px-4"><div className="h-4 bg-gray-200 dark:bg-zinc-800 rounded animate-pulse w-16" /></th>
                <th className="py-3 px-4"><div className="h-4 bg-gray-200 dark:bg-zinc-800 rounded animate-pulse w-24" /></th>
                <th className="py-3 px-4 text-right"><div className="h-4 bg-gray-200 dark:bg-zinc-800 rounded animate-pulse w-16 ml-auto" /></th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
              {[...Array(5)].map((_, idx) => (
                <tr key={idx}>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="h-4 bg-gray-200 dark:bg-zinc-800 rounded animate-pulse w-24" />
                      <div className="w-3.5 h-3.5 bg-gray-100 dark:bg-zinc-900 rounded animate-pulse" />
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="h-5 bg-gray-200 dark:bg-zinc-800 rounded-md animate-pulse w-24" />
                  </td>
                  <td className="py-3 px-4">
                    <div className="h-4 bg-gray-200 dark:bg-zinc-800 rounded animate-pulse w-16" />
                  </td>
                  <td className="py-3 px-4">
                    <div className="h-4 bg-gray-200 dark:bg-zinc-800 rounded animate-pulse w-14" />
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1.5">
                      <div className="h-4 bg-gray-200 dark:bg-zinc-800 rounded animate-pulse w-20" />
                      <div className="w-3.5 h-3.5 bg-gray-100 dark:bg-zinc-900 rounded animate-pulse" />
                    </div>
                  </td>
                  <td className="py-3 px-1 text-center">
                    <div className="w-5 h-5 rounded-full bg-gray-200 dark:bg-zinc-800 animate-pulse mx-auto" />
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1.5">
                      <div className="h-4 bg-gray-200 dark:bg-zinc-800 rounded animate-pulse w-20" />
                      <div className="w-3.5 h-3.5 bg-gray-100 dark:bg-zinc-900 rounded animate-pulse" />
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="h-4 bg-gray-200 dark:bg-zinc-800 rounded animate-pulse w-20" />
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="h-7 bg-gray-100 dark:bg-zinc-900 rounded border border-gray-200 dark:border-zinc-800 animate-pulse w-28 ml-auto" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer Skeleton */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-900/50">
          <div className="h-3 bg-gray-200 dark:bg-zinc-800 rounded animate-pulse w-44" />
          <div className="flex items-center gap-2">
            <div className="h-7 w-16 bg-gray-200 dark:bg-zinc-800 rounded animate-pulse" />
            <div className="h-7 w-16 bg-gray-200 dark:bg-zinc-800 rounded animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
};