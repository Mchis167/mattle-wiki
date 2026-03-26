"use client";

import NavigationBar from "./NavigationBar";
import PageHeader from "./PageHeader";
import { PixelEdge9, PixelEdge27 } from "./PixelEdge";

/**
 * BookLayout - The definitive "standard" layout for MattleWiki.
 * Follows a strictly layered ZStack approach:
 * 1. Decorative Layer (Background, Edges, Dots, Spine)
 * 2. Structural Layer (VStack with Title and Content Card)
 */
export default function BookLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-wiki-bg overflow-x-hidden">
      <NavigationBar />

      {/* 
        BookLayoutStructure
        Padding 4 bên = 20px (p-5)
        Max width matching Figma 1296px.
      */}
      <div className="relative isolate w-full max-w-[1296px] mx-auto flex-1 flex flex-col p-5 mt-4 mb-5 min-h-[80px]">

        {/* 
          MainContentBackground (Absolute Layer)
          z-index = 1 (using z-10 for safety)
          Width = 100% (absolute left-0 right-0)
          Align Bottom (bottom-0)
          Height = Parent H - 60px (h-[calc(100%-60px)])
        */}
        <div className="absolute left-0 right-0 bottom-0 h-[calc(100%-60px)] z-10 flex select-none pointer-events-none isolate">
          <PixelEdge9 bgColor="var(--wiki-book)" isLeading />
          <div
            className="flex-1 relative"
            style={{
              background: "var(--wiki-book-bg)",
              boxShadow: "0 -3px 0 0 var(--wiki-ink), 0 3px 0 0 var(--wiki-ink)"
            }}
          >
            {/* Center Spine */}
            <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-[3px] bg-[var(--wiki-ink)]" />

            {/* Corner Dots (Using SVG asset) */}
            <img src="/assets/corner-dots.svg" alt="" className="absolute top-[6px] left-[0px] w-2 h-2 shadow-sm" />
            <img src="/assets/corner-dots.svg" alt="" className="absolute top-[6px] right-[0px] w-2 h-2 shadow-sm" />
            <img src="/assets/corner-dots.svg" alt="" className="absolute bottom-[6px] left-[0px] w-2 h-2 shadow-sm" />
            <img src="/assets/corner-dots.svg" alt="" className="absolute bottom-[6px] right-[0px] w-2 h-2 shadow-sm" />
          </div>
          <PixelEdge9 mirrored bgColor="var(--wiki-book)" isLeading />
        </div>

        {/* 
          Content Stack (VStack Layer)
          relative z-20 to sit on top of background
        */}
        <div className="relative z-20 flex-1 flex flex-col">

          {/* PageHeader (Inside VStack) - px-[48px] offset per Figma 85:9768 */}
          <div className="h-[58px] flex items-end shrink-0 px-12 -mb-[2px]">
            <PageHeader type="IndexPage" />
          </div>

          {/* MainContent / Spread area (Inside VStack) */}
          <div className="flex-1 flex pt-[2px] min-h-0">
            {/* Left Content Edge (27px) */}
            <PixelEdge27 bgColor="var(--wiki-surface)" className="z-10" />

            {/* The Spread Card (MainContainer fill W) */}
            <div
              className="flex-1 flex relative text-white"
              style={{ boxShadow: "0 -3px 0 0 var(--wiki-ink), 0 3px 0 0 var(--wiki-ink)" }}
            >
              <div className="absolute inset-0 z-0" style={{ background: "var(--wiki-page-spread)" }} />

              <div className="flex-1 relative z-10 pointer-events-none" />
              <div className="w-[3px] shrink-0 relative z-10 pointer-events-none" style={{ background: "var(--wiki-page-divider)" }} />
              <div className="flex-1 relative z-10 pointer-events-none" />

              {/* Content Overlay - no padding here to allow children to define exact Figma padding */}
              <div className="absolute inset-0 z-20 flex flex-col overflow-visible">
                {children}
              </div>
            </div>

            {/* Right Content Edge (27px) */}
            <PixelEdge27 mirrored bgColor="var(--wiki-surface)" className="z-10" />
          </div>

        </div>
      </div>
    </div>
  );
}
