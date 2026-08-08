import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Heart, ShoppingBag, Plus, Minus, Truck, ShieldCheck, RefreshCw, Sparkles, X, Ruler } from "lucide-react";
import productsImage from "@/assets/rosse-products.jpg";

export interface ProductItem {
  id: string | number;
  name: string;
  price: number;
  category: string;
  tag: string;
  position?: string;
  image?: string;
  description: string;
  stripe_price_id?: string;
  sizes?: string[];
}

interface ProductDetailModalProps {
  product: ProductItem | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (productId: string | number, size: string, quantity: number) => void;
  favorites: Record<string | number, boolean>;
  toggleFavorite: (id: string | number) => void;
}

export function ProductDetailModal({
  product,
  isOpen,
  onClose,
  onAddToCart,
  favorites,
  toggleFavorite,
}: ProductDetailModalProps) {
  const [selectedSize, setSelectedSize] = useState<string>("S");
  const [quantity, setQuantity] = useState<number>(1);
  const [showSizeGuide, setShowSizeGuide] = useState<boolean>(false);

  // Determinar la lista de tallas disponibles
  const availableSizes = React.useMemo(() => {
    if (!product) return ["XS", "S", "M", "L", "XL"];
    if (product.sizes && product.sizes.length > 0) return product.sizes;
    
    const catLower = (product.category || "").toLowerCase();
    const nameLower = (product.name || "").toLowerCase();

    if (catLower.includes("accesorios") || catLower.includes("bolso") || nameLower.includes("cinturón")) {
      return ["Talla Única"];
    }
    return ["XS", "S", "M", "L", "XL"];
  }, [product]);

  // Al abrir el modal o cambiar de producto, resetear estados
  useEffect(() => {
    if (product && availableSizes.length > 0) {
      setSelectedSize(availableSizes[0]);
      setQuantity(1);
      setShowSizeGuide(false);
    }
  }, [product, availableSizes]);

  if (!product) return null;

  const isFavorite = !!favorites[product.id];
  const totalPrice = (product.price * quantity).toFixed(2);

  const handleConfirmAddToCart = () => {
    onAddToCart(product.id, selectedSize, quantity);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[95%] sm:max-w-2xl md:max-w-3xl p-0 overflow-hidden rounded-3xl border border-rose-100 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-2xl transition-all duration-300">
        <DialogTitle className="sr-only">{product.name}</DialogTitle>
        <DialogDescription className="sr-only">{product.description}</DialogDescription>

        <div className="relative grid grid-cols-1 md:grid-cols-12 max-h-[90vh] overflow-y-auto md:overflow-hidden">
          {/* Botón de Cierre Flotante Personalizado */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 z-20 size-9 rounded-full bg-white/90 dark:bg-zinc-900/90 text-zinc-700 dark:text-zinc-300 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-zinc-800 shadow-md backdrop-blur-md flex items-center justify-center border border-zinc-200/60 dark:border-zinc-800 transition-transform active:scale-90 cursor-pointer"
            aria-label="Cerrar vista previa"
          >
            <X className="size-4" />
          </button>

          {/* COLUMNA IZQUIERDA: Galería / Imagen del Producto (Bershka / Pull&Bear Style) */}
          <div className="md:col-span-6 relative aspect-[4/5] md:aspect-auto w-full bg-zinc-100 dark:bg-zinc-900 overflow-hidden group">
            {product.image ? (
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />
            ) : (
              <img
                src={productsImage}
                alt={product.name}
                className={`w-[400%] max-w-none h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 ${product.position || "left-0"}`}
              />
            )}

            {/* Badge de Etiqueta (Nuevo Drop, Más Vendido, etc.) */}
            <div className="absolute top-4 left-4 z-10">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-950/85 backdrop-blur-md px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest text-amber-300 border border-amber-400/30 shadow-lg">
                <Sparkles className="size-3 text-amber-400" />
                {product.tag}
              </span>
            </div>

            {/* Botón de Favorito Flotante sobre la Imagen */}
            <button
              onClick={() => toggleFavorite(product.id)}
              className="absolute bottom-4 left-4 z-10 size-10 rounded-full bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md flex items-center justify-center border border-zinc-200/50 shadow-md transition-transform active:scale-75 cursor-pointer"
              aria-label="Guardar en favoritos"
            >
              <Heart
                className={`size-5 transition-all ${
                  isFavorite ? "fill-rose-500 text-rose-500 scale-110 animate-pulse" : "text-zinc-700 dark:text-zinc-300"
                }`}
              />
            </button>
          </div>

          {/* COLUMNA DERECHA: Detalles, Tallas y Acción */}
          <div className="md:col-span-6 p-6 sm:p-8 flex flex-col justify-between space-y-6 bg-[#fffdfd] dark:bg-zinc-950 overflow-y-auto">
            {/* Header del Producto */}
            <div>
              <span className="text-[10px] font-black uppercase tracking-[0.25em] text-rose-600 dark:text-rose-400">
                {product.category}
              </span>
              <h2 className="mt-1 font-display text-xl sm:text-2xl font-black tracking-tight text-zinc-950 dark:text-zinc-50 leading-tight">
                {product.name}
              </h2>
              <div className="mt-2.5 flex items-baseline gap-2">
                <span className="font-mono text-2xl font-black text-zinc-950 dark:text-zinc-100">
                  ${product.price.toFixed(2)}
                </span>
                <span className="text-xs font-semibold text-zinc-400">USD</span>
                <span className="ml-2 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200/50">
                  En Stock
                </span>
              </div>

              <p className="mt-3 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed font-sans">
                {product.description || "Prenda moldeadora de alta tecnología confeccionada con textil inteligente ultra suave y elástico. Diseñada para esculpir y realzar tu figura con comodidad total."}
              </p>
            </div>

            {/* Selector de Tallas (Pull&Bear Style) */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-black uppercase tracking-wider text-zinc-900 dark:text-zinc-200">
                  Selecciona tu Talla
                </label>
                <button
                  type="button"
                  onClick={() => setShowSizeGuide(!showSizeGuide)}
                  className="inline-flex items-center text-[10px] font-extrabold uppercase tracking-wider text-rose-600 hover:text-rose-700 hover:underline cursor-pointer gap-1"
                >
                  <Ruler className="size-3" />
                  Guía de Tallas
                </button>
              </div>

              {/* Tira de Botones de Talla */}
              <div className="flex flex-wrap gap-2">
                {availableSizes.map((size) => {
                  const isSelected = selectedSize === size;
                  return (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setSelectedSize(size)}
                      className={`min-w-[44px] h-11 px-3.5 rounded-xl text-xs font-black tracking-wider transition-all duration-200 cursor-pointer flex items-center justify-center border ${
                        isSelected
                          ? "bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 border-zinc-950 dark:border-white shadow-md scale-[1.03]"
                          : "bg-zinc-50 hover:bg-zinc-100 text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800 hover:border-zinc-400"
                      }`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>

              {/* Popover / Mensaje desplegable de Guía de Tallas */}
              {showSizeGuide && (
                <div className="mt-2 p-3 rounded-xl bg-rose-50/70 dark:bg-rose-950/40 border border-rose-100 text-[11px] text-zinc-700 dark:text-zinc-300 animate-in fade-in-50 duration-200">
                  <p className="font-bold text-rose-700 dark:text-rose-400 mb-1">Guía orientativa de tallas Isafer:</p>
                  <ul className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-[10px]">
                    <li><b>XS:</b> 32-34 (Busto 80-84cm)</li>
                    <li><b>S:</b> 36 (Busto 85-89cm)</li>
                    <li><b>M:</b> 38 (Busto 90-94cm)</li>
                    <li><b>L:</b> 40-42 (Busto 95-100cm)</li>
                    <li><b>XL:</b> 44+ (Busto 101-106cm)</li>
                  </ul>
                </div>
              )}
            </div>

            {/* Selector de Cantidad */}
            <div className="flex items-center justify-between pt-1">
              <label className="text-[11px] font-black uppercase tracking-wider text-zinc-900 dark:text-zinc-200">
                Cantidad
              </label>
              <div className="flex items-center border border-zinc-200 dark:border-zinc-800 rounded-full bg-white dark:bg-zinc-900 p-1 shadow-xs">
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7 rounded-full text-zinc-600 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-zinc-800"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                  aria-label="Reducir cantidad"
                >
                  <Minus className="size-3" />
                </Button>
                <span className="w-8 text-center text-xs font-black text-zinc-900 dark:text-zinc-100 font-mono">
                  {quantity}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7 rounded-full text-zinc-600 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-zinc-800"
                  onClick={() => setQuantity((q) => q + 1)}
                  aria-label="Aumentar cantidad"
                >
                  <Plus className="size-3" />
                </Button>
              </div>
            </div>

            {/* Micro Garantías / Beneficios */}
            <div className="grid grid-cols-3 gap-2 py-3 border-y border-rose-100/60 dark:border-zinc-800/80 text-[10px] text-zinc-500">
              <div className="flex flex-col items-center text-center gap-1">
                <Truck className="size-4 text-rose-500" />
                <span className="font-semibold leading-tight">Envío Exprés Gratis &gt;$99</span>
              </div>
              <div className="flex flex-col items-center text-center gap-1">
                <ShieldCheck className="size-4 text-amber-500" />
                <span className="font-semibold leading-tight">100% Calidad Garantizada</span>
              </div>
              <div className="flex flex-col items-center text-center gap-1">
                <RefreshCw className="size-4 text-rose-500" />
                <span className="font-semibold leading-tight">Cambios de Talla Fáciles</span>
              </div>
            </div>

            {/* Botón Principal de Acción (Añadir a la Bolsa) */}
            <Button
              onClick={handleConfirmAddToCart}
              className="w-full h-14 rounded-2xl bg-[#ff007f] hover:bg-rose-600 text-white font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-rose-500/25 transition-all duration-200 active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
            >
              <ShoppingBag className="size-4" />
              Añadir a la Bolsa — ${totalPrice} USD
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
