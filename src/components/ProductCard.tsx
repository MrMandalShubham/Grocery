"use client";
import { Product } from "@/services/inventory";
import { useRole } from "@/contexts/RoleContext";
import { useCart } from "@/contexts/CartContext";
import Link from "next/link";

export default function ProductCard({ product }: { product: Product }) {
  const { role } = useRole();
  
  // B2B Pricing = Cost + 15%
  const b2bPrice = Math.ceil(product.cost * 1.15);
  const displayPrice = role === "B2B" ? b2bPrice : product.retailPrice;
  
  const isOutOfStock = product.stock === 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  return (
    <div className={`bg-white border ${isOutOfStock ? 'border-danger/30 opacity-70' : 'border-line'} rounded-2xl p-2.5 md:p-4 flex flex-col gap-2 md:gap-3 relative hover:shadow-md transition`}>
      {/* Badges */}
      <div className="absolute top-2 left-2 md:top-3 md:left-3 flex flex-col gap-1 z-10 pointer-events-none">
        {isOutOfStock && <span className="bg-danger text-white text-[9px] md:text-[10px] font-bold px-1.5 py-0.5 rounded-sm">OUT OF STOCK</span>}
        {isLowStock && <span className="bg-yellow text-yellow-ink text-[9px] md:text-[10px] font-bold px-1.5 py-0.5 rounded-sm">ONLY {product.stock} LEFT</span>}
      </div>

      <Link href={`/product/${product.name.replace(/[^a-zA-Z0-9- ]/g, '').replace(/\s+/g, '-').toLowerCase()}`} className="flex flex-col flex-grow cursor-pointer group">
        {/* Image Placeholder */}
        <div className="w-full h-20 md:h-32 bg-green-mist rounded-xl mt-4 flex items-center justify-center text-green-soft group-hover:bg-[#d4eadb] transition">
          <span className="text-3xl md:text-4xl">🛒</span>
        </div>

        {/* Details (Simplified) */}
        <div className="flex flex-col mt-2 md:mt-3 flex-grow">
          <h3 className="font-bold text-ink leading-tight text-xs md:text-sm line-clamp-2 group-hover:text-green-deep transition">{product.name}</h3>
        </div>
      </Link>

      {/* Pricing */}
      <div className="flex items-center justify-between mt-1 md:mt-2">
        <div className="flex flex-col">
          <span className="font-extrabold text-sm md:text-lg">₹{displayPrice}</span>
          {role === "B2C" && product.mrp > displayPrice && (
            <span className="text-[10px] md:text-xs text-ink-3 line-through">₹{product.mrp}</span>
          )}
        </div>
      </div>
    </div>
  );
}
