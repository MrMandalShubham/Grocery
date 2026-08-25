import { getProducts } from "@/services/inventory";
import ProductCard from "@/components/ProductCard";

export default async function Home() {
  const products = await getProducts();

  return (
    <div className="flex flex-col gap-12">
      {/* Hero Section */}
      <section className="bg-green-soft rounded-3xl p-8 md:p-12 flex flex-col items-start gap-4">
        <span className="bg-green-deep text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
          B2B & Retail
        </span>
        <h1 className="text-4xl md:text-5xl font-extrabold text-ink tracking-tight max-w-2xl">
          Fresh groceries delivered to your door in minutes.
        </h1>
        <p className="text-ink-2 text-lg max-w-xl">
          Whether you are stocking up your home or purchasing wholesale for your shop, we have you covered with the best prices.
        </p>
        <button className="mt-4 bg-green text-white px-8 py-3 rounded-full font-bold hover:bg-green-deep transition shadow-sm">
          Shop Now
        </button>
      </section>

      {/* Catalog Grid */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Trending Near You</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
}

