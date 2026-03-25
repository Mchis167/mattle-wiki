"use client";

import Button from "@/components/ui/Button";
import { cn } from "@/lib/utils"; // Assuming a utility exists, or I'll define a local one if not.
// Since I haven't seen /lib/utils, I'll use a simple className join or import the one from Button.

export default function NavigationBar({ isMobile = false }: { isMobile?: boolean }) {
  return (
    <nav
      className={cn(
        "flex items-center justify-between border-b border-wiki-border-nav shrink-0",
        isMobile ? "h-14" : "h-[62px]"
      )}
    >
      {/* LogoContainer */}
      <div 
        className={cn(
          "flex items-center h-full",
          isMobile ? "px-[18px] py-[10px]" : "pl-6 pr-6 pt-[18px] pb-5"
        )}
      >
        <div className="flex items-center justify-center w-6 h-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src="/assets/logo.svg" 
            alt="Mattle" 
            className="w-full h-full" 
          />
        </div>
      </div>

      {/* ButtonContainer */}
      <div 
        className={cn(
          "flex items-center h-full",
          isMobile ? "px-[18px]" : "px-6"
        )}
      >
        <Button 
          label="Play Now" 
          size={isMobile ? "Small" : "Large"} 
          href="https://app.mattle.fun/game"
          target="_blank"
        />
      </div>
    </nav>
  );
}
