"use client";

import Link from "next/link";
import { TabsBar } from "./TabItem";
import { BreadcrumbContainer, type BreadcrumbItem } from "./Breadcrumb";

// ─────────────────────────────────────────────────────────────────────────────
// Design tokens — WikiTitle badge palette
// ─────────────────────────────────────────────────────────────────────────────

const GOLD_GRADIENT = "linear-gradient(to bottom, var(--wiki-gold), var(--wiki-gold-secondary))";
const GOLD_BORDER = "var(--wiki-gold-dark)"; // outside stroke + dark-gold strip colour

// ─────────────────────────────────────────────────────────────────────────────
// TitleEdge — pixel-art edge for the WikiTitle badge
// ─────────────────────────────────────────────────────────────────────────────

interface TitleStripDef {
  startY: number;
  gradient: boolean; // true → gold gradient; false → solid #6b5409
  shadowTopPx?: number; // outside stroke height (box-shadow trick)
}

function TitleEdge({ mirrored = false }: { mirrored?: boolean }) {
  const strips: TitleStripDef[] = mirrored
    ? [
        { startY: 3, gradient: true, shadowTopPx: 6 },
        { startY: 6, gradient: true, shadowTopPx: 6 },
        { startY: 3, gradient: false },
      ]
    : [
        { startY: 3, gradient: false },
        { startY: 6, gradient: true, shadowTopPx: 6 },
        { startY: 3, gradient: true, shadowTopPx: 6 },
      ];

  return (
    <div className="flex self-stretch shrink-0">
      {strips.map(({ startY, gradient, shadowTopPx }, i) => (
        <div key={i} className="relative w-[3px] self-stretch">
          <div
            className="absolute left-0 right-0 bottom-0"
            style={{
              top: startY,
              background: gradient ? GOLD_GRADIENT : GOLD_BORDER,
              ...(shadowTopPx
                ? { boxShadow: `0 -${shadowTopPx}px 0 0 ${GOLD_BORDER}` }
                : {}),
            }}
          />
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// WikiTitleBadge — the gold "$MATTLE WIKI" badge
// ─────────────────────────────────────────────────────────────────────────────

function WikiTitleBadge({ isMobile = false }: { isMobile?: boolean }) {
  const h = isMobile ? 52 : 58;
  const px = isMobile ? 14 : 16;
  const pt = isMobile ? 12 : 14;
  const pb = isMobile ? 14 : 16;
  const size = isMobile ? 24 : 26;

  return (
    <Link
      href="/characters"
      className="flex items-stretch relative shrink-0"
      style={{
        height: h,
        zIndex: 2,
        marginRight: isMobile ? 0 : -8,
      }}
    >
      <TitleEdge />
      <div
        className="flex items-center whitespace-nowrap"
        style={{
          background: GOLD_GRADIENT,
          boxShadow: `0 -3px 0 0 ${GOLD_BORDER}`,
          paddingLeft: px,
          paddingRight: px,
          paddingTop: pt,
          paddingBottom: pb,
        }}
      >
        <span
          className="font-pixel leading-none"
          style={{
            fontSize: size,
            color: "var(--wiki-text)",
            // 8-direction text-shadow (2px) to simulate "outside stroke"
            textShadow: `
              2px 0 0 var(--wiki-border-nav), 
              -2px 0 0 var(--wiki-border-nav), 
              0 2px 0 var(--wiki-border-nav), 
              0 -2px 0 var(--wiki-border-nav), 
              2px 2px 0 var(--wiki-border-nav), 
              -2px -2px 0 var(--wiki-border-nav), 
              2px -2px 0 var(--wiki-border-nav), 
              -2px 2px 0 var(--wiki-border-nav),
              0px 4px 0 var(--wiki-deep),
              -2px 4px 0 var(--wiki-deep),
              2px 4px 0 var(--wiki-deep)
            `,
          }}
        >
          $MATTLE WIKI
        </span>
      </div>
      <TitleEdge mirrored />
    </Link>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PageHeader — public component
// ─────────────────────────────────────────────────────────────────────────────

export type PageHeaderType = "IndexPage" | "DetailPage";

interface PageHeaderProps {
  type?: PageHeaderType;
  isMobile?: boolean;
  /** DetailPage only — breadcrumb trail, last item = current page */
  breadcrumbs?: BreadcrumbItem[];
}

export default function PageHeader({
  type = "IndexPage",
  isMobile = false,
  breadcrumbs = [],
}: PageHeaderProps) {
  const isDetail = type === "DetailPage";

  return (
    <div
      className="flex relative isolate"
      style={{
        alignItems: isMobile ? "center" : "flex-end",
        justifyContent: isMobile ? "center" : "flex-start",
      }}
    >
      <WikiTitleBadge isMobile={isMobile} />

      {!isMobile && !isDetail && <TabsBar />}
      {!isMobile && isDetail && breadcrumbs.length > 0 && (
        <BreadcrumbContainer items={breadcrumbs} />
      )}
    </div>
  );
}

