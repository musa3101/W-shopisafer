import logoHeaderChic from "@/assets/logo-header-chic.png";
import logoFooterChic from "@/assets/logo-footer-chic.png";

interface IsaferLogoProps {
  variant?: "light" | "dark" | "gold" | "white";
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

export function IsaferLogo({
  variant = "dark",
  className = "",
  size = "md",
}: IsaferLogoProps) {
  const sizeClasses = {
    sm: "h-10 sm:h-12",
    md: "h-14 sm:h-16",
    lg: "h-20 sm:h-24",
    xl: "h-28 sm:h-36",
  }[size];

  // Determinar la imagen del logo según variante
  const isDarkTheme = variant === "dark" || variant === "white" || variant === "gold";
  const logoSrc = isDarkTheme ? logoFooterChic : logoHeaderChic;

  return (
    <div className={`inline-flex items-center justify-center select-none ${className}`}>
      {/* Logo oscuro chic con brillo (mariposa dorada/rosa brillante sobre fondo negro) */}
      {isDarkTheme ? (
        <div className="relative group overflow-hidden rounded-2xl border border-rose-500/20 bg-zinc-950 p-1 shadow-lg shadow-rose-950/40 transition-all hover:scale-105 hover:border-rose-400/40">
          <img
            src={logoFooterChic}
            alt="ISAFÉR BOUTIQUE BROOKLYN"
            className={`${sizeClasses} w-auto object-contain filter drop-shadow-md rounded-xl`}
          />
        </div>
      ) : (
        /* Logo claro chic para el navbar/header con fondo claro o adaptable a dark mode */
        <div className="relative group flex items-center justify-center transition-transform hover:scale-105">
          {/* Mostramos el logo claro chic en modo light y el oscuro en dark mode */}
          <img
            src={logoHeaderChic}
            alt="ISAFÉR BOUTIQUE BROOKLYN"
            className={`${sizeClasses} w-auto object-contain dark:hidden rounded-xl shadow-sm`}
          />
          <img
            src={logoFooterChic}
            alt="ISAFÉR BOUTIQUE BROOKLYN"
            className={`${sizeClasses} w-auto object-contain hidden dark:block rounded-xl shadow-lg border border-rose-500/30 bg-zinc-950 p-1`}
          />
        </div>
      )}
    </div>
  );
}
