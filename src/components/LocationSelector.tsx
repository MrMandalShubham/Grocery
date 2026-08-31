"use client";

import { useState } from "react";
import { setLocationCookie } from "@/app/actions";
import { useCart } from "@/contexts/CartContext";
import { useRouter } from "next/navigation";
import { Location } from "@/services/inventory";

import { STORE_LOCATIONS, MAX_DELIVERY_RADIUS_KM } from "@/config/stores";
import { calculateDistanceKM } from "@/lib/distance";

import dynamic from "next/dynamic";

const MapPicker = dynamic(() => import("./MapPicker"), {
  ssr: false,
  loading: () => <div className="h-[300px] w-full bg-line/20 animate-pulse rounded-2xl flex items-center justify-center text-ink-3 font-semibold">Loading Map...</div>
});

export default function LocationSelector({ 
  currentLocation, 
  locations 
}: { 
  currentLocation: string; 
  locations: Location[] 
}) {
  const [isLocating, setIsLocating] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { clearCart, items } = useCart();
  const router = useRouter();

  const activeLoc = locations.find(l => l.id === currentLocation);

  const assignLocation = async (lat: number, lng: number) => {
    let closestStoreId = null;
    let minDistance = Infinity;
    
    for (const [storeId, coords] of Object.entries(STORE_LOCATIONS)) {
      if (locations.find(l => l.id === storeId)) {
        const distance = calculateDistanceKM(lat, lng, coords.lat, coords.lng);
        if (distance < minDistance) {
          minDistance = distance;
          closestStoreId = storeId;
        }
      }
    }
    
    if (closestStoreId && minDistance <= MAX_DELIVERY_RADIUS_KM) {
      if (closestStoreId !== currentLocation && items.length > 0) {
        clearCart(); 
      }
      await setLocationCookie(closestStoreId);
      setIsModalOpen(false);
      router.refresh();
    } else {
      setIsModalOpen(false);
      router.push(`/out-of-service?lat=${lat}&lng=${lng}`);
    }
  };

  const handleAutoLocate = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsLocating(false);
        assignLocation(position.coords.latitude, position.coords.longitude);
      },
      (error) => {
        setIsLocating(false);
        alert("Unable to retrieve your location. Please drop a pin on the map instead!");
      }
    );
  };

  if (!locations || locations.length === 0) return null;

  return (
    <>
      <div className="relative flex items-center justify-center w-9 h-9 md:w-11 md:h-11">
        {!activeLoc && !isLocating && !isModalOpen && (
          <span className="absolute inset-0 rounded-xl bg-yellow animate-ping opacity-75 pointer-events-none"></span>
        )}
        
        <button 
          onClick={() => setIsModalOpen(true)}
          disabled={isLocating}
          className={`relative flex items-center justify-center w-full h-full text-white rounded-xl transition disabled:opacity-50 z-10 ${
            !activeLoc && !isLocating && !isModalOpen ? 'bg-green-deep shadow-md' : 'bg-green-ink/30 hover:bg-green-ink/50'
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
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col">
            <div className="p-4 md:p-6 border-b border-line flex items-center justify-between bg-cream">
              <h2 className="text-xl font-extrabold text-ink">Select Delivery Location</h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-line/50 hover:bg-line text-ink transition"
              >
                ✕
              </button>
            </div>
            
            <div className="p-4 md:p-6 flex flex-col gap-6">
              <button
                onClick={handleAutoLocate}
                disabled={isLocating}
                className="w-full flex items-center justify-center gap-3 bg-green-soft text-green-deep font-bold py-4 rounded-xl border border-green-deep/20 hover:bg-[#d4eadb] transition disabled:opacity-50"
              >
                {isLocating ? '⏳ Locating...' : '📍 Use Current GPS Location'}
              </button>

              <div className="flex items-center gap-4 text-ink-3">
                <div className="flex-1 h-px bg-line"></div>
                <span className="text-xs font-semibold uppercase">Or pin on map</span>
                <div className="flex-1 h-px bg-line"></div>
              </div>

              <MapPicker onConfirm={assignLocation} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
