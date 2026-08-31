"use client";
import { useCart } from "@/contexts/CartContext";
import { useRole } from "@/contexts/RoleContext";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { Location } from "@/services/inventory";
import LocationSelector from "./LocationSelector";

export default function Header({ 
  currentLocation, 
  locations 
}: { 
  currentLocation?: string, 
  locations?: Location[] 
}) {
  const { itemCount, setIsCartOpen } = useCart();
  const { user } = useRole();
  const router = useRouter();

  return (
    <header className="sticky top-0 z-50 bg-green-deep text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-4 md:gap-6">
          <Link href="/" className="font-bold text-xl md:text-2xl tracking-tight hover:opacity-80 transition flex items-center gap-2">
            <img src="/logo.png" alt="GenG Logo" className="w-8 h-8 md:w-10 md:h-10 object-contain bg-white rounded-full shadow-sm" />
            <span className="hidden lg:inline">GenG</span>
          </Link>
          
          {currentLocation && locations && (
            <LocationSelector currentLocation={currentLocation} locations={locations} />
          )}
        </div>
        <div className="flex gap-4 items-center">
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const q = formData.get("q")?.toString();
              if (q) router.push(`/search?q=${encodeURIComponent(q)}`);
            }}
          >
            <input 
              name="q"
              type="text" 
              placeholder="Search products..." 
              className="hidden sm:block px-4 py-1.5 rounded-full bg-green-ink/50 text-white placeholder-green-soft border-none focus:ring-2 focus:ring-yellow outline-none text-sm w-48 lg:w-64"
            />
          </form>
          <Link href="/orders" className="hidden md:block text-sm font-bold text-green-mist hover:text-white transition">
            My Orders
          </Link>
          
          {user ? (
            <div className="flex items-center gap-3">
              <span className="hidden lg:block text-sm font-semibold truncate max-w-[120px]">{user.user_metadata?.full_name || user.email}</span>
              <button onClick={() => supabase.auth.signOut()} className="text-xs font-bold text-white bg-green-ink px-3 py-1.5 rounded-full hover:bg-white hover:text-green-deep transition">
                Logout
              </button>
            </div>
          ) : (
            <Link href="/login" className="text-sm font-bold text-white bg-green-ink px-4 py-1.5 rounded-full hover:bg-white hover:text-green-deep transition">
              Sign In
            </Link>
          )}
          <button 
            onClick={() => setIsCartOpen(true)}
            className="bg-yellow text-yellow-ink px-4 py-1.5 rounded-full font-bold text-sm hover:brightness-105 transition flex items-center gap-2"
          >
            <span>🛒</span> Cart ({itemCount})
          </button>
        </div>
      </div>
    </header>
  );
}
