"use client";
import { useEffect, useRef, useState } from "react";
import ProductCard from "@/components/ProductCard";
import { Product } from "@/services/inventory";

export default function CuratedCarousel({ products }: { products: Product[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [centerIndices, setCenterIndices] = useState<number[]>([]);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    let scrollInterval: NodeJS.Timeout;

    const startAutoScroll = () => {
      scrollInterval = setInterval(() => {
        if (el && !isHovered) {
          if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 10) {
            el.scrollTo({ left: 0, behavior: "smooth" });
          } else {
            el.scrollBy({ left: 240, behavior: "smooth" });
          }
        }
      }, 2500); 
    };

    startAutoScroll();

    let scrollTimeout: NodeJS.Timeout;
    const handleScroll = () => {
      // Debounce the heavy math slightly to avoid layout thrashing
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        const containerCenter = el.scrollLeft + el.clientWidth / 2;
        const children = Array.from(el.children) as HTMLElement[];
        
        const distances = children.map((child, index) => {
          const childCenter = child.offsetLeft + child.clientWidth / 2;
          return { index, distance: Math.abs(containerCenter - childCenter) };
        });

        distances.sort((a, b) => a.distance - b.distance);
        // The 3 closest to the center of the scroll view
        setCenterIndices(distances.slice(0, 3).map(d => d.index));
      }, 50);
    };

    el.addEventListener("scroll", handleScroll);
    // Trigger once on mount
    setTimeout(handleScroll, 100);

    return () => {
      clearInterval(scrollInterval);
      clearTimeout(scrollTimeout);
      el.removeEventListener("scroll", handleScroll);
    };
  }, [isHovered]);

  return (
    <div 
      ref={scrollRef} 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={() => setIsHovered(true)}
      onTouchEnd={() => setIsHovered(false)}
      className="flex gap-4 overflow-x-auto pb-8 pt-4 snap-x snap-mandatory -mx-4 px-4 md:mx-0 md:px-0 transition-all duration-300" 
      style={{scrollbarWidth: 'none'}}
    >
      {products.map((product, idx) => {
        const isCenter = centerIndices.includes(idx);
        return (
          <div 
            key={product.id} 
            className={`snap-center flex-none transition-all duration-500 ease-out ${
              isCenter 
                ? 'w-[130px] sm:w-[180px] md:w-[200px] lg:w-[220px] scale-[1.03] shadow-lg ring-4 ring-green-deep z-10 rounded-2xl relative' 
                : 'w-[120px] sm:w-[170px] md:w-[190px] lg:w-[210px] opacity-80 scale-[0.97]'
            }`}
          >
            <ProductCard product={product} />
          </div>
        );
      })}
    </div>
  );
}
