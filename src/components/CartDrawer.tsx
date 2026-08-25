"use client";
import { useCart } from "@/contexts/CartContext";
import { useRole } from "@/contexts/RoleContext";
import Link from "next/link";

export default function CartDrawer() {
  const { isCartOpen, setIsCartOpen, items, updateQuantity, cartTotal } = useCart();
  const { role } = useRole();

  if (!isCartOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-ink/50 z-[60] backdrop-blur-sm"
        onClick={() => setIsCartOpen(false)}
      />
      <div className="fixed top-0 right-0 h-full w-full max-w-md bg-cream z-[70] shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-white border-b border-line">
          <h2 className="text-xl font-bold">Your Cart</h2>
          <button 
            onClick={() => setIsCartOpen(false)}
            className="p-2 hover:bg-green-mist rounded-full text-ink-3 transition"
          >
            ✕
          </button>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-ink-3 gap-2">
              <span className="text-4xl">🛒</span>
              <p>Your cart is empty.</p>
            </div>
          ) : (
            items.map((item) => {
              const price = role === "B2B" ? Math.ceil(item.cost * 1.15) : item.retailPrice;
              return (
                <div key={item.id} className="bg-white p-3 rounded-xl border border-line flex gap-4 items-center shadow-sm">
                  <div className="w-16 h-16 bg-green-mist rounded-lg flex-shrink-0" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm leading-tight">{item.name}</h4>
                    <div className="text-xs text-ink-3 mb-2">{item.unit}</div>
                    <div className="font-bold">₹{price}</div>
                  </div>
                  
                  {/* Stepper */}
                  <div className="flex items-center gap-3 bg-green-soft rounded-lg px-2 py-1 border border-green-deep/20">
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="text-green-deep font-bold px-1 hover:opacity-70"
                    >-</button>
                    <span className="font-bold text-sm w-4 text-center">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="text-green-deep font-bold px-1 hover:opacity-70"
                      disabled={item.quantity >= item.stock}
                    >+</button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="bg-white p-6 border-t border-line flex flex-col gap-4 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
            <div className="flex justify-between items-center text-lg font-bold">
              <span>Bill Total</span>
              <span>₹{cartTotal}</span>
            </div>
            {role === "B2B" && (
              <div className="text-xs text-green-deep bg-green-mist p-2 rounded-md font-semibold">
                Paying with Shop Credit Wallet
              </div>
            )}
            <Link 
              href="/checkout"
              onClick={() => setIsCartOpen(false)}
              className="w-full bg-green text-white py-4 rounded-xl font-bold text-center hover:bg-green-deep transition text-lg shadow-sm block"
            >
              Proceed to Checkout
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
