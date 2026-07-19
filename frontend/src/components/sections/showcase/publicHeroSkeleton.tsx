export const PublicHeroSkeleton = () => {
  return (
    <div className="overflow-hidden border border-gray-200 bg-white dark:border-zinc-800 dark:bg-zinc-950 relative w-full rounded-xl">
      {/* Cover Image Skeleton */}
      <div className="relative h-48 sm:h-64 w-full bg-gray-100 dark:bg-zinc-900 animate-pulse border-b border-gray-100 dark:border-zinc-800" />

      {/* Content Section */}
      <div className="relative px-6 pb-8 pt-0 sm:px-10 sm:pb-10 sm:pt-0">
        
        {/* Avatar Skeleton */}
        <div className="flex justify-between items-start -mt-16 sm:-mt-20 mb-4">
          <div className="relative">
            <div className="w-32 h-32 sm:w-40 sm:h-40 border-4 border-white dark:border-zinc-950 rounded-full bg-gray-200 dark:bg-zinc-800 animate-pulse" />
          </div>
        </div>

        {/* Info Rows */}
        <div className="flex flex-col gap-4 mt-2">
          
          {/* Name, KYC Badge & Wallet Section */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            
            {/* Name & KYC Status Badge */}
            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              {/* Full Name Skeleton */}
              <div className="h-8 bg-gray-200 dark:bg-zinc-800 rounded animate-pulse w-48 sm:w-64" />
              {/* KYC Badge Skeleton */}
              <div className="h-6 bg-gray-200 dark:bg-zinc-800 rounded-full animate-pulse w-20" />
            </div>

            {/* Wallet Address & Copy Button */}
            <div className="flex items-center gap-2 shrink-0">
              <div className="h-4 bg-gray-200 dark:bg-zinc-800 rounded animate-pulse w-36 sm:w-44" />
              <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-zinc-900 animate-pulse" />
            </div>
          </div>
          
          {/* Bio Lines */}
          <div className="flex flex-col gap-2 mt-1 max-w-3xl">
            <div className="h-4 bg-gray-200 dark:bg-zinc-800 rounded animate-pulse w-full" />
            <div className="h-4 bg-gray-200 dark:bg-zinc-800 rounded animate-pulse w-5/6" />
          </div>
          
          {/* Location Skeleton */}
          <div className="flex items-center gap-2 mt-1">
            <div className="w-4 h-4 rounded bg-gray-200 dark:bg-zinc-800 animate-pulse" />
            <div className="h-3 bg-gray-200 dark:bg-zinc-800 rounded animate-pulse w-24" />
          </div>

          {/* Social Links Skeleton */}
          <div className="flex items-center gap-3 mt-2">
            <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-zinc-900 animate-pulse" />
            <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-zinc-900 animate-pulse" />
            <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-zinc-900 animate-pulse" />
          </div>

        </div>
      </div>
    </div>
  );
};