import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  Instagram,
  Phone,
  MapPin,
  Menu,
  MessageCircle,
  Minus,
  Plus,
  ShoppingBag,

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
  Gem,
  Crown,
  Layers,
  Sliders,
  Shield,
  FileText,
  Cookie,
  Sparkles,
} from "lucide-react";
import { useMemo, useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { TikTokIcon, WhatsAppIcon } from "@/components/SocialIcons";

import heroImage from "@/assets/rosse-hero.jpg";
import camilaOwnerHero from "@/assets/camila-owner-hero.jpg";
import productsImage from "@/assets/rosse-products.jpg";
import sobreNosotrosImg from "@/assets/sobrenostros.jpg";
import { createOrder, fetchProducts, BackendProduct, updateOrderStripeSession, sendOrderConfirmationEmail, fetchCartById, saveCart, deleteCart, subscribeToNewsletter } from "@/services/insforgeService";
import { fetchUserFavorites, addFavorite, removeFavorite, syncGuestFavorites } from "@/services/favoritesService";
import { useAuth } from "@/hooks/useAuth";
import { AuthDialog } from "@/components/AuthDialog";
import { CustomerAccountModal } from "@/components/CustomerAccountModal";
import { AdminDashboardModal } from "@/components/AdminDashboardModal";
import { AboutUsModal } from "@/components/AboutUsModal";
import { AboutPage } from "@/components/AboutPage";
import { ProductDetailModal, ProductItem } from "@/components/ProductDetailModal";
import { QuickAddOverlay } from "@/components/QuickAddOverlay";
import { CheckoutShippingModal, ShippingDetails } from "@/components/CheckoutShippingModal";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { CtaButton } from "@/components/CtaButton";
import { IsaferLogo } from "@/components/IsaferLogo";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n";
import { OWNER_PHONE } from "@/lib/constants";
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
  loader: async () => {
    const backendProds = await fetchProducts().catch(() => [] as BackendProduct[]);
    const mapped: ProductItem[] = backendProds.map((bp, idx) => {
      let category = bp.category || "Tops & Sets";
      if (!bp.category) {
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
        sizes: bp.sizes && bp.sizes.length > 0 ? bp.sizes : undefined,
      };
    });
    return { initialProducts: mapped };
  },
  component: Index,
});

function AnimatedOfferBanner() {
  const [index, setIndex] = useState(0);
  const OFFERS = [
    "✦ ENVÍO EXPRESS GRATIS EN PEDIDOS SUPERIORES A $99 (TODO EE. UU.) ✦",
    "✦ 10% DE DESCUENTO EN TU PRIMERA COMPRA CON CÓDIGO ISAFER10 ✦",
    "✦ NUEVA COLECCIÓN ISAFER LUXE DISPONIBLE ✦",
    "✦ VISÍTANOS EN NUESTRO SHOWROOM EN BROOKLYN, NY ✦",
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % OFFERS.length);
    }, 3500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-rose-600 text-white w-full h-10 flex items-center justify-center overflow-hidden relative border-y border-rose-500/50 shadow-inner">
      {OFFERS.map((offer, i) => (
        <span
          key={i}
          className={`absolute text-[10px] sm:text-[11px] font-black tracking-[0.15em] sm:tracking-[0.25em] uppercase text-center w-full px-2 transition-all duration-700 ease-in-out ${
            i === index ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          {offer}
        </span>
      ))}
    </div>
  );
}

function AnimatedOwnerImage() {
  const [isVisible, setIsVisible] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.2 }
    );
    if (imgRef.current) observer.observe(imgRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={imgRef}
      className={`relative w-48 h-48 sm:w-72 sm:h-72 lg:w-96 lg:h-96 shrink-0 transition-all duration-1000 ease-out transform ${
        isVisible ? "opacity-100 translate-x-0 scale-100" : "opacity-0 translate-x-12 scale-95"
      }`}
    >
      {/* Glow Backdrop */}
      <div className="absolute inset-0 bg-white/40 rounded-[2.5rem] sm:rounded-[3rem] animate-pulse filter blur-xl" />
      
      {/* Image Frame */}
      <div className="relative w-full h-full p-2 bg-white/80 backdrop-blur-md rounded-[2.5rem] sm:rounded-[3rem] shadow-2xl shadow-rose-950/20 group hover:-translate-y-2 transition-all duration-500">
        <div className="w-full h-full overflow-hidden rounded-[2rem] sm:rounded-[2.5rem] border border-pink-100 relative">
          <img
            src={sobreNosotrosImg}
            alt="Camila, dueña de Isafer Boutique"
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
          />
        </div>
        
        {/* Floating Tag */}
        <div className="absolute -bottom-4 -left-4 sm:-bottom-6 sm:-left-6 bg-white px-5 py-3 rounded-full shadow-xl border border-pink-100 z-20 flex items-center gap-2 transform -rotate-6 group-hover:rotate-0 transition-all duration-300">
          <span className="font-display text-rose-950 font-black text-sm sm:text-lg">Camila ✨</span>
        </div>
      </div>
    </div>
  );
}



export interface CartLineItem {
  cartItemId: string;
  productId: string | number;
  quantity: number;
  size: string;
}

type Cart = Record<string, CartLineItem>;

function getOptimizedImageUrl(url?: string): string {
  if (!url) return productsImage;
  if (url.includes("images.unsplash.com")) {
    try {
      const urlObj = new URL(url);
      urlObj.searchParams.set("fm", "webp");
      if (!urlObj.searchParams.has("w")) urlObj.searchParams.set("w", "800");
      if (!urlObj.searchParams.has("q")) urlObj.searchParams.set("q", "80");
      return urlObj.toString();
    } catch (e) {
      return url;
    }
  }
  return url;
}

function ProductCrop({ id, alt, product }: { id?: string | number; alt?: string; product?: ProductItem }) {
  const p = product;
  const [imgSrc, setImgSrc] = useState<string>(() => {
    if (p?.image) return getOptimizedImageUrl(p.image);
    return getOptimizedImageUrl(productsImage);
  });

  useEffect(() => {
    if (p?.image) setImgSrc(getOptimizedImageUrl(p.image));
    else setImgSrc(getOptimizedImageUrl(productsImage));
  }, [p?.image]);

  if (!p) return null;

  const isSprite = !p.image;
  const fallbackUnsplash = "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80";

  return (
    <img
      src={imgSrc}
      alt={alt || p.name || "Prenda Isafer Boutique"}
      loading="lazy"
      onError={() => {
        setImgSrc(fallbackUnsplash);
      }}
      className={`absolute top-0 h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 ${
        isSprite ? `w-[400%] max-w-none ${p.position || "left-0"}` : "left-0 w-full"
      }`}
    />
  );
}

function Index() {
  const navigate = useNavigate();
  const { t, language, setLanguage } = useTranslation();
  const { initialProducts } = Route.useLoaderData();
  const [productsList, setProductsList] = useState<ProductItem[]>(initialProducts);
  const [cart, setCart] = useState<Cart>({});
  const [selectedProductForModal, setSelectedProductForModal] = useState<ProductItem | null>(null);
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [quickAddOpenId, setQuickAddOpenId] = useState<string | number | null>(null);
  const [isCartInitialized, setIsCartInitialized] = useState(false);
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
  const [geoCountry, setGeoCountry] = useState("EE. UU.");
  const [targetLang, setTargetLang] = useState<"es" | "en">("es");
  const [isCatalogExpanded, setIsCatalogExpanded] = useState(false);
  const [fullScreenMenuOpen, setFullScreenMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuSearchQuery, setMenuSearchQuery] = useState("");
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [legalType, setLegalType] = useState<"privacy" | "terms" | "cookies" | null>(null);
  const [aboutUsModalOpen, setAboutUsModalOpen] = useState(false);
  const [currentView, setCurrentView] = useState<"shop" | "about">("shop");
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [shippingModalOpen, setShippingModalOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [scrolledPastHero, setScrolledPastHero] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setIsScrolled(scrollY > 20);
      setScrolledPastHero(scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Carrusel dinámico de Hero
  const heroImages = useMemo(() => [
    camilaOwnerHero,
    heroImage,
    "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1600",
    "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=1600"
  ], []);
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);

  useEffect(() => {
    // 16 segundos para la foto oficial de Camila (index 0), 6 segundos para las demás
    const duration = currentHeroIndex === 0 ? 16000 : 6000;
    const timer = setTimeout(() => {
      setCurrentHeroIndex((prev) => (prev + 1) % heroImages.length);
    }, duration);
    return () => clearTimeout(timer);
  }, [currentHeroIndex, heroImages.length]);

  const { user, loading, isAdmin, isCustomer, signInWithGoogle, signInWithPassword, signOut } = useAuth();


  // Comprobar si hay un carrito para recuperar en la URL (?recover_cart=UUID) o en localStorage
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const recoverCartId = params.get("recover_cart");

    if (recoverCartId) {
      toast.loading("Recuperando tu bolsa de compras...");
      fetchCartById(recoverCartId)
        .then((dbCart) => {
          toast.dismiss();
          if (dbCart && Array.isArray(dbCart.items) && dbCart.items.length > 0) {
            const restoredCart: Cart = {};
            dbCart.items.forEach((item: any) => {
              if (item.id !== undefined && item.quantity !== undefined) {
                const size = item.size || "S";
                const cartKey = `${item.id}::${size}`;
                restoredCart[cartKey] = {
                  cartItemId: cartKey,
                  productId: item.id,
                  quantity: item.quantity,
                  size: size,
                };
              }
            });

            setCart(restoredCart);
            localStorage.setItem("isafer_cart_id", dbCart.id);
            setCartOpen(true);
            toast.success("¡Hemos recuperado tu bolsa de compras con éxito! 🛍️💖", { duration: 6000 });
          } else {
            toast.error("El enlace de recuperación ha expirado o el carrito ya no está disponible.");
          }
        })
        .catch((err) => {
          toast.dismiss();
          console.error("Error al recuperar el carrito abandonado:", err);
        })
        .finally(() => {
          setIsCartInitialized(true);
          window.history.replaceState({}, document.title, window.location.pathname);
        });
    } else {
      const localCartId = localStorage.getItem("isafer_cart_id");
      if (localCartId) {
        fetchCartById(localCartId)
          .then((dbCart) => {
            if (dbCart && Array.isArray(dbCart.items) && dbCart.items.length > 0) {
              const restoredCart: Cart = {};
              dbCart.items.forEach((item: any) => {
                if (item.id !== undefined && item.quantity !== undefined) {
                  const size = item.size || "S";
                  const cartKey = `${item.id}::${size}`;
                  restoredCart[cartKey] = {
                    cartItemId: cartKey,
                    productId: item.id,
                    quantity: item.quantity,
                    size: size,
                  };
                }
              });
              setCart(restoredCart);
            }
          })
          .catch((err) => console.warn("No se pudo sincronizar el carrito al inicio:", err))
          .finally(() => {
            setIsCartInitialized(true);
          });
      } else {
        setIsCartInitialized(true);
      }
    }
  }, []);

  // Sincronizar cambios del carrito local con PostgreSQL en InsForge
  useEffect(() => {
    if (!isCartInitialized) return;

    const cartItemsArray = Object.values(cart);
    const hasItems = cartItemsArray.length > 0;
    const localCartId = localStorage.getItem("isafer_cart_id");

    if (!hasItems) {
      if (localCartId) {
        deleteCart(localCartId)
          .then(() => localStorage.removeItem("isafer_cart_id"))
          .catch((err) => console.warn("Error al borrar el carrito vacío en el backend:", err));
      }
      return;
    }

    const itemsMapped = cartItemsArray.map((item) => ({
      id: item.productId,
      quantity: item.quantity,
      size: item.size,
    }));

    const customerEmail = user?.email || null;
    const cartId = localCartId || crypto.randomUUID();

    if (!localCartId) {
      localStorage.setItem("isafer_cart_id", cartId);
    }

    saveCart({
      id: cartId,
      customer_email: customerEmail,
      items: itemsMapped,
    }).catch((err) => console.error("Error al sincronizar el carrito en InsForge:", err));
  }, [cart, user, isCartInitialized]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const payment = params.get("payment");

    if (payment === "success") {
      setCart({});
      const localCartId = localStorage.getItem("isafer_cart_id");
      if (localCartId) {
        deleteCart(localCartId)
          .then(() => localStorage.removeItem("isafer_cart_id"))
          .catch((err) => console.error("Error al borrar carrito tras pago exitoso:", err));
      }
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

      // Caso 1: Web en Inglés, pero navegador prefiere Español
      if (language === "en" && prefersSpanish) {
        setGeoCountry("EE. UU.");
        setTargetLang("es");
        const timer = setTimeout(() => {
          setShowGeoBanner(true);
        }, 3500); // Aparece 2.3s después del de cookies para no pisarse
        return () => clearTimeout(timer);
      }

      // Caso 2: Web en Español, pero navegador prefiere Inglés
      if (language === "es" && !prefersSpanish) {
        setGeoCountry("EE. UU.");
        setTargetLang("en");
        const timer = setTimeout(() => {
          setShowGeoBanner(true);
        }, 3500);
        return () => clearTimeout(timer);
      }
    }
  }, [language]);

  const itemCount = useMemo(
    () => Object.values(cart).reduce((sum, item) => sum + item.quantity, 0),
    [cart]
  );

  const favCount = useMemo(
    () => Object.keys(favorites).length,
    [favorites]
  );

  const subtotal = useMemo(
    () =>
      Object.values(cart).reduce((sum, item) => {
        const product = productsList.find((p) => String(p.id) === String(item.productId));
        return sum + (product ? product.price * item.quantity : 0);
      }, 0),
    [cart, productsList]
  );

  const [couponCodeInput, setCouponCodeInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [discountPercent, setDiscountPercent] = useState<number>(0);

  const handleApplyCoupon = (codeToApply?: string) => {
    const code = (codeToApply || couponCodeInput).trim().toUpperCase();
    if (!code) {
      toast.error("Por favor introduce un código de cupón.");
      return;
    }

    if (code === "VIP10" || code === "BARBIELUXE10" || code === "ISAFER10" || code === "VIP") {
      setAppliedCoupon(code);
      setDiscountPercent(10);
      toast.success(`¡Cupón ${code} del 10% OFF aplicado con éxito! 💖`);
      setCouponCodeInput("");
    } else {
      toast.error("Código de cupón no válido o expirado.");
    }
  };

  const finalTotal = useMemo(
    () => subtotal * (1 - discountPercent / 100),
    [subtotal, discountPercent]
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

  const openProductModal = (idOrProduct: string | number | ProductItem) => {
    if (typeof idOrProduct === "object" && idOrProduct !== null) {
      setSelectedProductForModal(idOrProduct);
      setProductModalOpen(true);
    } else {
      const p = productsList.find((item) => String(item.id) === String(idOrProduct));
      if (p) {
        setSelectedProductForModal(p);
        setProductModalOpen(true);
      }
    }
  };

  const handleAddToCartFromModal = (id: string | number, size: string, quantityToAdd: number = 1) => {
    const item = productsList.find((p) => String(p.id) === String(id));
    const cartKey = `${id}::${size}`;

    setCart((current) => {
      const existing = current[cartKey];
      const newQuantity = (existing?.quantity ?? 0) + quantityToAdd;
      return {
        ...current,
        [cartKey]: {
          cartItemId: cartKey,
          productId: id,
          quantity: newQuantity,
          size: size,
        },
      };
    });

    setProductModalOpen(false);
    setQuickAddOpenId(null);
    setCartOpen(true);
    if (item) {
      toast.success(`¡${item.name} (${size}) añadido a tu bolsa! ✨`, { duration: 3000 });
    }
  };

  const handleQuickAddSizeSelect = (productId: string | number, size: string) => {
    handleAddToCartFromModal(productId, size, 1);
    setQuickAddOpenId(null);
  };

  const addProduct = (id: string | number) => {
    if (window.innerWidth < 640) {
      setQuickAddOpenId((prev) => (prev === id ? null : id));
    } else {
      openProductModal(id);
    }
  };

  const updateProduct = (cartKey: string, change: number) =>
    setCart((current) => {
      const existing = current[cartKey];
      if (!existing) return current;
      const quantity = existing.quantity + change;
      const next = { ...current };
      if (quantity <= 0) delete next[cartKey];
      else next[cartKey] = { ...existing, quantity };
      return next;
    });

  const removeProduct = (cartKey: string) => {
    const existing = cart[cartKey];
    const item = existing ? productsList.find((p) => String(p.id) === String(existing.productId)) : null;
    setCart((current) => {
      const next = { ...current };
      delete next[cartKey];
      return next;
    });
    if (item) {
      toast.info(`${item.name} (${existing?.size || ''}) eliminado de la bolsa`);
    }
  };

  const scrollToSection = (id: string) => {
    const target = document.getElementById(id) || document.querySelector(`[data-section="${id}"]`);
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    } else if (id === "coleccion") {
      window.scrollTo({ top: 600, behavior: "smooth" });
    }
  };

  const handleCheckout = () => {
    const activeCartItems = Object.values(cart);

    if (activeCartItems.length === 0) {
      toast.error("Tu bolsa está vacía");
      return;
    }

    const itemsText = activeCartItems
      .map((item) => {
        const p = productsList.find((prod) => String(prod.id) === String(item.productId));
        if (!p) return null;
        return `- ${item.quantity}x ${p.name} (Talla: ${item.size}) ($${(p.price * item.quantity).toFixed(2)})`;
      })
      .filter(Boolean)
      .join("%0A");

    const subtotalFormatted = finalTotal.toFixed(2);
    const couponInfo = appliedCoupon ? `%0ACup%C3%B3n%20Aplicado%3A%20${appliedCoupon}%20(-10%25)` : "";
    const whatsappUrl = `https://wa.me/${OWNER_PHONE}?text=Hola%20Isafer%20Boutique%2C%20quisiera%20confirmar%20mi%20pedido%3A%0A%0A${itemsText}${couponInfo}%0A%0ATotal%20Final%3A%20%24${subtotalFormatted}%0A%0A%C2%BFMe%20confirmas%20disponibilidad%20y%20m%C3%A9todo%20de%20entrega%3F`;

    const win = window.open(whatsappUrl, "_blank");
    if (!win) {
      window.location.href = whatsappUrl;
    }

    setCartOpen(false);
    toast.success("¡Redirigiendo a WhatsApp!");

    const customerEmail = user?.email || "cliente@isaferboutique.com";
    const customerName = user?.email ? user.email.split("@")[0] : "Cliente Web (WhatsApp)";
    const itemsMapped = activeCartItems.map((item) => {
      const p = productsList.find((prod) => String(prod.id) === String(item.productId))!;
      return {
        product_id: String(p.id),
        name: `${p.name} (${item.size})`,
        price: p.price,
        quantity: item.quantity,
        size: item.size,
      };
    });

    // Eliminar el carrito guardado del backend y localmente tras checkout exitoso
    const localCartId = localStorage.getItem("isafer_cart_id");
    if (localCartId) {
      deleteCart(localCartId)
        .then(() => localStorage.removeItem("isafer_cart_id"))
        .catch((err) => console.error("Error al borrar el carrito tras checkout de WhatsApp:", err));
    }
    setCart({});

    createOrder({
      customer_name: customerName,
      customer_email: customerEmail,
      total_amount: finalTotal,
      items: itemsMapped,
    })
      .then((res) => {
        if (res.success && res.data?.id) {
          sendOrderConfirmationEmail({
            customerName,
            customerEmail,
            totalAmount: finalTotal,
            items: itemsMapped,
            orderId: res.data.id,
          });
        }
      })
      .catch((err) => console.error("No se pudo guardar el pedido en InsForge:", err));
  };

  const handleOpenShippingModal = () => {
    const activeCartItems = Object.values(cart);
    if (activeCartItems.length === 0) {
      toast.error("Tu bolsa está vacía");
      return;
    }
    setCartOpen(false);
    setShippingModalOpen(true);
  };

  const executeStripeCheckout = async (details: ShippingDetails) => {
    setIsCheckingOut(true);
    const activeCartItems = Object.values(cart);

    if (activeCartItems.length === 0) {
      toast.error("Tu bolsa está vacía");
      setIsCheckingOut(false);
      return;
    }

    const DEFAULT_STRIPE_PRICE_ID = import.meta.env.VITE_DEFAULT_STRIPE_PRICE_ID || "price_1Q_boutique_default";
    toast.loading("Registrando datos de envío y preparando Stripe...");

    try {
      const orderItemsMapped = activeCartItems.map((item) => {
        const p = productsList.find((prod) => String(prod.id) === String(item.productId))!;
        return {
          product_id: String(p.id),
          name: `${p.name} (${item.size})`,
          price: p.price,
          quantity: item.quantity,
          size: item.size,
        };
      });

      const fullShippingAddress = `${details.address}, ${details.city} ${details.postalCode} ${details.countryState}`.trim();

      // 1. Crear el pedido con todos los datos de envío en estado 'pending' en InsForge
      const orderRes = await createOrder({
        customer_name: details.fullName,
        customer_email: details.email,
        customer_phone: details.phone,
        shipping_address: fullShippingAddress + (details.notes ? ` (Notas: ${details.notes})` : ""),
        total_amount: finalTotal,
        items: orderItemsMapped,
        stripe_session_id: 'pending_session',
      });

      if (!orderRes.success || !orderRes.data?.id) {
        toast.dismiss();
        toast.error(`No se pudo registrar el pedido previo: ${orderRes.error || "Inténtalo de nuevo"}`);
        return;
      }

      const createdOrderId = orderRes.data.id;

      // 2. Crear la sesión de Stripe Checkout pasando el order_id y metadatos completos
      const lineItems = activeCartItems.map((item) => {
        const p = productsList.find((prod) => String(prod.id) === String(item.productId))!;
        return {
          priceId: (p.stripe_price_id && p.stripe_price_id.trim()) ? p.stripe_price_id.trim() : DEFAULT_STRIPE_PRICE_ID,
          quantity: item.quantity,
        };
      });

      const { data, error } = await insforge.payments.stripe.createCheckoutSession("test", {
        mode: "payment",
        lineItems,
        successUrl: `${window.location.origin}/?payment=success&session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${window.location.origin}/?payment=cancel`,
        customerEmail: details.email,
        metadata: {
          order_id: createdOrderId,
          customer_name: details.fullName,
          customer_phone: details.phone,
          shipping_address: fullShippingAddress,
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
        toast.success("¡Redirigiendo a Stripe para pago seguro!");
        window.location.assign(data.checkoutSession.url);
      } else {
        toast.dismiss();
        toast.error("No se recibió la URL de pago de Stripe");
      }
    } catch (err: any) {
      toast.dismiss();
      console.error("Excepción en Stripe checkout:", err);
      toast.error("Error de conexión al procesar el pago");
    } finally {
      setIsCheckingOut(false);
      setShippingModalOpen(false);
    }
  };

  const executeWhatsAppCheckout = async (details: ShippingDetails) => {
    const activeCartItems = Object.values(cart);
    if (activeCartItems.length === 0) {
      toast.error("Tu bolsa está vacía");
      return;
    }

    const fullShippingAddress = `${details.address}, ${details.city} ${details.postalCode} ${details.countryState}`.trim();
    const orderItemsMapped = activeCartItems.map((item) => {
      const p = productsList.find((prod) => String(prod.id) === String(item.productId))!;
      return {
        product_id: String(p.id),
        name: `${p.name} (${item.size})`,
        price: p.price,
        quantity: item.quantity,
        size: item.size,
      };
    });

    // Guardar pedido en PostgreSQL
    createOrder({
      customer_name: details.fullName,
      customer_email: details.email,
      customer_phone: details.phone,
      shipping_address: fullShippingAddress + (details.notes ? ` (Notas: ${details.notes})` : ""),
      total_amount: finalTotal,
      items: orderItemsMapped,
    }).catch((err) => console.error("Error al guardar pedido de WhatsApp:", err));

    const text = activeCartItems
      .map((item) => {
        const p = productsList.find((prod) => String(prod.id) === String(item.productId));
        if (!p) return null;
        return `- ${item.quantity}x ${p.name} (Talla: ${item.size}) ($${(p.price * item.quantity).toFixed(2)})`;
      })
      .filter(Boolean)
      .join('\n');

    const msg = `Hola Isafer Boutique 💖, quiero realizar el siguiente pedido:\n\n👤 *Cliente:* ${details.fullName}\n✉️ *Email:* ${details.email}\n📱 *Teléfono:* ${details.phone}\n📍 *Dirección de Envío:* ${fullShippingAddress}\n${details.notes ? `📝 *Notas:* ${details.notes}\n` : ''}\n🛍️ *Prendas:*\n${text}\n\n*Total:* $${finalTotal.toFixed(2)} USD`;

    window.open(`https://wa.me/${OWNER_PHONE}?text=${encodeURIComponent(msg)}`, '_blank');
    setShippingModalOpen(false);
    setCartOpen(false);
    toast.success("¡Pedido enviado por WhatsApp!");
  };

  const filteredProducts = useMemo(() => {
    if (activeCategory === "Todos") return productsList;
    return productsList.filter((p) => p.category === activeCategory);
  }, [activeCategory, productsList]);



  return (
    <div className="min-h-screen overflow-x-hidden bg-background text-foreground antialiased selection:bg-amber-500/20 selection:text-amber-900 dark:selection:text-amber-100">

      {/* 2. HEADER NAVBAR LUXE */}
      <header className={`sticky top-0 z-40 border-b text-zinc-800 backdrop-blur-2xl transition-all duration-300 ${
        isScrolled
          ? "bg-[#fff8fa]/75 dark:bg-zinc-950/75 border-rose-200/50 dark:border-rose-900/50 shadow-sm"
          : "bg-[#fff8fa]/95 dark:bg-zinc-950/95 border-rose-100/80 dark:border-rose-900/80 shadow-xs"
      }`}>
        <div className="relative mx-auto flex h-16 sm:h-22 max-w-7xl items-center justify-between px-4 sm:px-8">
          {/* Left Menu Trigger for Fullscreen Menu */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full text-zinc-800 hover:text-rose-600 hover:bg-rose-100/50 cursor-pointer transition-transform active:scale-95"
              onClick={() => setFullScreenMenuOpen(true)}
              aria-label="Abrir menú de navegación"
            >
              <Menu className="size-5 sm:size-6" />
            </Button>
          </div>

          {/* Center Brand Logo (Sin fondo blanco, más grande y elegante en móvil) */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 flex items-center justify-center">
            <a
              href="#inicio"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection("inicio");
              }}
              className="cursor-pointer py-1"
              aria-label="Isafer Boutique Inicio"
            >
              <IsaferLogo variant="header" size="md" className="scale-110 sm:scale-100 transition-transform" />
            </a>
          </div>

          {/* Right Action Icons: Search, Profile, Favorites & Cart */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Botón de Búsqueda */}
            <Button
              variant="ghost"
              size="icon"
              className="hidden sm:inline-flex rounded-full text-zinc-700 hover:text-rose-500 hover:bg-rose-100/30 transition-transform active:scale-95 cursor-pointer"
              onClick={() => setSearchOpen(true)}
              aria-label="Buscar productos"
            >
              <Search className="size-5" />
            </Button>

            {/* Botón de Cuenta / Perfil (Visible en escritorio; en móvil está integrado en el Menú Hamburguesa) */}
            <div className="hidden sm:inline-flex">
              {loading ? (
                <div className="size-9 sm:size-10 flex items-center justify-center">
                  <span className="size-4 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : user ? (
                isAdmin ? (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full text-zinc-700 hover:text-rose-500 hover:bg-rose-100/30 transition-transform active:scale-95 cursor-pointer"
                    onClick={() => navigate({ to: "/admin" })}
                    title="Panel de Administración"
                    aria-label="Panel de Administración"
                  >
                    <UserCheck className="size-5 text-rose-500" />
                  </Button>
                ) : (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full text-zinc-700 hover:text-rose-500 hover:bg-rose-100/30 transition-transform active:scale-95 cursor-pointer"
                    onClick={() => setCustomerModalOpen(true)}
                    title="Mi Cuenta"
                    aria-label="Mi Cuenta"
                  >
                    <UserCheck className="size-5 text-rose-500" />
                  </Button>
                )
              ) : (
                <Link
                  id="login-header-link"
                  data-testid="login-link"
                  to="/login"
                  className="inline-flex items-center justify-center rounded-full size-9 sm:size-10 text-zinc-700 hover:text-rose-500 hover:bg-rose-100/30 transition-transform active:scale-95 cursor-pointer"
                  title="Iniciar sesión / Mi Cuenta"
                  aria-label="Iniciar sesión"
                >
                  <User className="size-5" />
                </Link>
              )}
            </div>

            {/* Botón de Favoritos (Corazón al lado de la Cesta) */}
            <Button
              variant="ghost"
              size="icon"
              className="relative rounded-full size-9 sm:size-10 text-zinc-700 hover:text-rose-500 hover:bg-rose-100/40 transition-transform active:scale-95 cursor-pointer"
              onClick={() => setFavoritesDrawerOpen(true)}
              title="Mis Favoritos"
              aria-label="Ver productos favoritos"
            >
              <Heart className={`size-5 ${favCount > 0 ? "fill-rose-500 text-rose-500" : ""}`} />
              {favCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex size-4 sm:size-4.5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-black text-white shadow-xs">
                  {favCount}
                </span>
              )}
            </Button>

            {/* Cart Trigger */}
            <Sheet open={cartOpen} onOpenChange={setCartOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="default"
                  size="sm"
                  className="relative rounded-full px-3.5 sm:px-4 h-9 sm:h-10 bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs gap-1.5 sm:gap-2 shadow-md shadow-pink-500/20 transition-transform active:scale-95 border-0 cursor-pointer"
                  aria-label={`Carrito, ${itemCount} artículos`}
                >
                  <ShoppingBag className="size-4" />
                  <span className="hidden sm:inline">Bolsa</span>
                  {itemCount > 0 && (
                    <span className="ml-0.5 flex size-4.5 items-center justify-center rounded-full bg-white text-[10px] font-black text-pink-600 shadow-xs">
                      {itemCount}
                    </span>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent className="flex w-[92%] sm:max-w-md flex-col border-rose-100/50 bg-[#fffcfd] p-6 text-zinc-800 [&>button]:bg-transparent [&>button]:text-zinc-400 [&>button]:hover:text-rose-500 [&>button]:right-5 [&>button]:top-5 [&>button]:rounded-full [&>button]:p-2 [&>button]:hover:bg-rose-50/50 [&>button]:border-0 [&>button]:shadow-none [&>button>svg]:size-5 [&>button]:transition-all [&>button]:duration-300">
                <SheetHeader className="text-left border-b border-rose-100/40 pb-4">
                  <SheetTitle className="font-display text-2xl font-black text-zinc-900 flex items-center gap-2">
                    <span>Tu Bolsa</span>
                    <span className="text-sm font-mono font-bold text-rose-500">
                      ({itemCount})
                    </span>
                  </SheetTitle>
                  <SheetDescription className="text-zinc-500 text-xs">
                    {itemCount ? "Finaliza tu pedido en 1 clic de forma segura" : "Explora nuestra colección y añade tus prendas preferidas"}
                  </SheetDescription>
                </SheetHeader>

                <div className="mt-6 flex-1 space-y-4 overflow-y-auto pr-1">
                  {!user && itemCount > 0 && (
                    <div className="p-3.5 rounded-2xl bg-gradient-to-r from-rose-500/10 via-pink-500/10 to-amber-500/10 border border-rose-200/80 shadow-2xs flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-rose-600">
                          <Sparkles className="size-3" /> Beneficio VIP Isafer
                        </div>
                        <p className="text-xs font-bold text-zinc-900 mt-0.5 leading-tight">
                          Inicia sesión para <span className="text-rose-600 font-extrabold">10% OFF</span> y guardar tu bolsa
                        </p>
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        className="rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 text-white font-extrabold text-[10px] uppercase tracking-wider px-3 py-1.5 shrink-0 hover:scale-105 active:scale-95 transition-all shadow-xs cursor-pointer border border-rose-400/30"
                        onClick={() => {
                          setCartOpen(false);
                          navigate({ to: "/login" });
                        }}
                      >
                        Entrar
                      </Button>
                    </div>
                  )}

                  {itemCount === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center text-zinc-500 py-12">
                      <ShoppingBag className="size-16 mb-4 text-rose-300 stroke-[1.2]" />
                      <p className="text-sm font-extrabold uppercase tracking-wider text-zinc-805">Tu bolsa está vacía actualmente</p>
                      <p className="text-xs mt-1.5 text-zinc-500">Explora y añade licras o vestidos de la nueva colección</p>
                      <Button
                        variant="outline"
                        className="mt-6 w-full rounded-xl border border-rose-200 bg-white text-[#ff007f] hover:bg-rose-50/50 text-xs font-black uppercase tracking-widest py-3.5 shadow-sm cursor-pointer transition-all hover:scale-[1.02] active:scale-95"
                        onClick={() => {
                          setCartOpen(false);
                          scrollToSection("coleccion");
                        }}
                      >
                        Explorar Colección
                      </Button>
                    </div>
                  ) : (
                    Object.entries(cart).map(([cartKey, item]) => {
                      const product = productsList.find((p) => String(p.id) === String(item.productId));
                      if (!product) return null;
                      return (
                        <div
                          key={cartKey}
                          className="grid grid-cols-[72px_minmax(0,1fr)] gap-4 rounded-xl border border-rose-100 bg-[#fffafb] p-3"
                        >
                          <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-zinc-100 border border-rose-100/50">
                            <ProductCrop product={product} />
                          </div>
                          <div className="min-w-0 flex flex-col justify-between">
                            <div>
                              <p className="truncate font-extrabold text-sm text-zinc-900">{product.name}</p>
                              <div className="flex items-center gap-1.5 mt-1">
                                <span className="inline-flex items-center rounded-md bg-rose-100/80 px-2 py-0.5 text-[10px] font-black text-rose-700 uppercase tracking-wider">
                                  Talla: {item.size}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center justify-between mt-2">
                              <p className="text-xs text-rose-600 font-mono font-black">
                                ${(product.price * item.quantity).toFixed(2)} USD
                              </p>
                              <div className="flex items-center gap-2">
                                <div className="flex items-center border border-rose-100 rounded-full bg-white shadow-xs">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="size-7 rounded-full text-zinc-650 hover:text-rose-600 hover:bg-rose-50/40"
                                    onClick={() => updateProduct(cartKey, -1)}
                                    aria-label={`Quitar uno de ${product.name}`}
                                  >
                                    <Minus className="size-3" />
                                  </Button>
                                  <span className="w-5 text-center text-xs font-bold text-zinc-800">{item.quantity}</span>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="size-7 rounded-full text-zinc-650 hover:text-rose-600 hover:bg-rose-50/40"
                                    onClick={() => updateProduct(cartKey, 1)}
                                    aria-label={`Añadir uno de ${product.name}`}
                                  >
                                    <Plus className="size-3" />
                                  </Button>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="size-7 rounded-full text-zinc-400 hover:text-red-500 hover:bg-red-50/30"
                                  onClick={() => removeProduct(cartKey)}
                                  aria-label={`Eliminar ${product.name}`}
                                >
                                  <Trash2 className="size-3.5" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {itemCount > 0 && (
                  <div className="border-t border-rose-100/40 pt-5 space-y-3">
                    {/* Campo de Cupón de Descuento VIP */}
                    <div className="space-y-1.5 p-3 rounded-2xl bg-rose-50/40 border border-rose-100/60">
                      <label className="text-[10px] font-extrabold text-zinc-600 uppercase tracking-widest flex items-center justify-between">
                        <span>¿Tienes un cupón VIP?</span>
                        {appliedCoupon && (
                          <span className="text-emerald-600 font-mono font-black">{appliedCoupon} (-10%)</span>
                        )}
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Ej: VIP10"
                          value={couponCodeInput}
                          onChange={(e) => setCouponCodeInput(e.target.value)}
                          className="flex-1 rounded-xl border border-rose-200/80 bg-white px-3 py-2 text-xs font-mono font-bold text-zinc-900 uppercase placeholder-zinc-400 focus:border-rose-500 focus:outline-none"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleApplyCoupon()}
                          className="rounded-xl border-rose-200 bg-white text-rose-700 hover:bg-rose-100 font-extrabold text-xs uppercase px-4 cursor-pointer"
                        >
                          Aplicar
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-1 pt-1">
                      {discountPercent > 0 && (
                        <div className="flex items-center justify-between text-xs text-rose-600 font-bold">
                          <span>Descuento VIP ({discountPercent}%)</span>
                          <span className="font-mono">-${(subtotal * (discountPercent / 100)).toFixed(2)} USD</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between text-sm font-bold">
                        <span className="text-zinc-700">{discountPercent > 0 ? "Total con Descuento" : "Subtotal"}</span>
                        <span className="text-xl font-mono text-zinc-950 font-black">${finalTotal.toFixed(2)} USD</span>
                      </div>
                    </div>

                    <Button
                      className="w-full h-14 rounded-2xl bg-[#ff007f] text-white font-extrabold text-xs uppercase tracking-[0.2em] shadow-lg shadow-rose-500/20 hover:bg-rose-600 transition-all cursor-pointer flex items-center justify-center gap-2"
                      onClick={handleOpenShippingModal}
                      disabled={isCheckingOut}
                    >
                      <CreditCard className="size-4" />
                      {isCheckingOut ? "Procesando..." : "Finalizar Compra"}
                    </Button>

                    <Button
                      variant="outline"
                      className="w-full h-14 rounded-2xl border-emerald-250 bg-emerald-50 text-emerald-700 font-extrabold text-xs uppercase tracking-[0.2em] shadow-sm hover:bg-emerald-100 hover:text-emerald-800 transition-all cursor-pointer flex items-center justify-center gap-2"
                      onClick={handleOpenShippingModal}
                    >
                      <WhatsAppIcon className="size-4 text-emerald-600" />
                      Pedir por WhatsApp
                    </Button>
                    <p className="text-center text-[10px] text-zinc-400 font-mono mt-2 flex items-center justify-center gap-1">
                      🔒 Pago seguro 100% encriptado (SSL)
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
          {/* Hero Carousel Images with smooth fading transitions (Fade-In / Fade-Out) */}
          {heroImages.map((src, index) => {
            const isActive = index === currentHeroIndex;
            return (
              <div
                key={src}
                className={`absolute inset-0 h-full w-full transition-opacity duration-[3000ms] ease-in-out ${
                  isActive ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                }`}
              >
                {/* Ambient Blurred Backdrop for Widescreen Desktop Displays */}
                <div
                  className="absolute inset-0 bg-cover bg-center filter blur-3xl scale-110 opacity-40 hidden sm:block"
                  style={{ backgroundImage: `url(${src})` }}
                />

                {/* Main Hero Image */}
                <img
                  src={src}
                  alt={index === 0 ? "Camila — Dueña y Fundadora de Isafer Boutique" : `Colección Isafer Boutique ${index + 1}`}
                  width={1280}
                  height={1600}
                  fetchPriority={index === 0 ? "high" : "low"}
                  className={`absolute inset-0 h-full w-full filter contrast-105 transition-transform duration-3000 ease-out ${
                    index === 0
                      ? "object-cover object-[center_68%] sm:object-[center_72%] lg:object-[center_68%]"
                      : "object-cover object-[55%_center]"
                  } ${isActive ? "scale-100" : "scale-105"}`}
                />
              </div>
            );
          })}
          {/* Degradados sutiles y transparentes para permitir visualizar a Camila y su boutique en alta definición en Mac */}
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/85 via-zinc-950/15 to-transparent sm:from-zinc-950/75 sm:via-transparent sm:to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/70 via-zinc-950/20 to-transparent sm:from-zinc-950/65 sm:via-transparent sm:to-transparent" />

          {/* Ajuste de márgenes y tipografía de alta visibilidad */}
          <div className="relative mx-auto w-full max-w-7xl px-5 pb-10 pt-28 sm:px-10 lg:px-16">
            <div className="max-w-xl">
              {/* Título Display adaptado a móviles y escritorio */}
              <h1 className="font-display text-[26px] sm:text-6xl font-black leading-[0.95] sm:leading-[1.0] tracking-tight text-white uppercase text-balance drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)]">
                {t("hero_title_1").includes("y") ? "Sensual &" : "Sexy &"}
                <br />
                <span className="italic font-serif font-normal text-rose-400 drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)] normal-case text-2xl sm:text-5xl">
                  {t("hero_title_1").includes("y") ? "Elegante" : "Elegant"}
                </span>
              </h1>

              <p className="mt-2 text-[9px] sm:text-xs font-mono tracking-[0.2em] sm:tracking-[0.25em] text-rose-300 uppercase font-bold drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
                Isafer Boutique · Brooklyn, NY
              </p>

              {/* Body Text */}
              <p className="mt-4 max-w-lg text-xs sm:text-sm leading-relaxed text-zinc-100 font-medium hidden sm:block drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]">
                {t("hero_subtitle")}
              </p>

              {/* Botón CTA compacto */}
              <div className="mt-4 sm:mt-8 flex items-center">
                <CtaButton
                  href="#coleccion"
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection("coleccion");
                  }}
                  text={t("hero_cta_primary")}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Animated Offers Banner */}
        <AnimatedOfferBanner />

        {/* Trending/New Arrivals Carousel */}
        <TrendingCarousel
          products={productsList}
          favorites={favorites}
          toggleFavorite={toggleFavorite}
          addProduct={addProduct}
          onProductClick={openProductModal}
          t={t}
        />

        {/* 4. BENTO GRID CATEGORIES (Barbie Style) */}
        <section id="categorias" className="scroll-mt-20 py-16 sm:py-24 bg-rose-50 dark:bg-[#1a0f14]">
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <div className="mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.3em] text-pink-500 flex items-center gap-2">
                  <Gem className="size-4" /> ESTRUCTURA DE ESTILOS
                </p>
                <h2 className="mt-2 font-display text-5xl sm:text-7xl font-black tracking-tighter text-rose-900 dark:text-rose-100 italic drop-shadow-sm">
                  Colecciones Luxe
                </h2>
              </div>
              <p className="text-xs sm:text-sm font-medium text-rose-700/80 dark:text-rose-300/80 max-w-xs leading-relaxed">
                Selecciona la categoría perfecta para tu próxima salida o evento. Brilla con estilo.
              </p>
            </div>

            {/* Asymmetric Bento Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {/* Bento Card 1: Large Featured (Licras Moldeadoras) */}
              <div
                onClick={() => {
                  setActiveCategory("Licras");
                  scrollToSection("coleccion");
                }}
                className="group relative md:col-span-2 aspect-[4/3] md:aspect-auto md:h-[400px] overflow-hidden rounded-[2rem] border-4 border-white/60 dark:border-rose-900/40 shadow-xl cursor-pointer transition-all duration-500 hover:border-pink-400 hover:shadow-pink-500/20 hover:shadow-2xl hover:-translate-y-1"
              >
                <ProductCrop product={productsList[3] || productsList[0]} />
                <div className="absolute inset-0 bg-gradient-to-t from-pink-950 via-pink-900/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
                <div className="relative z-10 p-8 flex flex-col justify-end h-full">
                  <div>
                    <span className="inline-block rounded-full bg-pink-500 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white mb-3 shadow-md">
                      Efecto Reloj de Arena
                    </span>
                    <h3 className="font-display text-4xl sm:text-5xl font-black text-white italic drop-shadow-md">
                      Licras Moldeadoras
                    </h3>
                    <p className="mt-2 text-sm text-pink-100 max-w-md font-medium">
                      Compresión inteligente con tejido moldeador que ajusta la cintura y esculpe la silueta sin perder comodidad.
                    </p>
                  </div>
                  <span className="mt-6 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-pink-300 group-hover:text-pink-200 group-hover:translate-x-1 transition-all">
                    Ver Licras <ArrowRight className="size-4" />
                  </span>
                </div>
              </div>

              {/* Bento Card 2: Vestidos */}
              <div
                onClick={() => {
                  setActiveCategory("Vestidos");
                  scrollToSection("coleccion");
                }}
                className="group relative aspect-[3/4] md:h-[400px] overflow-hidden rounded-[2rem] border-4 border-white/60 dark:border-rose-900/40 shadow-xl cursor-pointer transition-all duration-500 hover:border-pink-400 hover:shadow-pink-500/20 hover:shadow-2xl hover:-translate-y-1"
              >
                <ProductCrop product={productsList[7] || productsList[0]} />
                <div className="absolute inset-0 bg-gradient-to-t from-pink-950 via-pink-900/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
                <div className="relative z-10 p-6 flex flex-col justify-end h-full">
                  <div>
                    <span className="inline-block rounded-full bg-white/20 backdrop-blur-md border border-white/30 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white mb-3">
                      Sensual & Noche
                    </span>
                    <h3 className="font-display text-3xl font-black text-white italic drop-shadow-md">Vestidos de Malla</h3>
                    <p className="mt-1 text-xs text-pink-100 font-medium">Transparencias y drapeados sexy.</p>
                  </div>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-pink-300 group-hover:text-pink-200 group-hover:translate-x-1 transition-all">
                    Explorar <ArrowRight className="size-4" />
                  </span>
                </div>
              </div>

              {/* Bento Card 3: Tops & Sets */}
              <div
                onClick={() => {
                  setActiveCategory("Tops & Sets");
                  scrollToSection("coleccion");
                }}
                className="group relative aspect-[3/4] md:h-[400px] overflow-hidden rounded-[2rem] border-4 border-white/60 dark:border-rose-900/40 shadow-xl cursor-pointer transition-all duration-500 hover:border-pink-400 hover:shadow-pink-500/20 hover:shadow-2xl hover:-translate-y-1"
              >
                <ProductCrop product={productsList[0]} />
                <div className="absolute inset-0 bg-gradient-to-t from-pink-950 via-pink-900/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
                <div className="relative z-10 p-6 flex flex-col justify-end h-full">
                  <div>
                    <span className="inline-block rounded-full bg-white/20 backdrop-blur-md border border-white/30 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white mb-3">
                      Outfits 2 Piezas
                    </span>
                    <h3 className="font-display text-3xl font-black text-white italic drop-shadow-md">Tops & Sets</h3>
                    <p className="mt-1 text-xs text-pink-100 font-medium">Bandeau, nudos y combinables.</p>
                  </div>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-pink-300 group-hover:text-pink-200 group-hover:translate-x-1 transition-all">
                    Explorar <ArrowRight className="size-4" />
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
                    onClick={() => openProductModal(product)}
                    className={`group relative flex flex-col justify-between rounded-3xl border border-zinc-200/80 dark:border-zinc-800 bg-card p-2 sm:p-3 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 cursor-pointer ${shouldHide}`}
                  >
                    <div className="relative aspect-[4/5] sm:aspect-[3/4] w-full overflow-hidden rounded-2xl bg-zinc-100 dark:bg-zinc-900">
                      <ProductCrop product={product} />

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

                      {/* Quick Add Overlay Inline (Estilo Pull&Bear) */}
                      <QuickAddOverlay
                        product={product}
                        isOpen={quickAddOpenId === product.id}
                        onClose={() => setQuickAddOpenId(null)}
                        onSelectSize={(size) => handleQuickAddSizeSelect(product.id, size)}
                      />
                    </div>

                    <div className="p-2 pt-3 flex flex-col flex-1 justify-between">
                      <div>
                        <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                          {product.category}
                        </span>
                        <h3 className="mt-0.5 sm:mt-1 font-display text-xs sm:text-base md:text-lg font-bold tracking-tight group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
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
                        
                        {/* Botón de Añadir para Móviles (Pull&Bear Inline Quick-Add) */}
                        <Button
                          id={idx === 0 ? "add-to-cart-first-product-mobile" : undefined}
                          data-testid="add-to-cart-button-mobile"
                          variant="default"
                          size="sm"
                          className="rounded-full h-9 px-3.5 text-xs font-bold bg-zinc-950 hover:bg-zinc-900 text-white border border-zinc-800 transition-transform active:scale-95 flex sm:hidden items-center gap-1 cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            setQuickAddOpenId((prev) => (prev === product.id ? null : product.id));
                          }}
                          aria-label={t("catalog_add_to_cart")}
                        >
                          <Plus className="size-3.5" />
                          Añadir
                        </Button>

                        {/* Botón de Pedir para Desktop */}
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-full h-9 w-9 p-0 sm:w-auto sm:px-3 text-xs font-semibold border-zinc-300 dark:border-zinc-700 hover:bg-zinc-950 hover:text-white dark:hover:bg-zinc-100 dark:hover:text-zinc-950 hidden sm:flex"
                          onClick={(e) => {
                            e.stopPropagation();
                            openProductModal(product);
                          }}
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

        {/* 6. EDITORIAL BANNER SECTION (Sobre Nosotros - Barbie Style Curved) */}
        <section id="historia" className="relative w-full min-h-[450px] py-20 bg-gradient-to-r from-pink-300 to-rose-300 overflow-hidden flex items-center">
          
          {/* Top Curved Divider */}
          <div className="absolute top-0 left-0 w-full overflow-hidden leading-[0] z-20">
            <svg viewBox="0 0 1440 120" preserveAspectRatio="none" className="w-full h-[40px] sm:h-[80px]">
              <path d="M0,0 L1440,0 L1440,20 Q720,120 0,20 Z" className="fill-rose-50 dark:fill-[#1a0f14]" />
            </svg>
          </div>

          <div className="relative z-30 max-w-7xl mx-auto w-full px-6 sm:px-12 flex flex-col md:flex-row items-center justify-between gap-12 lg:gap-24">
            {/* Text Content */}
            <div className="max-w-xl space-y-6 text-center md:text-left mt-8 md:mt-0">
              <h2 className="font-sans text-4xl sm:text-5xl lg:text-6xl font-black text-rose-950 tracking-tight drop-shadow-sm">
                Nuestra Esencia
              </h2>
              <p className="text-sm sm:text-lg lg:text-xl font-semibold leading-relaxed text-rose-950/80 drop-shadow-sm">
                Desde 2024 creamos moda con sensibilidad, con corazón. No es solo diseñar ropa, es poner un poco de alma en cada pieza.
              </p>

              <div className="pt-2 flex justify-center md:justify-start">
                <button
                  onClick={() => setCurrentView("about")}
                  className="px-8 py-4 rounded-full bg-rose-950 text-pink-100 text-xs font-bold uppercase tracking-[0.2em] hover:bg-rose-900 transition-all cursor-pointer shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 border-0"
                >
                  Nuestra Historia
                </button>
              </div>
            </div>

            {/* Image Overlay on Right */}
            <AnimatedOwnerImage />
          </div>

          {/* Bottom Curved Divider */}
          <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-[0] z-20 rotate-180">
            <svg viewBox="0 0 1440 120" preserveAspectRatio="none" className="w-full h-[40px] sm:h-[80px]">
              <path d="M0,0 L1440,0 L1440,20 Q720,120 0,20 Z" className="fill-zinc-50 dark:fill-zinc-950" />
            </svg>
          </div>
        </section>

        {/* 7. VISÍTANOS EN BROOKLYN (BENTO SHOWROOM) */}
        <section id="visitanos" className="scroll-mt-20 py-24 px-5 bg-zinc-50 dark:bg-zinc-950 relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-zinc-200/50 dark:bg-grid-white/[0.02] bg-[size:32px_32px]" />
          <div className="mx-auto max-w-6xl relative z-10">
            <div className="flex flex-col gap-2 mb-12 text-center sm:text-left">
              <span className="text-xs font-black uppercase tracking-[0.3em] text-rose-500">Nuestra Tienda Física y Showroom</span>
              <h2 className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight">Visítanos en Brooklyn</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Address / Map */}
              <div className="md:col-span-12 lg:col-span-8 group relative overflow-hidden rounded-[2rem] border border-zinc-200/50 dark:border-white/5 bg-white/70 dark:bg-zinc-900/50 p-8 sm:p-12 shadow-xl hover:shadow-2xl transition-all duration-500 backdrop-blur-xl">
                 <div className="absolute -right-10 -bottom-10 text-rose-500/15 group-hover:text-rose-500/25 transition-all duration-700 transform group-hover:scale-110 pointer-events-none">
                   <MapPin className="w-96 h-96" />
                 </div>
                 <div className="relative z-10 flex flex-col h-full justify-between">
                    <div>
                      <div className="inline-flex size-14 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-500 mb-6 border border-rose-500/20 shadow-sm">
                        <MapPin className="size-7" />
                      </div>
                      <h3 className="text-2xl sm:text-3xl font-bold mb-4 tracking-tight">4711 4th Ave, Brooklyn, NY</h3>
                      <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-400 max-w-lg leading-relaxed font-medium">
                        Pruebas privadas de vestuario, asesoría de estilo personalizada y atención directa en nuestra boutique en Sunset Park.
                      </p>
                    </div>
                    <div className="mt-10 flex flex-wrap gap-4">
                      <Button asChild className="h-14 rounded-full px-8 bg-zinc-950 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-950 font-bold text-xs uppercase tracking-wider shadow-lg hover:-translate-y-1 transition-all">
                        <a href="https://maps.app.goo.gl/2kHjqUHMUXyegViK8" target="_blank" rel="noreferrer">
                          Abrir en Google Maps <MapPin className="ml-2 size-4" />
                        </a>
                      </Button>
                      <Button asChild variant="outline" className="h-14 rounded-full px-8 border-zinc-200 dark:border-white/10 hover:bg-zinc-100 dark:hover:bg-white/5 font-bold text-xs uppercase tracking-wider transition-all hover:-translate-y-1 bg-white/50 dark:bg-black/20 backdrop-blur-md">
                        <a href={`https://wa.me/${OWNER_PHONE}?text=Hola%20Isafer%20Boutique`} target="_blank" rel="noreferrer">
                          Cita Previa <WhatsAppIcon className="ml-2 size-4 text-emerald-500" />
                        </a>
                      </Button>
                    </div>
                 </div>
              </div>

              {/* Operating Hours */}
              <div className="md:col-span-6 lg:col-span-4 group relative overflow-hidden rounded-[2rem] border border-zinc-200/50 dark:border-white/5 bg-white/70 dark:bg-zinc-900/50 p-8 shadow-xl hover:shadow-2xl transition-all duration-500 backdrop-blur-xl">
                 <div className="flex items-center justify-between border-b border-zinc-100 dark:border-white/10 pb-5 mb-5">
                   <span className="text-xs font-black uppercase tracking-widest flex items-center gap-2 text-zinc-900 dark:text-zinc-100">
                     <Clock className="size-4 text-emerald-500" /> Horario
                   </span>
                   <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold font-mono">
                     <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Abierto
                   </span>
                 </div>
                 <div className="grid grid-cols-2 gap-y-3.5 text-sm">
                   <div className="font-semibold text-zinc-400">Lunes:</div>
                   <div className="font-bold text-rose-500 text-right">Cerrado</div>
                   <div className="font-semibold text-zinc-700 dark:text-zinc-300">Martes:</div>
                   <div className="font-mono font-medium text-right text-zinc-900 dark:text-zinc-100">11 AM – 8 PM</div>
                   <div className="font-semibold text-zinc-700 dark:text-zinc-300">Miércoles:</div>
                   <div className="font-mono font-medium text-right text-zinc-900 dark:text-zinc-100">11 AM – 8 PM</div>
                   <div className="font-semibold text-zinc-700 dark:text-zinc-300">Jueves:</div>
                   <div className="font-mono font-medium text-right text-zinc-900 dark:text-zinc-100">11 AM – 8 PM</div>
                   <div className="font-semibold text-zinc-700 dark:text-zinc-300">Viernes:</div>
                   <div className="font-mono font-medium text-right text-zinc-900 dark:text-zinc-100">11 AM – 8 PM</div>
                   <div className="font-semibold text-zinc-700 dark:text-zinc-300">Sábado:</div>
                   <div className="font-mono font-medium text-right text-zinc-900 dark:text-zinc-100">11 AM – 8 PM</div>
                   <div className="font-semibold text-zinc-700 dark:text-zinc-300">Domingo:</div>
                   <div className="font-mono font-medium text-right text-zinc-900 dark:text-zinc-100">11 AM – 8 PM</div>
                 </div>
              </div>

              {/* Contact / Social Grid (Diseño compacto horizontal en móvil, tarjetas en escritorio) */}
              <div className="md:col-span-6 lg:col-span-12 grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-4">
                 {/* Phone */}
                 <a href="tel:+19293531953" className="group flex items-center gap-3 sm:flex-col sm:justify-center sm:items-center text-left sm:text-center rounded-xl sm:rounded-2xl border border-zinc-200/80 dark:border-white/10 bg-white/80 dark:bg-zinc-900/60 p-2.5 sm:p-5 shadow-xs hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 backdrop-blur-xl">
                   <div className="size-8 sm:size-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0 sm:mb-2">
                     <Phone className="size-4 sm:size-5 text-zinc-600 dark:text-zinc-300 group-hover:text-rose-500 transition-colors" />
                   </div>
                   <div className="min-w-0 flex-1 sm:flex-initial">
                     <span className="block text-[9px] sm:text-xs font-black uppercase tracking-widest text-zinc-400 sm:mb-0.5">Llámanos</span>
                     <span className="font-mono font-bold text-xs sm:text-base text-zinc-900 dark:text-zinc-100 group-hover:text-rose-500 transition-colors truncate">+1 (929) 353-1953</span>
                   </div>
                 </a>
                 {/* Instagram */}
                 <a href="https://www.instagram.com/shopisafer" target="_blank" rel="noreferrer" className="group flex items-center gap-3 sm:flex-col sm:justify-center sm:items-center text-left sm:text-center rounded-xl sm:rounded-2xl border border-rose-200/80 dark:border-rose-900/40 bg-rose-50/80 dark:bg-rose-950/30 p-2.5 sm:p-5 shadow-xs hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 backdrop-blur-xl">
                   <div className="size-8 sm:size-10 rounded-full bg-rose-100 dark:bg-rose-900/50 flex items-center justify-center shrink-0 sm:mb-2">
                     <Instagram className="size-4 sm:size-5 text-rose-500 group-hover:text-rose-600 transition-colors" />
                   </div>
                   <div className="min-w-0 flex-1 sm:flex-initial">
                     <span className="block text-[9px] sm:text-xs font-black uppercase tracking-widest text-rose-400 sm:mb-0.5">Síguenos</span>
                     <span className="font-bold text-xs sm:text-base text-rose-600 dark:text-rose-300 truncate">@shopisafer</span>
                   </div>
                 </a>
                 {/* TikTok */}
                 <a href="https://www.tiktok.com/@shop_isafer1" target="_blank" rel="noreferrer" className="group flex items-center gap-3 sm:flex-col sm:justify-center sm:items-center text-left sm:text-center rounded-xl sm:rounded-2xl border border-zinc-800 bg-zinc-950 p-2.5 sm:p-5 shadow-xs hover:shadow-md transition-all duration-300 hover:-translate-y-0.5">
                   <div className="size-8 sm:size-10 rounded-full bg-zinc-800 flex items-center justify-center shrink-0 sm:mb-2">
                     <TikTokIcon className="size-4 sm:size-5 text-cyan-400 group-hover:text-white transition-colors" />
                   </div>
                   <div className="min-w-0 flex-1 sm:flex-initial">
                     <span className="block text-[9px] sm:text-xs font-black uppercase tracking-widest text-zinc-400 sm:mb-0.5">Tendencias</span>
                     <span className="font-bold text-xs sm:text-base text-white truncate">@shop_isafer1</span>
                   </div>
                 </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* 8. FOOTER E-COMMERCE LUXE (Barbie Style) */}
      <footer className="border-t-2 border-rose-100 bg-rose-50 text-rose-900 pt-16 pb-12 transition-all">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          {/* VIP Newsletter Box (Diseño Editorial Centrado Luxe) */}
          <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-white via-rose-50 to-pink-100 border-2 border-white p-8 sm:p-14 mb-16 shadow-xl shadow-rose-200/50 flex flex-col items-center text-center">
            {/* Luces de Neón Ambientales */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-pink-300/20 rounded-full filter blur-3xl -z-0 pointer-events-none" />
            <div className="absolute top-0 right-0 w-64 h-64 bg-rose-300/20 rounded-full filter blur-2xl -z-0 pointer-events-none" />

            <div className="relative z-10 w-full flex flex-col items-center">
              {/* Badge VIP */}
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 backdrop-blur-md border border-pink-200 text-pink-600 text-[10px] sm:text-xs font-bold tracking-[0.2em] uppercase mb-4 shadow-sm">
                <Crown className="size-3.5 text-pink-500 animate-pulse" /> CLUB VIP · ISAFÉR BOUTIQUE
              </span>

              {/* Título Principal */}
              <h3 className="font-display text-3xl sm:text-4xl lg:text-5xl font-black text-rose-950 tracking-tight leading-tight max-w-2xl">
                Consigue <span className="font-serif italic font-normal text-pink-500 drop-shadow-sm">10% OFF</span> en tu primer pedido
              </h3>

              {/* Subtítulo */}
              <p className="mt-4 text-xs sm:text-sm text-rose-700 font-medium max-w-lg leading-relaxed">
                Recibe avisos VIP de lanzamientos secretos, ventas exclusivas y ofertas semanales directamente en tu email.
              </p>

              {/* Formulario Unificado en Barra de Entrada Elegante */}
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (newsletterEmail) {
                    const res = await subscribeToNewsletter(newsletterEmail);
                    if (res.success) {
                      toast.success("¡Bienvenida al Club VIP! 💖", {
                        description: `Te hemos guardado en la lista VIP y enviado tu cupón de 10% OFF a ${res.email}.`,
                      });
                      setNewsletterEmail("");
                    }
                  }
                }}
                className="mt-8 w-full max-w-xl flex flex-col sm:flex-row items-center p-2 rounded-[2rem] sm:rounded-full bg-white/90 backdrop-blur-sm border-2 border-pink-100 focus-within:border-pink-300 focus-within:ring-4 focus-within:ring-pink-200/50 shadow-lg shadow-pink-100 transition-all duration-300 gap-2"
              >
                <div className="relative flex-1 w-full flex items-center pl-4 py-1">
                  <Mail className="size-5 text-pink-400 shrink-0" />
                  <input
                    type="email"
                    required
                    placeholder="Escribe tu correo electrónico..."
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    className="w-full bg-transparent px-3 py-2.5 text-sm font-medium text-rose-950 placeholder-rose-300 focus:outline-none"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full sm:w-auto rounded-xl sm:rounded-full bg-gradient-to-r from-pink-500 to-rose-400 hover:from-pink-400 hover:to-rose-300 text-white font-black text-xs uppercase tracking-[0.15em] px-8 py-4 shadow-md shadow-pink-200 cursor-pointer transition-all hover:scale-105 active:scale-95 shrink-0 border-0 h-12"
                >
                  UNIRME VIP
                </Button>
              </form>

              {/* Mensaje de Confianza */}
              <p className="mt-5 text-[10px] text-rose-400/80 font-medium tracking-wider">
                🔒 Respetamos tu privacidad. Cancela tu suscripción en cualquier momento.
              </p>
            </div>
          </div>

          {/* Separador negro */}
          <hr className="border-t-2 border-zinc-950/10 mb-14" />

          {/* 4 Columns Grid Organizado */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12 pb-14 border-b-2 border-zinc-950/10">
            {/* Col 1: Brand Identity */}
            <div className="space-y-5 text-center md:text-left flex flex-col items-center md:items-start">
              <IsaferLogo variant="footer" size="lg" />
              <p className="text-xs text-zinc-900 leading-relaxed max-w-xs font-medium">
                Moda femenina moldeadora, sensual y elegante. Diseñado en Brooklyn, NY para resaltar la seguridad y belleza natural de la mujer.
              </p>
              <div className="pt-2 flex items-center gap-3">
                <a
                  href="https://www.instagram.com/shopisafer"
                  target="_blank"
                  rel="noreferrer"
                  className="w-10 h-10 rounded-full bg-white border border-pink-100 flex items-center justify-center text-rose-400 hover:text-white hover:border-pink-500 hover:bg-pink-500 transition-all shadow-sm group"
                  aria-label="Instagram @shopisafer"
                >
                  <Instagram className="size-4 group-hover:scale-110 transition-transform" />
                </a>
                <a
                  href="https://www.tiktok.com/@shop_isafer1"
                  target="_blank"
                  rel="noreferrer"
                  className="w-10 h-10 rounded-full bg-white border border-pink-100 flex items-center justify-center text-rose-400 hover:text-white hover:border-zinc-950 hover:bg-zinc-950 transition-all shadow-sm group"
                  aria-label="TikTok @shop_isafer1"
                >
                  <TikTokIcon className="size-4 group-hover:scale-110 transition-transform" />
                </a>
                <a
                  href={`https://wa.me/${OWNER_PHONE}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-10 h-10 rounded-full bg-white border border-pink-100 flex items-center justify-center text-rose-400 hover:text-white hover:border-emerald-500 hover:bg-emerald-500 transition-all shadow-sm group"
                  aria-label="WhatsApp Directo"
                >
                  <WhatsAppIcon className="size-4 group-hover:scale-110 transition-transform" />
                </a>
              </div>
            </div>

            {/* Col 2: Colecciones */}
            <div className="space-y-5 text-center md:text-left">
              <h4 className="font-display text-sm font-black uppercase tracking-[0.2em] text-zinc-950 flex items-center justify-center md:justify-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-950 inline-block" /> Colecciones
              </h4>
              <ul className="space-y-3.5 text-sm text-zinc-900 font-medium">
                <li>
                  <a
                    href="#coleccion"
                    onClick={(e) => { e.preventDefault(); setActiveCategory("Licras"); scrollToSection("coleccion"); }}
                    className="hover:text-pink-500 hover:translate-x-1 inline-block transition-all"
                  >
                    Fajas & Licras Moldeadoras
                  </a>
                </li>
                <li>
                  <a
                    href="#coleccion"
                    onClick={(e) => { e.preventDefault(); setActiveCategory("Vestidos"); scrollToSection("coleccion"); }}
                    className="hover:text-pink-500 hover:translate-x-1 inline-block transition-all"
                  >
                    Vestidos Glam & Noche
                  </a>
                </li>
                <li>
                  <a
                    href="#coleccion"
                    onClick={(e) => { e.preventDefault(); setActiveCategory("Tops & Sets"); scrollToSection("coleccion"); }}
                    className="hover:text-pink-500 hover:translate-x-1 inline-block transition-all"
                  >
                    Conjuntos & Tops Luxe
                  </a>
                </li>
                <li>
                  <a
                    href="#historia"
                    onClick={(e) => { e.preventDefault(); setAboutUsModalOpen(true); }}
                    className="hover:text-pink-500 hover:translate-x-1 inline-block transition-all"
                  >
                    Nuestra Historia & Atelier
                  </a>
                </li>
              </ul>
            </div>

            {/* Col 3: Servicio al Cliente */}
            <div className="space-y-5 text-center md:text-left">
              <h4 className="font-display text-sm font-black uppercase tracking-[0.2em] text-zinc-950 flex items-center justify-center md:justify-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-950 inline-block" /> Servicio & Garantía
              </h4>
              <ul className="space-y-3.5 text-sm text-zinc-900 font-medium flex flex-col items-center md:items-start">
                <li className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-full bg-white shadow-sm border border-pink-100">
                    <Truck className="size-3.5 text-pink-400 shrink-0" />
                  </div>
                  <span>Envíos Express (EE. UU.)</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-full bg-white shadow-sm border border-pink-100">
                    <CheckCircle2 className="size-3.5 text-emerald-400 shrink-0" />
                  </div>
                  <span>Garantía de Cambio de Talla</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <a
                    href="#visitanos"
                    onClick={(e) => { e.preventDefault(); scrollToSection("visitanos"); }}
                    className="hover:text-pink-500 flex items-center gap-2.5 transition-colors"
                  >
                    <div className="p-1.5 rounded-full bg-white shadow-sm border border-pink-100">
                      <Clock className="size-3.5 text-amber-400 shrink-0" />
                    </div>
                    <span>Visita Nuestra Tienda Física</span>
                  </a>
                </li>
                <li className="flex items-center gap-2.5 pt-1">
                  <a
                    href={`https://wa.me/${OWNER_PHONE}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-pink-500 underline decoration-pink-300 underline-offset-4 font-bold hover:text-pink-400 transition-colors flex items-center gap-2"
                  >
                    <div className="p-1.5 rounded-full bg-emerald-50 shadow-sm border border-emerald-100">
                      <WhatsAppIcon className="size-3.5 text-emerald-500" />
                    </div>
                    Asesoría por WhatsApp
                  </a>
                </li>
              </ul>
            </div>

            {/* Col 4: Contacto */}
            <div className="space-y-5 text-center md:text-left">
              <h4 className="font-display text-sm font-black uppercase tracking-[0.2em] text-zinc-950 flex items-center justify-center md:justify-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-950 inline-block" /> Contacto
              </h4>
              <ul className="space-y-3.5 text-sm text-zinc-900 font-medium">
                <li className="flex items-center justify-center md:justify-start gap-2">
                  <MapPin className="size-4 text-pink-400 shrink-0" />
                  <span>4711 4th Ave, Brooklyn, NY</span>
                </li>
                <li>
                  <a href="tel:+19293531953" className="flex items-center justify-center md:justify-start gap-2 hover:text-pink-500 transition-colors">
                    <Phone className="size-4 text-pink-400 shrink-0" />
                    <span>+1 (929) 353-1953</span>
                  </a>
                </li>
                <li className="flex items-center justify-center md:justify-start gap-2">
                  <Clock className="size-4 text-pink-400 shrink-0" />
                  <span>Mar–Dom: 11 AM – 8 PM</span>
                </li>
              </ul>
              <div className="flex items-center justify-center md:justify-start gap-1.5 pt-1 text-[10px] text-zinc-500 font-medium">
                <Lock className="size-3 shrink-0" /> Pago seguro con tarjeta o Apple Pay
              </div>
            </div>
          </div>

          {/* Subfooter (Pie de página) */}
          <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-semibold text-rose-500/80">
            <div className="flex flex-col sm:flex-row items-center gap-2 text-center sm:text-left">
              <p>© 2026 Isafer Boutique. Todos los derechos reservados.</p>
              <span className="hidden sm:inline text-rose-300">•</span>
              <p>
                Diseño por{" "}
                <a
                  href="https://mynextbymusa.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-pink-500 hover:text-pink-400 font-black transition-colors underline decoration-dotted underline-offset-4"
                >
                  MYNEXT
                </a>
              </p>
            </div>
            <div className="flex items-center gap-6">
              <button
                onClick={() => setLegalType("privacy")}
                className="hover:text-pink-600 transition-colors cursor-pointer bg-transparent border-0 p-0 font-bold"
              >
                {t("footer_privacy")}
              </button>
              <button
                onClick={() => setLegalType("terms")}
                className="hover:text-pink-600 transition-colors cursor-pointer bg-transparent border-0 p-0 font-bold"
              >
                {t("footer_terms")}
              </button>
              <button
                onClick={() => setLegalType("cookies")}
                className="hover:text-pink-600 transition-colors cursor-pointer bg-transparent border-0 p-0 font-bold"
              >
                {t("footer_cookies")}
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* Floating Cart Badge (Limpio y oculto en el giro/hero; solo aparece al hacer scroll hacia abajo) */}
      {itemCount > 0 && scrolledPastHero && (
        <Button
          size="sm"
          className="fixed bottom-6 right-5 z-30 rounded-full bg-amber-400 text-zinc-950 font-black text-xs uppercase tracking-wider shadow-xl hover:bg-amber-300 px-4 h-10 flex items-center gap-2 cursor-pointer transition-all hover:scale-105 active:scale-95 border border-amber-300/60"
          onClick={() => setCartOpen(true)}
        >
          <ShoppingBag className="size-4" />
          <span>Ver Bolsa ({itemCount})</span>
        </Button>
      )}

      {/* Left Drawer Mobile/Desktop Navigation Menu (Rediseñado) */}
      <Sheet open={fullScreenMenuOpen} onOpenChange={setFullScreenMenuOpen}>
        <SheetContent
          side="left"
          className="flex w-[85%] sm:max-w-md flex-col border-rose-100/50 bg-[#fdf9f7] p-6 text-zinc-800 [&>button]:bg-transparent [&>button]:text-zinc-400 [&>button]:hover:text-rose-500 [&>button]:right-5 [&>button]:top-7 [&>button]:rounded-full [&>button]:p-2 [&>button]:hover:bg-rose-50/50 [&>button]:border-0 [&>button]:shadow-none [&>button>svg]:size-5 [&>button]:transition-all [&>button]:duration-300"
        >
          {/* Header Fijo con Fondo Blanco y Separador */}
          <div className="mx-[-24px] mt-[-24px] mb-4 bg-white border-b border-rose-100/50 px-6 py-5 flex items-center justify-between shadow-sm">
            <div className="scale-110 origin-left transition-transform">
              <IsaferLogo variant="header" size="lg" className="hover:scale-100" />
            </div>
          </div>

          {/* Quick Search inside menu */}
          <div className="my-2">
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
                className="w-full rounded-2xl border border-rose-100/80 bg-white py-2.5 pl-11 pr-4 text-xs font-semibold focus:border-rose-350 focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* Navigation Links Area (Optimized order) */}
          <div className="flex-1 overflow-y-auto no-scrollbar py-2">
            <nav className="flex flex-col font-sans">
              {/* 1. Inicio */}
              <a
                href="#inicio"
                onClick={(e) => {
                  e.preventDefault();
                  setFullScreenMenuOpen(false);
                  scrollToSection("inicio");
                }}
                className="py-3.5 border-b border-rose-100/40 text-left text-xs font-black uppercase tracking-wider text-zinc-800 hover:text-rose-600 transition-colors"
              >
                {t("nav_home") || "Inicio"}
              </a>

              {/* 2. Catálogo / Colecciones */}
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="categories" className="border-b border-rose-100/40 py-0.5">
                  <AccordionTrigger className="text-xs font-black uppercase tracking-wider text-zinc-800 hover:text-rose-600 hover:no-underline py-3.5">
                    {t("nav_categories") || "Catálogo / Colecciones"}
                  </AccordionTrigger>
                  <AccordionContent className="pt-1 pb-2 pl-3 flex flex-col gap-1.5">
                    {[
                      { label: t("catalog_filter_all"), category: "Todos", icon: Grid },
                      { label: t("catalog_filter_shapewear"), category: "Licras", icon: Sliders },
                      { label: t("catalog_filter_dresses"), category: "Vestidos", icon: Crown },
                      { label: t("catalog_filter_sets"), category: "Tops & Sets", icon: Layers },
                      { label: "Bodys & Corsets Moldeadores", category: "Bodys & Corsets", icon: Flame },
                      { label: "Accesorios Luxe & Glam", category: "Accesorios & Glam", icon: Gem },
                      { label: t("catalog_filter_protection"), category: "Gas Pimienta", icon: ShieldCheck },
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
                        className="flex items-center justify-between py-2 text-xs font-bold text-zinc-700 hover:text-rose-600 transition-colors group"
                      >
                        <span className="flex items-center gap-2.5">
                          <item.icon className="size-4 text-rose-500 group-hover:scale-110 transition-transform" />
                          {item.label}
                        </span>
                        <ChevronRight className="size-3.5 text-zinc-400 group-hover:translate-x-0.5 transition-transform" />
                      </a>
                    ))}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              {/* 3. Sobre Nosotros */}
              <button
                onClick={() => {
                  setFullScreenMenuOpen(false);
                  setCurrentView("about");
                }}
                className="w-full py-3.5 border-b border-rose-100/40 text-left text-xs font-black uppercase tracking-wider text-zinc-800 hover:text-rose-600 transition-colors flex items-center justify-between group cursor-pointer"
              >
                <span>Sobre Nosotros</span>
                <ChevronRight className="size-4 text-zinc-400 group-hover:translate-x-0.5 transition-transform" />
              </button>

              {/* 5. Contacto */}
              <a
                href="#visitanos"
                onClick={(e) => {
                  e.preventDefault();
                  setFullScreenMenuOpen(false);
                  scrollToSection("visitanos");
                }}
                className="py-3.5 border-b border-rose-100/40 text-left text-xs font-black uppercase tracking-wider text-zinc-800 hover:text-rose-600 transition-colors flex items-center justify-between group"
              >
                <span>Contacto 💬</span>
                <ChevronRight className="size-4 text-zinc-400 group-hover:translate-x-0.5 transition-transform" />
              </a>
            </nav>
          </div>

          {/* Pie de Menú Diferenciado (Zona de Cuentas, Redes e Idioma) */}
          <div className="mx-[-24px] mb-[-24px] mt-6 p-6 bg-[#f5ebe7] border-t border-rose-100/50 space-y-4">
            {/* User Account / Profile */}
            {user ? (
              <div className="rounded-2xl border border-rose-100 bg-white p-3.5 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-rose-500 to-rose-650 text-white flex items-center justify-center font-black text-xs shadow-sm shrink-0">
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
                      setTimeout(() => {
                        if (isAdmin) navigate({ to: "/admin" });
                        else setCustomerModalOpen(true);
                      }, 200);
                    }}
                    style={{ backgroundColor: '#09090b', color: '#ffffff' }}
                    className="flex-1 h-9 rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-zinc-900 transition-colors cursor-pointer flex items-center justify-center border border-zinc-800"
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
              <Link
                to="/login"
                onClick={() => setFullScreenMenuOpen(false)}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#ff007f] hover:bg-rose-600 text-white text-xs font-black uppercase tracking-wider py-3.5 shadow-md shadow-rose-500/10 cursor-pointer transition-all hover:scale-[1.02] active:scale-95"
              >
                <User className="size-4 text-white animate-pulse" /> Acceder o Crear Cuenta VIP
              </Link>
            )}

            {/* Icon-Only Social Buttons (Instagram, TikTok, WhatsApp) */}
            <div className="flex items-center justify-center gap-3 py-2">
              <a
                href="https://www.instagram.com/shopisafer"
                target="_blank"
                rel="noopener noreferrer"
                className="size-10 rounded-full border border-rose-200/80 bg-white flex items-center justify-center text-rose-500 hover:bg-rose-50 hover:border-rose-400 hover:text-rose-600 transition-all hover:scale-110 active:scale-95 shadow-sm"
                aria-label="Instagram @shopisafer"
                title="Instagram @shopisafer"
              >
                <Instagram className="size-5" />
              </a>
              <a
                href="https://www.tiktok.com/@shop_isafer1"
                target="_blank"
                rel="noopener noreferrer"
                className="size-10 rounded-full border border-zinc-200 bg-white flex items-center justify-center text-zinc-900 hover:bg-zinc-100 hover:border-zinc-400 transition-all hover:scale-110 active:scale-95 shadow-sm"
                aria-label="TikTok @shop_isafer1"
                title="TikTok @shop_isafer1"
              >
                <TikTokIcon className="size-5" />
              </a>
              <a
                href={`https://wa.me/${OWNER_PHONE}`}
                target="_blank"
                rel="noopener noreferrer"
                className="size-10 rounded-full border border-emerald-200 bg-white flex items-center justify-center text-emerald-600 hover:bg-emerald-50 hover:border-emerald-400 transition-all hover:scale-110 active:scale-95 shadow-sm"
                aria-label="WhatsApp Directo"
                title="Contacto por WhatsApp"
              >
                <WhatsAppIcon className="size-5" />
              </a>
            </div>

            {/* Language Selector */}
            <div className="flex items-center justify-between pt-2 border-t border-rose-100/30">
              <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">Idioma / Language</span>
              <LanguageSelector />
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Dialogs */}
      <CustomerAccountModal
        user={user}
        open={customerModalOpen}
        onOpenChange={setCustomerModalOpen}
        onSignOut={signOut}
      />
      <AdminDashboardModal
        open={adminModalOpen}
        onOpenChange={setAdminModalOpen}
        onProductsUpdated={() => navigate({ to: "/", replace: true })}
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
                    <div className="relative w-10 h-12 rounded-lg overflow-hidden bg-zinc-50 shrink-0">
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
                    <div className="relative w-20 h-24 rounded-xl overflow-hidden bg-zinc-50 shrink-0">
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
                navigate({ to: "/login" });
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

      {/* MODAL DE VISTA PREVIA Y SELECCIÓN DE TALLA (PULL&BEAR / BERSHKA STYLE) */}
      <ProductDetailModal
        product={selectedProductForModal}
        isOpen={productModalOpen}
        onClose={() => setProductModalOpen(false)}
        onAddToCart={handleAddToCartFromModal}
        favorites={favorites}
        toggleFavorite={toggleFavorite}
      />

      {/* MODAL / PESTAÑA SOBRE NOSOTROS & NUESTRA HISTORIA */}
      <AboutUsModal open={aboutUsModalOpen} onOpenChange={setAboutUsModalOpen} />

      {/* FIXED FULLSCREEN ABOUT PAGE */}
      {currentView === "about" && (
        <AboutPage 
          onBackToShop={() => setCurrentView("shop")} 
          favCount={favCount}
          onOpenFavorites={() => setFavoritesDrawerOpen(true)}
        />
      )}

      {/* MODAL DE CAPTURA DE DATOS DE ENVÍO Y IDENTIFICACIÓN */}
      <CheckoutShippingModal
        open={shippingModalOpen}
        onOpenChange={setShippingModalOpen}
        userEmail={user?.email}
        userName={user?.name}
        totalAmount={finalTotal}
        isCheckingOut={isCheckingOut}
        onConfirmStripe={executeStripeCheckout}
        onConfirmWhatsApp={executeWhatsAppCheckout}
      />
    </div>
  );
}
