"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────────────────────
// Design Tokens (matched to Figma and globals.css)
// ─────────────────────────────────────────────────────────────────────────────
const GOLD = "var(--wiki-gold)";
const GOLD_HOVER = "var(--wiki-gold-hover)";
const GOLD_DARK = "var(--wiki-gold-dark)";
const SURFACE = "var(--wiki-surface)"; // #1d1b16
const TAB_BG = "var(--wiki-tab-bg)";     // #3b382f

// ─────────────────────────────────────────────────────────────────────────────
// PageControlButtonEdge — Pixel-art edge for the 48x48 button
// ─────────────────────────────────────────────────────────────────────────────

interface StripDef {
  startY: number;    // Padding from top AND bottom (symmetric)
  w: number;         // Strip width in px
  dark?: boolean;    // If true, use GOLD_DARK always
  borderPx?: number; // Outside stroke width (box-shadow)
}

// Figma node 17779:66362 (Left edge default right)
// Strip 1: width 3, padding 3, dark gold
// Strip 2: width 3, padding 6, gold, 6px dark gold shadow
// Strip 3: width 3, padding 3, gold, 3px dark gold shadow
const LEFT_STRIPS: StripDef[] = [
  { startY: 3, w: 3, dark: true },
  { startY: 6, w: 3, borderPx: 6 },
  { startY: 3, w: 3, borderPx: 6 },
];

const RIGHT_STRIPS: StripDef[] = [
  { startY: 3, w: 3, borderPx: 6 },
  { startY: 6, w: 3, borderPx: 6 },
  { startY: 3, w: 3, dark: true },
];

function ControlButtonEdge({
  strips,
  isHover,
  disabled,
}: {
  strips: StripDef[];
  isHover: boolean;
  disabled?: boolean;
}) {
  return (
    <div className="flex self-stretch items-stretch shrink-0">
      {strips.map(({ startY, w, dark, borderPx }, i) => {
        let bg = dark ? GOLD_DARK : isHover ? GOLD_HOVER : GOLD;
        let shadowColor = GOLD_DARK;

        if (disabled) {
          bg = dark ? SURFACE : TAB_BG;
          shadowColor = SURFACE;
        }

        const shadow = borderPx
          ? {
            boxShadow: `0 -${borderPx}px 0 0 ${shadowColor}, 0 ${borderPx}px 0 0 ${shadowColor}`,
          }
          : {};

        return (
          <div
            key={i}
            className="relative self-stretch shrink-0"
            style={{ width: w }}
          >
            <div
              className="absolute left-0 right-0"
              style={{
                top: startY,
                bottom: startY,
                backgroundColor: bg,
                ...shadow,
                transition: "background-color 150ms",
              }}
            />
          </div>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Arrow Icon (Pixelated SVG)
// ─────────────────────────────────────────────────────────────────────────────
function ArrowIcon({ direction }: { direction: "left" | "right" }) {
  return (
    <img
      src="/assets/page-control-arrow.png"
      alt=""
      width={22}
      height={22}
      className={cn(
        "shrink-0 [image-rendering:pixelated]",
        direction === "left" && "scale-x-[-1]"
      )}
    />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PageControlButton Component
// ─────────────────────────────────────────────────────────────────────────────

interface PageControlButtonProps {
  direction?: "left" | "right";
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
}

export default function PageControlButton({
  direction = "right",
  disabled = false,
  onClick,
  className,
}: PageControlButtonProps) {
  const [isHovered, setIsHovered] = useState(false);

  const bg = disabled ? TAB_BG : isHovered ? GOLD_HOVER : GOLD;
  const shadowColor = disabled ? SURFACE : GOLD_DARK;

  // 3px outside stroke on top and bottom of main body
  const bodyShadow = `0 -3px 0 0 ${shadowColor}, 0 3px 0 0 ${shadowColor}`;

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "inline-flex items-center shrink-0 h-12 pt-[3px] pb-[3px] outline-none select-none",
        disabled ? "cursor-not-allowed" : "cursor-pointer",
        className
      )}
      onMouseEnter={() => !disabled && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <ControlButtonEdge
        strips={LEFT_STRIPS}
        isHover={isHovered}
        disabled={disabled}
      />

      {/* Main content body (30px center) */}
      <div
        className="flex items-center justify-center self-stretch w-[30px] shrink-0"
        style={{
          backgroundColor: bg,
          boxShadow: bodyShadow,
          transition: "background-color 150ms",
        }}
      >
        <div
          className={cn(
            "flex items-center justify-center transition-opacity duration-150",
            disabled ? "opacity-20" : "opacity-100"
          )}
        >
          <ArrowIcon direction={direction} />
        </div>
      </div>

      <ControlButtonEdge
        strips={RIGHT_STRIPS}
        isHover={isHovered}
        disabled={disabled}
      />
    </button>
  );
}
