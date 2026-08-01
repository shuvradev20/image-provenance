export const AssetCardSkeleton = () => {
  return (
    <div className="overflow-hidden rounded-xl bg-card dark:bg-zinc-900/60 h-full flex flex-col">
      <div className="w-full aspect-square bg-muted/60 animate-pulse border-b border-border" />
      <div className="p-4 flex flex-col grow justify-between gap-3">
        <div className="h-4 bg-muted/80 rounded-md animate-pulse w-3/4" />
        
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-border">
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded-full bg-muted/80 animate-pulse" />
            <div className="h-3 bg-muted/70 rounded-md animate-pulse w-16" />
          </div>
          
          <div className="h-3 bg-muted/70 rounded-md animate-pulse w-10" />
        </div>
      </div>
    </div>
  );
};