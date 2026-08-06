import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Sparkles, X, Heart, ShieldCheck, MapPin, Award, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AboutUsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AboutUsModal({ open, onOpenChange }: AboutUsModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl w-[95vw] max-h-[90vh] p-0 border-0 bg-zinc-950 text-white rounded-3xl overflow-hidden shadow-2xl flex flex-col z-[9999]">
        
        {/* Top Header Bar */}
        <div className="bg-zinc-900 border-b border-zinc-800 px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-rose-500 to-rose-600 text-white flex items-center justify-center font-serif font-black text-xs shadow-md">
              C
            </div>
            <div>
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white leading-none">
                Nuestra Historia
              </h3>
              <span className="text-[10px] font-bold text-rose-400 mt-0.5 block">Isafer Boutique · Brooklyn, NY 🇺🇸</span>
            </div>
          </div>

          <button
            onClick={() => onOpenChange(false)}
            className="p-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
            title="Cerrar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-8">
          
          {/* Main Story Hero Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            
            {/* Left Column: Portrait Photograph */}
            <div className="md:col-span-5 relative">
              <div className="relative aspect-[3/4] w-full rounded-3xl overflow-hidden border-2 border-zinc-800 shadow-xl group">
                <img
                  src="/camila-owner.jpg"
                  alt="Camila — Fundadora de Isafer Boutique"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                
                <div className="absolute bottom-4 left-4 right-4 p-3 rounded-2xl bg-zinc-950/90 backdrop-blur-md border border-zinc-800 text-white">
                  <p className="text-xs font-black text-white uppercase tracking-wider">Camila</p>
                  <p className="text-[10px] text-rose-400 font-semibold">Fundadora & Directora Creativa</p>
                </div>
              </div>
            </div>

            {/* Right Column: Story Text */}
            <div className="md:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[10px] font-black uppercase tracking-widest">
                <Sparkles className="w-3 h-3 text-amber-450" />
                DESDE 2024 · NEW YORK
              </div>

              <h2 className="font-serif text-2xl sm:text-3xl font-black text-white leading-tight">
                Empoderar a la mujer a través de prendas exclusivas y llenas de actitud. 💖
              </h2>

              <div className="space-y-3 text-xs sm:text-sm text-zinc-300 leading-relaxed font-sans">
                <p>
                  Todo empezó en <strong>2024</strong>, con un sueño muy claro: crear ropa que no fuera solo una prenda más, sino una forma de sentirte más segura, más libre y radiantemente femenina. Con un toque sofisticado pero lleno de la energía urbana de Nueva York, que siempre nos inspira.
                </p>

                <p>
                  Cada colección nace con un cuidado minucioso, seleccionando tejidos moldeadores premium, cortes favorecedores y detalles delicados. <strong>Isafer Boutique</strong> es el reflejo del amor por la moda y de la pasión de Camila por cuidar personalmente a cada clienta.
                </p>

                <p>
                  No creemos en tendencias pasajeras, sino en piezas cómodas y de alta calidad que destacan tus curvas y te acompañan en tus momentos más especiales. Moda hecha para durar y hacer brillar la mejor versión de ti.
                </p>
              </div>

              {/* Signature Block */}
              <div className="pt-4 border-t border-zinc-850 flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-semibold text-rose-400">Con cariño y gratitud, seguimos creando para ti.</p>
                  <h4 className="font-serif text-lg font-black tracking-widest text-white mt-0.5 uppercase">
                    CAMILA · ISAFER BOUTIQUE
                  </h4>
                </div>

                <span className="text-[10px] font-mono text-zinc-500 border border-zinc-800 px-2.5 py-1 rounded-lg">
                  Brooklyn, NY 🇺🇸
                </span>
              </div>
            </div>

          </div>

          {/* Pillars of Isafer Boutique */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-zinc-850">
            <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-850 space-y-1.5">
              <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center">
                <Heart className="w-4 h-4" />
              </div>
              <h5 className="text-xs font-black text-white uppercase tracking-wider">Diseño Moldeador</h5>
              <p className="text-[11px] text-zinc-400">Licras de alta compresión inteligente que estilizan y potencian tu figura natural.</p>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-850 space-y-1.5">
              <div className="w-8 h-8 rounded-xl bg-amber-450/10 text-amber-400 flex items-center justify-center">
                <Award className="w-4 h-4" />
              </div>
              <h5 className="text-xs font-black text-white uppercase tracking-wider">Calidad Premium</h5>
              <p className="text-[11px] text-zinc-400">Tejidos ultrasuaves, sin transparencias no deseadas y terminaciones de lujo.</p>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-850 space-y-1.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h5 className="text-xs font-black text-white uppercase tracking-wider">Atención 1 a 1</h5>
              <p className="text-[11px] text-zinc-400">Asesoría directa por WhatsApp y entregas en tiempo récord desde Brooklyn.</p>
            </div>
          </div>

        </div>

        {/* Modal Footer Bar */}
        <div className="bg-zinc-900 border-t border-zinc-850 px-6 py-4 flex items-center justify-between shrink-0">
          <p className="text-[11px] text-zinc-500 font-medium">© 2026 Isafer Boutique · Todos los derechos reservados</p>
          <Button
            onClick={() => onOpenChange(false)}
            className="rounded-xl px-6 h-10 bg-rose-500 hover:bg-rose-600 text-white font-black text-xs uppercase tracking-wider cursor-pointer shadow-lg shadow-rose-500/20"
          >
            Volver a la Tienda 🛍️
          </Button>
        </div>

      </DialogContent>
    </Dialog>
  );
}
