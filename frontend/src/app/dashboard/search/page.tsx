import SearchResults from "@/components/sections/explore/SearchResults";

export const dynamic = 'force-dynamic'; 

// 1. Component take 'async' korte hobe
export default async function SearchPage(props: {
  searchParams: Promise<{ q?: string }>;
}) {
  // 2. searchParams ke await kore nite hobe
  const searchParams = await props.searchParams;
  const query = searchParams.q || "";

  return (
    <div className="container mx-auto px-4 md:px-6 py-8 mt-16 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">
          Search Results
        </h1>
        <p className="text-muted-foreground mt-2">
          {query ? (
            <>Showing results for <span className="font-semibold text-primary">"{query}"</span></>
          ) : (
            "Please enter a keyword to search."
          )}
        </p>
      </div>

      {/* Main client component ta call kore query pass kore dilam */}
      {query ? (
        <SearchResults query={query} />
      ) : null}
      
    </div>
  );
}