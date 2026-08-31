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
      className="flex items-center gap-1 md:gap-2 text-white bg-green-ink/30 hover:bg-green-ink/50 px-2 py-1 md:px-3 md:py-1.5 rounded-xl transition text-xs md:text-sm font-semibold disabled:opacity-50"
    >
      <span className="text-lg">{isLocating ? '⏳' : '📍'}</span>
      <span className="hidden sm:block truncate max-w-[120px] lg:max-w-[180px]">
        {isLocating ? "Locating..." : (activeLoc ? activeLoc.name : "Locate Me")}
      </span>
      <span className="sm:hidden truncate max-w-[80px]">
        {isLocating ? "Locating..." : (activeLoc ? activeLoc.id : "Locate Me")}
      </span>
    </button>
  );
}
