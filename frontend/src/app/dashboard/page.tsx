export default function DashboardHome() {
  const categories = ['All Assets', 'Verified ✅', 'Pending ⏳', 'Flagged ⚠️', 'Recent Mints'];

  const dummyAssets = [1, 2, 3, 4, 5, 6, 7, 8];

  return (
    <div className="flex flex-col gap-6 h-full pb-8 animate-in fade-in duration-500">
      
      {/* 1. Header Section */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Overview</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Manage and track your digital image provenance.
        </p>
      </div>

      {/* 2. YouTube Style Filter Pills */}
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {categories.map((category, index) => (
          <button
            key={index}
            className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              index === 0
                ? 'bg-primary text-primary-foreground shadow-sm' // Active state
                : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground border border-border/50'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* 3. The Image Gallery Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {dummyAssets.map((item) => (
          <div
            key={item}
            className="group relative aspect-square bg-muted/10 border border-border/50 rounded-xl overflow-hidden hover:border-primary/50 transition-all duration-300 flex flex-col hover:shadow-md"
          >
            {/* Image Placeholder (Glassmorphism touch) */}
            <div className="flex-1 bg-muted/30 flex items-center justify-center relative overflow-hidden">
               {/* Background pattern ba real image ekhane bosbe */}
               <span className="text-muted-foreground/40 text-xs font-semibold uppercase tracking-widest">
                 Image_{item} Data
               </span>
               
               {/* Web3 Status Badge */}
               <div className="absolute top-3 right-3 bg-background/80 backdrop-blur-md border border-border/50 px-2.5 py-1 rounded-md text-[10px] text-green-500 font-semibold shadow-sm">
                 Verified
               </div>
            </div>

            {/* Metadata Footer */}
            <div className="p-4 bg-background border-t border-border/50">
              <h3 className="text-sm font-medium truncate text-foreground">
                ProveNode_Asset_#{item}
              </h3>
              <div className="flex items-center justify-between mt-1.5">
                <p className="text-xs text-muted-foreground font-mono">0x...a89</p>
                <p className="text-[10px] text-muted-foreground">Just now</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      
    </div>
  );
}