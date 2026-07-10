export const AssetCardSkeleton = () => {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-zinc-800 dark:bg-zinc-950 h-full flex flex-col">
      <div className="w-full aspect-square bg-gray-100 dark:bg-zinc-900 animate-pulse border-b border-gray-100 dark:border-zinc-800"></div>
      <div className="px-4 pb-6 pt-4 flex flex-col grow justify-between gap-4">
        <div className="h-4 bg-gray-200 dark:bg-zinc-800 rounded animate-pulse w-3/4"></div>
        
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-200 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-gray-200 dark:bg-zinc-800 animate-pulse"></div>
            <div className="h-3 bg-gray-200 dark:bg-zinc-800 rounded animate-pulse w-16"></div>
          </div>
          <div className="h-3 bg-gray-200 dark:bg-zinc-800 rounded animate-pulse w-12"></div>
        </div>
      </div>
    </div>
  );
};