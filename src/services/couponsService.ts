export interface Coupon {
  id: string;
  code: string;
  discountPercent: number;
  description: string;
  isActive: boolean;
  minPurchase?: number;
  createdAt: string;
}

export interface WelcomeBannerConfig {
  enabled: boolean;
  code: string;
  discountPercent: number;
  bannerText: string;
}

const COUPONS_KEY = "isafer_store_coupons";
const BANNER_KEY = "isafer_welcome_banner_config";
export const EVENT_NAME_COUPONS = "isafer_coupons_updated";
export const EVENT_NAME_BANNER = "isafer_banner_updated";

const DEFAULT_BANNER: WelcomeBannerConfig = {
  enabled: true,
  code: "ISAFER10",
  discountPercent: 10,
  bannerText: "✦ 10% DE DESCUENTO EN TU PRIMERA COMPRA CON CÓDIGO ISAFER10 ✦",
};

const DEFAULT_COUPONS: Coupon[] = [
  {
    id: "cop-1",
    code: "ISAFER10",
    discountPercent: 10,
    description:
      "10% de descuento automático en la primera compra de bienvenida",
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "cop-2",
    code: "VIP10",
    discountPercent: 10,
    description: "Descuento especial VIP para clientas frecuentes de Instagram",
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "cop-3",
    code: "BARBIELUXE15",
    discountPercent: 15,
    description:
      "15% OFF exclusivo en prendas seleccionadas de la colección Barbie Luxe",
    isActive: true,
    createdAt: new Date().toISOString(),
  },
];

export const couponsService = {
  getWelcomeBanner(): WelcomeBannerConfig {
    if (typeof window !== "undefined" && typeof localStorage !== "undefined") {
      const stored = localStorage.getItem(BANNER_KEY);
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch (e) {
          console.error("Error al leer configuración de banner:", e);
        }
      }
    }
    return DEFAULT_BANNER;
  },

  saveWelcomeBanner(config: WelcomeBannerConfig): void {
    if (typeof window !== "undefined" && typeof localStorage !== "undefined") {
      localStorage.setItem(BANNER_KEY, JSON.stringify(config));
      window.dispatchEvent(new Event(EVENT_NAME_BANNER));
    }
  },

  getCoupons(): Coupon[] {
    if (typeof window !== "undefined" && typeof localStorage !== "undefined") {
      const stored = localStorage.getItem(COUPONS_KEY);
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch (e) {
          console.error("Error al leer cupones:", e);
        }
      }
    }
    return DEFAULT_COUPONS;
  },

  saveCoupons(coupons: Coupon[]): void {
    if (typeof window !== "undefined" && typeof localStorage !== "undefined") {
      localStorage.setItem(COUPONS_KEY, JSON.stringify(coupons));
      window.dispatchEvent(new Event(EVENT_NAME_COUPONS));
    }
  },

  addCoupon(couponData: Omit<Coupon, "id" | "createdAt">): Coupon {
    const current = this.getCoupons();
    const newCoupon: Coupon = {
      ...couponData,
      id: `cop-${Date.now()}`,
      code: couponData.code.trim().toUpperCase(),
      createdAt: new Date().toISOString(),
    };
    const updated = [newCoupon, ...current];
    this.saveCoupons(updated);
    return newCoupon;
  },

  updateCoupon(id: string, updates: Partial<Coupon>): void {
    const current = this.getCoupons();
    const updated = current.map((c) =>
      c.id === id
        ? {
            ...c,
            ...updates,
            code: updates.code ? updates.code.trim().toUpperCase() : c.code,
          }
        : c,
    );
    this.saveCoupons(updated);
  },

  toggleCoupon(id: string): void {
    const current = this.getCoupons();
    const updated = current.map((c) =>
      c.id === id ? { ...c, isActive: !c.isActive } : c,
    );
    this.saveCoupons(updated);
  },

  deleteCoupon(id: string): void {
    const current = this.getCoupons();
    const updated = current.filter((c) => c.id !== id);
    this.saveCoupons(updated);
  },

  validateCoupon(code: string): {
    valid: boolean;
    discountPercent: number;
    coupon?: Coupon;
    error?: string;
  } {
    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode)
      return {
        valid: false,
        discountPercent: 0,
        error: "Ingresa un código de cupón",
      };

    const coupons = this.getCoupons();
    const found = coupons.find((c) => c.code === cleanCode);

    if (!found) {
      // Comprobar banner VIP
      const banner = this.getWelcomeBanner();
      if (banner.enabled && banner.code.toUpperCase() === cleanCode) {
        return { valid: true, discountPercent: banner.discountPercent };
      }
      return {
        valid: false,
        discountPercent: 0,
        error: "El código introducido no es válido o no existe.",
      };
    }

    if (!found.isActive) {
      return {
        valid: false,
        discountPercent: 0,
        error: "Este código de cupón se encuentra inactivo.",
      };
    }

    return {
      valid: true,
      discountPercent: found.discountPercent,
      coupon: found,
    };
  },
};
