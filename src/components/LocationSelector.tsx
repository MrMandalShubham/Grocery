"use client";

import { Location } from "@/services/inventory";
import { setLocationCookie } from "@/app/actions";
import { useCart } from "@/contexts/CartContext";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LocationSelector({ 
  currentLocation, 
  locations 
}: { 
  currentLocation: string; 
  locations: Location[] 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const { clearCart, items } = useCart();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const activeLoc = locations.find(l => l.id === currentLocation);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = async (locId: string) => {
    setIsOpen(false);
    if (locId === currentLocation) return;
    
    // Clear cart if switching locations to avoid stock issues
    if (items.length > 0) {
      const confirmClear = window.confirm("Changing your location will clear your current cart. Continue?");
      if (!confirmClear) return;
      clearCart();
    }
    
    await setLocationCookie(locId);
    router.refresh();
  };

  if (!locations || locations.length === 0) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 md:gap-2 text-white bg-green-ink/30 hover:bg-green-ink/50 px-2 py-1 md:px-3 md:py-1.5 rounded-xl transition text-xs md:text-sm font-semibold"
      >
        <span className="text-lg">📍</span>
        <span className="hidden sm:block truncate max-w-[120px] lg:max-w-[180px]">
          {activeLoc ? activeLoc.name : "Select Location"}
        </span>
        <span className="sm:hidden truncate max-w-[80px]">
          {activeLoc ? activeLoc.id : "Location"}
        </span>
        <span className="text-[10px]">▼</span>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-line overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
          <div className="p-3 bg-green-soft border-b border-line">
            <h3 className="font-bold text-green-deep text-sm">Choose Store</h3>
            <p className="text-xs text-green-ink opacity-80 leading-tight mt-0.5">Showing products in stock at this location</p>
          </div>
          <div className="max-h-60 overflow-y-auto p-1">
            {locations.map(loc => (
              <button
                key={loc.id}
                onClick={() => handleSelect(loc.id)}
                className={`w-full text-left flex flex-col p-2 rounded-xl transition ${
                  currentLocation === loc.id 
                    ? 'bg-green-mist/50' 
                    : 'hover:bg-line/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`font-bold text-sm ${currentLocation === loc.id ? 'text-green-deep' : 'text-ink'}`}>
                    {loc.name}
                  </span>
                  {currentLocation === loc.id && <span className="text-green-deep">✓</span>}
                </div>
                <span className="text-xs text-ink-3">
                  {loc.products_in_stock > 0 
                    ? `${loc.products_in_stock} products` 
                    : 'Out of stock'}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
