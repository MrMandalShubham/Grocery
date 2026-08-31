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
      className={`flex items-center justify-center w-8 h-8 md:w-10 md:h-10 text-white rounded-xl transition font-semibold disabled:opacity-50 ${
        !activeLoc && !isLocating ? 'bg-green-deep ring-2 ring-yellow animate-pulse shadow-[0_0_15px_rgba(255,215,0,0.6)]' : 'bg-green-ink/30 hover:bg-green-ink/50'
      }`}
      title={activeLoc ? activeLoc.name : "Locate Me"}
    >
      <span className="text-xl md:text-2xl">{isLocating ? '⏳' : '📍'}</span>
    </button>
  );
}
