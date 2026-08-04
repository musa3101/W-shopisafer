import React from "react";
import { useTranslation, Language } from "../lib/i18n";
import { Globe } from "lucide-react";

export const LanguageSelector: React.FC = () => {
  const { language, setLanguage, t } = useTranslation();

  return (
    <div 
      className="inline-flex items-center gap-1.5 p-1 rounded-full bg-black/40 border border-primary/30 backdrop-blur-md shadow-sm transition-all hover:border-primary/60"
      title={t("lang_switch_tooltip")}
    >
      <Globe className="w-3.5 h-3.5 ml-1.5 text-primary animate-pulse" />
      <div className="flex items-center gap-0.5">
        <button
          type="button"
          onClick={() => setLanguage("en")}
          className={`px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wider transition-all duration-200 cursor-pointer ${
            language === "en"
              ? "bg-gradient-to-r from-primary to-amber-400 text-black shadow-md scale-105"
              : "text-muted-foreground hover:text-white"
          }`}
          aria-label="Switch to English (US)"
        >
          🇺🇸 EN
        </button>
        <button
          type="button"
          onClick={() => setLanguage("es")}
          className={`px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wider transition-all duration-200 cursor-pointer ${
            language === "es"
              ? "bg-gradient-to-r from-primary to-amber-400 text-black shadow-md scale-105"
              : "text-muted-foreground hover:text-white"
          }`}
          aria-label="Cambiar a Español"
        >
          🇪🇸 ES
        </button>
      </div>
    </div>
  );
};
