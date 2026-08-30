"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/contexts/CartContext";

export default function BottomNav() {
  const pathname = usePathname();
  const { itemCount, setIsCartOpen } = useCart();

  // Don't show bottom nav on checkout or auth pages
  if (pathname === '/checkout' || pathname === '/login' || pathname === '/wholesale-login') {
    return null;
  }

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-line z-[80] pb-safe">
      <nav className="flex items-center justify-around h-16">
        <Link 
          href="/" 
          className={`flex flex-col items-center justify-center w-full h-full gap-1 transition ${pathname === '/' ? 'text-green-deep' : 'text-ink-3 hover:text-green-soft'}`}
        >
          <span className="text-2xl leading-none">🏠</span>
          <span className="text-[10px] font-bold">Home</span>
        </Link>
        
        <Link 
          href="/search" 
          className={`flex flex-col items-center justify-center w-full h-full gap-1 transition ${pathname.startsWith('/search') ? 'text-green-deep' : 'text-ink-3 hover:text-green-soft'}`}
        >
          <span className="text-2xl leading-none">🔍</span>
          <span className="text-[10px] font-bold">Search</span>
        </Link>

        <button 
          onClick={() => setIsCartOpen(true)}
          className="flex flex-col items-center justify-center w-full h-full gap-1 transition text-ink-3 hover:text-green-soft relative"
        >
          <div className="relative">
            <span className="text-2xl leading-none">🛒</span>
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-2 bg-yellow text-yellow-ink text-[10px] font-extrabold w-4 h-4 flex items-center justify-center rounded-full">
                {itemCount}
              </span>
            )}
          </div>
          <span className="text-[10px] font-bold">Cart</span>
        </button>

        <Link 
          href="/orders" 
          className={`flex flex-col items-center justify-center w-full h-full gap-1 transition ${pathname.startsWith('/orders') ? 'text-green-deep' : 'text-ink-3 hover:text-green-soft'}`}
        >
          <span className="text-2xl leading-none">📦</span>
          <span className="text-[10px] font-bold">Orders</span>
        </Link>

        <Link 
          href="/account" 
          className={`flex flex-col items-center justify-center w-full h-full gap-1 transition ${pathname.startsWith('/account') ? 'text-green-deep' : 'text-ink-3 hover:text-green-soft'}`}
        >
          <span className="text-2xl leading-none">👤</span>
          <span className="text-[10px] font-bold">Account</span>
        </Link>
      </nav>
    </div>
  );
}
