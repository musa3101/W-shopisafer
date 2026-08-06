import logoHeaderBarbie from "@/assets/logo-header-barbie.png";
import logoFooterChic from "@/assets/logo-footer-chic.png";

interface IsaferLogoProps {
  variant?: "header" | "footer";
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

export function IsaferLogo({
  variant = "header",
  className = "",
  size = "md",
}: IsaferLogoProps) {
  if (variant === "footer") {
    const sizeMap = {
      sm: "w-14 h-14",
      md: "w-20 h-20",
      lg: "w-28 h-28",
      xl: "w-36 h-36",
    }[size];

    return (
      <div className={`inline-flex items-center justify-center select-none ${className}`}>
        <div className={`${sizeMap} rounded-full p-1.5 border-2 border-rose-500/90 shadow-[0_0_20px_rgba(244,63,94,0.45)] bg-zinc-950 overflow-hidden flex items-center justify-center transition-all duration-300 hover:scale-105 hover:border-rose-400 hover:shadow-[0_0_25px_rgba(244,63,94,0.65)]`}>
          <img
            src={logoFooterChic}
            alt="ISAFÉR BOUTIQUE BROOKLYN"
            className="w-full h-full object-cover rounded-full"
          />
        </div>
      </div>
    );
  }

  const sizeClasses = {
    sm: "h-9 sm:h-11",
    md: "h-12 sm:h-14",
    lg: "h-16 sm:h-20",
    xl: "h-24 sm:h-28",
  }[size];

  return (
    <div className={`inline-flex items-center justify-center select-none ${className}`}>
      <img
        src={logoHeaderBarbie}
        alt="ISAFÉR BOUTIQUE BROOKLYN"
        className={`${sizeClasses} w-auto object-contain transition-transform duration-300 hover:scale-105 rounded-xl`}
      />
    </div>
  );
}
