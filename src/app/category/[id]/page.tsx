import { getProducts, getCategories } from "@/services/inventory";
import ProductCard from "@/components/ProductCard";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function CategoryPage({ params }: { params: Promise<{ id: string }> }) {
  // Await the params object in Next.js 15
  const resolvedParams = await params;
  const categoryId = resolvedParams.id;
  
  const [products, categories] = await Promise.all([getProducts(), getCategories()]);

  const currentCategory = categories.find(c => c.id === categoryId);
  if (!currentCategory) {
    notFound();
  }

  const categoryProducts = products.filter(p => p.category === categoryId);

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto py-6">
      <Link href="/" className="inline-flex items-center gap-2 text-green-deep font-bold text-sm hover:underline mb-2">
        ← Back to home
      </Link>
      
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-green-soft text-green-deep flex items-center justify-center text-3xl shadow-sm border border-green-soft">
          {currentCategory.icon}
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-ink tracking-tight">{currentCategory.name}</h1>
          <p className="text-ink-2 text-sm mt-1">{categoryProducts.length} items · delivered in minutes</p>
        </div>
      </div>

      {categoryProducts.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {categoryProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="bg-white border border-line rounded-3xl p-12 text-center flex flex-col items-center gap-4 shadow-sm mt-8">
          <span className="text-5xl opacity-50">🛒</span>
          <h2 className="text-xl font-bold">No products yet</h2>
          <p className="text-ink-2">We are adding fresh items to this category soon!</p>
        </div>
      )}
    </div>
  );
}
