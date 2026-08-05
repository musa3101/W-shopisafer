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
  catalog_show_more: string;
  catalog_show_less: string;

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

  // Trending Section
  trending_title: string;
  trending_subtitle: string;

  // Navigation Menu Items
  nav_menu_collection: string;
  nav_menu_categories: string;
  nav_menu_seal: string;
  nav_menu_visit: string;

  // Favorites Modal & Drawer
  fav_modal_title: string;
  fav_modal_desc: string;
  fav_modal_login_btn: string;
  fav_modal_guest_btn: string;
  fav_drawer_title: string;
  fav_drawer_empty: string;
  fav_drawer_empty_sub: string;

  // Cookies & Geo Banners
  cookies_text: string;
  cookies_policy_link: string;
  cookies_settings_btn: string;
  cookies_reject_btn: string;
  cookies_accept_btn: string;
  geo_title_es: string;
  geo_title_en: string;
  geo_change_loc_es: string;
  geo_change_loc_en: string;
  geo_desc_es: string;
  geo_desc_en: string;
  geo_no: string;
  geo_yes_es: string;
  geo_yes_en: string;

  // Auth Dialog
  auth_title: string;
  auth_subtitle: string;
  auth_tab_client: string;
  auth_tab_admin: string;
  auth_client_desc: string;
  auth_google_btn: string;
  auth_admin_desc: string;
  auth_admin_user_label: string;
  auth_admin_pass_label: string;
  auth_admin_submit: string;

  // Newsletter & Fullscreen Menu
  newsletter_title: string;
  newsletter_subtitle: string;
  newsletter_placeholder: string;
  newsletter_btn: string;
  footer_payments_title: string;
  mobile_menu_close: string;
  mobile_menu_search: string;
  mobile_menu_title: string;
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
    catalog_show_more: "Show Full Collection",
    catalog_show_less: "Show Less",

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

    // Trending Section
    trending_title: "Trending Now",
    trending_subtitle: "Our most popular styles handpicked for you.",

    // Navigation Menu Items
    nav_menu_collection: "New Collection",
    nav_menu_categories: "Bento Categories",
    nav_menu_seal: "The Isafer Seal",
    nav_menu_visit: "Visit Brooklyn",

    // Favorites Modal & Drawer
    fav_modal_title: "Added to My Wishlist",
    fav_modal_desc: "We saved your outfit to a temporary wishlist. Sign in or create an account to store your favorites permanently!",
    fav_modal_login_btn: "Sign In or Register",
    fav_modal_guest_btn: "Continue as Guest",
    fav_drawer_title: "My Favorites Wishlist",
    fav_drawer_empty: "No favorites saved yet",
    fav_drawer_empty_sub: "Tap the heart icon on any outfit to save it here.",

    // Cookies & Geo Banners
    cookies_text: "We use cookies to analyze traffic, personalize your shopping experience, and deliver relevant promotions. You can accept, decline, or manage your preferences.",
    cookies_policy_link: "Cookie Policy",
    cookies_settings_btn: "Cookie Settings",
    cookies_reject_btn: "Decline Cookies",
    cookies_accept_btn: "Accept Cookies",
    geo_title_es: "Browsing from Spain",
    geo_title_en: "Browsing from USA",
    geo_change_loc_es: "Change location",
    geo_change_loc_en: "Change location",
    geo_desc_es: "Would you like to switch the language to Spanish?",
    geo_desc_en: "Would you like to save your location and switch language to English?",
    geo_no: "No",
    geo_yes_es: "Yes, Switch to Spanish 🇪🇸",
    geo_yes_en: "Yes, Switch to English 🇺🇸",

    // Auth Dialog
    auth_title: "My Account · Isafer Boutique",
    auth_subtitle: "Track your orders or log into the boutique admin portal.",
    auth_tab_client: "Customers (Google)",
    auth_tab_admin: "Boutique Owner",
    auth_client_desc: "Quickly sign in with Google to check order history and shipping updates.",
    auth_google_btn: "Sign in with Google",
    auth_admin_desc: "Boutique Owner Credentials:",
    auth_admin_user_label: "Admin Email or Username",
    auth_admin_pass_label: "Password",
    auth_admin_submit: "Enter Admin Panel",

    // Newsletter & Fullscreen Menu
    newsletter_title: "JOIN THE BARBIE LUXE CLUB 💖",
    newsletter_subtitle: "Get 10% OFF on your first order & secret drop alerts.",
    newsletter_placeholder: "Enter your email address...",
    newsletter_btn: "Join VIP Club",
    footer_payments_title: "100% Guaranteed Safe Checkout",
    mobile_menu_close: "Close Menu",
    mobile_menu_search: "Search outfits, shapewear...",
    mobile_menu_title: "BARBIE LUXE NAVIGATION",
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
    catalog_show_more: "Ver Colección Completa",
    catalog_show_less: "Ver Menos",

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

    // Trending Section
    trending_title: "Tendencias de la Semana",
    trending_subtitle: "Nuestros estilos más populares elegidos para ti.",

    // Navigation Menu Items
    nav_menu_collection: "Nueva Colección",
    nav_menu_categories: "Categorías Bento",
    nav_menu_seal: "El Sello Isafer",
    nav_menu_visit: "Visítanos en Brooklyn",

    // Favorites Modal & Drawer
    fav_modal_title: "Añadido a la lista de Mis Favoritos",
    fav_modal_desc: "Hemos añadido tu prenda a una lista temporal. Inicia sesión en tu cuenta o regístrate para que podamos almacenar tus favoritos por más tiempo.",
    fav_modal_login_btn: "Acceder o crear cuenta nueva",
    fav_modal_guest_btn: "Continuar como invitado",
    fav_drawer_title: "Mi Lista de Favoritos",
    fav_drawer_empty: "Aún no tienes favoritos guardados",
    fav_drawer_empty_sub: "Pulsa el icono de corazón en cualquier prenda para guardarla aquí.",

    // Cookies & Geo Banners
    cookies_text: "Utilizamos cookies propias y de terceros para conocer los usos de nuestra tienda online y poder mejorarla, adaptar el contenido a tus gustos y personalizar nuestros anuncios, marketing y publicaciones en redes sociales. Puedes aceptarlas todas, rechazarlas o elegir tu configuración pulsando los botones correspondientes.",
    cookies_policy_link: "Política de Cookies",
    cookies_settings_btn: "Configuración de Cookies",
    cookies_reject_btn: "Rechazar Cookies",
    cookies_accept_btn: "Aceptar Cookies",
    geo_title_es: "Estás navegando en España",
    geo_title_en: "You are browsing from USA",
    geo_change_loc_es: "Cambiar ubicación",
    geo_change_loc_en: "Change location",
    geo_desc_es: "¿Quieres guardar tu ubicación y cambiar el idioma a Español?",
    geo_desc_en: "Would you like to save your location and switch language to English?",
    geo_no: "No",
    geo_yes_es: "Sí, cambiar a Español 🇪🇸",
    geo_yes_en: "Yes, switch to English 🇺🇸",

    // Auth Dialog
    auth_title: "Mi Cuenta · Isafer Boutique",
    auth_subtitle: "Accede a tu historial de pedidos o entra al panel de administración de la tienda.",
    auth_tab_client: "Clientas (Google)",
    auth_tab_admin: "Dueña / Admin",
    auth_client_desc: "Inicia sesión rápidamente con tu cuenta de Google para consultar el estado de tus compras y pedidos realizados.",
    auth_google_btn: "Iniciar sesión con Google",
    auth_admin_desc: "Credenciales de Acceso Dueña:",
    auth_admin_user_label: "Usuario o Email de Administración",
    auth_admin_pass_label: "Contraseña",
    auth_admin_submit: "Entrar al Panel de Control",

    // Newsletter & Fullscreen Menu
    newsletter_title: "ÚNETE AL CLUB BARBIE LUXE 💖",
    newsletter_subtitle: "Consigue 10% OFF en tu primer pedido y avisos VIP de lanzamientos secretos.",
    newsletter_placeholder: "Escribe tu correo electrónico...",
    newsletter_btn: "Unirme VIP",
    footer_payments_title: "Pagos 100% Seguros Garantizados",
    mobile_menu_close: "Cerrar Menú",
    mobile_menu_search: "Buscar prendas, fajas...",
    mobile_menu_title: "NAVEGACIÓN BARBIE LUXE",
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

