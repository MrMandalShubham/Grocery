"use client";
import { useState } from "react";
import ProductCard from "@/components/ProductCard";
import { Category, Product } from "@/services/inventory";

interface CategorizedGroup {
  categoryId: string;
  title: string;
  list: Product[];
}

export default function HomeCatalog({ 
  categories, 
  categorizedProducts 
}: { 
  categories: Category[], 
  categorizedProducts: CategorizedGroup[] 
}) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const selectedGroup = selectedCategory 
    ? categorizedProducts.find(g => g.categoryId === selectedCategory) 
    : null;

  return (
    <div className="flex flex-col gap-10">
      {/* Categories Grid (10 items) */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-extrabold tracking-tight">Shop by category</h2>
          {selectedCategory && (
            <button 
              onClick={() => setSelectedCategory(null)}
              className="text-green-deep font-bold text-sm hover:underline"
            >
              Clear filter ✕
            </button>
          )}
        </div>
        <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-10 gap-3">
          {categories.map((cat) => (
            <button 
              key={cat.id} 
              onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
              className={`flex flex-col items-center gap-2 text-center py-3 px-1 rounded-2xl transition group cursor-pointer ${
                selectedCategory === cat.id ? 'bg-green-soft ring-2 ring-green-deep' : 'hover:bg-green-mist'
              }`}
            >
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl transition-transform group-hover:-translate-y-1 shadow-sm border ${
                selectedCategory === cat.id ? 'bg-white border-green-deep' : 'bg-green-soft border-green-soft text-green-deep'
              }`}>
                {cat.icon}
              </div>
              <span className={`text-xs font-semibold leading-tight ${selectedCategory === cat.id ? 'text-green-deep font-extrabold' : 'text-ink'}`}>
                {cat.name}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Dynamic Product Area */}
      {selectedCategory ? (
        <section className="bg-white border border-line rounded-3xl p-6 md:p-8 shadow-sm">
          <h2 className="text-2xl font-extrabold tracking-tight mb-6">
            {categories.find(c => c.id === selectedCategory)?.name}
          </h2>
          {selectedGroup && selectedGroup.list.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {selectedGroup.list.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="py-12 text-center flex flex-col items-center gap-2">
              <span className="text-5xl opacity-50 mb-2">🛒</span>
              <h3 className="text-lg font-bold text-ink">No items here</h3>
              <p className="text-ink-2">We are stocking up this category soon!</p>
            </div>
          )}
        </section>
      ) : (
        <div className="flex flex-col gap-10">
          {categorizedProducts.map((group, idx) => (
            <section key={idx}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-extrabold tracking-tight">{group.title}</h2>
                <button 
                  onClick={() => setSelectedCategory(group.categoryId)} 
                  className="text-green-deep font-bold text-sm hover:underline"
                >
                  See all →
                </button>
              </div>
              <div className="flex gap-4 overflow-x-auto pb-4 snap-x -mx-4 px-4 md:mx-0 md:px-0" style={{scrollbarWidth: 'none'}}>
                {group.list.map((product) => (
                  <div key={product.id} className="snap-start flex-none w-[160px] md:w-[172px]">
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
