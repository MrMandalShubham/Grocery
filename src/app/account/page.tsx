"use client";
import { useRole } from "@/contexts/RoleContext";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AccountPage() {
  const { user, role } = useRole();
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center max-w-md mx-auto px-4">
        <span className="text-6xl">👋</span>
        <h1 className="text-3xl font-extrabold text-ink tracking-tight">Welcome to GenG</h1>
        <p className="text-ink-2 font-medium">Log in to view your account, track your orders, and access personalized offers.</p>
        
        <div className="flex flex-col gap-3 w-full mt-4">
          <Link href="/login" className="w-full bg-green text-white px-6 py-4 rounded-xl font-bold hover:bg-green-deep transition shadow-sm">
            Sign In / Register
          </Link>
          <Link href="/wholesale-login" className="w-full bg-white text-green-deep border-2 border-green px-6 py-4 rounded-xl font-bold hover:bg-green-mist transition">
            Shop Partner Login (B2B)
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 flex flex-col gap-8">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 bg-green-deep text-white rounded-full flex items-center justify-center text-2xl font-extrabold shadow-md">
          {user.user_metadata?.full_name?.charAt(0) || user.email?.charAt(0).toUpperCase()}
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-ink">{user.user_metadata?.full_name || "My Account"}</h1>
          <p className="text-ink-2 font-medium">{user.email}</p>
        </div>
      </div>

      <div className="bg-white border border-line rounded-3xl p-6 shadow-sm flex flex-col gap-4">
        <h2 className="text-lg font-bold text-ink mb-2">Account Details</h2>
        <div className="flex justify-between items-center py-2 border-b border-line">
          <span className="text-ink-3 font-semibold">Account Type</span>
          <span className="bg-green-soft text-green-deep px-3 py-1 rounded-full text-sm font-bold">{role} Customer</span>
        </div>
        <div className="flex justify-between items-center py-2 border-b border-line">
          <span className="text-ink-3 font-semibold">Phone</span>
          <span className="font-bold">{user.user_metadata?.phone || "Not added"}</span>
        </div>
      </div>

      <div className="flex flex-col gap-3 mt-4">
        <Link href="/orders" className="bg-white border border-line rounded-xl p-4 flex items-center justify-between hover:border-green transition shadow-sm">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📦</span>
            <span className="font-bold text-ink">My Orders</span>
          </div>
          <span className="text-ink-3">→</span>
        </Link>
        <div className="bg-white border border-line rounded-xl p-4 flex items-center justify-between opacity-50 cursor-not-allowed">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📍</span>
            <span className="font-bold text-ink">Saved Addresses</span>
          </div>
          <span className="text-xs bg-line px-2 py-1 rounded font-bold">Coming Soon</span>
        </div>
        <div className="bg-white border border-line rounded-xl p-4 flex items-center justify-between opacity-50 cursor-not-allowed">
          <div className="flex items-center gap-3">
            <span className="text-2xl">💳</span>
            <span className="font-bold text-ink">Payment Methods</span>
          </div>
          <span className="text-xs bg-line px-2 py-1 rounded font-bold">Coming Soon</span>
        </div>
      </div>

      <button 
        onClick={handleLogout}
        className="mt-8 text-danger font-bold w-full bg-danger/10 py-4 rounded-xl hover:bg-danger/20 transition"
      >
        Log Out
      </button>
    </div>
  );
}
