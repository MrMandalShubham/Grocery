"use client";
import { useEffect, useState } from "react";

const ICONS = ["🥑", "🍎", "🥛", "🍞", "🍿", "🧼", "🥤", "🧴", "🌾", "🧀", "🥚", "🥫"];

export default function HeroAnimation() {
  const [icon, setIcon] = useState("🥑"); 

  useEffect(() => {
    // Randomize on client mount to avoid SSR hydration mismatch
    const randomIcon = ICONS[Math.floor(Math.random() * ICONS.length)];
    setIcon(randomIcon);
  }, []);

  return (
    <div className="absolute -right-4 top-1/2 -translate-y-1/2 md:relative md:top-auto md:translate-y-0 md:right-auto flex w-40 h-40 md:w-48 md:h-48 items-center justify-center pointer-events-none opacity-40 md:opacity-100">
      <div className="absolute inset-0 bg-green/10 rounded-full blur-2xl"></div>
      <span 
        className="text-[100px] md:text-[120px] drop-shadow-xl z-10 animate-bounce" 
        style={{ animationDuration: '3s' }}
      >
        {icon}
      </span>
    </div>
  );
}
