"use client";

import Link from "next/link";

// ─────────────────────────────────────────────────────────────────────────────
// Breadcrumb Item Interface
// ─────────────────────────────────────────────────────────────────────────────

export interface BreadcrumbItem {
  label: string;
  href?: string; // undefined = current page (dimmed text, not a link)
}

// ─────────────────────────────────────────────────────────────────────────────
// Design tokens
// ─────────────────────────────────────────────────────────────────────────────

const CRUMB_BG = "var(--wiki-tab-bg)";

// ─────────────────────────────────────────────────────────────────────────────
// BreadcrumbEdge — same 3-strip pattern as TabEdge but for breadcrumb panel
// ─────────────────────────────────────────────────────────────────────────────

function BreadcrumbEdge() {
  const STRIPS = [
    { startY: 3, bg: CRUMB_BG, shadowTopPx: 6 },
    { startY: 6, bg: CRUMB_BG, shadowTopPx: 6 },
    { startY: 3, bg: "var(--wiki-book)" }, // always-dark separator
  ];

  return (
    <div className="flex self-stretch shrink-0">
      {STRIPS.map(({ startY, bg, shadowTopPx }, i) => (
        <div key={i} className="relative w-[3px] self-stretch">
          <div
            className="absolute left-0 right-0 bottom-0"
            style={{
              top: startY,
              backgroundColor: bg,
              ...(shadowTopPx
                ? { boxShadow: `0 -${shadowTopPx}px 0 0 var(--wiki-surface)` }
                : {}),
            }}
          />
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// BreadcrumbConnector — the pixel-art ">" chevron between breadcrumb items
// ─────────────────────────────────────────────────────────────────────────────

function BreadcrumbConnector() {
  // 12 × 12 pixel-art right-chevron using a 2-px grid
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      aria-hidden="true"
      className="shrink-0"
    >
      <rect x="3" y="2" width="2" height="2" fill="var(--wiki-text-muted)" />
      <rect x="5" y="4" width="2" height="2" fill="var(--wiki-text-muted)" />
      <rect x="7" y="6" width="2" height="2" fill="var(--wiki-text-muted)" />
      <rect x="5" y="8" width="2" height="2" fill="var(--wiki-text-muted)" />
      <rect x="3" y="10" width="2" height="2" fill="var(--wiki-text-muted)" />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// BreadcrumbContainer — used in DetailPage desktop variant
//
// Same stacking trick as Tabs: mr-[-8px] so it tucks under the WikiBadge edge.
// ─────────────────────────────────────────────────────────────────────────────

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export function BreadcrumbContainer({ items }: BreadcrumbProps) {
  return (
    <div
      className="flex items-start relative shrink-0"
      style={{ marginRight: -8, zIndex: 1 }}
    >
      {/* Content panel */}
      <div
        className="flex items-center shrink-0 self-stretch"
        style={{
          backgroundColor: CRUMB_BG,
          boxShadow: "0 -3px 0 0 var(--wiki-surface)", // 3 px outside top stroke
          paddingTop: 2,
          paddingBottom: 5,
          paddingLeft: 26,
          paddingRight: 12,
        }}
      >
        <div className="flex items-center gap-[2px]">
          {items.map((item, idx) => {
            const isLast = idx === items.length - 1;

            return (
              <div key={idx} className="flex items-center gap-[2px]">
                {/* Label */}
                {isLast || !item.href ? (
                  <span
                    className="font-pixel text-[14px] leading-[18px] whitespace-nowrap px-2 py-2"
                    style={{ color: "var(--wiki-text-dimmed)" }}
                  >
                    {item.label}
                  </span>
                ) : (
                  <Link
                    href={item.href}
                    className="font-pixel text-[14px] leading-[18px] whitespace-nowrap px-2 py-2"
                    style={{ color: "var(--wiki-text)" }}
                  >
                    {item.label}
                  </Link>
                )}
                {/* Connector (between items, not after last) */}
                {!isLast && <BreadcrumbConnector />}
              </div>
            );
          })}
        </div>
      </div>

      {/* Right pixel-art edge */}
      <BreadcrumbEdge />
    </div>
  );
}
