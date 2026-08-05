"use client";

export const ActivityStatsSkeleton = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className="bg-card dark:bg-zinc-900/60 border border-border rounded-xl p-5 h-22 flex flex-col justify-between overflow-hidden"
        >
          <div className="h-2.5 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse w-28" />
          <div className="flex items-baseline gap-2">
            <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse w-20" />
            <div className="h-2.5 bg-zinc-100 dark:bg-zinc-800/50 rounded animate-pulse w-16" />
          </div>
        </div>
      ))}
    </div>
  );
};

export const ActivityTableSkeleton = () => {
  return (
    <div className="w-full space-y-3">
      <div className="flex items-center gap-2">
        <div className="h-7 w-12 bg-zinc-200 dark:bg-zinc-800 rounded-lg animate-pulse" />
        <div className="h-7 w-24 bg-zinc-100 dark:bg-zinc-900 rounded-lg animate-pulse" />
      </div>

      <div className="bg-card dark:bg-zinc-900/60 border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left min-w-200">
            <thead className="bg-zinc-100/60 dark:bg-zinc-900/40 border-b border-border">
              <tr>
                <th className="py-3 px-4">
                  <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse w-28" />
                </th>
                <th className="py-3 px-4">
                  <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse w-16" />
                </th>
                <th className="py-3 px-4">
                  <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse w-12" />
                </th>
                <th className="py-3 px-4">
                  <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse w-12" />
                </th>
                <th className="py-3 px-4">
                  <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse w-16" />
                </th>
                <th className="py-3 px-1 w-6 text-center"></th>
                <th className="py-3 px-4">
                  <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse w-16" />
                </th>
                <th className="py-3 px-4">
                  <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse w-24" />
                </th>
                <th className="py-3 px-4 text-right">
                  <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse w-16 ml-auto" />
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-border">
              {[...Array(10)].map((_, idx) => (
                <tr key={idx} className="h-11">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1.5">
                      <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse w-20" />
                      <div className="w-3.5 h-3.5 bg-zinc-100 dark:bg-zinc-800/60 rounded animate-pulse" />
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded-md animate-pulse w-22" />
                  </td>
                  <td className="py-3 px-4">
                    <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse w-14" />
                  </td>
                  <td className="py-3 px-4">
                    <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse w-12" />
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1">
                      <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse w-18" />
                      <div className="w-3.5 h-3.5 bg-zinc-100 dark:bg-zinc-800/60 rounded animate-pulse" />
                    </div>
                  </td>
                  <td className="py-3 px-1 text-center">
                    <div className="w-5 h-5 rounded-full bg-zinc-200 dark:bg-zinc-800 animate-pulse mx-auto" />
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1">
                      <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse w-18" />
                      <div className="w-3.5 h-3.5 bg-zinc-100 dark:bg-zinc-800/60 rounded animate-pulse" />
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse w-20" />
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="h-6 bg-zinc-100 dark:bg-zinc-800/80 rounded-md border border-border/50 animate-pulse w-28 ml-auto" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 sm:px-6 py-3 border-t border-border bg-zinc-100/50 dark:bg-zinc-900/40">
          <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse w-48" />
          <div className="flex items-center gap-2">
            <div className="h-6 w-16 bg-zinc-200 dark:bg-zinc-800 rounded-md animate-pulse" />
            <div className="h-6 w-14 bg-zinc-200 dark:bg-zinc-800 rounded-md animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
};