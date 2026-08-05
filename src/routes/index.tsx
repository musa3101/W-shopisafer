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
  CreditCard,
  Grid,
  ChevronRight,
  X,
  Search,
  Mail,
  Lock,
  Shield,
  FileText,
  Cookie,
} from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import { toast } from "sonner";

import heroImage from "@/assets/rosse-hero.jpg";
import productsImage from "@/assets/rosse-products.jpg";
import { createOrder, fetchProducts, BackendProduct, updateOrderStripeSession, sendOrderConfirmationEmail } from "@/services/insforgeService";
import { fetchUserFavorites, addFavorite, removeFavorite, syncGuestFavorites } from "@/services/favoritesService";
import { useAuth } from "@/hooks/useAuth";
import { AuthDialog } from "@/components/AuthDialog";
import { CustomerAccountModal } from "@/components/CustomerAccountModal";
import { AdminDashboardModal } from "@/components/AdminDashboardModal";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { IsaferLogo } from "@/components/IsaferLogo";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n";
import { LanguageSelector } from "@/components/LanguageSelector";
import { TrendingCarousel } from "@/components/TrendingCarousel";
import { insforge } from "@/lib/insforge";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

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
  id: string | number;
  name: string;
  price: number;
  category: string;
  tag: string;
  position?: string;
  image?: string;
  description: string;
  stripe_price_id?: string;
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

type Cart = Record<string | number, number>;

function ProductCrop({ id, alt, product }: { id?: string | number; alt?: string; product?: ProductItem }) {
  const p = product ?? (id !== undefined ? products.find(prod => String(prod.id) === String(id)) : undefined);
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
  const { t, language, setLanguage } = useTranslation();
  const [productsList, setProductsList] = useState<ProductItem[]>(products);
  const [cart, setCart] = useState<Cart>({});
  const [cartOpen, setCartOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>("Todos");
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [customerModalOpen, setCustomerModalOpen] = useState(false);
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [favorites, setFavorites] = useState<Record<string | number, boolean>>({});
  const [favDialogOpen, setFavDialogOpen] = useState(false);
  const [pendingFavProduct, setPendingFavProduct] = useState<string | null>(null);
  const [favoritesDrawerOpen, setFavoritesDrawerOpen] = useState(false);
  const [showCookiesBanner, setShowCookiesBanner] = useState(false);
  const [showGeoBanner, setShowGeoBanner] = useState(false);
  const [geoCountry, setGeoCountry] = useState("España");
  const [targetLang, setTargetLang] = useState<"es" | "en">("es");
  const [isCatalogExpanded, setIsCatalogExpanded] = useState(false);
  const [fullScreenMenuOpen, setFullScreenMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuSearchQuery, setMenuSearchQuery] = useState("");
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [legalType, setLegalType] = useState<"privacy" | "terms" | "cookies" | null>(null);

  const { user, isAdmin, isCustomer, signInWithGoogle, signInWithPassword, signOut } = useAuth();

  const loadProductsFromInsForge = async () => {
    try {
      const backendProds = await fetchProducts();
      if (backendProds && backendProds.length > 0) {
        const mapped: ProductItem[] = backendProds.map((bp, idx) => {
          let category = "Tops & Sets";
          const nameLower = bp.name.toLowerCase();
          if (nameLower.includes("vestido") || nameLower.includes("gown") || nameLower.includes("skirt")) {
            category = "Vestidos";
          } else if (nameLower.includes("licra") || nameLower.includes("jumpsuit") || nameLower.includes("athletic") || nameLower.includes("biker")) {
            category = "Licras";
          } else if (nameLower.includes("body")) {
            category = "Bodys & Corsets";
          } else if (nameLower.includes("bolso") || nameLower.includes("cinturón") || nameLower.includes("accesorios")) {
            category = "Accesorios & Glam";
          }

          return {
            id: bp.id || idx,
            name: bp.name,
            price: Number(bp.price),
            category,
            tag: bp.badge || "Destacado",
            image: bp.images && bp.images.length > 0 ? bp.images[0] : undefined,
            description: bp.description || "",
            stripe_price_id: bp.stripe_price_id,
          };
        });
        setProductsList(mapped);
      }
    } catch (err) {
      console.error("Error cargando productos de InsForge:", err);
    }
  };

  useEffect(() => {
    loadProductsFromInsForge();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const payment = params.get("payment");

    if (payment === "success") {
      setCart({});
      toast.success("🎉 ¡Pago Exitoso! Tu orden se está procesando.", {
        duration: 8000,
        description: "Muchas gracias por tu compra. Te enviaremos un correo para coordinar tu envío.",
      });
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (payment === "cancel") {
      toast.info("Pago cancelado. Los artículos siguen en tu bolsa. 💖", {
        duration: 5000,
      });
      setCartOpen(true);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  useEffect(() => {
    setIsCatalogExpanded(false);
  }, [activeCategory]);

  // Verificar consentimiento de cookies
  useEffect(() => {
    const consent = localStorage.getItem("isafer_cookies_consent");
    if (!consent) {
      const timer = setTimeout(() => {
        setShowCookiesBanner(true);
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleCookiesConsent = (type: "accepted" | "rejected") => {
    localStorage.setItem("isafer_cookies_consent", type);
    setShowCookiesBanner(false);
    if (type === "accepted") {
      toast.success("¡Gracias por aceptar nuestras cookies! 💖");
    }
  };

  // Verificar procedencia e idioma del cliente para sugerir cambio
  useEffect(() => {
    const geoConsent = localStorage.getItem("isafer_geo_consent");
    if (!geoConsent) {
      const navLang = navigator.language || (navigator as any).userLanguage || "";
      const prefersSpanish = navLang.toLowerCase().startsWith("es");

      // Caso 1: Web en Inglés, pero navegador prefiere Español (es de España/Latam)
      if (language === "en" && prefersSpanish) {
        setGeoCountry("España");
        setTargetLang("es");
        const timer = setTimeout(() => {
          setShowGeoBanner(true);
        }, 3500); // Aparece 2.3s después del de cookies para no pisarse
        return () => clearTimeout(timer);
      }

      // Caso 2: Web en Español, pero navegador prefiere Inglés (es de USA/Global)
      if (language === "es" && !prefersSpanish) {
        setGeoCountry("USA");
        setTargetLang("en");
        const timer = setTimeout(() => {
          setShowGeoBanner(true);
        }, 3500);
        return () => clearTimeout(timer);
      }
    }
  }, [language]);

  const itemCount = Object.values(cart).reduce((sum, count) => sum + count, 0);
  const subtotal = useMemo(
    () => productsList.reduce((sum, product) => sum + product.price * (cart[product.id] ?? 0), 0),
    [cart, productsList],
  );

  // Cargar favoritos al inicio y sincronizar si el usuario inicia sesión
  useEffect(() => {
    const loadFavorites = async () => {
      if (user) {
        // Cargar desde PostgreSQL
        const userFavs = await fetchUserFavorites(user.id);
        const favsMap: Record<string, boolean> = {};
        userFavs.forEach((fid) => {
          favsMap[fid] = true;
        });
        setFavorites(favsMap);

        // Sincronizar temporales de LocalStorage
        const stored = localStorage.getItem("isafer_guest_favorites");
        if (stored) {
          try {
            const guestFavs = JSON.parse(stored) as string[];
            if (guestFavs.length > 0) {
              await syncGuestFavorites(user.id, guestFavs);
              const mergedFavs = await fetchUserFavorites(user.id);
              const mergedMap: Record<string, boolean> = {};
              mergedFavs.forEach((fid) => {
                mergedMap[fid] = true;
              });
              setFavorites(mergedMap);
              toast.success("¡Tus favoritos temporales se han sincronizado con tu cuenta! 💖");
            }
          } catch (e) {
            console.error("Error al sincronizar favoritos:", e);
          }
          localStorage.removeItem("isafer_guest_favorites");
        }
      } else {
        // Cargar desde LocalStorage
        const stored = localStorage.getItem("isafer_guest_favorites");
        if (stored) {
          try {
            const guestFavs = JSON.parse(stored) as string[];
            const favsMap: Record<string, boolean> = {};
            guestFavs.forEach((fid) => {
              favsMap[fid] = true;
            });
            setFavorites(favsMap);
          } catch (e) {
            console.error("Error al leer favoritos temporales:", e);
          }
        } else {
          setFavorites({});
        }
      }
    };

    loadFavorites();
  }, [user]);

  const toggleFavorite = async (id: string | number) => {
    const productId = String(id);
    const isFav = !!favorites[productId];

    if (user) {
      // 1. Conectado (Guardar en base de datos)
      if (isFav) {
        setFavorites((prev) => {
          const next = { ...prev };
          delete next[productId];
          return next;
        });
        const success = await removeFavorite(user.id, productId);
        if (success) {
          toast("Eliminado de favoritos 💔", { duration: 2000 });
        } else {
          setFavorites((prev) => ({ ...prev, [productId]: true }));
          toast.error("No se pudo eliminar de favoritos");
        }
      } else {
        setFavorites((prev) => ({ ...prev, [productId]: true }));
        const success = await addFavorite(user.id, productId);
        if (success) {
          toast("¡Añadido a tus favoritos! 💖", { duration: 2000 });
        } else {
          setFavorites((prev) => {
            const next = { ...prev };
            delete next[productId];
            return next;
          });
          toast.error("No se pudo guardar en favoritos");
        }
      }
    } else {
      // 2. Invitado (Guardar en LocalStorage y abrir modal estilo Pull&Bear)
      const stored = localStorage.getItem("isafer_guest_favorites");
      let guestFavs: string[] = [];
      if (stored) {
        try {
          guestFavs = JSON.parse(stored);
        } catch (e) {
          console.error(e);
        }
      }

      if (isFav) {
        guestFavs = guestFavs.filter((fid) => fid !== productId);
        localStorage.setItem("isafer_guest_favorites", JSON.stringify(guestFavs));
        setFavorites((prev) => {
          const next = { ...prev };
          delete next[productId];
          return next;
        });
        toast("Eliminado de favoritos 💔", { duration: 2000 });
      } else {
        guestFavs.push(productId);
        localStorage.setItem("isafer_guest_favorites", JSON.stringify(guestFavs));
        setFavorites((prev) => ({ ...prev, [productId]: true }));
        
        // Abrir diálogo de invitación
        setPendingFavProduct(productId);
        setFavDialogOpen(true);
      }
    }
  };

  const addProduct = (id: string | number) => {
    const item = productsList.find((p) => String(p.id) === String(id));
    setCart((current) => ({ ...current, [id]: (current[id] ?? 0) + 1 }));
    setCartOpen(true);
    if (item) {
      toast.success(`${item.name} añadido a tu bolsa ✨`);
    }
  };

  const updateProduct = (id: string | number, change: number) =>
    setCart((current) => {
      const quantity = Math.max(0, (current[id] ?? 0) + change);
      const next = { ...current };
      if (quantity === 0) delete next[id];
      else next[id] = quantity;
      return next;
    });

  const removeProduct = (id: string | number) => {
    const item = productsList.find((p) => String(p.id) === String(id));
    setCart((current) => {
      const next = { ...current };
      delete next[id];
      return next;
    });
    if (item) {
      toast.info(`${item.name} eliminado de la bolsa`);
    }
  };

  const scrollToSection = (id: string) => {
    const target = document.getElementById(id);
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleCheckout = () => {
    const activeItems = productsList.filter((p) => cart[p.id]);

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

    const customerEmail = user?.email || "cliente@isaferboutique.com";
    const customerName = user?.email ? user.email.split("@")[0] : "Cliente Web (WhatsApp)";
    const itemsMapped = activeItems.map((p) => ({
      product_id: String(p.id),
      name: p.name,
      price: p.price,
      quantity: cart[p.id],
    }));

    createOrder({
      customer_name: customerName,
      customer_email: customerEmail,
      total_amount: subtotal,
      items: itemsMapped,
    })
      .then((res) => {
        if (res.success && res.data?.id) {
          sendOrderConfirmationEmail({
            customerName,
            customerEmail,
            totalAmount: subtotal,
            items: itemsMapped,
            orderId: res.data.id,
          });
        }
      })
      .catch((err) => console.error("No se pudo guardar el pedido en InsForge:", err));
  };

  const handleStripeCheckout = async () => {
    const activeItems = productsList.filter((p) => cart[p.id]);

    if (activeItems.length === 0) {
      toast.error("Tu bolsa está vacía");
      return;
    }

    // Verificar si todos los items seleccionados tienen un Stripe Price ID asignado
    const itemsWithoutPrice = activeItems.filter((p) => !p.stripe_price_id);
    if (itemsWithoutPrice.length > 0) {
      toast.error(
        `El artículo "${itemsWithoutPrice[0].name}" no se puede pagar con tarjeta todavía. Contacta con nosotros por WhatsApp.`,
        { duration: 5000 }
      );
      return;
    }

    toast.loading("Creando pedido y preparando pago seguro...");

    try {
      // 1. Crear el pedido en estado 'pending' en la base de datos de InsForge
      const orderRes = await createOrder({
        customer_name: user?.email ? user.email.split("@")[0] : "Cliente Web (Stripe)",
        customer_email: user?.email || "cliente@isaferboutique.com",
        total_amount: subtotal,
        items: activeItems.map((p) => ({
          product_id: String(p.id),
          name: p.name,
          price: p.price,
          quantity: cart[p.id],
        })),
        stripe_session_id: 'pending_session',
      });

      if (!orderRes.success || !orderRes.data?.id) {
        toast.dismiss();
        toast.error(`No se pudo registrar el pedido previo: ${orderRes.error || "Inténtalo de nuevo"}`);
        return;
      }

      const createdOrderId = orderRes.data.id;

      // 2. Crear la sesión de Stripe Checkout pasando el order_id en metadata
      const lineItems = activeItems.map((p) => ({
        priceId: p.stripe_price_id!,
        quantity: cart[p.id],
      }));

      const { data, error } = await insforge.payments.stripe.createCheckoutSession("test", {
        mode: "payment",
        lineItems,
        successUrl: `${window.location.origin}/?payment=success&session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${window.location.origin}/?payment=cancel`,
        customerEmail: user?.email || undefined,
        metadata: {
          order_id: createdOrderId,
        },
      });

      if (error) {
        toast.dismiss();
        console.error("Error al crear sesión de checkout con Stripe:", error);
        toast.error(`Error al procesar pago: ${error.message || "Inténtalo de nuevo"}`);
        return;
      }

      if (data?.checkoutSession?.url) {
        // 3. Actualizar la orden con el ID real de la sesión de Stripe
        await updateOrderStripeSession(createdOrderId, data.checkoutSession.id);

        toast.dismiss();
        toast.success("¡Redirigiendo a Stripe!");
        window.location.assign(data.checkoutSession.url);
      } else {
        toast.dismiss();
        toast.error("No se recibió la URL de pago de Stripe");
      }
    } catch (err: any) {
      toast.dismiss();
      console.error("Excepción en Stripe checkout:", err);
      toast.error("Error de conexión al procesar el pago");
    }
  };

  const filteredProducts = useMemo(() => {
    if (activeCategory === "Todos") return productsList;
    return productsList.filter((p) => p.category === activeCategory);
  }, [activeCategory, productsList]);

  return (
    <div className="min-h-screen overflow-x-hidden bg-background text-foreground antialiased selection:bg-amber-500/20 selection:text-amber-900 dark:selection:text-amber-100">
      {/* 1. TOP ANNOUNCEMENT MARQUEE */}
      <div className="bg-zinc-950 text-zinc-100 px-4 py-2 text-[11px] font-semibold tracking-[0.25em] uppercase text-center border-b border-zinc-800 flex items-center justify-center gap-3 overflow-hidden">
        <span className="hidden sm:inline text-amber-400">✦</span>
        <span>{t("nav_shipping_banner")}</span>
        <span className="hidden sm:inline text-amber-400">✦</span>
      </div>

      {/* 2. HEADER NAVBAR */}
      <header className="sticky top-0 z-40 border-b border-rose-100 bg-[#fff8fa]/95 text-zinc-800 backdrop-blur-xl transition-all">
        <div className="relative mx-auto flex h-16 sm:h-20 max-w-7xl items-center justify-between px-4 sm:px-8">
          {/* Left Menu Trigger for Fullscreen Menu */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full text-zinc-700 hover:text-rose-600 hover:bg-rose-100/50 cursor-pointer"
              onClick={() => setFullScreenMenuOpen(true)}
              aria-label="Abrir menú de navegación"
            >
              <Menu className="size-5" />
            </Button>
          </div>

          {/* Center Brand Logo (Absolute Center) */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 flex items-center justify-center">
            <a
              href="#inicio"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection("inicio");
              }}
              className="cursor-pointer"
              aria-label="Isafer Boutique Inicio"
            >
              <IsaferLogo variant="header" size="md" />
            </a>
          </div>

          {/* Right Action Icons: Search & Cart */}
          <div className="flex items-center gap-1.5 sm:gap-3">
            {/* Botón de Búsqueda */}
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full text-zinc-700 hover:text-rose-500 hover:bg-rose-100/30 transition-transform active:scale-95 cursor-pointer mr-0.5"
              onClick={() => setSearchOpen(true)}
              aria-label="Buscar productos"
            >
              <Search className="size-5" />
            </Button>

            {/* Cart Trigger */}
            <Sheet open={cartOpen} onOpenChange={setCartOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="default"
                  size="sm"
                  className="relative rounded-full px-4 h-10 bg-primary text-primary-foreground hover:bg-primary/95 font-semibold text-xs gap-2 shadow-lg shadow-rose-200/50 transition-transform active:scale-95 border border-primary/20"
                  aria-label={`Carrito, ${itemCount} artículos`}
                >
                  <ShoppingBag className="size-4" />
                  <span className="hidden sm:inline">Bolsa</span>
                  {itemCount > 0 && (
                    <span className="ml-0.5 flex size-5 items-center justify-center rounded-full bg-zinc-950 text-[11px] font-bold text-white">
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
                    productsList
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
                      className="h-12 w-full rounded-full text-xs font-semibold uppercase tracking-wider bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-950/20 gap-2 cursor-pointer transition-all active:scale-95 border border-rose-500/20"
                      onClick={handleStripeCheckout}
                    >
                      <CreditCard className="size-4" />
                      Pagar con Tarjeta (Stripe)
                    </Button>
                    <Button
                      className="h-12 w-full rounded-full text-xs font-semibold uppercase tracking-wider bg-emerald-600 text-white hover:bg-emerald-500 shadow-lg shadow-emerald-950/50 gap-2 cursor-pointer transition-all active:scale-95 border border-emerald-500/20"
                      onClick={handleCheckout}
                    >
                      <MessageCircle className="size-4 fill-white" />
                      Pedir por WhatsApp (Respaldo)
                    </Button>
                    <p className="text-center text-[10px] text-zinc-500 tracking-wide">
                      🔒 Pago seguro encriptado con Stripe & InsForge
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
              {/* H1 Display Title (gpt-taste rule) */}
              <h1 className="font-display text-4xl sm:text-6xl font-black leading-[1.0] tracking-tight text-white uppercase text-balance">
                {t("hero_title_1").includes("y") ? "Sensual &" : "Sexy &"}
                <br />
                <span className="italic font-serif font-normal text-primary drop-shadow-sm normal-case">
                  {t("hero_title_1").includes("y") ? "Elegante" : "Elegant"}
                </span>
              </h1>

              {/* Body Text (max 65 chars rule - hidden on mobile) */}
              <p className="mt-6 max-w-lg text-sm sm:text-base leading-relaxed text-zinc-300 font-normal hidden sm:block">
                {t("hero_subtitle")}
              </p>

              {/* CTA Buttons (gpt-taste uppercase tracking rule) */}
              <div className="mt-8 flex items-center">
                <Button
                  asChild
                  className="w-full sm:w-auto h-13 rounded-full px-8 text-xs font-bold uppercase tracking-[0.2em] bg-primary text-white hover:bg-primary/90 shadow-lg shadow-rose-950/20 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                >
                  <a
                    href="#coleccion"
                    onClick={(e) => {
                      e.preventDefault();
                      scrollToSection("coleccion");
                    }}
                    className="flex items-center justify-center gap-1.5"
                  >
                    {t("hero_cta_primary")} ✦
                  </a>
                </Button>
              </div>

              {/* Social Proof Stats - hidden on mobile */}
              <div className="mt-12 hidden sm:flex items-center gap-6 pt-6 border-t border-zinc-800/80 text-xs text-zinc-400">
                <div className="flex items-center gap-1.5">
                  <div className="flex -space-x-1">
                    {[1, 2, 3, 4].map((i) => (
                      <span
                        key={i}
                        className="inline-flex size-6 items-center justify-center rounded-full bg-primary/20 border border-primary text-[10px] font-bold text-primary"
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

        {/* Trending/New Arrivals Carousel */}
        <TrendingCarousel
          products={productsList}
          favorites={favorites}
          toggleFavorite={toggleFavorite}
          addProduct={addProduct}
          t={t}
        />

        {/* 4. BENTO GRID CATEGORIES (uipro-max skill) */}
        <section id="categorias" className="scroll-mt-20 py-16 sm:py-24 bg-zinc-900 text-zinc-100">
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <div className="mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.3em] text-primary">
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
                <ProductCrop product={productsList[3] || productsList[0]} />
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
                <ProductCrop product={productsList[7] || productsList[0]} />
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
                <ProductCrop product={productsList[0]} />
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
                <p className="text-xs font-bold uppercase tracking-[0.3em] text-primary">
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
                    className={`rounded-full px-5 text-xs font-semibold transition-all ${activeCategory === id
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
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {filteredProducts.map((product, idx) => {
                const shouldHide = !isCatalogExpanded && (
                  idx >= 4 ? (idx >= 8 ? "hidden" : "hidden lg:block") : ""
                );
                return (
                  <article
                    key={product.id}
                    className={`group relative flex flex-col justify-between rounded-3xl border border-zinc-200/80 dark:border-zinc-800 bg-card p-3 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 ${shouldHide}`}
                  >
                    <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl bg-zinc-100 dark:bg-zinc-900">
                      <ProductCrop product={product} />

                      {/* Tag Badge */}
                      <span className="absolute left-3 top-3 rounded-full bg-zinc-950/80 backdrop-blur-md px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-300 border border-amber-400/30">
                        {product.tag}
                      </span>

                      {/* Wishlist Heart - Estilo Pull&Bear */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(product.id);
                        }}
                        className="absolute right-3 top-3 size-9 rounded-full bg-white/90 hover:bg-white shadow-xs backdrop-blur-xs flex items-center justify-center border border-zinc-200/50 transition-all duration-300 active:scale-75 group/fav cursor-pointer"
                        aria-label="Guardar en favoritos"
                      >
                        <Heart
                          className={`size-4 transition-all duration-350 ${
                            favorites[product.id]
                              ? "fill-rose-500 text-rose-500 scale-110 animate-pulse"
                              : "text-zinc-700 fill-transparent group-hover/fav:text-rose-500 group-hover/fav:scale-110"
                          }`}
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
                        <h3 className="mt-1 font-display text-sm sm:text-base md:text-lg font-bold tracking-tight group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                          {product.name}
                        </h3>
                        <p className="mt-1 text-xs text-muted-foreground line-clamp-2 hidden sm:block">
                          {product.description}
                        </p>
                      </div>

                      <div className="mt-4 flex items-center justify-between pt-3 border-t border-zinc-100 dark:border-zinc-800">
                        <span className="font-mono text-lg font-extrabold text-zinc-950 dark:text-zinc-100">
                          ${product.price.toFixed(2)} <span className="text-[10px] font-normal text-zinc-400 hidden sm:inline">USD</span>
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-full h-9 w-9 p-0 sm:w-auto sm:px-3 text-xs font-semibold border-zinc-300 dark:border-zinc-700 hover:bg-zinc-950 hover:text-white dark:hover:bg-zinc-100 dark:hover:text-zinc-950"
                          onClick={() => addProduct(product.id)}
                          aria-label={t("catalog_add_to_cart")}
                        >
                          <ShoppingBag className="size-3.5 sm:mr-1" />
                          <span className="hidden sm:inline">Pedir</span>
                        </Button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            {/* Show More / Show Less Button */}
            {filteredProducts.length > 4 && (
              <div
                className={`mt-12 flex justify-center ${
                  filteredProducts.length <= 8 ? "lg:hidden" : ""
                }`}
              >
                <Button
                  onClick={() => setIsCatalogExpanded(!isCatalogExpanded)}
                  className="rounded-full h-12 px-8 text-xs font-bold uppercase tracking-[0.2em] bg-zinc-950 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-950 border border-zinc-300 dark:border-zinc-700 transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-lg shadow-zinc-200/20"
                >
                  {isCatalogExpanded ? (
                    <>
                      {t("catalog_show_less")} ✦
                    </>
                  ) : (
                    <>
                      {t("catalog_show_more")} ✦
                    </>
                  )}
                </Button>
              </div>
            )}
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
            <div
              className="flex overflow-x-auto sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-5 pb-4 sm:pb-0 snap-x snap-mandatory scrollbar-none"
              style={{
                scrollbarWidth: "none",
                msOverflowStyle: "none",
              }}
            >
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
                  className="group relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 aspect-[4/5] flex flex-col justify-end p-4 transition-all duration-300 hover:border-rose-400/50 hover:shadow-2xl min-w-[75%] sm:min-w-0 snap-start shrink-0 sm:shrink"
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
            <div className="inline-flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary mb-6">
              <MapPin className="size-7" />
            </div>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-primary">
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

      {/* 8. FOOTER E-COMMERCE ENRIQUECIDO (Bershka / Fashion Nova Style) */}
      <footer className="border-t border-zinc-900 bg-zinc-950 text-zinc-300 pt-16 pb-12 transition-all">
        <div className="mx-auto max-w-7xl px-4 sm:px-8">
          {/* VIP Newsletter Box */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-zinc-900 via-rose-950/40 to-zinc-900 border border-rose-500/20 p-8 sm:p-12 mb-16 shadow-2xl">
            <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8 text-center lg:text-left">
              <div className="space-y-2 max-w-xl">
                <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-[10px] font-mono font-bold tracking-widest uppercase">
                  <Sparkles className="size-3 text-rose-400" /> {t("newsletter_title")}
                </span>
                <h3 className="font-serif text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  {t("newsletter_subtitle")}
                </h3>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (newsletterEmail) {
                    toast.success("¡Bienvenida al Club Barbie Luxe! 💖", {
                      description: "Te hemos enviado tu cupón VIP de 10% OFF.",
                    });
                    setNewsletterEmail("");
                  }
                }}
                className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto shrink-0 max-w-md"
              >
                <div className="relative flex-1">
                  <Mail className="absolute left-4 top-3.5 size-4 text-zinc-500" />
                  <input
                    type="email"
                    required
                    placeholder={t("newsletter_placeholder")}
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    className="w-full rounded-2xl border border-zinc-800 bg-zinc-900/90 py-3 pl-11 pr-4 text-xs text-white placeholder-zinc-500 focus:border-rose-500 focus:outline-none"
                  />
                </div>
                <Button
                  type="submit"
                  className="rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs uppercase tracking-wider px-6 py-3 shadow-lg cursor-pointer"
                >
                  {t("newsletter_btn")}
                </Button>
              </form>
            </div>
          </div>

          {/* 4 Columns Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-zinc-900">
            {/* Col 1: Brand Info */}
            <div className="space-y-4 text-center md:text-left">
              <div className="inline-flex justify-center md:justify-start">
                <IsaferLogo variant="footer" size="md" />
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed max-w-sm">
                {t("footer_tagline")} Diseñado en Brooklyn, NY para empoderar la elegancia y seguridad femenina.
              </p>
              <div className="pt-2 flex items-center justify-center md:justify-start gap-3">
                <a
                  href="https://www.instagram.com/shopisafer"
                  target="_blank"
                  rel="noreferrer"
                  className="w-9 h-9 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-rose-400 hover:border-rose-500/40 transition-colors"
                  aria-label="Instagram"
                >
                  <Instagram className="size-4" />
                </a>
                <a
                  href="https://wa.me/19296772514"
                  target="_blank"
                  rel="noreferrer"
                  className="w-9 h-9 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-emerald-400 hover:border-emerald-500/40 transition-colors"
                  aria-label="WhatsApp"
                >
                  <MessageCircle className="size-4" />
                </a>
              </div>
            </div>

            {/* Col 2: Shop Links */}
            <div className="space-y-4 text-center md:text-left">
              <h4 className="font-serif text-sm font-bold uppercase tracking-widest text-white">
                {t("footer_links_title")}
              </h4>
              <ul className="space-y-2.5 text-xs text-zinc-400">
                <li>
                  <a href="#coleccion" onClick={(e) => { e.preventDefault(); setActiveCategory("Licras"); scrollToSection("coleccion"); }} className="hover:text-rose-400 transition-colors">
                    Fajas & Licras Moldeadoras
                  </a>
                </li>
                <li>
                  <a href="#coleccion" onClick={(e) => { e.preventDefault(); setActiveCategory("Vestidos"); scrollToSection("coleccion"); }} className="hover:text-rose-400 transition-colors">
                    Vestidos Glam & Noche
                  </a>
                </li>
                <li>
                  <a href="#spray" onClick={(e) => { e.preventDefault(); scrollToSection("spray"); }} className="hover:text-rose-400 transition-colors">
                    Aerosol de Autodefensa Chic
                  </a>
                </li>
                <li>
                  <a href="#coleccion" onClick={(e) => { e.preventDefault(); setActiveCategory("Tops & Sets"); scrollToSection("coleccion"); }} className="hover:text-rose-400 transition-colors">
                    Conjuntos & Tops Luxe
                  </a>
                </li>
              </ul>
            </div>

            {/* Col 3: Customer Support */}
            <div className="space-y-4 text-center md:text-left">
              <h4 className="font-serif text-sm font-bold uppercase tracking-widest text-white">
                {t("footer_help_title")}
              </h4>
              <ul className="space-y-2.5 text-xs text-zinc-400 flex flex-col items-center md:items-start">
                <li className="flex items-center gap-2">
                  <Truck className="size-3.5 text-rose-400" /> Envíos Express (USA 24-48h)
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="size-3.5 text-emerald-400" /> Devoluciones 30 Días
                </li>
                <li className="flex items-center gap-2">
                  <Clock className="size-3.5 text-amber-400" /> Atención Lun-Sáb (9am - 8pm)
                </li>
                <li>
                  <a href="https://wa.me/19296772514" target="_blank" rel="noreferrer" className="text-emerald-400 underline hover:text-emerald-300 transition-colors font-semibold">
                    Atención por WhatsApp
                  </a>
                </li>
              </ul>
            </div>

            {/* Col 4: Safe Payments & Location */}
            <div className="space-y-4 text-center md:text-left">
              <h4 className="font-serif text-sm font-bold uppercase tracking-widest text-white">
                {t("footer_payments_title")}
              </h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Pagos encriptados SSL de 256 bits procesados en tiempo real con Stripe Checkout o WhatsApp.
              </p>
              <div className="flex flex-wrap justify-center md:justify-start items-center gap-2 pt-1">
                <span className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-[10px] font-extrabold text-white flex items-center gap-1.5">
                  <CreditCard className="size-3.5 text-rose-400" /> Stripe Checkout
                </span>
                <span className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-[10px] font-mono font-bold text-zinc-300">
                  Visa / MasterCard
                </span>
                <span className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-[10px] font-mono font-bold text-emerald-400">
                  WhatsApp Orders
                </span>
              </div>
            </div>
          </div>

          {/* Subfooter */}
          <div className="pt-8 border-t border-zinc-900/60 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
            <div className="flex flex-col sm:flex-row items-center gap-2 text-center sm:text-left">
              <p>{t("footer_rights")} Brooklyn, New York, NY 11201.</p>
              <span className="hidden sm:inline text-zinc-800">|</span>
              <p>
                {t("footer_credits")}{" "}
                <a 
                  href="https://mynextbymusa.com/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-amber-400 hover:text-amber-300 font-bold transition-colors underline decoration-dotted underline-offset-4"
                >
                  MYNEXT
                </a>
              </p>
            </div>
            <div className="flex items-center gap-6 text-[11px]">
              <button 
                onClick={() => setLegalType("privacy")} 
                className="hover:text-zinc-300 transition-colors cursor-pointer bg-transparent border-0 p-0 text-[11px] font-medium"
              >
                {t("footer_privacy")}
              </button>
              <button 
                onClick={() => setLegalType("terms")} 
                className="hover:text-zinc-300 transition-colors cursor-pointer bg-transparent border-0 p-0 text-[11px] font-medium"
              >
                {t("footer_terms")}
              </button>
              <button 
                onClick={() => setLegalType("cookies")} 
                className="hover:text-zinc-300 transition-colors cursor-pointer bg-transparent border-0 p-0 text-[11px] font-medium"
              >
                {t("footer_cookies")}
              </button>
            </div>
          </div>
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



      {/* Full-Screen Mobile Menu Overlay (Bershka & Pull&Bear Style) */}
      {/* Left Drawer Mobile/Desktop Navigation Menu (Camila Sevilla Style) */}
      <Sheet open={fullScreenMenuOpen} onOpenChange={setFullScreenMenuOpen}>
        <SheetContent
          side="left"
          className="flex w-[85%] sm:max-w-md flex-col border-rose-100 bg-[#fffcfd] p-6 text-zinc-800 [&>button]:bg-transparent [&>button]:text-zinc-400 [&>button]:hover:text-rose-500 [&>button]:right-5 [&>button]:top-5 [&>button]:rounded-full [&>button]:p-2 [&>button]:hover:bg-rose-50/50 [&>button]:border-0 [&>button]:shadow-none [&>button>svg]:size-5 [&>button]:transition-all [&>button]:duration-300"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-rose-100 mt-2">
            <IsaferLogo variant="header" size="md" />
          </div>

          {/* Quick Search inside menu */}
          <div className="my-4">
            <div className="relative">
              <Search className="absolute left-4 top-3 size-4 text-zinc-400" />
              <input
                type="text"
                placeholder={t("mobile_menu_search")}
                value={menuSearchQuery}
                onChange={(e) => setMenuSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    setFullScreenMenuOpen(false);
                    scrollToSection("coleccion");
                  }
                }}
                className="w-full rounded-2xl border border-rose-100 bg-[#fffafb] py-2.5 pl-11 pr-4 text-xs font-semibold focus:border-rose-300 focus:outline-none"
              />
            </div>
          </div>

          {/* Navigation Links Area */}
          <div className="flex-1 overflow-y-auto no-scrollbar py-2 space-y-4">
            <nav className="flex flex-col font-sans">
              {/* Enlace Inicio */}
              <a
                href="#inicio"
                onClick={(e) => {
                  e.preventDefault();
                  setFullScreenMenuOpen(false);
                  scrollToSection("inicio");
                }}
                className="py-3 border-b border-rose-50/60 text-left text-sm font-bold uppercase tracking-wider text-zinc-800 hover:text-rose-600 transition-colors"
              >
                {t("nav_home") || "Inicio"}
              </a>

              {/* Acordeón de Categorías de la Tienda */}
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="categories" className="border-b border-rose-50/60 py-1">
                  <AccordionTrigger className="text-sm font-bold uppercase tracking-wider text-zinc-800 hover:text-rose-600 hover:no-underline py-2">
                    {t("nav_categories") || "Colección / Categorías"}
                  </AccordionTrigger>
                  <AccordionContent className="pt-1 pb-2 pl-3 flex flex-col gap-1.5">
                    {[
                      { label: t("catalog_filter_all"), category: "Todos", icon: Sparkles },
                      { label: t("catalog_filter_shapewear"), category: "Licras", icon: Flame },
                      { label: t("catalog_filter_dresses"), category: "Vestidos", icon: Heart },
                      { label: t("catalog_filter_sets"), category: "Tops & Sets", icon: Grid },
                      { label: "Bodys & Corsets", category: "Bodys & Corsets", icon: Sparkles },
                      { label: "Accesorios & Glam", category: "Accesorios & Glam", icon: Star },
                    ].map((item) => (
                      <a
                        key={item.category}
                        href="#coleccion"
                        onClick={(e) => {
                          e.preventDefault();
                          setActiveCategory(item.category);
                          setFullScreenMenuOpen(false);
                          scrollToSection("coleccion");
                        }}
                        className="flex items-center justify-between py-2 text-xs font-semibold text-zinc-650 hover:text-rose-600 transition-colors"
                      >
                        <span className="flex items-center gap-2">
                          <item.icon className="size-3.5 text-rose-300" />
                          {item.label}
                        </span>
                        <ChevronRight className="size-3 text-zinc-450" />
                      </a>
                    ))}
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="safety" className="border-b border-rose-50/60 py-1">
                  <AccordionTrigger className="text-sm font-bold uppercase tracking-wider text-zinc-800 hover:text-rose-600 hover:no-underline py-2">
                    {t("catalog_filter_protection") || "Defensa Personal"}
                  </AccordionTrigger>
                  <AccordionContent className="pt-1 pb-2 pl-3 flex flex-col gap-1.5">
                    <a
                      href="#coleccion"
                      onClick={(e) => {
                        e.preventDefault();
                        setActiveCategory("Gas Pimienta");
                        setFullScreenMenuOpen(false);
                        scrollToSection("coleccion");
                      }}
                      className="flex items-center justify-between py-2 text-xs font-semibold text-zinc-650 hover:text-rose-600 transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <ShieldCheck className="size-3.5 text-rose-300" />
                        Gas Pimienta & Alarmas
                      </span>
                      <ChevronRight className="size-3 text-zinc-450" />
                    </a>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              {/* Botón de Favoritos */}
              <button
                onClick={() => {
                  setFullScreenMenuOpen(false);
                  setFavoritesDrawerOpen(true);
                }}
                className="w-full py-3.5 border-b border-rose-50/60 text-left text-sm font-bold uppercase tracking-wider text-zinc-800 hover:text-rose-600 transition-colors flex items-center justify-between group cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  Mis Favoritos 💖
                  {Object.keys(favorites).length > 0 && (
                    <span className="ml-1 px-2 py-0.5 rounded-full bg-rose-105 text-[10px] font-black text-rose-600">
                      {Object.keys(favorites).length}
                    </span>
                  )}
                </span>
                <ChevronRight className="size-4 text-zinc-450 group-hover:translate-x-0.5 transition-transform" />
              </button>

              {/* Enlaces de Utilidad */}
              <a
                href="https://wa.me/19294848383?text=Hola,%20quisiera%20saber%20el%20estado%20de%20mi%20pedido%20de%20Isafer%20Boutique"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setFullScreenMenuOpen(false)}
                className="py-3 border-b border-rose-50/60 text-left text-sm font-bold uppercase tracking-wider text-zinc-800 hover:text-rose-600 transition-colors flex items-center justify-between group"
              >
                <span>Seguimiento de Pedido 📦</span>
                <ChevronRight className="size-4 text-zinc-450 group-hover:translate-x-0.5 transition-transform" />
              </a>

              <a
                href="https://wa.me/19294848383?text=Hola,%20necesito%20ayuda%20con%20una%20compra%20en%20Isafer%20Boutique"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setFullScreenMenuOpen(false)}
                className="py-3 border-b border-rose-50/60 text-left text-sm font-bold uppercase tracking-wider text-zinc-800 hover:text-rose-600 transition-colors flex items-center justify-between group"
              >
                <span>Centro de Ayuda 💬</span>
                <ChevronRight className="size-4 text-zinc-450 group-hover:translate-x-0.5 transition-transform" />
              </a>

              <a
                href="#historia"
                onClick={(e) => {
                  e.preventDefault();
                  setFullScreenMenuOpen(false);
                  scrollToSection("historia");
                }}
                className="py-3 border-b border-rose-50/60 text-left text-sm font-bold uppercase tracking-wider text-zinc-800 hover:text-rose-600 transition-colors flex items-center justify-between group"
              >
                <span>Nuestra Historia ✨</span>
                <ChevronRight className="size-4 text-zinc-450 group-hover:translate-x-0.5 transition-transform" />
              </a>
            </nav>
          </div>

          {/* Footer Section of Menu */}
          <div className="pt-4 border-t border-rose-100 space-y-4">
            {/* User Account / Profile */}
            {user ? (
              <div className="rounded-2xl border border-rose-100 bg-rose-50/30 p-3.5">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-rose-500 to-rose-600 text-white flex items-center justify-center font-black text-xs shadow-xs shrink-0">
                    {user.email ? user.email.slice(0, 2).toUpperCase() : "US"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-extrabold text-zinc-800 text-[10px] uppercase tracking-wider flex items-center gap-1">
                      {isAdmin ? <ShieldCheck className="size-3.5 text-amber-500" /> : <UserCheck className="size-3.5 text-rose-500" />}
                      {isAdmin ? "Panel Administradora" : "Mi Perfil Cliente"}
                    </p>
                    <p className="text-zinc-500 text-[9px] truncate">{user.email}</p>
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => {
                      setFullScreenMenuOpen(false);
                      if (isAdmin) setAdminModalOpen(true);
                      else setCustomerModalOpen(true);
                    }}
                    className="flex-1 h-9 rounded-xl text-[10px] font-black uppercase tracking-wider bg-zinc-950 text-white hover:bg-zinc-900 transition-colors cursor-pointer flex items-center justify-center border border-zinc-800"
                  >
                    Abrir Panel
                  </button>
                  <button
                    onClick={() => {
                      setFullScreenMenuOpen(false);
                      signOut();
                    }}
                    className="flex-1 h-9 rounded-xl text-[10px] font-black uppercase tracking-wider border border-rose-200 text-rose-650 bg-white hover:bg-rose-50/40 transition-colors cursor-pointer flex items-center justify-center"
                  >
                    Salir
                  </button>
                </div>
              </div>
            ) : (
              <Button
                variant="outline"
                className="w-full flex items-center justify-center gap-2 rounded-2xl border-rose-200 bg-white text-zinc-800 hover:bg-rose-50 text-xs font-extrabold py-3 shadow-xs cursor-pointer"
                onClick={() => {
                  setFullScreenMenuOpen(false);
                  setAuthDialogOpen(true);
                }}
              >
                <User className="size-4 text-rose-500" /> Acceder o Crear Cuenta VIP
              </Button>
            )}

            {/* Instagram box widget */}
            <a
              href="https://instagram.com/shopisafer"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 rounded-2xl border border-rose-100/80 bg-white hover:bg-rose-50/20 transition-colors group"
            >
              <div className="size-9 rounded-xl bg-rose-50 flex items-center justify-center text-rose-500 shrink-0 group-hover:scale-105 transition-transform">
                <Instagram className="size-5" />
              </div>
              <div className="text-left min-w-0">
                <p className="text-[10px] font-mono uppercase tracking-widest text-zinc-450">Instagram Oficial</p>
                <p className="text-xs font-extrabold text-zinc-855 group-hover:text-rose-600 transition-colors">@shopisafer</p>
              </div>
              <ChevronRight className="size-4 text-zinc-450 ml-auto group-hover:translate-x-0.5 transition-transform" />
            </a>

            {/* Language Selector (At the very bottom as requested) */}
            <div className="flex items-center justify-between pt-2">
              <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">Idioma / Language</span>
              <LanguageSelector />
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Dialogs */}
      <AuthDialog
        open={authDialogOpen}
        onOpenChange={setAuthDialogOpen}
        onGoogleSignIn={signInWithGoogle}
        onAdminLogin={signInWithPassword}
        onSuccessAdmin={() => setAdminModalOpen(true)}
      />
      <CustomerAccountModal
        user={user}
        open={customerModalOpen}
        onOpenChange={setCustomerModalOpen}
        onSignOut={signOut}
      />
      <AdminDashboardModal
        open={adminModalOpen}
        onOpenChange={setAdminModalOpen}
        onProductsUpdated={loadProductsFromInsForge}
      />

      {/* Dialog de Búsqueda Minimalista */}
      <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
        <DialogContent className="w-[92vw] max-w-lg bg-white border border-rose-100 p-6 rounded-3xl text-left shadow-2xl [&>button]:bg-transparent [&>button]:text-zinc-400 [&>button]:hover:text-rose-500 [&>button]:right-5 [&>button]:top-5 [&>button]:rounded-full [&>button]:p-2 [&>button]:hover:bg-rose-50/50 [&>button]:border-0 [&>button]:shadow-none">
          <DialogHeader>
            <DialogTitle className="text-xl font-serif font-black text-zinc-950">
              Buscar Prenda
            </DialogTitle>
            <DialogDescription className="text-xs text-zinc-500 font-mono uppercase tracking-widest mt-1">
              Colección Isafer Boutique
            </DialogDescription>
          </DialogHeader>

          <div className="relative mt-4">
            <Search className="absolute left-4 top-3.5 size-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Escribe el nombre de la prenda o categoría..."
              value={menuSearchQuery}
              onChange={(e) => setMenuSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setSearchOpen(false);
                  scrollToSection("coleccion");
                }
              }}
              className="w-full rounded-2xl border border-rose-100 bg-[#fffafb] py-3.5 pl-11 pr-4 text-xs font-semibold focus:border-rose-400 focus:outline-none"
              autoFocus
            />
          </div>

          {menuSearchQuery.trim() && (
            <div className="mt-4 max-h-[250px] overflow-y-auto space-y-2 pr-1">
              <p className="text-[10px] text-zinc-400 uppercase tracking-widest font-mono">Resultados sugeridos:</p>
              {productsList
                .filter((p) => p.name.toLowerCase().includes(menuSearchQuery.toLowerCase()) || p.category.toLowerCase().includes(menuSearchQuery.toLowerCase()))
                .slice(0, 5)
                .map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center gap-3 p-2 rounded-xl border border-rose-100/50 hover:bg-rose-50/20 cursor-pointer transition-colors"
                    onClick={() => {
                      setSearchOpen(false);
                      setActiveCategory("Todos");
                      setTimeout(() => {
                        scrollToSection("coleccion");
                      }, 100);
                    }}
                  >
                    <div className="w-10 h-12 rounded-lg overflow-hidden bg-zinc-50 shrink-0">
                      <ProductCrop product={p} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-bold text-zinc-800 truncate">{p.name}</h4>
                      <p className="text-[10px] text-zinc-400 mt-0.5">{p.category}</p>
                    </div>
                    <p className="font-mono text-xs font-black text-rose-600">${p.price.toFixed(2)}</p>
                  </div>
                ))}
              {productsList.filter((p) => p.name.toLowerCase().includes(menuSearchQuery.toLowerCase()) || p.category.toLowerCase().includes(menuSearchQuery.toLowerCase())).length === 0 && (
                <p className="text-xs text-zinc-500 text-center py-4">No se encontraron prendas con "{menuSearchQuery}"</p>
              )}
            </div>
          )}

          <div className="flex justify-end gap-2.5 mt-5">
            <Button
              className="w-full rounded-2xl h-11 text-xs font-extrabold uppercase tracking-widest bg-zinc-950 text-white hover:bg-zinc-800 shadow-md cursor-pointer"
              onClick={() => {
                setSearchOpen(false);
                scrollToSection("coleccion");
              }}
            >
              Ver todos los resultados
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Drawer de Favoritos Reubicado */}
      <Sheet open={favoritesDrawerOpen} onOpenChange={setFavoritesDrawerOpen}>
        <SheetContent className="flex w-[92%] flex-col border-rose-100 bg-[#fffcfd] p-6 text-zinc-800 sm:max-w-md [&>button]:bg-transparent [&>button]:text-zinc-400 [&>button]:hover:text-rose-500 [&>button]:right-5 [&>button]:top-5 [&>button]:rounded-full [&>button]:p-2 [&>button]:hover:bg-rose-50/50 [&>button]:border-0 [&>button]:shadow-none [&>button>svg]:size-5 [&>button]:transition-all [&>button]:duration-300">
          <SheetHeader className="text-left border-b border-rose-100 pb-4">
            <SheetTitle className="font-serif text-2xl font-black text-zinc-900 flex items-center justify-between">
              <span>Mis Favoritos 💖</span>
            </SheetTitle>
            <SheetDescription className="text-xs text-zinc-500 uppercase tracking-widest font-mono">
              Tus prendas preferidas en Isafer Boutique
            </SheetDescription>
          </SheetHeader>

          {Object.keys(favorites).length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-rose-50 flex items-center justify-center text-rose-300">
                <Heart className="w-8 h-8 stroke-[1.2]" />
              </div>
              <div>
                <p className="text-sm font-extrabold text-zinc-800">Tu lista está vacía</p>
                <p className="text-xs text-zinc-500 mt-1 max-w-[220px] mx-auto">
                  Haz clic en el corazón de cualquier prenda para guardarla aquí.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto no-scrollbar py-4 space-y-4">
              {productsList
                .filter((p) => favorites[p.id])
                .map((p) => (
                  <div key={p.id} className="flex gap-4 p-3 rounded-2xl border border-rose-100/50 bg-white/50 shadow-xs relative group">
                    <div className="w-20 h-24 rounded-xl overflow-hidden bg-zinc-50 shrink-0">
                      <ProductCrop product={p} />
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                      <div>
                        <h4 className="font-extrabold text-xs text-zinc-800 truncate">{p.name}</h4>
                        <p className="text-[10px] text-zinc-400 mt-0.5">{p.category}</p>
                        <p className="font-mono text-xs font-black text-rose-600 mt-1.5">${p.price.toFixed(2)} USD</p>
                      </div>
                      
                      <Button
                        size="sm"
                        className="w-full mt-2 h-8 rounded-xl text-[10px] font-bold uppercase tracking-wider bg-rose-500 hover:bg-rose-600 text-white shadow-xs cursor-pointer"
                        onClick={() => {
                          addProduct(p.id);
                          setFavoritesDrawerOpen(false);
                        }}
                      >
                        <ShoppingBag className="w-3.5 h-3.5 mr-1" /> Añadir a bolsa
                      </Button>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-2 h-7 w-7 p-0 rounded-full text-zinc-400 hover:text-rose-650 hover:bg-rose-50 cursor-pointer"
                      onClick={() => toggleFavorite(p.id)}
                      aria-label="Quitar de favoritos"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                ))}
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Modal de Favoritos Pull&Bear Style */}
      <Dialog open={favDialogOpen} onOpenChange={setFavDialogOpen}>
        <DialogContent className="w-[92vw] max-w-md bg-white border border-rose-100 p-6 rounded-3xl text-center shadow-2xl [&>button]:bg-transparent [&>button]:text-zinc-400 [&>button]:hover:text-rose-500 [&>button]:right-4 [&>button]:top-4 [&>button]:rounded-full [&>button]:p-2 [&>button]:hover:bg-rose-50/50 [&>button]:border-0 [&>button]:shadow-none">
          <DialogHeader className="space-y-3">
            <div className="mx-auto w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center text-rose-500 animate-bounce">
              <Heart className="w-6 h-6 fill-rose-500 text-rose-500" />
            </div>
            <DialogTitle className="text-lg font-serif font-black text-zinc-900 tracking-tight">
              {t("fav_modal_title")}
            </DialogTitle>
            <DialogDescription className="text-xs text-zinc-500 leading-relaxed px-2">
              {t("fav_modal_desc")}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-2.5 mt-5">
            <Button
              className="w-full rounded-2xl h-11 text-xs font-extrabold uppercase tracking-widest bg-zinc-950 text-white hover:bg-zinc-800 shadow-md cursor-pointer"
              onClick={() => {
                setFavDialogOpen(false);
                setAuthDialogOpen(true);
              }}
            >
              {t("fav_modal_login_btn")}
            </Button>
            <Button
              variant="outline"
              className="w-full rounded-2xl h-11 text-xs font-bold uppercase tracking-widest border-rose-100 text-zinc-500 hover:bg-rose-50/50 cursor-pointer"
              onClick={() => setFavDialogOpen(false)}
            >
              {t("fav_modal_guest_btn")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog para Políticas Legales (Privacidad, Términos, Cookies) */}
      <Dialog open={legalType !== null} onOpenChange={(open) => !open && setLegalType(null)}>
        <DialogContent className="w-[92vw] max-w-2xl bg-white border border-rose-100 p-6 rounded-3xl text-left shadow-2xl [&>button]:bg-transparent [&>button]:text-zinc-400 [&>button]:hover:text-rose-500 [&>button]:right-5 [&>button]:top-5 [&>button]:rounded-full [&>button]:p-2 [&>button]:hover:bg-rose-50/50 [&>button]:border-0 [&>button]:shadow-none">
          <DialogHeader>
            <DialogTitle className="text-2xl font-serif font-black text-zinc-950 flex items-center gap-2">
              {legalType === "privacy" && (
                <>
                  <ShieldCheck className="size-6 text-rose-500 animate-pulse" />
                  {t("footer_privacy")}
                </>
              )}
              {legalType === "terms" && (
                <>
                  <FileText className="size-6 text-rose-500 animate-pulse" />
                  {t("footer_terms")}
                </>
              )}
              {legalType === "cookies" && (
                <>
                  <Cookie className="size-6 text-rose-500 animate-pulse" />
                  {t("footer_cookies")}
                </>
              )}
            </DialogTitle>
            <DialogDescription className="text-xs text-zinc-400 font-mono uppercase tracking-widest mt-1">
              Isafer Boutique · Legal Information
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 max-h-[50vh] overflow-y-auto pr-2 space-y-4 text-sm text-zinc-600 leading-relaxed font-sans scrollbar-thin scrollbar-thumb-zinc-200">
            {legalType === "privacy" && (
              <>
                <p className="font-semibold text-zinc-800 text-sm border-l-2 border-rose-400 pl-3 py-1 bg-rose-50/20 rounded-r-lg">{t("legal_privacy_intro")}</p>
                <div className="space-y-4 mt-2">
                  <div className="space-y-1">
                    <h5 className="font-extrabold text-zinc-900 text-xs uppercase tracking-wider">{t("legal_privacy_sec1_title")}</h5>
                    <p className="text-xs text-zinc-600 leading-relaxed">{t("legal_privacy_sec1_text")}</p>
                  </div>
                  <div className="space-y-1">
                    <h5 className="font-extrabold text-zinc-900 text-xs uppercase tracking-wider">{t("legal_privacy_sec2_title")}</h5>
                    <p className="text-xs text-zinc-600 leading-relaxed">{t("legal_privacy_sec2_text")}</p>
                  </div>
                  <div className="space-y-1">
                    <h5 className="font-extrabold text-zinc-900 text-xs uppercase tracking-wider">{t("legal_privacy_sec3_title")}</h5>
                    <p className="text-xs text-zinc-600 leading-relaxed">{t("legal_privacy_sec3_text")}</p>
                  </div>
                </div>
              </>
            )}

            {legalType === "terms" && (
              <>
                <p className="font-semibold text-zinc-800 text-sm border-l-2 border-rose-400 pl-3 py-1 bg-rose-50/20 rounded-r-lg">{t("legal_terms_intro")}</p>
                <div className="space-y-4 mt-2">
                  <div className="space-y-1">
                    <h5 className="font-extrabold text-zinc-900 text-xs uppercase tracking-wider">{t("legal_terms_sec1_title")}</h5>
                    <p className="text-xs text-zinc-600 leading-relaxed">{t("legal_terms_sec1_text")}</p>
                  </div>
                  <div className="space-y-1">
                    <h5 className="font-extrabold text-zinc-900 text-xs uppercase tracking-wider">{t("legal_terms_sec2_title")}</h5>
                    <p className="text-xs text-zinc-600 leading-relaxed">{t("legal_terms_sec2_text")}</p>
                  </div>
                  <div className="space-y-1">
                    <h5 className="font-extrabold text-zinc-900 text-xs uppercase tracking-wider">{t("legal_terms_sec3_title")}</h5>
                    <p className="text-xs text-zinc-600 leading-relaxed">{t("legal_terms_sec3_text")}</p>
                  </div>
                </div>
              </>
            )}

            {legalType === "cookies" && (
              <>
                <p className="font-semibold text-zinc-800 text-sm border-l-2 border-rose-400 pl-3 py-1 bg-rose-50/20 rounded-r-lg">{t("legal_cookies_intro")}</p>
                <div className="space-y-4 mt-2">
                  <div className="space-y-1">
                    <h5 className="font-extrabold text-zinc-900 text-xs uppercase tracking-wider">{t("legal_cookies_sec1_title")}</h5>
                    <p className="text-xs text-zinc-600 leading-relaxed">{t("legal_cookies_sec1_text")}</p>
                  </div>
                  <div className="space-y-1">
                    <h5 className="font-extrabold text-zinc-900 text-xs uppercase tracking-wider">{t("legal_cookies_sec2_title")}</h5>
                    <p className="text-xs text-zinc-600 leading-relaxed">{t("legal_cookies_sec2_text")}</p>
                  </div>
                  <div className="space-y-1">
                    <h5 className="font-extrabold text-zinc-900 text-xs uppercase tracking-wider">{t("legal_cookies_sec3_title")}</h5>
                    <p className="text-xs text-zinc-600 leading-relaxed">{t("legal_cookies_sec3_text")}</p>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="mt-6 flex justify-end">
            <Button 
              className="bg-zinc-950 hover:bg-zinc-800 text-white rounded-xl text-xs font-extrabold uppercase tracking-widest px-6 h-11 cursor-pointer"
              onClick={() => setLegalType(null)}
            >
              {t("legal_close_btn")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Banner de Cookies Estilo Pull&Bear */}
      {showCookiesBanner && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-rose-100 p-5 sm:p-6 shadow-[0_-8px_30px_rgba(0,0,0,0.06)] animate-in slide-in-from-bottom duration-500">
          <div className="mx-auto max-w-7xl flex flex-col md:flex-row items-center justify-between gap-5 text-left">
            <div className="flex-1 space-y-2">
              <p className="text-[11px] sm:text-xs text-zinc-600 leading-relaxed font-medium">
                {t("cookies_text")}{" "}
                <button 
                  onClick={() => setLegalType("cookies")} 
                  className="underline font-bold text-zinc-900 hover:text-rose-600 transition-colors bg-transparent border-0 p-0 cursor-pointer text-[11px] sm:text-xs font-semibold inline"
                >
                  {t("cookies_policy_link")}
                </button>.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0">
              <Button
                variant="outline"
                className="w-full sm:w-auto px-6 h-11 rounded-xl text-xs font-bold uppercase tracking-widest border-zinc-300 text-zinc-700 hover:bg-rose-50/30 cursor-pointer"
                onClick={() => handleCookiesConsent("rejected")}
              >
                {t("cookies_settings_btn")}
              </Button>
              <Button
                className="w-full sm:w-auto px-6 h-11 rounded-xl text-xs font-extrabold uppercase tracking-widest bg-zinc-950 text-white hover:bg-zinc-800 cursor-pointer"
                onClick={() => handleCookiesConsent("rejected")}
              >
                {t("cookies_reject_btn")}
              </Button>
              <Button
                className="w-full sm:w-auto px-6 h-11 rounded-xl text-xs font-extrabold uppercase tracking-widest bg-zinc-950 text-white hover:bg-zinc-800 cursor-pointer"
                onClick={() => handleCookiesConsent("accepted")}
              >
                {t("cookies_accept_btn")}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Banner de Geolocalización / Idioma Estilo Pull&Bear */}
      {showGeoBanner && (
        <div className="fixed bottom-6 left-6 z-45 bg-white border border-rose-100 p-5 rounded-3xl shadow-2xl max-w-[90vw] sm:max-w-sm animate-in fade-in slide-in-from-bottom duration-300">
          <div className="space-y-4 text-left">
            <div className="flex items-center justify-between gap-3 border-b border-rose-50 pb-2">
              <span className="text-xs font-extrabold text-zinc-800 tracking-tight">
                {targetLang === "es" ? t("geo_title_es") : t("geo_title_en")}
              </span>
              <button
                onClick={() => {
                  setLanguage(targetLang);
                  localStorage.setItem("isafer_geo_consent", "saved");
                  setShowGeoBanner(false);
                  toast.success(targetLang === "es" ? "Idioma cambiado a Español 🇪🇸" : "Language changed to English 🇺🇸");
                }}
                className="text-[10px] font-bold text-zinc-400 underline hover:text-rose-600 transition-colors cursor-pointer"
              >
                {targetLang === "es" ? t("geo_change_loc_es") : t("geo_change_loc_en")}
              </button>
            </div>
            
            <p className="text-[11px] text-zinc-500 font-medium">
              {targetLang === "es" ? t("geo_desc_es") : t("geo_desc_en")}
            </p>

            <div className="flex gap-2.5 pt-1">
              <Button
                variant="outline"
                className="flex-1 rounded-2xl h-10 text-xs font-bold uppercase tracking-widest border-rose-100 text-zinc-500 hover:bg-rose-50/50 cursor-pointer"
                onClick={() => {
                  localStorage.setItem("isafer_geo_consent", "dismissed");
                  setShowGeoBanner(false);
                }}
              >
                {t("geo_no")}
              </Button>
              <Button
                className="flex-1 rounded-2xl h-10 text-xs font-extrabold uppercase tracking-widest bg-zinc-950 text-white hover:bg-zinc-800 shadow-md cursor-pointer"
                onClick={() => {
                  setLanguage(targetLang);
                  localStorage.setItem("isafer_geo_consent", "saved");
                  setShowGeoBanner(false);
                  toast.success(targetLang === "es" ? "Idioma y ubicación guardados 🌍" : "Location and language saved 🌍");
                }}
              >
                {targetLang === "es" ? t("geo_yes_es") : t("geo_yes_en")}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
