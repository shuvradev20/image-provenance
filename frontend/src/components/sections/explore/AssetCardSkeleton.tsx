export const AssetCardSkeleton = () => {
  return (
    <div className="overflow-hidden rounded-xl border border-zinc-800/80 bg-zinc-950/40 h-full flex flex-col">
      {/* Image Skeleton */}
      <div className="w-full aspect-square bg-zinc-800/50 animate-pulse border-b border-zinc-800/50"></div>
      
      {/* Content Skeleton */}
      <div className="px-4 pb-6 pt-4 flex flex-col flex-grow justify-between gap-4">
        {/* Title Skeleton */}
        <div className="h-4 bg-zinc-800/60 rounded animate-pulse w-3/4"></div>
        
        {/* Footer Skeleton */}
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-zinc-700/70">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-zinc-800/60 animate-pulse"></div>
            <div className="h-3 bg-zinc-800/60 rounded animate-pulse w-16"></div>
          </div>
          <div className="h-3 bg-zinc-800/60 rounded animate-pulse w-12"></div>
        </div>
      </div>
    </div>
  );
};