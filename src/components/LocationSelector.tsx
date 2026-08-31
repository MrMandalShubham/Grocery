"use client";

import { useState } from "react";
import { setLocationCookie } from "@/app/actions";
import { useCart } from "@/contexts/CartContext";
import { useRouter } from "next/navigation";
import { Location } from "@/services/inventory";

import { STORE_LOCATIONS, MAX_DELIVERY_RADIUS_KM } from "@/config/stores";
import { calculateDistanceKM } from "@/lib/distance";

export default function LocationSelector({ 
  currentLocation, 
  locations 
}: { 
  currentLocation: string; 
  locations: Location[] 
}) {
  const [isLocating, setIsLocating] = useState(false);
  const { clearCart, items } = useCart();
  const router = useRouter();

  const activeLoc = locations.find(l => l.id === currentLocation);

  const handleAutoLocate = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        setIsLocating(false);
        
        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;
        
        // Find closest store
        let closestStoreId = null;
        let minDistance = Infinity;
        
        for (const [storeId, coords] of Object.entries(STORE_LOCATIONS)) {
          // Only check stores that exist in backend locations list
          if (locations.find(l => l.id === storeId)) {
            const distance = calculateDistanceKM(userLat, userLng, coords.lat, coords.lng);
            if (distance < minDistance) {
              minDistance = distance;
              closestStoreId = storeId;
            }
          }
        }
        
        if (closestStoreId && minDistance <= MAX_DELIVERY_RADIUS_KM) {
          if (closestStoreId !== currentLocation && items.length > 0) {
            clearCart(); // Auto clear cart if they were using a different location manually before
          }
          await setLocationCookie(closestStoreId);
          router.refresh();
        } else {
          // Out of service area
          router.push(`/out-of-service?lat=${userLat}&lng=${userLng}`);
        }
      },
      (error) => {
        setIsLocating(false);
        alert("Unable to retrieve your location. Please check your browser permissions.");
      }
    );
  };

  if (!locations || locations.length === 0) return null;

  return (
    <button 
      onClick={handleAutoLocate}
      disabled={isLocating}
      className={`flex items-center justify-center w-9 h-9 md:w-11 md:h-11 text-white rounded-xl transition disabled:opacity-50 ${
        !activeLoc && !isLocating ? 'bg-green-deep ring-2 ring-yellow animate-pulse shadow-[0_0_15px_rgba(255,215,0,0.6)]' : 'bg-green-ink/30 hover:bg-green-ink/50'
      }`}
    >
      {isLocating ? (
        <svg className="animate-spin w-5 h-5 md:w-6 md:h-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : (
        <svg className="w-5 h-5 md:w-6 md:h-6" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
          <circle cx="12" cy="10" r="3"/>
        </svg>
      )}
    </button>
  );
}
