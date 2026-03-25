"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";

// ─────────────────────────────────────────────────────────────────────────────
// TabEdge — pixel-art right-side staircase corner for each tab
//
// The effect (3 vertical strips, each 3 px wide):
//
//   Strip 1  Strip 2  Strip 3
//   ───────  ───────  ───────
//   gap 3px  gap 6px  gap 3px    ← transparent → shows bg behind tab
//   drk 6px  drk 6px  dark ∞     ← #1d1b16 (separator / border colour)
//   tab ∞    tab ∞               ← tab background colour
//
// KEY: gap is achieved with absolute-positioned inner strip (top: startY).
// Putting paddingTop + backgroundColor on the SAME div doesn't work —
// background-color fills the padding area too, destroying the gap.
// ─────────────────────────────────────────────────────────────────────────────

interface StripDef {
  startY: number;   // how many px from top the strip starts (transparent above)
  bg: string;       // fill colour of the strip body
  borderTopPx?: number; // optional dark border at top of strip
}

function TabEdge({ bgColor }: { bgColor: string }) {
  const STRIPS: StripDef[] = [
    { startY: 3, bg: bgColor, borderTopPx: 6 },
    { startY: 6, bg: bgColor, borderTopPx: 6 },
    { startY: 3, bg: "var(--wiki-surface)" },               // always-dark separator strip
  ];

  return (
    <div className="flex self-stretch shrink-0">
      {STRIPS.map(({ startY, bg, borderTopPx }, i) => (
        // Outer wrapper: transparent, gives the "gap" at the top
        <div key={i} className="relative w-[3px] self-stretch">
          {/* Inner strip: starts at startY, coloured + optional border */}
          <div
            className="absolute left-0 right-0 bottom-0"
            style={{
              top: startY,
              backgroundColor: bg,
              ...(borderTopPx
                ? { boxShadow: `0 -${borderTopPx}px 0 0 var(--wiki-surface)` }
                : {}),
            }}
          />
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TabItem — single tab unit
// ─────────────────────────────────────────────────────────────────────────────

export type TabState = "selected" | "hover" | "enable";

interface TabItemProps {
  label: string;
  state?: TabState;
}

export function TabItem({ label, state = "enable" }: TabItemProps) {
  const [isHovered, setIsHovered] = useState(false);
  const isSelected = state === "selected";
  const isHover = state === "hover" || (isHovered && !isSelected);
  const bgColor = isHover ? "var(--wiki-tab-hover)" : "var(--wiki-tab-bg)";

  return (
    <div
      className="flex items-start cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* ── Label container ── */}
      <div
        className="flex items-center gap-[30px] pb-[13px] pl-[26px] pr-[12px] pt-[10px] relative"
        style={{
          backgroundColor: bgColor,
          boxShadow: "0 -3px 0 0 var(--wiki-surface)",
        }}
      >
        <span
          className="text-[14px] leading-[18px] whitespace-nowrap font-pixel"
          style={{
            color:
              isSelected || isHover
                ? "var(--wiki-text)"
                : "var(--wiki-text-muted)",
          }}
        >
          {label}
        </span>

        {/* Selected indicator (25 × 6 px pixel-art shape, bottom-center) */}
        {isSelected && (
          <div className="absolute bottom-[3px] left-1/2 -translate-x-1/2 w-[25px] h-[6px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/assets/tab-indicator.svg"
              alt=""
              className="w-full h-full"
            />
          </div>
        )}
      </div>

      {/* ── Right pixel-art edge ── */}
      <TabEdge bgColor={bgColor} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TabsBar — assembled tabs with overlap stacking
//
// Each tab has  mr-[-8px]  so the NEXT tab starts 8 px into the current tab's
// 9 px edge.  Z-index decreases left → right, so earlier (active) tabs render
// on top and their edges are never obscured.
// ─────────────────────────────────────────────────────────────────────────────

const TABS = [
  { label: "Characters", href: "/characters" },
  { label: "Abilities", href: "/abilities" },
  { label: "Items", href: "/items" },
  { label: "Monster", href: "/monsters" },
] as const;

export function TabsBar() {
  const pathname = usePathname();

  return (
    <div className="flex items-end isolate pr-[8px]">
      {TABS.map((tab, idx) => {
        const isActive = pathname.startsWith(tab.href);
        const zIndex = TABS.length - idx + 1; // leftmost = highest z

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className="flex items-start -mr-2 relative"
            style={{ zIndex }}
          >
            <TabItem
              label={tab.label}
              state={isActive ? "selected" : "enable"}
            />
          </Link>
        );
      })}
    </div>
  );
}
