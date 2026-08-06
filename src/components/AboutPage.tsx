import React, { useEffect } from "react";
import { ArrowLeft, Sparkles, Instagram, MessageCircle, MapPin, Heart, ShieldCheck, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IsaferLogo } from "@/components/IsaferLogo";

interface AboutPageProps {
  onBackToShop: () => void;
  camilaImage?: string;
}

export function AboutPage({ onBackToShop, camilaImage }: AboutPageProps) {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const defaultCamilaImage = "/camila-owner.jpg";
  const finalCamilaImage = camilaImage || defaultCamilaImage;

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col font-sans animate-in fade-in duration-300">
      
      {/* 1. Sticky Navigation Header */}
      <header className="sticky top-0 z-50 bg-white/95 dark:bg-zinc-950/95 border-b border-zinc-200 dark:border-zinc-800 backdrop-blur-md px-4 sm:px-8 h-16 sm:h-20 flex items-center justify-between">
        <button
          onClick={onBackToShop}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver a la Tienda</span>
        </button>

        <div className="font-serif text-xl sm:text-2xl font-black tracking-wider text-zinc-900 dark:text-white uppercase">
          Isafer Boutique
        </div>

        <div className="w-24 text-right">
          <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-widest hidden sm:inline">Acerca de Nosotros</span>
        </div>
      </header>

      {/* 2. Hero Image Banner with Text Overlay (Identical to Camila Sevilla reference) */}
      <section className="relative w-full h-[60vh] sm:h-[75vh] min-h-[420px] bg-zinc-900 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2000"
          alt="Isafer Boutique Showroom"
          className="w-full h-full object-cover object-center opacity-85"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/20" />

        {/* Text Overlay on Bottom Left */}
        <div className="absolute bottom-10 left-6 sm:left-12 sm:bottom-16 max-w-2xl text-white space-y-4 pr-6">
          <p className="text-base sm:text-2xl font-serif leading-relaxed text-zinc-100 font-light drop-shadow-md">
            "Desde 2024 creamos moda con sensibilidad, con corazón. No es solo diseñar ropa, es poner un poco de alma en cada pieza."
          </p>

          <div className="pt-2">
            <span className="px-4 py-1.5 border border-white text-white text-xs font-bold uppercase tracking-[0.25em] inline-block bg-white/10 backdrop-blur-xs">
              Nuestra Historia
            </span>
          </div>
        </div>
      </section>

      {/* 3. Main Storytelling Content */}
      <section className="max-w-4xl mx-auto px-6 sm:px-10 py-16 sm:py-24 space-y-12">
        
        {/* Title */}
        <div className="text-center space-y-3">
          <p className="text-xs font-black uppercase tracking-[0.3em] text-rose-500">
            Isafer Boutique · Brooklyn, NY 🇺🇸
          </p>
          <h1 className="font-serif text-3xl sm:text-5xl font-black text-zinc-900 dark:text-white tracking-tight">
            Nuestra Historia
          </h1>
          <div className="w-12 h-0.5 bg-rose-500 mx-auto mt-4" />
        </div>

        {/* Story Body Paragraphs */}
        <div className="space-y-6 text-base sm:text-lg text-zinc-700 dark:text-zinc-300 leading-relaxed font-sans font-normal">
          <p>
            Todo empezó en <strong>2024</strong>, con un sueño muy simple: crear moda que no fuera solo ropa, sino una manera de sentirse más segura, más femenina y llena de confianza. Con un toque elegante pero también urbano, porque la ciudad y su energía siempre inspiran.
          </p>

          <p>
            Cada colección nace con mucho cuidado, buscando siluetas modernas y detalles delicados. Brooklyn y Nueva York son parte de la esencia, su luz, sus calles... y también la pasión de Camila, que desde siempre ha amado la moda y el proceso de darle vida a cada prenda.
          </p>

          <p>
            No creemos en tendencias pasajeras, sino en piezas que se sienten cómodas, hechas con materiales de calidad, que acompañan a la mujer en su día a día. Moda pensada para durar y para expresar la individualidad de cada una.
          </p>
        </div>

        {/* Signoff */}
        <div className="pt-8 border-t border-zinc-200 dark:border-zinc-800 space-y-2">
          <p className="text-sm font-semibold text-rose-500 uppercase tracking-widest">
            Con cariño y gratitud, seguimos creando.
          </p>
          <h3 className="font-serif text-2xl font-black text-zinc-900 dark:text-white uppercase tracking-wider">
            CAMILA · ISAFER BOUTIQUE
          </h3>
        </div>

        {/* 4. Camila's Biography & Photo Section */}
        <div className="mt-16 pt-12 border-t border-zinc-200 dark:border-zinc-800">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center bg-zinc-50 dark:bg-zinc-900/60 p-6 sm:p-10 rounded-3xl border border-zinc-200/80 dark:border-zinc-800">
            
            {/* Left: Camila Photo */}
            <div className="md:col-span-5 relative">
              <div className="aspect-[3/4] w-full rounded-2xl overflow-hidden border border-zinc-300 dark:border-zinc-700 shadow-lg">
                <img
                  src={finalCamilaImage}
                  alt="Camila — Fundadora de Isafer Boutique"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Right: Bio Text */}
            <div className="md:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs font-black uppercase tracking-widest">
                <Sparkles className="w-3.5 h-3.5" /> Fundadora & Directora Creativa
              </div>

              <h3 className="font-serif text-2xl font-black text-zinc-900 dark:text-white">
                Camila
              </h3>

              <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-300 leading-relaxed">
                "Mi meta en Isafer Boutique es que cada mujer que vista nuestras prendas sienta esa magia de verse al espejo y sentirse poderosa, sensual y cómoda. Cuidamos cada detalle desde Brooklyn para entregarte la mejor experiencia."
              </p>

              <div className="pt-2 flex items-center gap-4 text-xs font-bold text-zinc-500">
                <span>✦ Atención 1 a 1</span>
                <span>✦ Envíos 🇺🇸 & Internacionales</span>
              </div>
            </div>

          </div>
        </div>

      </section>

      {/* 5. Clean Footer (Identical to Camila Sevilla structure) */}
      <footer className="mt-auto bg-zinc-950 text-zinc-400 border-t border-zinc-800 py-16 px-6 sm:px-12">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10">
          
          <div className="space-y-4">
            <div>
              <IsaferLogo variant="footer" size="lg" />
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Moda femenina sensual, elegante y licras moldeadoras de alta compresión en Brooklyn, New York.
            </p>
          </div>

          <div className="space-y-3">
            <h5 className="text-xs font-black uppercase tracking-widest text-white">Navegación</h5>
            <ul className="space-y-2 text-xs font-semibold">
              <li><button onClick={onBackToShop} className="hover:text-white transition-colors cursor-pointer">Colección Tienda</button></li>
              <li><button onClick={onBackToShop} className="hover:text-white transition-colors cursor-pointer">Licras Moldeadoras</button></li>
              <li><button onClick={onBackToShop} className="hover:text-white transition-colors cursor-pointer">Vestidos de Noche</button></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h5 className="text-xs font-black uppercase tracking-widest text-white">Atención al Cliente</h5>
            <ul className="space-y-2 text-xs font-semibold">
              <li><a href="https://wa.me/19296772514" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">Seguimiento de Pedido</a></li>
              <li><a href="https://wa.me/19296772514" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">Centro de Ayuda / WhatsApp</a></li>
              <li><a href="https://www.instagram.com/shopisafer" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">Instagram @shopisafer</a></li>
            </ul>
          </div>

          <div className="space-y-4">
            <h5 className="text-xs font-black uppercase tracking-widest text-white">Contacto Directo</h5>
            <p className="text-xs text-zinc-400">Brooklyn, New York, EE.UU. 🇺🇸</p>
            <Button
              onClick={onBackToShop}
              className="w-full rounded-full bg-white text-zinc-950 hover:bg-zinc-200 font-bold text-xs uppercase tracking-widest cursor-pointer"
            >
              Ir a la Tienda 🛍️
            </Button>
          </div>

        </div>

        <div className="mt-12 pt-6 border-t border-zinc-900 text-center text-[11px] text-zinc-600">
          © 2026 Isafer Boutique · Todos los derechos reservados.
        </div>
      </footer>

    </div>
  );
}
