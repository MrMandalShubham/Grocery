"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function WholesaleLogin() {
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(false);
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              role: 'B2B'
            }
          }
        });
        if (error) throw error;
        alert("B2B Registration successful! You can now log in.");
        setIsSignUp(false);
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        if (error) throw error;
        
        // Double check they actually have a B2B role before letting them proceed
        if (data.user?.user_metadata?.role !== 'B2B') {
          await supabase.auth.signOut();
          throw new Error("This account is not registered as a Wholesale partner.");
        }
        
        router.push("/");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center py-10">
      <div className="bg-green-mist border border-green-soft rounded-3xl p-8 shadow-md w-full max-w-md flex flex-col gap-6 relative overflow-hidden">
        {/* Decorator */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-green-soft rounded-bl-full -z-10 opacity-50"></div>
        
        <div className="text-center">
          <span className="bg-green-deep text-white text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-wider mb-2 inline-block">B2B Portal</span>
          <h1 className="text-2xl font-extrabold text-green-deep">Shop Partner {isSignUp ? 'Registration' : 'Login'}</h1>
          <p className="text-ink-2 text-sm mt-1">Access wholesale pricing & catalog.</p>
        </div>

        {errorMsg && (
          <div className="bg-danger/10 text-danger text-sm font-bold p-3 rounded-lg text-center">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {isSignUp && (
            <input 
              type="text" 
              placeholder="Owner Full Name" 
              className="border border-green-soft rounded-xl px-4 py-3 focus:outline-none focus:border-green-deep transition font-bold tracking-wide"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          )}
          <input 
            type="email" 
            placeholder="Business Email" 
            className="border border-green-soft rounded-xl px-4 py-3 focus:outline-none focus:border-green-deep transition font-bold tracking-wide"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input 
            type="password" 
            placeholder="Password" 
            className="border border-green-soft rounded-xl px-4 py-3 focus:outline-none focus:border-green-deep transition font-bold tracking-wide"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button 
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-xl font-bold transition shadow-sm ${loading ? 'bg-green-soft text-green-deep' : 'bg-green-deep text-white hover:bg-green-ink'}`}
          >
            {loading ? "Please wait..." : (isSignUp ? "Register Shop" : "Access Catalog")}
          </button>
        </form>

        <div className="text-center text-sm">
          {isSignUp ? (
            <p>Already registered? <button onClick={() => setIsSignUp(false)} className="text-green-deep font-bold hover:underline">Log in</button></p>
          ) : (
            <p>New partner? <button onClick={() => setIsSignUp(true)} className="text-green-deep font-bold hover:underline">Register your shop</button></p>
          )}
        </div>

        <div className="text-center text-xs text-ink-3 mt-4 border-t border-green-soft pt-4">
          Not a shop? <Link href="/login" className="text-green font-bold hover:underline">Go to Retail Login</Link>
        </div>
      </div>
    </div>
  );
}
