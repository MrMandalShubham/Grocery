"use client";

import { Suspense, useState } from "react";
import { logServiceRequest } from "@/app/actions";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function OutOfServiceContent() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();

  const lat = Number(searchParams.get("lat"));
  const lng = Number(searchParams.get("lng"));

  const handleResponse = async (wantsService: boolean) => {
    if (!lat || !lng) {
      router.push("/");
      return;
    }
    setLoading(true);
    await logServiceRequest(lat, lng, wantsService);
    setLoading(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center max-w-md mx-auto px-4">
        <span className="text-6xl mb-6">✅</span>
        <h1 className="text-2xl font-extrabold tracking-tight mb-2 text-green-deep">Thank you!</h1>
        <p className="text-ink-2 mb-8">
          We have recorded your location. Your feedback helps us decide where to open our next warehouse. We'll be there soon!
        </p>
        <Link href="/" className="bg-green-soft text-green-deep font-bold px-6 py-3 rounded-full hover:bg-green-mist transition">
          Go back to homepage
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center max-w-md mx-auto px-4">
      <span className="text-6xl mb-6">📍</span>
      <h1 className="text-2xl font-extrabold tracking-tight mb-2 text-ink">We're not in your area yet!</h1>
      <p className="text-ink-2 mb-8 leading-relaxed">
        It looks like you are more than 10km away from any of our current fulfillment centers. 
        We are expanding rapidly and want to know where to go next!
      </p>
      
      <div className="w-full bg-white p-6 rounded-3xl border border-line shadow-sm mb-6">
        <h2 className="font-bold text-lg mb-4 text-green-deep">Do you want service at this location?</h2>
        <div className="flex flex-col gap-3">
          <button 
            onClick={() => handleResponse(true)}
            disabled={loading}
            className="w-full bg-green-deep text-white font-bold py-3 rounded-xl hover:bg-green-ink transition disabled:opacity-50"
          >
            Yes, please notify me!
          </button>
          <button 
            onClick={() => handleResponse(false)}
            disabled={loading}
            className="w-full bg-white text-ink border border-line font-bold py-3 rounded-xl hover:bg-line/50 transition disabled:opacity-50"
          >
            No thanks, just browsing
          </button>
        </div>
      </div>

      <Link href="/" className="text-sm font-semibold text-ink-3 hover:text-green-deep transition underline">
        Manually select a different location
      </Link>
    </div>
  );
}

export default function OutOfServicePage() {
  return (
    <Suspense fallback={<div className="min-h-[60vh] flex items-center justify-center">Loading...</div>}>
      <OutOfServiceContent />
    </Suspense>
  );
}
