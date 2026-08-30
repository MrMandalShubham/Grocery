"use client";
import { Product } from "@/services/inventory";
import { useRole } from "@/contexts/RoleContext";
import { useCart } from "@/contexts/CartContext";

export default function ProductCard({ product }: { product: Product }) {
  const { role } = useRole();
  const { items, addItem, updateQuantity } = useCart();
  
  // B2B Pricing = Cost + 15%
  const b2bPrice = Math.ceil(product.cost * 1.15);
  const displayPrice = role === "B2B" ? b2bPrice : product.retailPrice;
  
  const isOutOfStock = product.stock === 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;
  
  const cartItem = items.find(i => i.id === product.id);
  const qtyInCart = cartItem?.quantity || 0;

  return (
    <div className={`bg-white border ${isOutOfStock ? 'border-danger/30 opacity-70' : 'border-line'} rounded-2xl p-2.5 md:p-4 flex flex-col gap-2 md:gap-3 relative hover:shadow-md transition`}>
      {/* Badges */}
      <div className="absolute top-2 left-2 md:top-3 md:left-3 flex flex-col gap-1 z-10">
        {isOutOfStock && <span className="bg-danger text-white text-[9px] md:text-[10px] font-bold px-1.5 py-0.5 rounded-sm">OUT OF STOCK</span>}
        {isLowStock && <span className="bg-yellow text-yellow-ink text-[9px] md:text-[10px] font-bold px-1.5 py-0.5 rounded-sm">ONLY {product.stock} LEFT</span>}
      </div>

      {/* Image Placeholder */}
      <div className="w-full h-20 md:h-32 bg-green-mist rounded-xl mt-4 flex items-center justify-center text-green-soft">
        <span className="text-3xl md:text-4xl">🛒</span>
      </div>

      {/* Details */}
      <div className="flex flex-col gap-0.5 md:gap-1 flex-grow">
        <span className="text-[9px] md:text-xs text-ink-3 font-semibold uppercase tracking-wider">{product.category}</span>
        <h3 className="font-bold text-ink leading-tight text-xs md:text-sm line-clamp-2">{product.name}</h3>
        <span className="text-[10px] md:text-xs text-ink-2">{product.unit}</span>
      </div>

      {/* Pricing & CTA */}
      <div className="flex items-center justify-between mt-1 md:mt-2">
        <div className="flex flex-col">
          <span className="font-extrabold text-sm md:text-lg">₹{displayPrice}</span>
          {role === "B2B" && <span className="text-[9px] md:text-[10px] text-green-deep font-semibold">Cost+15%</span>}
          {role === "B2C" && product.mrp > displayPrice && (
            <span className="text-[10px] md:text-xs text-ink-3 line-through">₹{product.mrp}</span>
          )}
        </div>
        
        {qtyInCart > 0 ? (
          <div className="flex items-center gap-1.5 md:gap-3 bg-green-soft rounded-lg px-1.5 md:px-2 py-1 border border-green-deep/20">
            <button onClick={() => updateQuantity(product.id, qtyInCart - 1)} className="text-green-deep font-bold px-1 hover:opacity-70 text-xs md:text-sm">-</button>
            <span className="font-bold text-xs md:text-sm w-3 md:w-4 text-center">{qtyInCart}</span>
            <button disabled={qtyInCart >= product.stock} onClick={() => updateQuantity(product.id, qtyInCart + 1)} className="text-green-deep font-bold px-1 hover:opacity-70 text-xs md:text-sm">+</button>
          </div>
        ) : (
          <button 
            disabled={isOutOfStock}
            onClick={() => addItem(product)}
            className={`px-3 py-1 md:px-4 md:py-1.5 rounded-full font-bold text-xs md:text-sm transition ${isOutOfStock ? 'bg-line text-ink-3 cursor-not-allowed' : 'bg-green-soft text-green-deep border border-green-deep hover:bg-green-deep hover:text-white'}`}
          >
            {isOutOfStock ? 'Sold' : 'ADD'}
          </button>
        )}
      </div>
    </div>
  );
}

