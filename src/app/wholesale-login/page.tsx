"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function WholesaleLogin() {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // TODO: Connect actual Supabase auth here. Ensure user has 'shop' role.
    setTimeout(() => {
      setStep("otp");
      setLoading(false);
    }, 1000);
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // TODO: Connect actual Supabase verify here
    setTimeout(() => {
      window.location.href = "/";
    }, 1000);
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="bg-green-mist border border-green-soft rounded-3xl p-8 shadow-md w-full max-w-md flex flex-col gap-6 relative overflow-hidden">
        {/* Decorator */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-green-soft rounded-bl-full -z-10 opacity-50"></div>
        
        <div className="text-center">
          <span className="bg-green-deep text-white text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-wider mb-2 inline-block">B2B Portal</span>
          <h1 className="text-2xl font-extrabold text-green-deep">Shop Partner Login</h1>
          <p className="text-ink-2 text-sm mt-1">Access wholesale pricing & credit wallet.</p>
        </div>

        {step === "phone" ? (
          <form onSubmit={handleSendOtp} className="flex flex-col gap-4">
            <input 
              type="tel" 
              placeholder="Registered Shop Phone" 
              className="border border-green-soft rounded-xl px-4 py-3 focus:outline-none focus:border-green-deep transition font-bold tracking-wide"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
            <button 
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-xl font-bold transition shadow-sm ${loading ? 'bg-green-soft text-green-deep' : 'bg-green-deep text-white hover:bg-green-ink'}`}
            >
              {loading ? "Sending OTP..." : "Get OTP"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerify} className="flex flex-col gap-4">
            <div className="text-sm text-center">
              Enter the OTP sent to <span className="font-bold">{phone}</span>
            </div>
            <input 
              type="text" 
              placeholder="4-digit OTP" 
              className="border border-green-soft rounded-xl px-4 py-3 focus:outline-none focus:border-green-deep transition text-center font-bold tracking-widest text-lg"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              maxLength={4}
              required
            />
            <button 
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-xl font-bold transition shadow-sm ${loading ? 'bg-green-soft text-green-deep' : 'bg-green-deep text-white hover:bg-green-ink'}`}
            >
              {loading ? "Verifying..." : "Verify & Access Catalog"}
            </button>
          </form>
        )}

        <div className="text-center text-xs text-ink-3 mt-4 border-t border-green-soft pt-4">
          Not a shop? <Link href="/login" className="text-green font-bold hover:underline">Go to Retail Login</Link>
        </div>
      </div>
    </div>
  );
}
