import React from 'react';

interface CtaButtonProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  text?: string;
}

export function CtaButton({ text = "EXPLORAR COLECCIÓN", className = "", ...props }: CtaButtonProps) {
  return (
    <a 
      className={`group relative inline-block text-white pb-2.5 pl-0.5 tracking-[4px] text-sm uppercase mr-2.5 cursor-pointer transition-all duration-300 ease-in-out active:scale-90 border-none bg-transparent font-bold hover:text-pink-50 drop-shadow-md ${className}`}
      {...props}
    >
      {text}
      
      {/* Arrow (\\21DD) */}
      <span className="absolute -top-3 -right-2.5 translate-x-full text-[28px] text-pink-500 group-hover:text-pink-400 leading-none transition-colors duration-300 drop-shadow-[0_0_8px_rgba(236,72,153,0.6)]">
        &#8669;
      </span>
      
      {/* Animated underline */}
      <span className="absolute w-full h-[2px] bottom-0 left-0 bg-pink-500 shadow-[0_0_10px_rgba(236,72,153,0.8)] scale-x-0 origin-bottom-right transition-transform duration-300 ease-out group-hover:scale-x-100 group-hover:origin-bottom-left" />
    </a>
  );
}
