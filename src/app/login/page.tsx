"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RetailLogin() {
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
              role: 'B2C'
            }
          }
        });
        if (error) throw error;
        // On success, Supabase either logs them in or asks for email verification (depending on dashboard settings)
        alert("Registration successful! You can now log in.");
        setIsSignUp(false);
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        if (error) throw error;
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
      <div className="bg-white border border-line rounded-3xl p-8 shadow-md w-full max-w-md flex flex-col gap-6">
        <div className="text-center">
          <h1 className="text-2xl font-extrabold text-ink">Retail Customer {isSignUp ? 'Registration' : 'Login'}</h1>
          <p className="text-ink-2 text-sm mt-1">Get groceries delivered in minutes.</p>
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
              placeholder="Full Name" 
              className="border border-line rounded-xl px-4 py-3 focus:outline-none focus:border-green transition font-bold tracking-wide"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          )}
          <input 
            type="email" 
            placeholder="Email Address" 
            className="border border-line rounded-xl px-4 py-3 focus:outline-none focus:border-green transition font-bold tracking-wide"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input 
            type="password" 
            placeholder="Password" 
            className="border border-line rounded-xl px-4 py-3 focus:outline-none focus:border-green transition font-bold tracking-wide"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button 
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-xl font-bold transition shadow-sm ${loading ? 'bg-line text-ink-3' : 'bg-green text-white hover:bg-green-deep'}`}
          >
            {loading ? "Please wait..." : (isSignUp ? "Create Account" : "Login")}
          </button>
        </form>

        <div className="text-center text-sm">
          {isSignUp ? (
            <p>Already have an account? <button onClick={() => setIsSignUp(false)} className="text-green font-bold hover:underline">Log in</button></p>
          ) : (
            <p>New here? <button onClick={() => setIsSignUp(true)} className="text-green font-bold hover:underline">Create an account</button></p>
          )}
        </div>

        <div className="text-center text-xs text-ink-3 mt-4 border-t border-line pt-4">
          Are you a wholesale shop? <Link href="/wholesale-login" className="text-green-deep font-bold hover:underline">Login here</Link>
        </div>
      </div>
    </div>
  );
}
