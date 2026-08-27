"use client";
import { useCart } from "@/contexts/CartContext";
import { useRole } from "@/contexts/RoleContext";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function Header() {
  const { itemCount, setIsCartOpen } = useCart();
  const { user } = useRole();

  return (
    <header className="sticky top-0 z-50 bg-green-deep text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="font-bold text-2xl tracking-tight hover:opacity-80 transition">Grocery.</Link>
        </div>
        <div className="flex gap-4 items-center">
          <input 
            type="text" 
            placeholder="Search products..." 
            className="hidden sm:block px-4 py-1.5 rounded-full bg-green-ink/50 text-white placeholder-green-soft border-none focus:ring-2 focus:ring-yellow outline-none text-sm w-48 lg:w-64"
          />
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
