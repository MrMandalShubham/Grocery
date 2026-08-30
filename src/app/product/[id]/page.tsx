import { getProducts } from "@/services/inventory";
import Link from "next/link";
import AddToCartLarge from "@/components/AddToCartLarge";
import ProductCard from "@/components/ProductCard";

export default async function ProductPage({ params }: { params: { id: string } }) {
  const products = await getProducts();
  const product = products.find(p => p.id === params.id);
  
  if (!product) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">Product not found</h1>
        <Link href="/" className="text-green hover:underline font-bold">Return Home</Link>
      </div>
    );
  }

  // Get some related products (same category, excluding current)
  const relatedProducts = products
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 5);

  return (
    <div className="max-w-5xl mx-auto py-8 flex flex-col gap-12">
      
      {/* Product Details Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
        {/* Left: Huge Image */}
        <div className="bg-green-mist rounded-3xl h-[400px] md:h-[500px] flex items-center justify-center text-green-soft relative">
          <span className="text-[120px] md:text-[180px]">🛒</span>
          {product.stock > 0 && product.stock <= 5 && (
            <span className="absolute top-6 left-6 bg-yellow text-yellow-ink text-xs font-bold px-3 py-1 rounded-sm shadow-sm">
              Hurry, only {product.stock} left!
            </span>
          )}
        </div>

        {/* Right: Info */}
        <div className="flex flex-col gap-6 justify-center">
          <div>
            <span className="text-sm text-ink-3 font-semibold uppercase tracking-wider bg-line/30 px-2 py-1 rounded-md">
              {product.category}
            </span>
            <h1 className="text-3xl md:text-4xl font-extrabold text-ink mt-3 leading-tight">
              {product.name}
            </h1>
            <p className="text-lg text-ink-2 mt-2">{product.unit}</p>
          </div>

          <div className="flex flex-col gap-1 border-y border-line py-6 my-2">
            <div className="flex items-end gap-3">
              <span className="text-4xl font-extrabold text-ink">₹{product.retailPrice}</span>
              {product.mrp > product.retailPrice && (
                <span className="text-xl text-ink-3 line-through mb-1">₹{product.mrp}</span>
              )}
            </div>
            {product.mrp > product.retailPrice && (
              <span className="text-green font-bold text-sm">
                You save ₹{product.mrp - product.retailPrice} ({Math.round(((product.mrp - product.retailPrice) / product.mrp) * 100)}% OFF)
              </span>
            )}
            <p className="text-xs text-ink-3 mt-1">(Inclusive of all taxes)</p>
          </div>

          <AddToCartLarge product={product} />

          {/* Dummy Benefits / Info like Flipkart */}
          <div className="flex flex-col gap-4 mt-4">
            <h3 className="font-bold text-lg">Why buy from us?</h3>
            <ul className="flex flex-col gap-3 text-sm text-ink-2">
              <li className="flex items-center gap-3"><span className="text-xl">⚡</span> Superfast delivery within minutes</li>
              <li className="flex items-center gap-3"><span className="text-xl">🛡️</span> 100% genuine & quality checked</li>
              <li className="flex items-center gap-3"><span className="text-xl">🔄</span> Easy returns no questions asked</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Description & Details */}
      <div className="bg-white border border-line rounded-3xl p-8 shadow-sm">
        <h2 className="text-2xl font-bold mb-4">Product Details</h2>
        <p className="text-ink-2 leading-relaxed">
          This is a freshly sourced, high-quality {product.name.toLowerCase()} that is an essential addition to your daily needs. 
          Packaged with strict hygiene standards to ensure maximum freshness and safety. Perfect for your home and family.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8 border-t border-line pt-8">
          <div className="flex flex-col gap-1">
            <span className="text-xs text-ink-3 font-semibold uppercase">Shelf Life</span>
            <span className="font-bold text-sm">Best before 6 months</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs text-ink-3 font-semibold uppercase">FSSAI License</span>
            <span className="font-bold text-sm">10012011000168</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs text-ink-3 font-semibold uppercase">Country of Origin</span>
            <span className="font-bold text-sm">India</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs text-ink-3 font-semibold uppercase">Return Policy</span>
            <span className="font-bold text-sm">Non-returnable</span>
          </div>
        </div>
      </div>

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-6">Similar items you might like</h2>
          <div className="flex gap-4 overflow-x-auto pb-4 snap-x -mx-4 px-4 md:mx-0 md:px-0" style={{scrollbarWidth: 'none'}}>
            {relatedProducts.map((p) => (
              <div key={p.id} className="snap-start flex-none w-[110px] sm:w-[170px] md:w-[190px] lg:w-[210px]">
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
