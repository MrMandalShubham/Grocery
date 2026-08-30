import { getProducts } from "@/services/inventory";
import ProductCard from "@/components/ProductCard";

export default async function SearchPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ [key: string]: string | string[] | undefined }> 
}) {
  const params = await searchParams;
  const q = typeof params.q === 'string' ? params.q : '';
  
  // Use the API search capability directly
  const results = q ? await getProducts({ search: q }) : [];

  return (
    <div className="max-w-7xl mx-auto py-8 flex flex-col gap-8 px-4">
      
      {/* Mobile-friendly search input on the page itself */}
      <form action="/search" method="GET" className="sm:hidden flex w-full">
        <input 
          type="text" 
          name="q" 
          defaultValue={q}
          placeholder="Search for groceries..." 
          className="w-full px-5 py-3 rounded-xl border border-line bg-white shadow-sm focus:outline-none focus:border-green focus:ring-2 focus:ring-green-soft"
        />
      </form>

      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold text-ink">
          {q ? `Search Results for "${q}"` : "Search"}
        </h1>
        <p className="text-ink-3 font-semibold">{q ? `${results.length} items found` : "Find anything you need instantly"}</p>
      </div>

      {results.length > 0 ? (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 md:gap-4">
          {results.map((product) => (
            <div key={product.id} className="w-[115px] sm:w-[170px] md:w-[190px] lg:w-[210px]">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      ) : !q ? (
        <div className="py-20 text-center flex flex-col items-center gap-4 bg-white border border-line rounded-3xl shadow-sm">
          <span className="text-6xl">🛒</span>
          <h3 className="text-xl font-bold text-ink">What are you looking for?</h3>
          <p className="text-ink-2 max-w-sm">Type a product name or category in the search bar to find exactly what you need.</p>
        </div>
      ) : (
        <div className="py-20 text-center flex flex-col items-center gap-4 bg-white border border-line rounded-3xl shadow-sm">
          <span className="text-6xl opacity-40">🔍</span>
          <h3 className="text-xl font-bold text-ink">No products found</h3>
          <p className="text-ink-2 max-w-sm">We couldn't find anything matching "{q}". Try searching for something else like "milk" or "bread".</p>
        </div>
      )}
    </div>
  );
}
