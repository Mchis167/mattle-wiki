"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import OutlineText from "@/components/ui/OutlineText";

// ─────────────────────────────────────────────────────────────────────────────
// Design Tokens
// ─────────────────────────────────────────────────────────────────────────────
const SURFACE = "var(--wiki-surface)"; // #1d1b16
const DEEP = "var(--wiki-deep)";       // #282001
const BORDER = "var(--wiki-border)";   // #2f2717
const NAV_BORDER = "var(--wiki-border-nav)"; // #211a03
const TEXT = "var(--wiki-text)";       // #f0e9cf
const ENERGY_ICON = "/assets/energy-icon.png";
const BG_TEXTURE = "/assets/char-card-bg.jpg";

// ─────────────────────────────────────────────────────────────────────────────
// Variant config
// ─────────────────────────────────────────────────────────────────────────────
export type CardCharacterVariant = "desktop-default" | "desktop-hover" | "mobile";

interface VariantConfig {
  width: number;
  height: number;
  bodyTop: number;         // px from top where shaped card body starts
  chamfer: number;         // corner chamfer size in px
  charSize: number;        // character sprite size (square)
  charCenterOffsetY: number; // how many px ABOVE the vertical 50% line the char center sits
  energyWidth: number;
  energyHeight: number;
  energyBottom: number;
  titleFontSize: number;
  titleLineHeight: string;
  titleShadowY: number;    // px of drop shadow below title text
  titleTracking?: string;  // letter-spacing
  iconSize: number;
  valueFontSize: number;
  valueLineHeight: string;
}

const CONFIG: Record<CardCharacterVariant, VariantConfig> = {
  "desktop-default": {
    width: 152, height: 218,
    bodyTop: 7, chamfer: 4,
    charSize: 102, charCenterOffsetY: 15.75,
    energyWidth: 72, energyHeight: 40, energyBottom: 3,
    titleFontSize: 16, titleLineHeight: "20px", titleShadowY: 3,
    titleTracking: "0.64px",
    iconSize: 18, valueFontSize: 14, valueLineHeight: "18px",
  },
  "desktop-hover": {
    width: 152, height: 218,
    bodyTop: 7, chamfer: 4,
    charSize: 114, charCenterOffsetY: 19.33,
    energyWidth: 72, energyHeight: 40, energyBottom: 3,
    titleFontSize: 16, titleLineHeight: "20px", titleShadowY: 3,
    titleTracking: "0.64px",
    iconSize: 18, valueFontSize: 14, valueLineHeight: "18px",
  },
  "mobile": {
    width: 100, height: 120,
    bodyTop: 7, chamfer: 3,
    charSize: 50, charCenterOffsetY: 9,
    energyWidth: 56, energyHeight: 28, energyBottom: 3,
    titleFontSize: 10, titleLineHeight: "14px", titleShadowY: 2,
    iconSize: 16, valueFontSize: 12, valueLineHeight: "16px",
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// CardBorderOverlay
//
// Absolutely positioned over the card body. All strips are transparent with
// colored bands at top/bottom (using CSS gradient), matching the "borrder"
// layer in Figma (node 1:4054).
//
// Left edge  (left → right): [0px-gap border] [3px-gap border] [0px-gap border]
// Right edge (left → right): [0px-gap border] [3px-gap border] [6px-gap solid]
// Middle body: 3px border bands at top and bottom only
// ─────────────────────────────────────────────────────────────────────────────
function CardBorderStrip({
  inset,
  borderWeight,
  isSolid = false,
}: {
  inset: number;
  borderWeight?: number;
  isSolid?: boolean;
}) {
  const bg = isSolid
    ? BORDER
    : `linear-gradient(${BORDER} ${borderWeight}px, transparent ${borderWeight}px, transparent calc(100% - ${borderWeight}px), ${BORDER} calc(100% - ${borderWeight}px))`;

  return (
    <div className="relative w-[3px] self-stretch shrink-0">
      <div
        className="absolute inset-x-0"
        style={{ top: inset, bottom: inset, background: bg }}
      />
    </div>
  );
}

function CardBorderOverlay() {
  const middleBg = `linear-gradient(${BORDER} 3px, transparent 3px, transparent calc(100% - 3px), ${BORDER} calc(100% - 3px))`;

  return (
    <div className="absolute inset-0 flex items-stretch pointer-events-none">
      {/* Left edge: 3 strips */}
      <CardBorderStrip inset={6} isSolid />
      <CardBorderStrip inset={3} borderWeight={6} />
      <CardBorderStrip inset={0} borderWeight={6} />

      {/* Middle body — top/bottom 3px border bands only */}
      <div className="flex-1" style={{ background: middleBg }} />

      {/* Right edge: 3 strips (last one is solid, not gradient) */}
      <CardBorderStrip inset={0} borderWeight={6} />
      <CardBorderStrip inset={3} borderWeight={6} />
      <CardBorderStrip inset={6} isSolid />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// EnergyEdge
//
// Pixel-art corner edge for the energy bar (matches Figma "Edge" sub-layers
// inside "EnergyComsume", node 1:4071 and 1:4081).
//
// Left  strips (L→R): solid-BORDER | DEEP+6px-top | DEEP+6px-top
// Right strips (L→R): DEEP+6px-top | DEEP+6px-top | solid-BORDER
// ─────────────────────────────────────────────────────────────────────────────
interface EnergyStripDef {
  startY: number;
  bg: string;
  borderTopPx?: number;
}

const ENERGY_LEFT_STRIPS: EnergyStripDef[] = [
  { startY: 3, bg: BORDER },
  { startY: 6, bg: DEEP, borderTopPx: 6 },
  { startY: 3, bg: DEEP, borderTopPx: 6 },
];

const ENERGY_RIGHT_STRIPS: EnergyStripDef[] = [
  { startY: 3, bg: DEEP, borderTopPx: 6 },
  { startY: 6, bg: DEEP, borderTopPx: 6 },
  { startY: 3, bg: BORDER },
];

function EnergyEdge({ mirrored }: { mirrored?: boolean }) {
  const strips = mirrored ? ENERGY_RIGHT_STRIPS : ENERGY_LEFT_STRIPS;
  return (
    <div className="flex self-stretch shrink-0">
      {strips.map(({ startY, bg, borderTopPx }, i) => (
        <div key={i} className="relative w-[3px] self-stretch">
          <div
            className="absolute inset-x-0 bottom-0"
            style={{
              top: startY,
              backgroundColor: bg,
              ...(borderTopPx
                ? { boxShadow: `0 -${borderTopPx}px 0 0 ${BORDER}` }
                : {}),
            }}
          />
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MainCardCharacter
// ─────────────────────────────────────────────────────────────────────────────
export interface MainCardCharacterProps {
  charName?: string;
  energyCost?: number;
  /** Path to the character sprite image */
  characterImage: string;
  variant?: CardCharacterVariant;
  className?: string;
  onClick?: () => void;
}

export default function MainCardCharacter({
  charName = "Mchis Do",
  energyCost = 7,
  characterImage,
  variant = "desktop-default",
  className,
  onClick,
}: MainCardCharacterProps) {
  const [isHovered, setIsHovered] = useState(false);

  // Drive desktop-hover config when user hovers a desktop card
  const effectiveVariant =
    variant !== "mobile" && isHovered ? "desktop-hover" : variant;
  const c = CONFIG[effectiveVariant];

  const isMobile = variant === "mobile";

  // Chamfered card body shape — all 4 corners
  const ch = c.chamfer;
  const cardClipPath = [
    `${ch}px 0`,
    `calc(100% - ${ch}px) 0`,
    `100% ${ch}px`,
    `100% calc(100% - ${ch}px)`,
    `calc(100% - ${ch}px) 100%`,
    `${ch}px 100%`,
    `0 calc(100% - ${ch}px)`,
    `0 ${ch}px`,
  ].join(", ");

  return (
    <div
      className={cn(
        "relative shrink-0 cursor-pointer select-none transition-all duration-300 ease-in-out",
        isHovered && "scale-[1.02] -translate-y-1",
        className
      )}
      style={{ width: c.width, height: c.height }}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* ── Card body: shaped background + border overlay ── */}
      <div
        className="absolute inset-x-0 bottom-0"
        style={{
          top: c.bodyTop,
          clipPath: `polygon(${cardClipPath})`,
          backgroundColor: SURFACE,
        }}
      >
        {/* Background texture container with polygon mask for step-border alignment */}
        <div
          className="absolute inset-0 overflow-hidden pointer-events-none z-0"
          style={{ padding: "3px 3px", backgroundColor: "#1D1B16" }}
        >
          <div className="relative w-full h-full">
            {/* Default Layer: Subtle Mask */}
            <img
              src={BG_TEXTURE}
              alt=""
              className="absolute inset-0 w-full h-full object-cover block"
              style={{
                opacity: 0.9,
                maskImage: "radial-gradient(156.47% 94.78% at 52.53% 0%, rgba(115, 115, 115, 0.00) 0%, #737373 45%, rgba(217, 217, 217, 0.00) 84.77%)",
                WebkitMaskImage: "radial-gradient(156.47% 94.78% at 52.53% 0%, rgba(115, 115, 115, 0.00) 0%, #737373 45%, rgba(217, 217, 217, 0.00) 84.77%)",
              }}
            />

            {/* Hover Layer: Independent "Light Up" Glow */}
            <img
              src={BG_TEXTURE}
              alt=""
              className={cn(
                "absolute inset-0 w-full h-full object-cover block transition-opacity duration-700 ease-out",
                isHovered ? "opacity-90" : "opacity-0"
              )}
              style={{
                maskImage: "radial-gradient(156.47% 94.78% at 52.53% 0%, #737373 0%, #737373 45%, rgba(217, 217, 217, 0.00) 84.77%)",
                WebkitMaskImage: "radial-gradient(156.47% 94.78% at 52.53% 0%, #737373 0%, #737373 45%, rgba(217, 217, 217, 0.00) 84.77%)",
              }}
            />
          </div>
        </div>


        {/* Border strips (overlay on top of texture) */}
        <div className="absolute inset-0 z-10">
          <CardBorderOverlay />
        </div>
      </div>

      {/* ── Character sprite ── */}
      <div
        className="absolute left-1/2 pointer-events-none transition-all duration-300 ease-out"
        style={{
          width: c.charSize,
          height: c.charSize,
          top: `calc(50% - ${c.charCenterOffsetY}px)`,
          transform: "translate(-50%, -50%)",
          willChange: "width, height, top",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={characterImage}
          alt={charName}
          className="absolute inset-0 size-full object-cover pointer-events-none"
        />
      </div>

      {/* ── Energy bar ── */}
      <div
        className="absolute left-1/2 flex items-start"
        style={{
          bottom: c.energyBottom,
          width: c.energyWidth,
          height: c.energyHeight,
          transform: "translateX(-50%)",
        }}
      >
        <EnergyEdge />

        <div
          className="flex flex-1 items-center justify-center gap-[6px] h-full pr-[3px]"
          style={{
            backgroundColor: DEEP,
            boxShadow: `0 -3px 0 0 ${BORDER}`,
          }}
        >
          <div
            className="relative shrink-0 pointer-events-none"
            style={{ width: c.iconSize, height: c.iconSize }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={ENERGY_ICON}
              alt=""
              className="absolute inset-0 size-full [image-rendering:pixelated]"
            />
          </div>

          <span
            className="font-pixel text-right whitespace-nowrap shrink-0"
            style={{
              color: TEXT,
              fontSize: c.valueFontSize,
              lineHeight: c.valueLineHeight,
            }}
          >
            {energyCost}
          </span>
        </div>

        <EnergyEdge mirrored />
      </div>

      {/* ── Card title ── */}
      <div className="absolute inset-x-0 top-0 flex items-center justify-center">
        <OutlineText
          as="p"
          size={2}
          color="#211a03"
          shadowY={c.titleShadowY}
          shadowColor="#282001"
          className="font-pixel uppercase whitespace-nowrap bg-clip-text text-transparent bg-gradient-to-b from-[#f0e9cf] to-[#908a75]"
          style={{
            fontSize: c.titleFontSize,
            lineHeight: c.titleLineHeight,
            letterSpacing: c.titleTracking,
          }}
        >
          {charName}
        </OutlineText>
      </div>
    </div>
  );
}
