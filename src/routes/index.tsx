import { createFileRoute } from "@tanstack/react-router";
import {
  Instagram,
  MapPin,
  Menu,
  MessageCircle,
  Minus,
  Plus,
  ShoppingBag,
  Sparkles,
  Trash2,
  User,
  ShieldCheck,
  UserCheck,
  Heart,
  Star,
  ArrowRight,
  CheckCircle2,
  Clock,
  Truck,
  Flame,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import heroImage from "@/assets/rosse-hero.jpg";
import productsImage from "@/assets/rosse-products.jpg";
import { createOrder } from "@/services/insforgeService";
import { useAuth } from "@/hooks/useAuth";
import { AuthDialog } from "@/components/AuthDialog";
import { CustomerAccountModal } from "@/components/CustomerAccountModal";
import { AdminDashboardModal } from "@/components/AdminDashboardModal";
import { IsaferLogo } from "@/components/IsaferLogo";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n";
import { LanguageSelector } from "@/components/LanguageSelector";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Isafer Boutique | Sexy, Elegante y Moldeadora · Brooklyn, NY" },
      {
        name: "description",
        content:
          "Descubre la colección más exclusiva de ropa femenina, licras moldeadoras premium y vestidos sensuales en Isafer Boutique, Brooklyn, Nueva York.",
      },
      { property: "og:title", content: "Isafer Boutique | Tu Outfit Ideal en Brooklyn" },
      {
        property: "og:description",
        content: "Moda femenina sensual y exclusiva. Realza tu figura con Isafer Boutique.",
      },
    ],
  }),
  component: Index,
});

interface ProductItem {
  id: number;
  name: string;
  price: number;
  category: "Licras" | "Vestidos" | "Tops & Sets" | "Bodys & Corsets" | "Accesorios & Glam";
  tag: string;
  position?: string;
  image?: string;
  description: string;
}

const products: ProductItem[] = [
  {
    id: 0,
    name: "Silk Knot Bandeau Set",
    price: 38.0,
    category: "Tops & Sets",
    tag: "Nuevo Drop",
    position: "left-0",
    description: "Set de dos piezas ultrasuave con nudo decorativo y ajuste entallado.",
  },
  {
    id: 1,
    name: "Licra Moldeadora Premium",
    price: 35.0,
    category: "Licras",
    tag: "Más Vendido",
    position: "left-[-100%]",
    description: "Licra de alta compresión inteligente que esculpe y realza la figura.",
  },
  {
    id: 2,
    name: "Vestido Malla Transparente",
    price: 48.0,
    category: "Vestidos",
    tag: "Tendencia",
    position: "left-[-200%]",
    description: "Vestido de malla fina con transparencias estratégicas para la noche.",
  },
  {
    id: 3,
    name: "Draped Cutout Blue Mini",
    price: 52.0,
    category: "Vestidos",
    tag: "Edición Limitada",
    position: "left-[-300%]",
    description: "Mini vestido drapeado con escote asimétrico y acabado satinado.",
  },
  {
    id: 4,
    name: "Licra Esculpida Push-Up Brooklyn",
    price: 39.0,
    category: "Licras",
    tag: "Cintura Alta",
    image: "https://images.unsplash.com/photo-1518310383802-640c2de311b2?w=800&q=80",
    description: "Confección sin costuras con pretina ancha antideslizante para máximo control.",
  },
  {
    id: 5,
    name: "Body Corset Efecto Cuero Black",
    price: 45.0,
    category: "Bodys & Corsets",
    tag: "Favoritodueña",
    image: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&q=80",
    description: "Body entallado con acabado efecto cuero mate y escote estructurado.",
  },
  {
    id: 6,
    name: "Conjunto Velvet Night 2 Piezas",
    price: 55.0,
    category: "Tops & Sets",
    tag: "Exclusivo",
    image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80",
    description: "Top crop ajustado y falda tubo en terciopelo fino para eventos de noche.",
  },
  {
    id: 7,
    name: "Vestido Asimétrico Cut-Out Emerald",
    price: 58.0,
    category: "Vestidos",
    tag: "Noche Chic",
    image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&q=80",
    description: "Diseño elegante con abertura lateral y escote cruzado en tono esmeralda.",
  },
  {
    id: 8,
    name: "Licra Moldeadora Biker Seamless",
    price: 32.0,
    category: "Licras",
    tag: "Básico Must",
    image: "https://images.unsplash.com/photo-1506629082925-2368c855a153?w=800&q=80",
    description: "Biker corta con compresión inteligente en abdomen y muslos.",
  },
  {
    id: 9,
    name: "Body Malla Strass Brillantes",
    price: 42.0,
    category: "Bodys & Corsets",
    tag: "Glam & Party",
    image: "https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=800&q=80",
    description: "Malla elastizada con incrustaciones de strass brillante que destacan bajo las luces.",
  },
  {
    id: 10,
    name: "Mini Falda Plisada Satin Rose",
    price: 36.0,
    category: "Tops & Sets",
    tag: "Verano",
    image: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=800&q=80",
    description: "Falda satinada ligera con vuelo fluido e interior tipo short invisible.",
  },
  {
    id: 11,
    name: "Cinturón Corset Moldeador Gold",
    price: 28.0,
    category: "Accesorios & Glam",
    tag: "Detalle Chic",
    image: "https://images.unsplash.com/photo-1611591475777-233cd73222d3?w=800&q=80",
    description: "Cinturón elástico con hebilla metálica dorada para acentuar cualquier outfit.",
  },
];

type Cart = Record<number, number>;

function ProductCrop({ id, alt, product }: { id?: number; alt?: string; product?: ProductItem }) {
  const p = product ?? (id !== undefined ? products[id] : undefined);
  if (!p) return null;
  if (p.image) {
    return (
      <img
        src={p.image}
        alt={alt || p.name}
        loading="lazy"
        className="absolute top-0 left-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
      />
    );
  }
  return (
    <img
      src={productsImage}
      alt={alt || p.name}
      loading="lazy"
      width={1536}
      height={1024}
      className={`absolute top-0 h-full w-[400%] max-w-none object-cover transition-transform duration-700 ease-out group-hover:scale-105 ${p.position || "left-0"}`}
    />
  );
}

function Index() {
  const { t } = useTranslation();
  const [cart, setCart] = useState<Cart>({});
  const [cartOpen, setCartOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>("Todos");
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [customerModalOpen, setCustomerModalOpen] = useState(false);
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [favorites, setFavorites] = useState<Record<number, boolean>>({});

  const { user, isAdmin, isCustomer } = useAuth();

  const itemCount = Object.values(cart).reduce((sum, count) => sum + count, 0);
  const subtotal = useMemo(
    () => products.reduce((sum, product) => sum + product.price * (cart[product.id] ?? 0), 0),
    [cart],
  );

  const toggleFavorite = (id: number) => {
    setFavorites((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      toast(next[id] ? "Añadido a favoritos 💖" : "Eliminado de favoritos", {
        duration: 2000,
      });
      return next;
    });
  };

  const addProduct = (id: number) => {
    setCart((current) => ({ ...current, [id]: (current[id] ?? 0) + 1 }));
    setCartOpen(true);
    toast.success(`${products[id].name} añadido a tu bolsa ✨`);
  };

  const updateProduct = (id: number, change: number) =>
    setCart((current) => {
      const quantity = Math.max(0, (current[id] ?? 0) + change);
      const next = { ...current };
      if (quantity === 0) delete next[id];
      else next[id] = quantity;
      return next;
    });

  const removeProduct = (id: number) => {
    const productName = products[id].name;
    setCart((current) => {
      const next = { ...current };
      delete next[id];
      return next;
    });
    toast.info(`${productName} eliminado de la bolsa`);
  };

  const scrollToSection = (id: string) => {
    const target = document.getElementById(id);
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleCheckout = () => {
    const activeItems = products.filter((p) => cart[p.id]);

    if (activeItems.length === 0) {
      toast.error("Tu bolsa está vacía");
      return;
    }

    const itemsText = activeItems
      .map((p) => `- ${cart[p.id]}x ${p.name} ($${(p.price * cart[p.id]).toFixed(2)})`)
      .join("%0A");

    const subtotalFormatted = subtotal.toFixed(2);
    const whatsappUrl = `https://wa.me/19296772514?text=Hola%20Isafer%20Boutique%2C%20quisiera%20confirmar%20mi%20pedido%3A%0A%0A${itemsText}%0A%0ASubtotal%3A%20%24${subtotalFormatted}%0A%0A%C2%BFMe%20confirmas%20disponibilidad%20y%20m%C3%A9todo%20de%20entrega%3F`;

    const win = window.open(whatsappUrl, "_blank");
    if (!win) {
      window.location.href = whatsappUrl;
    }

    setCartOpen(false);
    toast.success("¡Redirigiendo a WhatsApp!");

    createOrder({
      customer_name: user?.email ? user.email.split("@")[0] : "Cliente Web (WhatsApp)",
      customer_email: user?.email || "cliente@isaferboutique.com",
      total_amount: subtotal,
      items: activeItems.map((p) => ({
        name: p.name,
        price: p.price,
        quantity: cart[p.id],
      })),
    }).catch((err) => console.error("No se pudo guardar el pedido en InsForge:", err));
  };

  const filteredProducts = useMemo(() => {
    if (activeCategory === "Todos") return products;
    return products.filter((p) => p.category === activeCategory);
  }, [activeCategory]);

  return (
    <div className="min-h-screen overflow-x-hidden bg-background text-foreground antialiased selection:bg-amber-500/20 selection:text-amber-900 dark:selection:text-amber-100">
      {/* 1. TOP ANNOUNCEMENT MARQUEE */}
      <div className="bg-zinc-950 text-zinc-100 px-4 py-2 text-[11px] font-semibold tracking-[0.25em] uppercase text-center border-b border-zinc-800 flex items-center justify-center gap-3 overflow-hidden">
        <span className="hidden sm:inline text-amber-400">✦</span>
        <span>{t("nav_shipping_banner")}</span>
        <span className="hidden sm:inline text-amber-400">✦</span>
      </div>

      {/* 2. HEADER NAVBAR */}
      <header className="sticky top-0 z-40 border-b border-zinc-200/80 dark:border-zinc-800/80 bg-background/85 backdrop-blur-xl transition-all">
        <div className="mx-auto flex h-16 sm:h-20 max-w-7xl items-center justify-between px-4 sm:px-8">
          {/* Left Menu Drawer Trigger */}
          <div className="flex items-center gap-2">
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  aria-label="Abrir menú de navegación"
                >
                  <Menu className="size-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[88%] max-w-sm border-zinc-800 bg-zinc-950 p-8 text-zinc-100">
                <SheetHeader className="text-left pb-6 border-b border-zinc-800">
                  <SheetTitle className="p-0">
                    <IsaferLogo variant="white" />
                  </SheetTitle>
                  <SheetDescription className="text-zinc-400 text-xs mt-2">
                    Ropa Femenina & Licras Moldeadoras · Brooklyn, NY
                  </SheetDescription>
                </SheetHeader>
                <nav className="mt-8 flex flex-col gap-6 text-xl font-medium tracking-tight">
                  {[
                    ["Nueva Colección", "#coleccion"],
                    ["Categorías Bento", "#categorias"],
                    ["El Sello Isafer", "#estilo"],
                    ["Visítanos en Brooklyn", "#visitanos"],
                  ].map(([label, href]) => (
                    <SheetClose asChild key={label}>
                      <a
                        href={href}
                        onClick={(e) => {
                          e.preventDefault();
                          scrollToSection(href.substring(1));
                        }}
                        className="group flex items-center justify-between border-b border-zinc-800/60 pb-3 text-zinc-300 transition-colors hover:text-amber-300 cursor-pointer"
                      >
                        <span>{label}</span>
                        <ArrowRight className="size-4 opacity-0 transition-opacity group-hover:opacity-100 text-amber-400" />
                      </a>
                    </SheetClose>
                  ))}
                </nav>
                <div className="mt-12 pt-6 border-t border-zinc-800 space-y-4">
                  <a
                    href="https://www.instagram.com/shopisafer"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2.5 text-xs tracking-wider uppercase text-zinc-400 hover:text-amber-300 transition-colors"
                  >
                    <Instagram className="size-4 text-amber-400" /> @shopisafer
                  </a>
                  <a
                    href="https://wa.me/19296772514"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2.5 text-xs tracking-wider uppercase text-zinc-400 hover:text-emerald-400 transition-colors"
                  >
                    <MessageCircle className="size-4 text-emerald-400" /> +1 (929) 677-2514
                  </a>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Center Brand Logo */}
          <a
            href="#inicio"
            onClick={(e) => {
              e.preventDefault();
              scrollToSection("inicio");
            }}
            className="cursor-pointer transition-transform hover:scale-105"
            aria-label="Isafer Boutique Inicio"
          >
            <IsaferLogo />
          </a>

          {/* Right Action Icons: Auth, Language & Cart */}
          <div className="flex items-center gap-2 sm:gap-3">
            <LanguageSelector />
            {user ? (
              <Button
                variant="ghost"
                size="sm"
                className="hidden sm:inline-flex items-center gap-2 rounded-full border border-zinc-200 dark:border-zinc-800 text-xs font-semibold px-4"
                onClick={() => (isAdmin ? setAdminModalOpen(true) : setCustomerModalOpen(true))}
              >
                {isAdmin ? <ShieldCheck className="size-4 text-amber-500" /> : <UserCheck className="size-4 text-emerald-500" />}
                <span className="truncate max-w-[100px]">{user.email?.split("@")[0]}</span>
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800"
                onClick={() => setAuthDialogOpen(true)}
                aria-label="Cuenta de cliente"
              >
                <User className="size-5" />
              </Button>
            )}

            {/* Cart Trigger */}
            <Sheet open={cartOpen} onOpenChange={setCartOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="default"
                  size="sm"
                  className="relative rounded-full px-4 h-10 bg-zinc-950 text-zinc-100 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-950 font-semibold text-xs gap-2 shadow-lg transition-transform active:scale-95"
                  aria-label={`Carrito, ${itemCount} artículos`}
                >
                  <ShoppingBag className="size-4" />
                  <span className="hidden sm:inline">Bolsa</span>
                  {itemCount > 0 && (
                    <span className="ml-0.5 flex size-5 items-center justify-center rounded-full bg-amber-500 text-[11px] font-bold text-zinc-950">
                      {itemCount}
                    </span>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent className="flex w-[92%] flex-col border-zinc-800 bg-zinc-950 p-6 text-zinc-100 sm:max-w-md">
                <SheetHeader className="text-left border-b border-zinc-800 pb-4">
                  <SheetTitle className="font-display text-2xl font-bold text-zinc-100 flex items-center justify-between">
                    <span>Tu Bolsa de Selección</span>
                    <span className="text-xs font-mono font-normal text-amber-400">
                      {itemCount} item{itemCount !== 1 ? "s" : ""}
                    </span>
                  </SheetTitle>
                  <SheetDescription className="text-zinc-400 text-xs">
                    {itemCount ? "Finaliza tu pedido en 1 clic por WhatsApp oficial" : "Explora nuestra colección y añade tus prendas preferidas"}
                  </SheetDescription>
                </SheetHeader>

                <div className="mt-6 flex-1 space-y-4 overflow-y-auto pr-1">
                  {itemCount === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-center text-zinc-500">
                      <ShoppingBag className="size-12 mb-3 stroke-[1.2]" />
                      <p className="text-sm font-medium">Tu bolsa de compras está vacía</p>
                      <p className="text-xs mt-1 text-zinc-600">Añade licras o vestidos de la nueva colección</p>
                    </div>
                  ) : (
                    products
                      .filter((product) => cart[product.id])
                      .map((product) => (
                        <div
                          key={product.id}
                          className="grid grid-cols-[72px_minmax(0,1fr)] gap-4 rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-3"
                        >
                          <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-zinc-800">
                            <ProductCrop product={product} />
                          </div>
                          <div className="min-w-0 flex flex-col justify-between">
                            <div>
                              <p className="truncate font-semibold text-sm text-zinc-100">{product.name}</p>
                              <p className="text-xs text-amber-400 font-mono font-medium mt-0.5">
                                ${product.price.toFixed(2)} USD
                              </p>
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                              <div className="flex items-center border border-zinc-700 rounded-full bg-zinc-800">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="size-7 rounded-full text-zinc-300 hover:text-white"
                                  onClick={() => updateProduct(product.id, -1)}
                                  aria-label={`Quitar uno de ${product.name}`}
                                >
                                  <Minus className="size-3" />
                                </Button>
                                <span className="w-5 text-center text-xs font-semibold">{cart[product.id]}</span>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="size-7 rounded-full text-zinc-300 hover:text-white"
                                  onClick={() => updateProduct(product.id, 1)}
                                  aria-label={`Añadir uno de ${product.name}`}
                                >
                                  <Plus className="size-3" />
                                </Button>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="ml-auto size-7 rounded-full text-zinc-500 hover:text-red-400"
                                onClick={() => removeProduct(product.id)}
                                aria-label={`Eliminar ${product.name}`}
                              >
                                <Trash2 className="size-3.5" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))
                  )}
                </div>

                {itemCount > 0 && (
                  <div className="border-t border-zinc-800 pt-5 space-y-3">
                    <div className="flex items-center justify-between text-sm font-semibold">
                      <span className="text-zinc-400">Subtotal estimado</span>
                      <span className="text-xl font-mono text-amber-400">${subtotal.toFixed(2)} USD</span>
                    </div>
                    <Button
                      className="h-12 w-full rounded-full text-xs font-semibold uppercase tracking-wider bg-emerald-600 text-white hover:bg-emerald-500 shadow-lg shadow-emerald-950/50 gap-2 cursor-pointer"
                      onClick={handleCheckout}
                    >
                      <MessageCircle className="size-4 fill-white" />
                      Pedir Directo por WhatsApp
                    </Button>
                    <p className="text-center text-[10px] text-zinc-500 tracking-wide">
                      🔒 Pedido directo sin comisiones · Confirmación inmediata en Brooklyn
                    </p>
                  </div>
                )}
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <main id="inicio">
        {/* 3. HERO SECTION (HIGH-FASHION EDITORIAL MAGAZINE COVER) */}
        <section className="relative min-h-[90svh] sm:min-h-[92vh] flex items-end overflow-hidden bg-zinc-950 text-white">
          <img
            src={heroImage}
            alt="Modelo Isafer Boutique vestida con outfit sensual y elegante"
            width={1280}
            height={1600}
            fetchPriority="high"
            className="absolute inset-0 h-full w-full object-cover object-[55%_center] opacity-80 filter contrast-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/90 via-zinc-950/30 to-transparent" />

          <div className="relative mx-auto w-full max-w-7xl px-5 pb-16 pt-32 sm:px-10 lg:px-16">
            <div className="max-w-2xl">
              {/* H3 Eyebrow Badge */}
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/40 bg-amber-400/10 px-4 py-1.5 backdrop-blur-md mb-6">
                <Sparkles className="size-3.5 text-amber-400" />
                <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-amber-300">
                  {t("hero_badge")}
                </span>
              </div>

              {/* H1 Display Title (gpt-taste rule) */}
              <h1 className="font-display text-5xl sm:text-7xl lg:text-8xl font-black leading-[0.9] tracking-[-0.04em] text-white uppercase">
                {t("hero_title_1")}
                <br />
                <span className="italic font-serif font-normal text-amber-200 drop-shadow-sm normal-case">
                  {t("hero_title_2")}
                </span>
              </h1>

              {/* Body Text (max 65 chars rule) */}
              <p className="mt-6 max-w-lg text-sm sm:text-base leading-relaxed text-zinc-300 font-normal">
                {t("hero_subtitle")}
              </p>

              {/* CTA Buttons (gpt-taste uppercase tracking rule) */}
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Button
                  asChild
                  className="h-13 rounded-full px-8 text-xs font-bold uppercase tracking-[0.2em] bg-amber-400 text-zinc-950 hover:bg-amber-300 shadow-amber-400/20 shadow-xl transition-transform hover:scale-105 cursor-pointer"
                >
                  <a
                    href="#coleccion"
                    onClick={(e) => {
                      e.preventDefault();
                      scrollToSection("coleccion");
                    }}
                  >
                    {t("hero_cta_primary")} ✦
                  </a>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="h-13 rounded-full px-7 text-xs font-bold uppercase tracking-[0.2em] border-zinc-700 bg-zinc-900/60 backdrop-blur-md text-zinc-100 hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  <a
                    href="#visitanos"
                    onClick={(e) => {
                      e.preventDefault();
                      scrollToSection("visitanos");
                    }}
                  >
                    {t("hero_cta_secondary")}
                  </a>
                </Button>
              </div>

              {/* Social Proof Stats */}
              <div className="mt-12 flex items-center gap-6 pt-6 border-t border-zinc-800/80 text-xs text-zinc-400">
                <div className="flex items-center gap-1.5">
                  <div className="flex -space-x-1">
                    {[1, 2, 3, 4].map((i) => (
                      <span
                        key={i}
                        className="inline-flex size-6 items-center justify-center rounded-full bg-amber-400/20 border border-amber-400 text-[10px] font-bold text-amber-300"
                      >
                        ★
                      </span>
                    ))}
                  </div>
                  <span className="font-semibold text-zinc-200 ml-1">4.9/5 Rating</span>
                </div>
                <span className="text-zinc-700">•</span>
                <span className="text-zinc-300 font-medium">+1,200 Pedidos en NYC & EE. UU.</span>
              </div>
            </div>
          </div>
        </section>

        {/* 4. BENTO GRID CATEGORIES (uipro-max skill) */}
        <section id="categorias" className="scroll-mt-20 py-16 sm:py-24 bg-zinc-900 text-zinc-100">
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <div className="mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.3em] text-amber-400">
                  ESTRUCTURA DE ESTILOS
                </p>
                <h2 className="mt-2 font-display text-4xl sm:text-6xl font-extrabold tracking-tight">
                  Colecciones Bento
                </h2>
              </div>
              <p className="text-xs text-zinc-400 max-w-xs leading-relaxed">
                Selecciona la categoría perfecta para tu próxima salida o evento.
              </p>
            </div>

            {/* Asymmetric Bento Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {/* Bento Card 1: Large Featured (Licras Moldeadoras) */}
              <div
                onClick={() => {
                  setActiveCategory("Licras");
                  scrollToSection("coleccion");
                }}
                className="group relative md:col-span-2 aspect-[4/3] md:aspect-auto md:h-96 overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950 p-6 flex flex-col justify-end cursor-pointer transition-all duration-300 hover:border-amber-400/50 hover:shadow-2xl"
              >
                <ProductCrop product={products[1]} />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />
                <div className="relative z-10">
                  <span className="inline-block rounded-full bg-amber-400 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-zinc-950 mb-2">
                    Efecto Reloj de Arena
                  </span>
                  <h3 className="font-display text-3xl sm:text-4xl font-extrabold text-white">
                    Licras Moldeadoras
                  </h3>
                  <p className="mt-1 text-xs text-zinc-300 max-w-md">
                    Compresión inteligente con tejido moldeador que ajusta la cintura y esculpe la silueta sin perder comodidad.
                  </p>
                  <span className="mt-4 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400 group-hover:translate-x-1 transition-transform">
                    Ver Licras <ArrowRight className="size-3.5" />
                  </span>
                </div>
              </div>

              {/* Bento Card 2: Vestidos */}
              <div
                onClick={() => {
                  setActiveCategory("Vestidos");
                  scrollToSection("coleccion");
                }}
                className="group relative aspect-[3/4] md:h-96 overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950 p-6 flex flex-col justify-end cursor-pointer transition-all duration-300 hover:border-amber-400/50 hover:shadow-2xl"
              >
                <ProductCrop product={products[2]} />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />
                <div className="relative z-10">
                  <span className="inline-block rounded-full bg-zinc-800 border border-zinc-700 px-2.5 py-0.5 text-[10px] font-semibold uppercase text-zinc-300 mb-2">
                    Sensual & Noche
                  </span>
                  <h3 className="font-display text-2xl font-bold text-white">Vestidos de Malla</h3>
                  <p className="mt-1 text-xs text-zinc-400">Transparencias y drapeados sexy.</p>
                  <span className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-400 group-hover:translate-x-1 transition-transform">
                    Explorar <ArrowRight className="size-3.5" />
                  </span>
                </div>
              </div>

              {/* Bento Card 3: Tops & Sets */}
              <div
                onClick={() => {
                  setActiveCategory("Tops & Sets");
                  scrollToSection("coleccion");
                }}
                className="group relative aspect-[3/4] md:h-96 overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950 p-6 flex flex-col justify-end cursor-pointer transition-all duration-300 hover:border-amber-400/50 hover:shadow-2xl"
              >
                <ProductCrop product={products[0]} />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />
                <div className="relative z-10">
                  <span className="inline-block rounded-full bg-zinc-800 border border-zinc-700 px-2.5 py-0.5 text-[10px] font-semibold uppercase text-zinc-300 mb-2">
                    Outfits 2 Piezas
                  </span>
                  <h3 className="font-display text-2xl font-bold text-white">Tops & Sets</h3>
                  <p className="mt-1 text-xs text-zinc-400">Bandeau, nudos y piezas combinables.</p>
                  <span className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-400 group-hover:translate-x-1 transition-transform">
                    Explorar <ArrowRight className="size-3.5" />
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 5. BEST SELLERS CATALOG (gpt-taste & motion-design) */}
        <section id="coleccion" className="scroll-mt-20 py-16 sm:py-24 bg-background">
          <div className="mx-auto max-w-7xl px-4 sm:px-8">
            <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.3em] text-amber-600 dark:text-amber-400">
                  {t("catalog_badge")}
                </p>
                <h2 className="mt-1 font-display text-4xl sm:text-6xl font-extrabold tracking-tight">
                  {t("catalog_title")}
                </h2>
              </div>

              {/* Category Filter Pills */}
              <div className="flex flex-wrap items-center gap-2">
                {[
                  { id: "Todos", label: t("catalog_filter_all") },
                  { id: "Licras", label: t("catalog_filter_shapewear") },
                  { id: "Vestidos", label: t("catalog_filter_dresses") },
                  { id: "Tops & Sets", label: t("catalog_filter_sets") },
                  { id: "Bodys & Corsets", label: "Bodys & Corsets" },
                  { id: "Accesorios & Glam", label: "Accesorios" },
                ].map(({ id, label }) => (
                  <Button
                    key={id}
                    variant={activeCategory === id ? "default" : "outline"}
                    size="sm"
                    className={`rounded-full px-5 text-xs font-semibold transition-all ${
                      activeCategory === id
                        ? "bg-zinc-950 text-white dark:bg-zinc-100 dark:text-zinc-950 shadow-md"
                        : "border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    }`}
                    onClick={() => setActiveCategory(id)}
                  >
                    {label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Product Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <article
                  key={product.id}
                  className="group relative flex flex-col justify-between rounded-3xl border border-zinc-200/80 dark:border-zinc-800 bg-card p-3 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1"
                >
                  <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl bg-zinc-100 dark:bg-zinc-900">
                    <ProductCrop product={product} />

                    {/* Tag Badge */}
                    <span className="absolute left-3 top-3 rounded-full bg-zinc-950/80 backdrop-blur-md px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-300 border border-amber-400/30">
                      {product.tag}
                    </span>

                    {/* Wishlist Heart */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(product.id);
                      }}
                      className="absolute right-3 top-3 size-9 rounded-full bg-zinc-950/60 backdrop-blur-md flex items-center justify-center text-white hover:text-red-400 transition-colors"
                      aria-label="Guardar en favoritos"
                    >
                      <Heart
                        className={`size-4 ${favorites[product.id] ? "fill-red-500 text-red-500" : ""}`}
                      />
                    </button>

                    {/* Quick Add Button Overlay */}
                    <div className="absolute inset-x-3 bottom-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <Button
                        className="w-full rounded-full h-11 text-xs font-bold uppercase tracking-wider bg-amber-400 text-zinc-950 hover:bg-amber-300 shadow-xl cursor-pointer"
                        onClick={() => addProduct(product.id)}
                      >
                        <Plus className="mr-1 size-4" /> {t("catalog_add_to_cart")}
                      </Button>
                    </div>
                  </div>

                  <div className="p-3 pt-4 flex flex-col flex-1 justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                        {product.category}
                      </span>
                      <h3 className="mt-1 font-display text-lg font-bold tracking-tight group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                        {product.name}
                      </h3>
                      <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                        {product.description}
                      </p>
                    </div>

                    <div className="mt-4 flex items-center justify-between pt-3 border-t border-zinc-100 dark:border-zinc-800">
                      <span className="font-mono text-lg font-extrabold text-zinc-950 dark:text-zinc-100">
                        ${product.price.toFixed(2)} <span className="text-[10px] font-normal text-zinc-400">USD</span>
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-full h-9 px-3 text-xs font-semibold border-zinc-300 dark:border-zinc-700 hover:bg-zinc-950 hover:text-white dark:hover:bg-zinc-100 dark:hover:text-zinc-950"
                        onClick={() => addProduct(product.id)}
                      >
                        <ShoppingBag className="size-3.5 mr-1" /> Pedir
                      </Button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* 6. "EL SELLO ISAFE" EDITORIAL FEATURE SPOTLIGHT */}
        <section id="estilo" className="scroll-mt-20 bg-zinc-950 py-20 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full filter blur-3xl pointer-events-none" />
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <div className="grid lg:grid-cols-3 gap-8 items-stretch">
              {/* Feature 1 */}
              <div className="rounded-3xl border border-zinc-800 bg-zinc-900/60 p-8 flex flex-col justify-between hover:border-amber-400/40 transition-colors">
                <div>
                  <Flame className="size-8 text-amber-400 mb-6" />
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-400">
                    TEJIDO INTELIGENTE
                  </p>
                  <h3 className="mt-2 font-display text-2xl font-bold">Efecto Moldeador Real</h3>
                  <p className="mt-3 text-xs leading-relaxed text-zinc-400">
                    Nuestras licras están confeccionadas con compresión anatómica que define la cintura, moldea los glúteos y no marca costuras.
                  </p>
                </div>
                <div className="mt-8 pt-4 border-t border-zinc-800 flex items-center gap-2 text-xs font-semibold text-zinc-300">
                  <CheckCircle2 className="size-4 text-emerald-400" /> Ajuste 100% Garantizado
                </div>
              </div>

              {/* Feature 2 */}
              <div className="rounded-3xl border border-amber-400/30 bg-gradient-to-b from-amber-400/10 to-zinc-900/60 p-8 flex flex-col justify-between">
                <div>
                  <Sparkles className="size-8 text-amber-400 mb-6" />
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-400">
                    DISEÑO NOCTURNO
                  </p>
                  <h3 className="mt-2 font-display text-2xl font-bold text-amber-200">
                    Elegancia Sensual
                  </h3>
                  <p className="mt-3 text-xs leading-relaxed text-zinc-300">
                    Vestidos de malla con caídas drapeadas y transparencias refinadas para destacar en tus fiestas, cumpleaños y cenas en Nueva York.
                  </p>
                </div>
                <div className="mt-8 pt-4 border-t border-amber-400/20 flex items-center gap-2 text-xs font-semibold text-amber-300">
                  <Star className="size-4 fill-amber-400 text-amber-400" /> Colección Exclusiva 2026
                </div>
              </div>

              {/* Feature 3 */}
              <div className="rounded-3xl border border-zinc-800 bg-zinc-900/60 p-8 flex flex-col justify-between hover:border-amber-400/40 transition-colors">
                <div>
                  <Truck className="size-8 text-amber-400 mb-6" />
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-400">
                    ENTREGA INMEDIATA
                  </p>
                  <h3 className="mt-2 font-display text-2xl font-bold">Showroom & Envíos 🇺🇸</h3>
                  <p className="mt-3 text-xs leading-relaxed text-zinc-400">
                    Recoge directamente en nuestra boutique física en Brooklyn o recibe tu paquete en tiempo récord con seguimiento activo.
                  </p>
                </div>
                <div className="mt-8 pt-4 border-t border-zinc-800 flex items-center gap-2 text-xs font-semibold text-zinc-300">
                  <Clock className="size-4 text-amber-400" /> Atención 1 a 1 en WhatsApp
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 6.5 INSTAGRAM & TIKTOK FEED SHOWCASE (@shopisafer & @shop_isafer1) */}
        <section className="py-16 sm:py-24 bg-zinc-900 text-zinc-100 border-t border-b border-zinc-800">
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.3em] text-rose-400">
                  REDES SOCIALES OFICIALES
                </p>
                <h2 className="mt-1 font-display text-4xl sm:text-5xl font-extrabold tracking-tight">
                  @shopisafer en Instagram & TikTok
                </h2>
              </div>
              <div className="flex items-center gap-3">
                <a
                  href="https://www.instagram.com/shopisafer"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-rose-500/40 bg-rose-500/10 px-4 py-2 text-xs font-semibold text-rose-300 hover:bg-rose-500/20 transition-all"
                >
                  <Instagram className="size-4" /> @shopisafer
                </a>
                <a
                  href="https://www.tiktok.com/@shop_isafer1"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-zinc-700 bg-zinc-800 px-4 py-2 text-xs font-semibold text-zinc-200 hover:bg-zinc-700 transition-all"
                >
                  🎵 TikTok @shop_isafer1
                </a>
              </div>
            </div>

            {/* Social Posts Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[
                {
                  title: "Licra Moldeadora Efecto Cintura Reloj de Arena 🔥",
                  handle: "@shopisafer · Instagram Reel",
                  image: "https://images.unsplash.com/photo-1518310383802-640c2de311b2?w=800&q=80",
                  link: "https://www.instagram.com/shopisafer",
                  badge: "Reel Popular",
                },
                {
                  title: "Drop Exclusivo: Vestidos de Malla Noche Sexy 💫",
                  handle: "@shop_isafer1 · TikTok Video",
                  image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&q=80",
                  link: "https://www.tiktok.com/@shop_isafer1",
                  badge: "Viral TikTok",
                },
                {
                  title: "Set Silk Knot Bandeau 2 Piezas · Sensual & Chic ✨",
                  handle: "@shopisafer · Post Foto",
                  image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80",
                  link: "https://www.instagram.com/shopisafer",
                  badge: "Look de la Semana",
                },
                {
                  title: "Pruébate en nuestro Showroom de Brooklyn, NY 📍",
                  handle: "@shop_isafer1 · TikTok Live",
                  image: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&q=80",
                  link: "https://www.tiktok.com/@shop_isafer1",
                  badge: "Showroom NYC",
                },
              ].map((item, idx) => (
                <a
                  key={idx}
                  href={item.link}
                  target="_blank"
                  rel="noreferrer"
                  className="group relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 aspect-[4/5] flex flex-col justify-end p-4 transition-all duration-300 hover:border-rose-400/50 hover:shadow-2xl"
                >
                  <img
                    src={item.image}
                    alt={item.title}
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />

                  <span className="absolute top-3 left-3 rounded-full bg-zinc-950/80 backdrop-blur-md px-2.5 py-0.5 text-[10px] font-bold text-rose-300 border border-rose-500/30">
                    {item.badge}
                  </span>

                  <div className="relative z-10 space-y-1">
                    <p className="text-xs font-semibold text-zinc-100 line-clamp-2">{item.title}</p>
                    <p className="text-[11px] text-zinc-400 font-mono">{item.handle}</p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* 7. VISÍTANOS EN BROOKLYN (SHOWROOM CARD) */}
        <section id="visitanos" className="scroll-mt-20 py-20 px-5 bg-background">
          <div className="mx-auto max-w-5xl rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-card p-8 sm:p-14 text-center shadow-2xl relative overflow-hidden">
            <div className="inline-flex size-14 items-center justify-center rounded-full bg-amber-400/10 text-amber-500 mb-6">
              <MapPin className="size-7" />
            </div>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-amber-600 dark:text-amber-400">
              NUESTRA TIENDA FÍSICA
            </p>
            <h2 className="mt-2 font-display text-4xl sm:text-6xl font-extrabold tracking-tight">
              Visítanos en Brooklyn
            </h2>
            <p className="mt-4 text-base font-semibold text-zinc-800 dark:text-zinc-200">
              📍 4711 Brooklyn, Nueva York, EE. UU.
            </p>
            <p className="mt-2 text-xs text-muted-foreground max-w-md mx-auto">
              Pruebas privadas de vestuario, asesoría de estilo personalizada y atención directa.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Button asChild className="h-12 rounded-full px-8 bg-zinc-950 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-950 font-bold text-xs uppercase tracking-wider">
                <a
                  href="https://www.google.com/maps/search/?api=1&query=4711+Brooklyn+New+York"
                  target="_blank"
                  rel="noreferrer"
                >
                  Abrir en Google Maps <MapPin className="ml-2 size-4" />
                </a>
              </Button>
              <Button
                asChild
                variant="outline"
                className="h-12 rounded-full px-8 border-emerald-500/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 font-bold text-xs uppercase tracking-wider"
              >
                <a
                  href="https://wa.me/19296772514?text=Hola%20Isafer%20Boutique%2C%20quiero%20agendar%20una%20visita%20al%20Showroom"
                  target="_blank"
                  rel="noreferrer"
                >
                  Agendar Cita previa <MessageCircle className="ml-2 size-4" />
                </a>
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* 8. FOOTER */}
      <footer className="border-t border-zinc-800 bg-zinc-950 px-5 pb-12 pt-16 text-zinc-300">
        <div className="mx-auto max-w-7xl grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="md:col-span-2">
            <IsaferLogo variant="white" showSubtext={true} />
            <p className="mt-4 text-xs text-zinc-400 max-w-sm leading-relaxed">
              Boutique femenina exclusiva en Brooklyn, Nueva York. Especialistas en licras moldeadoras de alta compresión, vestidos sensuales y outfits de noche.
            </p>
            <div className="mt-6 flex items-center gap-4 text-xs font-semibold text-amber-300">
              <span>📍 Brooklyn, NY</span>
              <span>•</span>
              <span>🇺🇸 Envíos a todo USA</span>
            </div>
          </div>

          <div>
            <h4 className="font-display text-sm font-bold uppercase tracking-wider text-white mb-4">
              Navegación
            </h4>
            <ul className="space-y-2.5 text-xs text-zinc-400">
              <li>
                <a href="#coleccion" onClick={(e) => { e.preventDefault(); scrollToSection("coleccion"); }} className="hover:text-amber-300 transition-colors">
                  Nueva Colección
                </a>
              </li>
              <li>
                <a href="#categorias" onClick={(e) => { e.preventDefault(); scrollToSection("categorias"); }} className="hover:text-amber-300 transition-colors">
                  Licras Moldeadoras
                </a>
              </li>
              <li>
                <a href="#estilo" onClick={(e) => { e.preventDefault(); scrollToSection("estilo"); }} className="hover:text-amber-300 transition-colors">
                  El Sello Isafer
                </a>
              </li>
              <li>
                <a href="#visitanos" onClick={(e) => { e.preventDefault(); scrollToSection("visitanos"); }} className="hover:text-amber-300 transition-colors">
                  Showroom Brooklyn
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-display text-sm font-bold uppercase tracking-wider text-white mb-4">
              Redes & Contacto
            </h4>
            <div className="space-y-3 text-xs text-zinc-400">
              <a
                href="https://www.instagram.com/shopisafer"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 hover:text-amber-300 transition-colors"
              >
                <Instagram className="size-4 text-amber-400" /> @shopisafer (Instagram)
              </a>
              <a
                href="https://www.tiktok.com/@shop_isafer1"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 hover:text-amber-300 transition-colors"
              >
                <Sparkles className="size-4 text-amber-400" /> @shop_isafer1 (TikTok)
              </a>
              <a
                href="https://wa.me/19296772514"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 hover:text-emerald-400 transition-colors"
              >
                <MessageCircle className="size-4 text-emerald-400" /> WhatsApp Oficial
              </a>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-7xl mt-12 pt-8 border-t border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <p>© {new Date().getFullYear()} Isafer Boutique. Todos los derechos reservados. Brooklyn, NY.</p>
          <p className="text-[10px] tracking-widest uppercase">Designed with MYNEXT Design System</p>
        </div>
      </footer>

      {/* Floating Cart Badge */}
      {itemCount > 0 && (
        <Button
          size="lg"
          className="fixed bottom-22 right-5 z-30 rounded-full bg-amber-400 text-zinc-950 font-bold text-xs uppercase tracking-wider shadow-2xl hover:bg-amber-300 px-6 h-12 flex items-center gap-2 animate-bounce cursor-pointer"
          onClick={() => setCartOpen(true)}
        >
          <ShoppingBag className="size-5" />
          <span>Ver Bolsa ({itemCount})</span>
        </Button>
      )}

      {/* Floating WhatsApp Action Button */}
      <Button
        asChild
        size="icon"
        className="fixed bottom-5 right-5 z-30 size-14 rounded-full bg-emerald-500 text-white shadow-2xl hover:bg-emerald-400 transition-transform hover:scale-110 cursor-pointer"
        aria-label="Contactar por WhatsApp"
      >
        <a
          href="https://wa.me/19296772514?text=Hola%20Isafer%20Boutique%2C%20quisiera%20consultar%20sobre%20sus%20prendas"
          target="_blank"
          rel="noreferrer"
        >
          <MessageCircle className="size-7" />
        </a>
      </Button>

      {/* Dialogs */}
      <AuthDialog open={authDialogOpen} onOpenChange={setAuthDialogOpen} />
      <CustomerAccountModal open={customerModalOpen} onOpenChange={setCustomerModalOpen} />
      <AdminDashboardModal open={adminModalOpen} onOpenChange={setAdminModalOpen} />
    </div>
  );
}
