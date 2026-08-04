import logoHeaderBarbie from "@/assets/logo-header-barbie.png";
import logoFooterNew from "@/assets/logo-footer.jpg";

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
  const sizeClasses = {
    sm: "h-9 sm:h-11",
    md: "h-12 sm:h-14",
    lg: "h-16 sm:h-20",
    xl: "h-24 sm:h-28",
  }[size];

  const logoSrc = variant === "header" ? logoHeaderBarbie : logoFooterNew;

  return (
    <div className={`inline-flex items-center justify-center select-none ${className}`}>
      <img
        src={logoSrc}
        alt="ISAFÉR BOUTIQUE BROOKLYN"
        className={`${sizeClasses} w-auto object-contain transition-transform duration-300 hover:scale-105 rounded-xl`}
      />
    </div>
  );
}
