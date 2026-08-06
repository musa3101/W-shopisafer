import { useState, useRef } from "react";
import { PlusCircle, Image as ImageIcon, Sparkles, Upload, Check, Trash2, Tag, Layers, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { createProduct, uploadProductImage } from "../src/services/insforgeService";

interface ProductCreatorProps {
  onProductCreated: () => void;
  onCancel: () => void;
}

const US_SIZES = ["XS", "S", "M", "L", "XL", "0", "2", "4", "6", "8", "10", "12"];
const EU_SIZES = ["34", "36", "38", "40", "42", "44", "S", "M", "L", "XL"];

export function ProductCreator({ onProductCreated, onCancel }: ProductCreatorProps) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [description, setDescription] = useState("");
  const [badge, setBadge] = useState("");
  const [stripePriceId, setStripePriceId] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Género y Tallas
  const [gender, setGender] = useState<"women" | "men" | "unisex">("women");
  const [sizeSystem, setSizeSystem] = useState<"US" | "EU">("US");
  const [selectedSizes, setSelectedSizes] = useState<string[]>(["S", "M", "L"]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // File Upload Handlers
  const handleFileProcess = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Por favor selecciona un archivo de imagen válido (PNG, JPG, WEBP)");
      return;
    }

    setUploadingImage(true);
    try {
      const res = await uploadProductImage(file);
      if (res.success && res.url) {
        setImageUrl(res.url);
        toast.success("Foto de la prenda cargada con éxito 📸");
      } else {
        toast.error(res.error || "No se pudo subir la imagen.");
      }
    } catch (err) {
      toast.error("Error al procesar la imagen.");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileProcess(e.target.files[0]);
    }
  };

  const toggleSize = (sz: string) => {
    setSelectedSizes((prev) =>
      prev.includes(sz) ? prev.filter((s) => s !== sz) : [...prev, sz]
    );
  };

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
        gender,
        sizes: selectedSizes,
        size_system: sizeSystem,
      });

      if (res.success) {
        toast.success(`Colección/Prenda '${name}' publicada con éxito 💖`);
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

  const [loading, setLoading] = useState(false);

  const availableSizes = sizeSystem === "US" ? US_SIZES : EU_SIZES;

  return (
    <form onSubmit={handleSubmit} className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 sm:p-8 space-y-8 shadow-2xl relative overflow-hidden">
      
      {/* Encabezado del Formulario */}
      <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-500 to-rose-600 text-white flex items-center justify-center shadow-lg shadow-rose-500/20">
            <PlusCircle className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-base font-black text-white uppercase tracking-widest leading-none">Añadir Nueva Prenda a la Web</h4>
            <span className="text-xs text-zinc-400 mt-1 block">Publica nuevos modelos en el catálogo oficial de Isafer</span>
          </div>
        </div>

        <button
          type="button"
          onClick={onCancel}
          className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all cursor-pointer"
          title="Cancelar"
        >
          ✕
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Columna Izquierda: Dropzone de Arrastrar e Soltar Imagen */}
        <div className="space-y-3">
          <label className="text-[11px] font-black text-zinc-300 uppercase tracking-widest block flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-rose-500" />
            Foto Principal (Drag & Drop)
          </label>
          
          {/* Dropzone Container */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`aspect-[3/4] w-full rounded-3xl border-2 border-dashed transition-all flex flex-col items-center justify-center relative overflow-hidden cursor-pointer group shadow-inner ${
              isDragging
                ? "border-rose-500 bg-rose-500/10 scale-[1.02]"
                : imageUrl
                ? "border-zinc-700 bg-zinc-950"
                : "border-zinc-800 bg-zinc-950 hover:border-rose-500/50 hover:bg-zinc-900/60"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />

            {uploadingImage ? (
              <div className="text-center p-6 space-y-3">
                <RefreshCw className="w-10 h-10 animate-spin text-rose-500 mx-auto" />
                <p className="text-xs font-bold text-zinc-300">Procesando y Subiendo Imagen...</p>
              </div>
            ) : imageUrl ? (
              <>
                <img
                  src={imageUrl}
                  alt="Vista previa de la prenda"
                  className="w-full h-full object-cover group-hover:opacity-90 transition-opacity"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-4 text-center">
                  <Upload className="w-8 h-8 text-rose-400 mb-2" />
                  <p className="text-xs font-bold text-white uppercase tracking-wider">Arrastra otra foto o haz clic para cambiar</p>
                </div>
              </>
            ) : (
              <div className="text-center p-6 space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto text-zinc-400 group-hover:text-rose-500 group-hover:scale-110 transition-all shadow-lg">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-black text-white uppercase tracking-wider">Arrastra la imagen aquí</p>
                  <p className="text-[11px] text-zinc-500 mt-1">o haz clic para explorar tus archivos</p>
                </div>
                <span className="inline-block px-3 py-1 rounded-full bg-zinc-900 text-[10px] font-mono text-zinc-400 border border-zinc-800">
                  PNG, JPG, WEBP
                </span>
              </div>
            )}
          </div>

          {/* Opcional: Pegar URL manual */}
          <div className="pt-2">
            <input
              type="url"
              placeholder="O pega una URL de imagen externa..."
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-2xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-rose-500/50 transition-colors font-mono"
            />
          </div>
        </div>

        {/* Columnas Central y Derecha: Formulario Completo */}
        <div className="lg:col-span-2 space-y-5">
          
          {/* Fila 1: Nombre de la prenda */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Nombre de la Prenda *</label>
            <input
              type="text"
              required
              placeholder="Ej: Vestido Barbie Luxe Pink"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-2xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-rose-500/50 transition-colors font-semibold"
            />
          </div>

          {/* Fila 2: Precio y Stock */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Precio de Venta ($ USD) *</label>
              <div className="flex items-center bg-zinc-950 border border-zinc-800 rounded-2xl px-3.5 py-2.5">
                <span className="text-rose-500 font-bold mr-2 text-sm">$</span>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="45.00"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full bg-transparent text-sm text-white font-bold font-mono focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Unidades Iniciales de Stock</label>
              <input
                type="number"
                placeholder="15"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-2xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-rose-500/50 transition-colors font-mono font-bold"
              />
            </div>
          </div>

          {/* Fila 3: Selección de Género / Colección */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Categoría / Colección</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "women", label: "Mujer 💖" },
                { id: "men", label: "Hombre 🖤" },
                { id: "unisex", label: "Unisex ✨" },
              ].map((g) => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => setGender(g.id as any)}
                  className={`py-2.5 px-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all border cursor-pointer ${
                    gender === g.id
                      ? "bg-rose-500 border-rose-500 text-white shadow-lg shadow-rose-500/20"
                      : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white"
                  }`}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>

          {/* Fila 4: Selección de Sistema de Tallas (US vs España / EU) */}
          <div className="space-y-3 bg-zinc-950 p-4 rounded-3xl border border-zinc-800">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-black text-zinc-300 uppercase tracking-widest flex items-center gap-2">
                <Tag className="w-3.5 h-3.5 text-rose-500" />
                Tallas Disponibles
              </label>

              {/* Selector de Sistema US / EU */}
              <div className="flex bg-zinc-900 border border-zinc-800 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setSizeSystem("US")}
                  className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase transition-all ${
                    sizeSystem === "US" ? "bg-rose-500 text-white" : "text-zinc-400 hover:text-white"
                  }`}
                >
                  Sistema EE.UU. (US)
                </button>
                <button
                  type="button"
                  onClick={() => setSizeSystem("EU")}
                  className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase transition-all ${
                    sizeSystem === "EU" ? "bg-rose-500 text-white" : "text-zinc-400 hover:text-white"
                  }`}
                >
                  Sistema España (EU)
                </button>
              </div>
            </div>

            {/* Píldoras de Tallas Interactivas */}
            <div className="flex flex-wrap gap-2 pt-1">
              {availableSizes.map((sz) => {
                const isSelected = selectedSizes.includes(sz);
                return (
                  <button
                    key={sz}
                    type="button"
                    onClick={() => toggleSize(sz)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition-all border cursor-pointer ${
                      isSelected
                        ? "bg-rose-500 border-rose-500 text-white shadow-md shadow-rose-500/20 scale-105"
                        : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-white"
                    }`}
                  >
                    {sz} {isSelected && "✓"}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Fila 5: Descripción */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Descripción o Detalles</label>
            <textarea
              placeholder="Detalles sobre confección, tejido, corte y estilismo..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-2xl text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-rose-500/50 transition-colors resize-none leading-relaxed"
            />
          </div>

          {/* Fila 6: Etiqueta y Stripe Price ID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Etiqueta Especial (Badge)</label>
              <input
                type="text"
                placeholder="Ej: NUEVO DROP, TENDENCIA"
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-2xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-rose-500/50 transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Stripe Price ID</label>
              <input
                type="text"
                placeholder="price_1Q..."
                value={stripePriceId}
                onChange={(e) => setStripePriceId(e.target.value)}
                className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-2xl text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-rose-500/50 transition-colors font-mono"
              />
            </div>
          </div>

        </div>
      </div>

      {/* Acciones del Formulario */}
      <div className="flex items-center justify-end gap-3 border-t border-zinc-800 pt-6">
        <button
          type="button"
          onClick={onCancel}
          className="px-5 py-3 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-xs font-black uppercase tracking-wider rounded-2xl transition-all cursor-pointer"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading || uploadingImage}
          className={`flex items-center gap-2 px-7 py-3.5 bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white text-xs font-black uppercase tracking-widest rounded-2xl transition-all shadow-xl shadow-rose-500/25 active:scale-95 cursor-pointer ${
            loading || uploadingImage ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          <Sparkles className="w-4 h-4" />
          {loading ? "Publicando Prenda..." : "Añadir Prenda a la Web"}
        </button>
      </div>
    </form>
  );
}
