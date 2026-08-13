import logoHeaderBarbie from "@/assets/logo-header-barbie-transparent.png";
import logoFooter from "@/assets/logo-footer-square.jpg";

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
    const sizeClasses = {
      sm: "w-14 h-14",
      md: "w-20 h-20",
      lg: "w-28 h-28",
      xl: "w-36 h-36",
    }[size];

    return (
      <div
        className={`inline-flex items-center justify-center select-none ${className}`}
      >
        <div
          className={`${sizeClasses} rounded-full bg-[#f8f7f2] border-2 border-rose-300 shadow-[0_0_20px_rgba(244,63,94,0.3)] overflow-hidden flex items-center justify-center transition-transform duration-300 hover:scale-105 hover:border-rose-400`}
        >
          <img
            src={logoFooter}
            alt="ISAFÉR BOUTIQUE BROOKLYN"
            className="w-full h-full object-cover scale-[1.45] origin-center"
          />
        </div>
      </div>
    );
  }

  const sizeClasses = {
    sm: "h-10 sm:h-12",
    md: "h-14 sm:h-16 md:h-18",
    lg: "h-18 sm:h-22",
    xl: "h-26 sm:h-32",
  }[size];

  return (
    <div
      className={`inline-flex items-center justify-center select-none ${className}`}
    >
      <img
        src={logoHeaderBarbie}
        alt="ISAFÉR BOUTIQUE BROOKLYN"
        className={`${sizeClasses} w-auto object-contain transition-transform duration-300 hover:scale-105`}
      />
    </div>
  );
}
