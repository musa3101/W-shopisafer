import React, { useRef, useState, useEffect } from "react";
import { Heart, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import productsImage from "@/assets/rosse-products.jpg";

interface ProductItem {
  id: string | number;
  name: string;
  price: number;
  category: string;
  tag: string;
  position?: string;
  image?: string;
  description: string;
}

interface TrendingCarouselProps {
  products: ProductItem[];
  favorites: Record<string | number, boolean>;
  toggleFavorite: (id: string | number) => void;
  addProduct: (id: string | number) => void;
  t: (key: any) => string;
}

export function TrendingCarousel({
  products,
  favorites,
  toggleFavorite,
  addProduct,
  t,
}: TrendingCarouselProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [thumbWidth, setThumbWidth] = useState(25); // Default thumb width percentage

  // Filter a curated selection of products to display as "Trending" (e.g. first 6 products)
  const baseTrendingProducts = products.slice(0, 6);
  // Repeat 4 times to create an infinite-like scrolling experience
  const trendingProducts = [...baseTrendingProducts, ...baseTrendingProducts, ...baseTrendingProducts, ...baseTrendingProducts].map((p, idx) => ({
    ...p,
    uniqueKey: `${p.id}-${idx}`,
  }));

  const handleScroll = () => {
    const container = containerRef.current;
    if (!container) return;

    const scrollLeft = container.scrollLeft;
    const scrollWidth = container.scrollWidth;
    const clientWidth = container.clientWidth;

    const maxScrollLeft = scrollWidth - clientWidth;
    if (maxScrollLeft > 0) {
      const progress = (scrollLeft / maxScrollLeft) * 100;
      setScrollProgress(progress);

      const visibleRatio = clientWidth / scrollWidth;
      setThumbWidth(Math.max(15, visibleRatio * 100)); // Minimum 15% width
    }
  };

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
      // Trigger initial layout calculation
      handleScroll();
      
      // Listen to resize to recalculate thumb width
      window.addEventListener("resize", handleScroll);

      return () => {
        container.removeEventListener("scroll", handleScroll);
        window.removeEventListener("resize", handleScroll);
      };
    }
  }, [trendingProducts.length]); // Use length instead of object reference

  // Render product image or fallback
  const renderProductImage = (p: ProductItem) => {
    if (p.image) {
      return (
        <img
          src={p.image}
          alt={p.name}
          loading="lazy"
          className="absolute top-0 left-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 rounded-none"
        />
      );
    }
    return (
      <img
        src={productsImage}
        alt={p.name}
        loading="lazy"
        className={`absolute top-0 h-full w-[400%] max-w-none object-cover transition-transform duration-700 ease-out group-hover:scale-105 rounded-none ${p.position || "left-0"}`}
      />
    );
  };

  // Calculate thumb left offset proportionally within the remaining track space
  const thumbLeft = (scrollProgress / 100) * (100 - thumbWidth);

  return (
    <section className="py-16 bg-white dark:bg-zinc-950 text-black dark:text-white border-b border-zinc-100 dark:border-zinc-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        {/* Section Header */}
        <div className="mb-8 text-left">
          <h2 className="font-sans text-xs font-bold uppercase tracking-[0.3em] text-zinc-400 dark:text-zinc-500">
            {t("trending_title")}
          </h2>
          <p className="mt-1.5 font-serif text-2xl sm:text-3xl italic text-zinc-950 dark:text-zinc-55 font-normal">
            {t("trending_subtitle")}
          </p>
        </div>

        {/* Scrollable Container */}
        <div
          ref={containerRef}
          className="flex overflow-x-auto gap-4 md:gap-6 snap-x snap-mandatory scrollbar-none pb-4"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          {trendingProducts.map((product) => (
            <div
              key={product.uniqueKey}
              className="min-w-[70%] sm:min-w-[35%] md:min-w-[28%] lg:min-w-[22%] snap-start flex flex-col group rounded-none"
            >
              {/* Product Image Container with sharp corners */}
              <div className="relative aspect-[3/4] w-full overflow-hidden bg-zinc-100 dark:bg-zinc-900 rounded-none border border-zinc-100 dark:border-zinc-900">
                {renderProductImage(product)}

                {/* Wishlist Heart Button - Minimalist outline */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(product.id);
                  }}
                  className="absolute right-3 top-3 size-8 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm flex items-center justify-center text-black dark:text-white hover:text-red-500 dark:hover:text-red-500 transition-colors shadow-sm rounded-none"
                  aria-label="Add to wishlist"
                >
                  <Heart
                    className={`size-4 stroke-[1.5] ${favorites[product.id] ? "fill-red-500 text-red-500" : "text-black dark:text-white"}`}
                  />
                </button>

              </div>

              {/* Product Details - Sharp and clean layout */}
              <div className="mt-3 flex flex-col text-left">
                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                  {product.category}
                </span>
                
                <h3 className="mt-1 font-sans text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 truncate">
                  {product.name}
                </h3>
                
                <div className="mt-1 flex items-center justify-between">
                  <span className="font-mono text-sm font-bold text-zinc-900 dark:text-zinc-100">
                    ${product.price.toFixed(2)} <span className="text-[9px] font-normal text-zinc-400">USD</span>
                  </span>
                  
                  {/* Mobile Quick Add Plus Icon Button */}
                  <button
                    onClick={() => addProduct(product.id)}
                    className="md:hidden size-8 flex items-center justify-center border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors text-black dark:text-white rounded-none"
                    aria-label="Quick add"
                  >
                    <Plus className="size-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Custom Progress Scrollbar */}
        <div className="mt-6 flex justify-center">
          <div className="w-48 h-[2px] bg-zinc-200 dark:bg-zinc-800 relative rounded-none overflow-hidden">
            <div
              className="h-full bg-black dark:bg-white absolute transition-all duration-75 ease-out rounded-none"
              style={{
                width: `${thumbWidth}%`,
                left: `${thumbLeft}%`,
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
