import { getProducts } from "@/services/inventory";
import ProductCard from "@/components/ProductCard";

export default async function SearchPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ [key: string]: string | string[] | undefined }> 
}) {
  const params = await searchParams;
  const q = typeof params.q === 'string' ? params.q.toLowerCase() : '';
  
  const products = await getProducts();
  
  const results = q 
    ? products.filter(p => 
        p.name.toLowerCase().includes(q) || 
        p.category.toLowerCase().includes(q)
      )
    : [];

  return (
    <div className="max-w-7xl mx-auto py-8 flex flex-col gap-8 px-4">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold text-ink">
          Search Results for "{q}"
        </h1>
        <p className="text-ink-3 font-semibold">{results.length} items found</p>
      </div>

      {results.length > 0 ? (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 md:gap-4">
          {results.map((product) => (
            <div key={product.id} className="w-[115px] sm:w-[170px] md:w-[190px] lg:w-[210px]">
              <ProductCard product={product} />
            </div>
          ))}
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
