"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function RetailLogin() {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // TODO: Connect actual Supabase auth here
    // const { error } = await supabase.auth.signInWithOtp({ phone });
    setTimeout(() => {
      setStep("otp");
      setLoading(false);
    }, 1000);
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // TODO: Connect actual Supabase verify here
    // const { error } = await supabase.auth.verifyOtp({ phone, token: otp, type: 'sms' });
    setTimeout(() => {
      window.location.href = "/";
    }, 1000);
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="bg-white border border-line rounded-3xl p-8 shadow-md w-full max-w-md flex flex-col gap-6">
        <div className="text-center">
          <h1 className="text-2xl font-extrabold text-ink">Retail Customer Login</h1>
          <p className="text-ink-2 text-sm mt-1">Get groceries delivered in minutes.</p>
        </div>

        {step === "phone" ? (
          <form onSubmit={handleSendOtp} className="flex flex-col gap-4">
            <input 
              type="tel" 
              placeholder="Enter your mobile number" 
              className="border border-line rounded-xl px-4 py-3 focus:outline-none focus:border-green transition font-bold tracking-wide"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
            <button 
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-xl font-bold transition shadow-sm ${loading ? 'bg-line text-ink-3' : 'bg-green text-white hover:bg-green-deep'}`}
            >
              {loading ? "Sending OTP..." : "Continue"}
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
              className="border border-line rounded-xl px-4 py-3 focus:outline-none focus:border-green transition text-center font-bold tracking-widest text-lg"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              maxLength={4}
              required
            />
            <button 
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-xl font-bold transition shadow-sm ${loading ? 'bg-line text-ink-3' : 'bg-green text-white hover:bg-green-deep'}`}
            >
              {loading ? "Verifying..." : "Verify & Login"}
            </button>
          </form>
        )}

        <div className="text-center text-xs text-ink-3 mt-4">
          Are you a wholesale shop? <Link href="/wholesale-login" className="text-green-deep font-bold hover:underline">Login here</Link>
        </div>
      </div>
    </div>
  );
}
