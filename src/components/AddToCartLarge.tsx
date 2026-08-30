"use client";
import { Product } from "@/services/inventory";
import { useCart } from "@/contexts/CartContext";
import { useRouter } from "next/navigation";

export default function AddToCartLarge({ product }: { product: Product }) {
  const { items, addItem, updateQuantity } = useCart();
  const router = useRouter();
  
  const cartItem = items.find(i => i.id === product.id);
  const qtyInCart = cartItem?.quantity || 0;
  const isOutOfStock = product.stock === 0;

  if (qtyInCart > 0) {
    return (
      <div className="flex gap-3 w-full max-w-sm">
        <div className="flex items-center justify-between bg-green-soft rounded-xl px-2 py-3 border border-green-deep/20 w-[140px]">
          <button onClick={() => updateQuantity(product.id, qtyInCart - 1)} className="text-green-deep font-bold text-2xl hover:opacity-70 px-3">-</button>
          <span className="font-bold text-xl">{qtyInCart}</span>
          <button disabled={product.stock !== null && qtyInCart >= product.stock} onClick={() => updateQuantity(product.id, qtyInCart + 1)} className="text-green-deep font-bold text-2xl hover:opacity-70 px-3">+</button>
        </div>
        <button 
          onClick={() => router.push('/checkout')}
          className="flex-1 bg-yellow text-yellow-ink rounded-xl font-bold text-lg flex items-center justify-center hover:brightness-105 transition shadow-sm"
        >
          Buy Now →
        </button>
      </div>
    );
  }

  return (
    <button 
      disabled={isOutOfStock}
      onClick={() => addItem(product)}
      className={`w-full max-w-xs py-4 rounded-xl font-bold text-lg transition shadow-sm ${
        isOutOfStock 
          ? 'bg-line text-ink-3 cursor-not-allowed' 
          : 'bg-green-deep text-white hover:bg-green-ink shadow-md'
      }`}
    >
      {isOutOfStock ? 'Sold Out' : 'Add to Cart'}
    </button>
  );
}
