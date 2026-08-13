import React from "react";
import { X } from "lucide-react";
import { ProductItem } from "./ProductDetailModal";

interface QuickAddOverlayProps {
  product: ProductItem;
  isOpen: boolean;
  onClose: () => void;
  onSelectSize: (size: string) => void;
}

export function QuickAddOverlay({
  product,
  isOpen,
  onClose,
  onSelectSize,
}: QuickAddOverlayProps) {
  if (!isOpen) return null;

  // Determinar la lista de tallas disponibles
  const availableSizes = (() => {
    if (product.sizes && product.sizes.length > 0) return product.sizes;

    const catLower = (product.category || "").toLowerCase();
    const nameLower = (product.name || "").toLowerCase();

    if (
      catLower.includes("accesorios") ||
      catLower.includes("bolso") ||
      nameLower.includes("cinturón")
    ) {
      return ["Talla Única"];
    }
    return ["XS", "S", "M", "L", "XL"];
  })();

  const handleContainerClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div
      onClick={handleContainerClick}
      className="absolute inset-0 z-30 flex flex-col justify-end p-2.5 bg-zinc-950/80 backdrop-blur-md rounded-2xl animate-in fade-in slide-in-from-bottom-3 duration-200 ease-out select-none"
    >
      {/* Botón de Cierre */}
      <div className="flex items-center justify-between mb-2 px-1">
        <span className="text-[10px] font-black uppercase tracking-widest text-amber-300">
          Selecciona Talla
        </span>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="size-7 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-transform active:scale-90 cursor-pointer"
          aria-label="Cerrar selección de talla"
        >
          <X className="size-3.5" />
        </button>
      </div>

      {/* Selector de Tallas Grid/Strip estilo Pull&Bear */}
      <div className="flex flex-wrap gap-1.5 justify-center mb-1">
        {availableSizes.map((size) => (
          <button
            key={size}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSelectSize(size);
            }}
            className="flex-1 min-w-[42px] h-10 px-2 rounded-xl bg-white hover:bg-rose-50 text-zinc-950 font-black text-xs tracking-wider transition-all duration-150 active:scale-95 flex items-center justify-center shadow-md border border-white/40 cursor-pointer"
          >
            {size}
          </button>
        ))}
      </div>

      <p className="text-[9px] text-center text-zinc-300/80 font-medium tracking-tight mt-1">
        Añade al instante a tu bolsa ✨
      </p>
    </div>
  );
}
