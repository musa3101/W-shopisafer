import React, { useEffect, useState } from "react";

export function InitialLoader() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1600); // 1.6s crisp initial load
    return () => clearTimeout(timer);
  }, []);

  if (!loading) return null;

  const text = "ISÀFER BOUTIQUE";

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-zinc-950">
      <style>{`
        .isafer-loader-wrapper {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          height: 120px;
          width: auto;
          margin: 2rem;

          font-family: "Playfair Display", "Times New Roman", serif;
          font-size: 1.8em;
          font-weight: 300;
          user-select: none;
          color: #fda4af; /* rose-300 */
          letter-spacing: 0.25em;
          scale: 1.2;
        }

        @media (min-width: 640px) {
          .isafer-loader-wrapper {
            scale: 1.6;
          }
        }


        .isafer-loader-letter {
          display: inline-block;
          opacity: 0;
          animation: isafer-loader-letter-anim 4s infinite linear;
          z-index: 2;
        }

        @keyframes isafer-loader-letter-anim {
          0% {
            filter: blur(4px);
            opacity: 0;
          }
          5% {
            opacity: 1;
            text-shadow: 0 0 8px rgba(253, 164, 175, 0.6);
            filter: blur(0px);
            transform: translateY(-1px);
          }
          20% {
            opacity: 0.8;
            text-shadow: 0 0 0px transparent;
            filter: blur(0px);
          }
          100% {
            filter: blur(2px);
            opacity: 0;
          }
        }
      `}</style>
      <div className="isafer-loader-wrapper">
        {text.split("").map((letter, index) => (
          <span
            key={index}
            className="isafer-loader-letter"
            style={{ 
              animationDelay: `${0.1 + index * 0.105}s`,
              width: letter === " " ? "0.5em" : "auto"
            }}
          >
            {letter}
          </span>
        ))}
      </div>
    </div>
  );
}
