"use client";
import ProductCard from "@/components/ProductCard";
import CuratedCarousel from "@/components/CuratedCarousel";
import { Category, Product } from "@/services/inventory";
import Link from "next/link";

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
  return (
    <div className="flex flex-col gap-10">
      {/* Categories Grid (10 items) */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-extrabold tracking-tight">Shop by category</h2>
        </div>
        <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-10 gap-3">
          {categories.map((cat) => (
            <Link 
              key={cat.id} 
              href={`/category/${cat.id}`}
              className="flex flex-col items-center gap-2 text-center py-3 px-1 rounded-2xl transition group cursor-pointer hover:bg-green-mist"
            >
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl transition-transform group-hover:-translate-y-1 shadow-sm border bg-green-soft border-green-soft text-green-deep">
                {cat.icon}
              </div>
              <span className="text-xs font-semibold leading-tight text-ink">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Dynamic Product Area */}
      <div className="flex flex-col gap-10">
        {categorizedProducts.map((group, idx) => (
          <section key={idx}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-extrabold tracking-tight">{group.title}</h2>
              {group.categoryId !== 'trending' && group.categoryId !== 'discounts' && (
                <Link 
                  href={`/category/${group.categoryId}`}
                  className="text-green-deep font-bold text-sm hover:underline"
                >
                  See all →
                </Link>
              )}
            </div>
            <div className="mt-2">
              {group.categoryId === 'trending' || group.categoryId === 'discounts' ? (
                <CuratedCarousel products={group.list} />
              ) : (
                <div className="flex gap-2 md:gap-4 overflow-x-auto pb-4 snap-x -mx-4 px-4 md:mx-0 md:px-0" style={{scrollbarWidth: 'none'}}>
                  {group.list.map((product) => (
                    <div key={product.id} className="snap-start flex-none w-[120px] sm:w-[170px] md:w-[190px] lg:w-[210px]">
                      <ProductCard product={product} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
