import React, { createContext, useContext, useState, useEffect } from "react";

export type Language = "en" | "es";

export interface Translations {
  // Navigation & Header
  nav_tagline: string;
  nav_shipping_banner: string;
  nav_home: string;
  nav_catalog: string;
  nav_pepper_spray: string;
  nav_about: string;
  nav_faq: string;
  nav_search_placeholder: string;
  nav_account: string;
  nav_cart: string;
  nav_admin: string;
  
  // Hero Section
  hero_badge: string;
  hero_title_1: string;
  hero_title_2: string;
  hero_subtitle: string;
  hero_cta_primary: string;
  hero_cta_secondary: string;
  hero_stat_1_num: string;
  hero_stat_1_label: string;
  hero_stat_2_num: string;
  hero_stat_2_label: string;
  hero_stat_3_num: string;
  hero_stat_3_label: string;

  // Pepper Spray / Protection Banner
  spray_badge: string;
  spray_title: string;
  spray_subtitle: string;
  spray_feature_1_title: string;
  spray_feature_1_desc: string;
  spray_feature_2_title: string;
  spray_feature_2_desc: string;
  spray_feature_3_title: string;
  spray_feature_3_desc: string;
  spray_cta: string;

  // Catalog Section
  catalog_badge: string;
  catalog_title: string;
  catalog_subtitle: string;
  catalog_filter_all: string;
  catalog_filter_shapewear: string;
  catalog_filter_dresses: string;
  catalog_filter_protection: string;
  catalog_filter_sets: string;
  catalog_add_to_cart: string;
  catalog_added: string;
  catalog_quick_view: string;
  catalog_view_details: string;

  // Benefits / Values
  value_1_title: string;
  value_1_desc: string;
  value_2_title: string;
  value_2_desc: string;
  value_3_title: string;
  value_3_desc: string;
  value_4_title: string;
  value_4_desc: string;

  // Cart Drawer & Modals
  cart_title: string;
  cart_empty: string;
  cart_empty_sub: string;
  cart_subtotal: string;
  cart_shipping: string;
  cart_shipping_free: string;
  cart_total: string;
  cart_checkout_btn: string;
  cart_clear: string;

  // Footer
  footer_tagline: string;
  footer_links_title: string;
  footer_help_title: string;
  footer_location_title: string;
  footer_location_address: string;
  footer_rights: string;

  // General & Notifications
  toast_added_to_cart: string;
  toast_order_success: string;
  lang_switch_tooltip: string;
}

const translations: Record<Language, Translations> = {
  en: {
    // Navigation & Header
    nav_tagline: "Brooklyn Luxury Boutique",
    nav_shipping_banner: "✨ Free Express Shipping on orders over $99 across USA | Isafer Luxe Collection ✨",
    nav_home: "Home",
    nav_catalog: "Catalog",
    nav_pepper_spray: "Self-Defense",
    nav_about: "Our Story",
    nav_faq: "FAQ",
    nav_search_placeholder: "Search shapewear, dresses, pepper spray...",
    nav_account: "Account",
    nav_cart: "Cart",
    nav_admin: "Admin",

    // Hero Section
    hero_badge: "NEW BARBIE LUXE COLLECTION 👑",
    hero_title_1: "Sexy, Elegant &",
    hero_title_2: "Sculpting Power",
    hero_subtitle: "Highlight your natural curves with premium shapewear, glamorous dresses, and chic discreet self-defense pepper sprays. Designed in Brooklyn, NY for the empowered woman.",
    hero_cta_primary: "Explore Collection",
    hero_cta_secondary: "View Self-Defense Spray",
    hero_stat_1_num: "100%",
    hero_stat_1_label: "Sculpting Comfort",
    hero_stat_2_num: "24/7",
    hero_stat_2_label: "Protection & Style",
    hero_stat_3_num: "4.9★",
    hero_stat_3_label: "Brooklyn Reviews",

    // Pepper Spray / Protection Banner
    spray_badge: "ISAFER DEFENSE LINE 💖",
    spray_title: "Chic Protection. Maximum Safety.",
    spray_subtitle: "Your safety should never compromise your elegance. Sleek, powerful, and stylish pepper sprays created to give you total confidence wherever you go.",
    spray_feature_1_title: "Maximum Strength Gel",
    spray_feature_1_desc: "Police-grade OC pepper gel with UV dye for instant intruder identification.",
    spray_feature_2_title: "Ergonomic & Discreet",
    spray_feature_2_desc: "Fits perfectly in your purse, handbag, or pocket with quick-release safety lock.",
    spray_feature_3_title: "Luxe Metallic Finish",
    spray_feature_3_desc: "Available in signature Barbie Hot Pink and Rose Gold metallic accents.",
    spray_cta: "Get Yours Now - $24.99",

    // Catalog Section
    catalog_badge: "EXCLUSIVES 2026",
    catalog_title: "Featured Collection",
    catalog_subtitle: "Curated pieces engineered to embrace your confidence and silhouette.",
    catalog_filter_all: "All Products",
    catalog_filter_shapewear: "Shapewear & Body",
    catalog_filter_dresses: "Glam Dresses",
    catalog_filter_protection: "Self-Defense Spray",
    catalog_filter_sets: "Luxe Sets",
    catalog_add_to_cart: "Add to Bag",
    catalog_added: "Added!",
    catalog_quick_view: "Quick View",
    catalog_view_details: "View Product",

    // Benefits / Values
    value_1_title: "Express US Shipping",
    value_1_desc: "Fast delivery directly from our Brooklyn distribution hub.",
    value_2_title: "Discreet Packaging",
    value_2_desc: "Your order arrives in elegant, confidential packaging.",
    value_3_title: "Premium Materials",
    value_3_desc: "Ultra-breathable contour fabrics with medical-grade support.",
    value_4_title: "Easy 30-Day Returns",
    value_4_desc: "Satisfaction guaranteed on all unworn boutique apparel.",

    // Cart Drawer & Modals
    cart_title: "Your Shopping Bag",
    cart_empty: "Your bag is currently empty",
    cart_empty_sub: "Discover our sculpt collection or chic defense sprays to get started.",
    cart_subtotal: "Subtotal",
    cart_shipping: "Shipping",
    cart_shipping_free: "FREE (Orders over $99)",
    cart_total: "Total",
    cart_checkout_btn: "Proceed to Checkout",
    cart_clear: "Clear Bag",

    // Footer
    footer_tagline: "Empowering women with confidence, elegance, and safety.",
    footer_links_title: "Boutique",
    footer_help_title: "Customer Care",
    footer_location_title: "Showroom Location",
    footer_location_address: "Brooklyn, New York, NY 11201, USA",
    footer_rights: "© 2026 Isafer Boutique. All rights reserved.",

    // General & Notifications
    toast_added_to_cart: "Item added to your bag!",
    toast_order_success: "Thank you for your order!",
    lang_switch_tooltip: "Switch language / Cambiar idioma",
  },
  es: {
    // Navigation & Header
    nav_tagline: "Boutique de Lujo en Brooklyn",
    nav_shipping_banner: "✨ Envío Express gratis en pedidos superiores a $99 en todo EE. UU. | Colección Isafer Luxe ✨",
    nav_home: "Inicio",
    nav_catalog: "Catálogo",
    nav_pepper_spray: "Autodefensa",
    nav_about: "Nuestra Historia",
    nav_faq: "Preguntas Frecuentes",
    nav_search_placeholder: "Buscar fajas, vestidos, gas pimienta...",
    nav_account: "Mi Cuenta",
    nav_cart: "Carrito",
    nav_admin: "Admin",

    // Hero Section
    hero_badge: "NUEVA COLECCIÓN BARBIE LUXE 👑",
    hero_title_1: "Sensual, Elegante y",
    hero_title_2: "Efecto Moldeador",
    hero_subtitle: "Realza tus curvas naturales con fajas de moldeado superior, vestidos glamurosos y elegantes aerosoles de pimienta para tu seguridad. Diseñado en Brooklyn, NY.",
    hero_cta_primary: "Explorar Colección",
    hero_cta_secondary: "Ver Spray de Seguridad",
    hero_stat_1_num: "100%",
    hero_stat_1_label: "Confort y Horma",
    hero_stat_2_num: "24/7",
    hero_stat_2_label: "Protección y Estilo",
    hero_stat_3_num: "4.9★",
    hero_stat_3_label: "Reseñas en Brooklyn",

    // Pepper Spray / Protection Banner
    spray_badge: "LÍNEA DE DEFENSA ISAFER 💖",
    spray_title: "Protección Chic. Máxima Seguridad.",
    spray_subtitle: "Tu seguridad no compromete tu elegancia. Aerosoles de pimienta potentes, sofisticados y portátiles para tu tranquilidad constante.",
    spray_feature_1_title: "Gel de Máxima Potencia",
    spray_feature_1_desc: "Fórmula de gas pimienta OC de grado policial con tinte UV para identificación inmediata.",
    spray_feature_2_title: "Ergonómico y Discreto",
    spray_feature_2_desc: "Tamaño perfecto para tu bolso o bolsillo con bloqueo de seguridad de disparo rápido.",
    spray_feature_3_title: "Acabado Metálico Luxe",
    spray_feature_3_desc: "Disponible en tono rosa Barbie exclusivo y acabados en oro rosa.",
    spray_cta: "Consigue el tuyo - $24.99",

    // Catalog Section
    catalog_badge: "EXCLUSIVOS 2026",
    catalog_title: "Colección Destacada",
    catalog_subtitle: "Prendas seleccionadas y diseñadas para empoderar tu silueta con elegancia.",
    catalog_filter_all: "Todos los Productos",
    catalog_filter_shapewear: "Fajas y Moldes",
    catalog_filter_dresses: "Vestidos Glam",
    catalog_filter_protection: "Gas Pimienta",
    catalog_filter_sets: "Conjuntos Luxe",
    catalog_add_to_cart: "Añadir a la Bolsa",
    catalog_added: "¡Añadido!",
    catalog_quick_view: "Vista Rápida",
    catalog_view_details: "Ver Producto",

    // Benefits / Values
    value_1_title: "Envíos Rápidos en EE. UU.",
    value_1_desc: "Envíos directos desde nuestra sede en Brooklyn.",
    value_2_title: "Empaque Discreto",
    value_2_desc: "Recibe tu compra en cajas y empaques elegantes y confidenciales.",
    value_3_title: "Materiales Premium",
    value_3_desc: "Telas moldeadoras transpirables de soporte médico y alta durabilidad.",
    value_4_title: "Devoluciones de 30 Días",
    value_4_desc: "Garantía de satisfacción en prendas sin uso.",

    // Cart Drawer & Modals
    cart_title: "Tu Bolsa de Compras",
    cart_empty: "Tu bolsa está vacía",
    cart_empty_sub: "Descubre nuestra colección moldeadora o los sprays de seguridad para empezar.",
    cart_subtotal: "Subtotal",
    cart_shipping: "Envío",
    cart_shipping_free: "GRATIS (Pedidos > $99)",
    cart_total: "Total",
    cart_checkout_btn: "Finalizar Compra",
    cart_clear: "Vaciar Bolsa",

    // Footer
    footer_tagline: "Empoderando a la mujer con elegancia, estilo y seguridad.",
    footer_links_title: "Boutique",
    footer_help_title: "Atención al Cliente",
    footer_location_title: "Ubicación Showroom",
    footer_location_address: "Brooklyn, New York, NY 11201, EE. UU.",
    footer_rights: "© 2026 Isafer Boutique. Todos los derechos reservados.",

    // General & Notifications
    toast_added_to_cart: "¡Producto añadido a tu bolsa!",
    toast_order_success: "¡Gracias por tu compra!",
    lang_switch_tooltip: "Cambiar idioma / Switch language",
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof Translations) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("isafer_lang") as Language;
      if (saved === "en" || saved === "es") return saved;
    }
    // Default to 'en' (USA English) as explicitly requested by user
    return "en";
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== "undefined") {
      localStorage.setItem("isafer_lang", lang);
      document.documentElement.lang = lang;
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      document.documentElement.lang = language;
    }
  }, [language]);

  const t = (key: keyof Translations): string => {
    return translations[language]?.[key] || translations.en[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useTranslation must be used within a LanguageProvider");
  }
  return context;
};
