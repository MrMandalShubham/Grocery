import { getProducts, getCategories } from "@/services/inventory";
import HomeCatalog from "@/components/HomeCatalog";

export default async function Home() {
  const products = await getProducts();
  const categories = await getCategories();

  // Group products by category
  const categorizedProducts = categories.map(cat => ({
    categoryId: cat.id,
    title: cat.name,
    list: products.filter(p => p.category === cat.id)
  })).filter(group => group.list.length > 0);

  return (
    <div className="flex flex-col gap-10 max-w-7xl mx-auto py-6">
      {/* Original Style Hero Section */}
      <section className="rounded-3xl bg-gradient-to-br from-[#EAF4E2] via-[#DCEBD2] to-[#CFE3C2] border border-[#D7E6CB] relative overflow-hidden p-8 md:p-12 flex items-center justify-between">
        <div className="relative z-10">
          <span className="inline-flex items-center gap-2 bg-yellow text-yellow-ink font-bold text-xs px-3 py-1 rounded-full mb-4">
            🏷️ UP TO 40% OFF
          </span>
          <h1 className="text-3xl md:text-4xl font-extrabold text-green-ink tracking-tight max-w-sm leading-tight">
            Daily groceries, delivered in minutes
          </h1>
          <p className="text-ink-2 mt-2 max-w-md text-sm md:text-base font-medium">
            Fresh produce, dairy, snacks and household essentials — at your door before your chai gets cold.
          </p>
          <button className="mt-6 bg-green-deep text-white px-6 py-3 rounded-full font-bold hover:bg-green-ink transition shadow-sm inline-flex items-center gap-2">
            Shop now →
          </button>
        </div>
        {/* Abstract Art matching original style */}
        <div className="hidden md:flex relative w-48 h-48 items-center justify-center">
          <div className="absolute inset-0 bg-green/10 rounded-full blur-2xl"></div>
          <span className="text-[120px] drop-shadow-xl z-10 animate-bounce" style={{animationDuration: '3s'}}>🥑</span>
        </div>
      </section>

      {/* Offers Strip */}
      <section className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0" style={{scrollbarWidth: 'none'}}>
        <button className="flex-none flex items-center gap-2 bg-white border border-line rounded-full px-4 py-2 text-sm font-semibold hover:border-green hover:-translate-y-0.5 transition shadow-sm">
          <span className="text-green-deep font-extrabold">₹75 OFF</span> on orders above ₹749 — GREEN75
        </button>
        <button className="flex-none flex items-center gap-2 bg-white border border-line rounded-full px-4 py-2 text-sm font-semibold hover:border-green hover:-translate-y-0.5 transition shadow-sm">
          <span className="text-green-deep font-extrabold">₹50 OFF</span> on orders above ₹499 — GREEN50
        </button>
        <button className="flex-none flex items-center gap-2 bg-white border border-line rounded-full px-4 py-2 text-sm font-semibold hover:border-green hover:-translate-y-0.5 transition shadow-sm">
          <span className="text-green-deep font-extrabold">FREE</span> delivery above ₹199
        </button>
      </section>

      <HomeCatalog categories={categories} categorizedProducts={categorizedProducts} />
    </div>
  );
}
