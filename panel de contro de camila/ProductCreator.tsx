import { useState } from "react";
import { PlusCircle, Image as ImageIcon, Sparkles, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { createProduct } from "../src/services/insforgeService";

interface ProductCreatorProps {
  onProductCreated: () => void;
  onCancel: () => void;
}

export function ProductCreator({ onProductCreated, onCancel }: ProductCreatorProps) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [description, setDescription] = useState("");
  const [badge, setBadge] = useState("");
  const [stripePriceId, setStripePriceId] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price) {
      toast.error("El nombre y el precio de venta son campos obligatorios");
      return;
    }

    setLoading(true);
    try {
      const res = await createProduct({
        name,
        price: parseFloat(price) || 0,
        stock: parseInt(stock, 10) || 0,
        description,
        badge,
        stripe_price_id: stripePriceId,
        images: imageUrl ? [imageUrl] : undefined,
      });

      if (res.success) {
        toast.success(`Colección/Prenda '${name}' añadida con éxito.`);
        setName("");
        setPrice("");
        setStock("");
        setDescription("");
        setBadge("");
        setStripePriceId("");
        setImageUrl("");
        onProductCreated();
      } else {
        toast.error(res.error || "No se pudo añadir la prenda");
      }
    } catch (err) {
      toast.error("Error al conectar con la base de datos");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 sm:p-6 space-y-6 shadow-xl">
      <div className="flex items-center gap-2 pb-3 border-b border-zinc-850">
        <PlusCircle className="w-5 h-5 text-rose-500" />
        <h4 className="text-sm font-black text-white uppercase tracking-widest">Añadir Nueva Prenda a la Web</h4>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left column: Photo Upload / URL Preview */}
        <div className="space-y-4">
          <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Foto de la Prenda</label>
          
          {/* Image preview frame */}
          <div className="aspect-[3/4] w-full rounded-2xl bg-zinc-950 border border-zinc-850 overflow-hidden flex flex-col items-center justify-center relative shadow-inner group">
            {imageUrl ? (
              <img 
                src={imageUrl} 
                alt="Vista previa" 
                className="w-full h-full object-cover"
                onError={() => {
                  toast.error("No se pudo cargar la imagen de la URL ingresada");
                }}
              />
            ) : (
              <div className="text-center p-4">
                <ImageIcon className="w-12 h-12 stroke-[1.2] text-zinc-700 mx-auto mb-2" />
                <p className="text-[10px] text-zinc-550 leading-relaxed">Pega una URL de imagen a la derecha para ver la vista previa aquí</p>
              </div>
            )}
          </div>
        </div>

        {/* Center & Right columns: Inputs form */}
        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* 1. Name */}
          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Nombre de la Prenda *</label>
            <input
              type="text"
              required
              placeholder="Ej: Vestido Barbie Luxe Pink"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-850 rounded-xl text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-rose-500/50 transition-colors"
            />
          </div>

          {/* 2. Price */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Precio de Venta ($ USD) *</label>
            <input
              type="number"
              step="0.01"
              required
              placeholder="Ej: 45.00"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-850 rounded-xl text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-rose-500/50 transition-colors font-mono"
            />
          </div>

          {/* 3. Stock */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Unidades Iniciales de Stock</label>
            <input
              type="number"
              placeholder="Ej: 15"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-850 rounded-xl text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-rose-500/50 transition-colors font-mono"
            />
          </div>

          {/* 4. Description */}
          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Descripción o Detalles de la prenda</label>
            <textarea
              placeholder="Ej: Confección premium con tejido elástico entallado..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-850 rounded-xl text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-rose-500/50 transition-colors resize-none"
            />
          </div>

          {/* 5. URL Image input */}
          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider font-semibold">URL de la Imagen</label>
            <input
              type="url"
              placeholder="https://images.unsplash.com/..."
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-850 rounded-xl text-xs text-white placeholder-zinc-650 focus:outline-none focus:border-rose-500/50 transition-colors font-mono"
            />
          </div>

          {/* 6. Tag Badge */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Etiqueta Especial (Badge)</label>
            <input
              type="text"
              placeholder="Ej: NUEVO, BARBIE LUXE"
              value={badge}
              onChange={(e) => setBadge(e.target.value)}
              className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-850 rounded-xl text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-rose-500/50 transition-colors"
            />
          </div>

          {/* 7. Stripe Price ID */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Stripe Price ID</label>
            <input
              type="text"
              placeholder="Ej: price_1Q..."
              value={stripePriceId}
              onChange={(e) => setStripePriceId(e.target.value)}
              className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-850 rounded-xl text-xs text-white placeholder-zinc-650 focus:outline-none focus:border-rose-500/50 transition-colors font-mono"
            />
          </div>

        </div>
      </div>

      {/* Buttons */}
      <div className="flex items-center justify-end gap-2 border-t border-zinc-850/60 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-zinc-950 hover:bg-zinc-900 border border-zinc-850 text-zinc-450 hover:text-zinc-200 text-xs font-bold rounded-xl transition-all"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className={`flex items-center gap-1.5 px-5 py-2.5 bg-rose-500 hover:bg-rose-600 text-white text-xs font-black rounded-xl transition-all shadow-lg ${
            loading ? 'opacity-50 cursor-not-allowed' : 'shadow-rose-500/10'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          {loading ? "Creando Prenda..." : "Añadir Prenda"}
        </button>
      </div>
    </form>
  );
}
