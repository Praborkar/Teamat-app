import React, { useEffect, useState } from "react";
import logo from "../assets/logo.png";

export default function SplashScreen({ onComplete }) {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFadeOut(true);
      setTimeout(onComplete, 800); // Wait for fade out animation
    }, 2200);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className={`
      fixed inset-0 z-[9999] flex items-center justify-center bg-white font-space
      transition-opacity duration-1000 ease-in-out
      ${fadeOut ? "opacity-0 pointer-events-none" : "opacity-100"}
    `}>
      <div className="text-center space-y-6 animate-in fade-in zoom-in duration-1000 fill-mode-forwards px-6 max-w-lg">
        <div className="relative inline-block">
          <img 
            src={logo} 
            alt="Teamat Logo" 
            className="w-full h-auto drop-shadow-[0_20px_60px_rgba(0,0,0,0.08)]"
          />
        </div>
        <p className="text-[var(--text-muted)] text-[11px] md:text-sm font-black tracking-[0.2em] animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-500 fill-mode-forwards uppercase whitespace-nowrap">
          Where teams communicate effortlessly
        </p>

        <div className="absolute bottom-12 left-1/2 -translate-x-1/2">
           <p className="text-[var(--text-muted)] text-[10px] font-black tracking-widest opacity-40 uppercase">
             Version 1.0
           </p>
        </div>
      </div>
    </div>
  );
}
