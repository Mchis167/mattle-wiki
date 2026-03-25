"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────────────────────
// Design Tokens (matched to Figma and globals.css)
// ─────────────────────────────────────────────────────────────────────────────
const GOLD = "var(--wiki-gold)";
const GOLD_HOVER = "var(--wiki-gold-hover)";
const GOLD_DARK = "var(--wiki-gold-dark)";
const TEXT_COLOR = "var(--wiki-text)";
const TEXT_STROKE = "var(--wiki-border-nav)";
const TEXT_SHADOW = "var(--wiki-deep)";

// ─────────────────────────────────────────────────────────────────────────────
// ButtonEdge — Pixel-art left/right capsule edge
// ─────────────────────────────────────────────────────────────────────────────

interface StripDef {
  startY: number;    // Padding from top AND bottom (symmetric)
  w: number;         // Strip width in px
  dark?: boolean;    // If true, use GOLD_DARK always
  borderPx?: number; // Outside stroke width (box-shadow)
}

const LEFT_STRIPS: StripDef[] = [
  { startY: 9, w: 2, dark: true, borderPx: 5 },
  { startY: 6, w: 1, borderPx: 2 },
  { startY: 6, w: 2, borderPx: 5 },
  { startY: 3, w: 2, borderPx: 2 },
  { startY: 3, w: 2, borderPx: 5 },
];

const RIGHT_STRIPS: StripDef[] = [...LEFT_STRIPS].reverse();

function ButtonEdge({
  strips,
  isHover,
}: {
  strips: StripDef[];
  isHover: boolean;
}) {
  return (
    <div className="flex self-stretch items-stretch shrink-0">
      {strips.map(({ startY, w, dark, borderPx }, i) => {
        const bg = dark ? GOLD_DARK : isHover ? GOLD_HOVER : GOLD;
        const shadow = borderPx
          ? {
              boxShadow: `0 -${borderPx}px 0 0 ${GOLD_DARK}, 0 ${borderPx}px 0 0 ${GOLD_DARK}`,
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
              }}
            />
          </div>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Button component
// ─────────────────────────────────────────────────────────────────────────────

export type ButtonSize = "Large" | "Small";

interface ButtonProps {
  label?: string;
  size?: ButtonSize;
  href?: string;
  target?: string;
  onClick?: () => void;
  className?: string;
  children?: React.ReactNode;
}

export default function Button({
  label = "Play Now",
  size = "Large",
  href,
  target,
  onClick,
  className,
  children,
}: ButtonProps) {
  const [isHovered, setIsHovered] = useState(false);

  const isLarge = size === "Large";
  const bg = isHovered ? GOLD_HOVER : GOLD;

  // 2px outside stroke on top and bottom of main body (matches Figma "Outside" stroke weight 2.0)
  const bodyShadow = `0 -2px 0 0 ${GOLD_DARK}, 0 2px 0 0 ${GOLD_DARK}`;

  // 8-Way Hack for text stroke (1px)
  const strokeColor = TEXT_STROKE;
  const shadowColor = TEXT_SHADOW;
  const textShadow = `
    1px 0 0 ${strokeColor}, -1px 0 0 ${strokeColor}, 
    0 1px 0 ${strokeColor}, 0 -1px 0 ${strokeColor}, 
    1px 1px 0 ${strokeColor}, -1px -1px 0 ${strokeColor}, 
    1px -1px 0 ${strokeColor}, -1px 1px 0 ${strokeColor},
    0px 2px 0 ${shadowColor}, -1px 2px 0 ${shadowColor}, 1px 2px 0 ${shadowColor}
  `.trim();

  const content = children || label;

  const innerContent = (
    <>
      <ButtonEdge strips={LEFT_STRIPS} isHover={isHovered} />

      {/* Main content body */}
      <div
        className={cn(
          "flex items-center justify-center self-stretch shrink-0",
          isLarge ? "px-[10px]" : "px-[6px]"
        )}
        style={{
          backgroundColor: bg,
          boxShadow: bodyShadow,
          transition: "background-color 150ms",
        }}
      >
        <span
          className="font-pixel whitespace-nowrap"
          style={{
            fontSize: isLarge ? 16 : 14,
            lineHeight: isLarge ? "22px" : "18px",
            color: TEXT_COLOR,
            textShadow: textShadow,
          }}
        >
          {content}
        </span>
      </div>

      <ButtonEdge strips={RIGHT_STRIPS} isHover={isHovered} />
    </>
  );

  const sharedProps = {
    className: cn("inline-flex items-start cursor-pointer outline-none", className),
    style: {
      height: isLarge ? 40 : 36,
      paddingTop: 2,
      paddingBottom: 2,
    },
    onMouseEnter: () => setIsHovered(true),
    onMouseLeave: () => setIsHovered(false),
  };

  if (href) {
    const isExternal = href.startsWith("http");
    if (isExternal) {
      return (
        <a
          href={href}
          target={target}
          rel={target === "_blank" ? "noopener noreferrer" : undefined}
          {...sharedProps}
        >
          {innerContent}
        </a>
      );
    }
    return (
      <Link href={href} {...sharedProps}>
        {innerContent}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} {...sharedProps}>
      {innerContent}
    </button>
  );
}
