import SearchResults from "@/components/sections/explore/SearchResults";

export const dynamic = 'force-dynamic'; 

export default async function SearchPage(props: {
  searchParams: Promise<{ q?: string }>;
}) {
  const searchParams = await props.searchParams;
  const query = searchParams.q || "";

  return (
    <div className="container mx-auto px-4 md:px-6 py-4 max-w-7xl">
      <div className="mb-10">
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

      {query ? (
        <SearchResults query={query} />
      ) : null}
      
    </div>
  );
}