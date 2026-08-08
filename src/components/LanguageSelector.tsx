import React from "react";
import { useTranslation } from "../lib/i18n";
import { Globe } from "lucide-react";

export const LanguageSelector: React.FC = () => {
  const { language, setLanguage, t } = useTranslation();

  return (
    <div 
      className="inline-flex items-center gap-1.5 p-1 rounded-full bg-white border border-rose-200/80 shadow-sm transition-all hover:border-rose-300"
      title={t("lang_switch_tooltip")}
    >
      <div className="pl-2 flex items-center text-rose-500">
        <Globe className="w-3.5 h-3.5" />
      </div>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => setLanguage("en")}
          className={`px-3 py-1 rounded-full text-[10px] font-extrabold tracking-widest uppercase transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
            language === "en"
              ? "bg-rose-500 text-white shadow-sm scale-105 font-mono"
              : "text-zinc-600 hover:text-zinc-950 hover:bg-rose-50/50 font-mono"
          }`}
          aria-label="Switch to English (US)"
        >
          <span>🇺🇸</span>
          <span>EN</span>
        </button>
        <button
          type="button"
          onClick={() => setLanguage("es")}
          className={`px-3 py-1 rounded-full text-[10px] font-extrabold tracking-widest uppercase transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
            language === "es"
              ? "bg-rose-500 text-white shadow-sm scale-105 font-mono"
              : "text-zinc-600 hover:text-zinc-950 hover:bg-rose-50/50 font-mono"
          }`}
          aria-label="Cambiar a Español"
        >
          <span>🇪🇸</span>
          <span>ES</span>
        </button>
      </div>
    </div>
  );
};
