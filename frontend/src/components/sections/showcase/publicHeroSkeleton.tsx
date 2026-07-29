export const PublicHeroSkeleton = () => {
  return (
    <div className="p-0 overflow-hidden bg-card dark:bg-zinc-900/60 relative w-full rounded-xl shadow-none border border-border">
      <div className="relative h-44 sm:h-60 w-full bg-zinc-200 dark:bg-zinc-800/80 animate-pulse m-0 p-0 rounded-t-xl overflow-hidden" />

      <div className="relative px-6 pb-8 pt-0 sm:px-8 sm:pb-8 sm:pt-0">
        
        <div className="flex justify-between items-start -mt-14 sm:-mt-16 mb-4">
          <div className="relative">
            <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full border-4 border-card bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
          </div>
        </div>

        <div className="flex flex-col gap-4 mt-1">
          <div className="flex flex-col gap-4 sm:gap-0 sm:block">

            <div className="order-1 flex flex-wrap items-center gap-2.5 sm:inline-flex sm:mr-3">
              <div className="h-6 w-40 sm:w-52 bg-zinc-200 dark:bg-zinc-800 rounded-md animate-pulse" />
              <div className="h-5 w-20 bg-zinc-200 dark:bg-zinc-800 rounded-full animate-pulse" />
            </div>

            <div className="order-2 flex flex-col gap-2 mt-2 sm:mt-3 max-w-3xl">
              <div className="h-3.5 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse w-full" />
              <div className="h-3.5 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse w-4/5" />
            </div>

            <div className="order-3 flex flex-col sm:block sm:float-right sm:-mt-12 sm:mb-4 w-full sm:w-auto mt-2">
              <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse w-24 mb-1.5" />
              <div className="flex items-center gap-2">
                <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse w-36 sm:w-48" />
                <div className="w-6 h-6 rounded-md bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
              </div>
            </div>

          </div>

          <div className="hidden sm:block clear-both" />

          <div className="order-4 flex flex-col gap-1 sm:-mt-6">
            <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse w-20" />
            <div className="h-3.5 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse w-28" />
          </div>

          <div className="order-5 flex items-center gap-2 mt-1 -ml-1">
            <div className="w-7 h-7 rounded-md bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
            <div className="w-7 h-7 rounded-md bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
            <div className="w-7 h-7 rounded-md bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
          </div>

        </div>
      </div>
    </div>
  );
};