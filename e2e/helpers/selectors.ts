/**
 * Selectores centralizados para Isafer Boutique E2E Tests
 *
 * Cambia estos selectores para adaptar la suite a otro proyecto.
 * Se priorizan: data-testid > aria roles > CSS selectors
 */

export const SEL = {
  /* ── Navbar ── */
  navbar: "nav, header",
  logo: 'img[alt*="Isafer"], img[alt*="isafer"], img[alt*="logo"]',
  cartIcon:
    '[aria-label*="carrito" i], [aria-label*="cart" i], button:has(svg)',
  userIcon:
    '[aria-label*="cuenta" i], [aria-label*="user" i], [aria-label*="account" i]',
  menuHamburger:
    '[aria-label*="menú" i], [aria-label*="menu" i], button:has(svg.lucide-menu)',
  languageSelector: '[aria-label*="idioma" i], [aria-label*="language" i]',

  /* ── Hero Section ── */
  heroSection: 'section:first-of-type, [class*="hero" i]',
  heroCta: 'a.group, [class*="cta" i]',
  heroTitle: "h1",

  /* ── InitialLoader ── */
  initialLoader: ".isafer-loader-wrapper",
  initialLoaderOverlay: ".fixed.inset-0.z-\\[9999\\]",

  /* ── Offer Banner ── */
  offerBanner: '[class*="offer" i], [class*="banner" i]',

  /* ── Catálogo / Productos ── */
  catalogSection: '#coleccion, [id*="coleccion" i], [id*="catalog" i]',
  productCard: '[class*="product" i], [class*="card" i]',
  productName: '[class*="product" i] h3, [class*="card" i] h3',
  productPrice: '[class*="price" i], [class*="$" i]',
  trendingCarousel: '[class*="trending" i], [class*="carousel" i]',

  /* ── Product Detail Modal ── */
  productModal: '[role="dialog"]',
  productModalClose: '[role="dialog"] button:has(svg)',
  sizeSelector: 'button[class*="size" i], [aria-label*="talla" i]',
  addToCartBtn:
    'button:has-text("carrito"), button:has-text("Añadir"), button:has-text("Add")',

  /* ── Cart (Sheet lateral) ── */
  cartSheet: '[role="dialog"], [class*="sheet" i]',
  cartItem: '[class*="cart-item" i], [class*="grid"]',
  cartQuantityPlus: "button:has(svg.lucide-plus)",
  cartQuantityMinus: "button:has(svg.lucide-minus)",
  cartRemove: "button:has(svg.lucide-trash)",
  cartEmpty: "text=vacía",
  cartTotal: '[class*="total" i]',
  cartCheckout: 'button:has-text("Pagar"), button:has-text("Checkout")',

  /* ── Auth Dialog ── */
  authDialog: '[role="dialog"]',
  authGoogleBtn: 'button:has-text("Google")',
  authAdminTab: 'button:has-text("Admin"), [role="tab"]:has-text("Admin")',
  authEmailInput: 'input[type="email"], input[placeholder*="email" i]',
  authPasswordInput: 'input[type="password"]',
  authSubmitBtn:
    'button[type="submit"], button:has-text("Iniciar"), button:has-text("Login")',

  /* ── Newsletter ── */
  newsletterSection: 'footer, [class*="newsletter" i]',
  newsletterInput:
    'input[type="email"][placeholder*="email" i], footer input[type="email"]',
  newsletterSubmit:
    'footer button[type="submit"], [class*="newsletter" i] button',

  /* ── Footer ── */
  footer: "footer",
  footerSocialLinks: 'footer a[href*="instagram"], footer a[href*="tiktok"]',
  footerPhone: 'footer a[href*="tel:"], footer a[href*="wa.me"]',

  /* ── Admin ── */
  adminLoginForm: 'form, [class*="login" i]',
  adminEmailInput: 'input[type="email"]',
  adminPasswordInput: 'input[type="password"]',
  adminSubmitBtn: 'button[type="submit"]',

  /* ── Toast notifications ── */
  toast: '[data-sonner-toast], [role="status"]',
  toastSuccess: '[data-type="success"]',
  toastError: '[data-type="error"]',
} as const;
