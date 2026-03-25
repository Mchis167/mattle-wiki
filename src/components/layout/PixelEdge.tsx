"use client";

import { cn } from "@/lib/utils";

/**
 * PixelEdge — vertical pixel-art border strips.
 * 
 * Reconstructed from Figma node 85:9747 (Left Edge)
 * and 85:9760 (Right Edge).
 */

export type PixelEdgeVariant = "book" | "spread" | "transparent";

/** 
 * Internal Base: Just the 3 strips of pixels with insets.
 * Does NOT have its own background or top/bottom shadows.
 */
function PixelEdge9Base({
  mirrored,
  stripBg,
  inkColor,
}: {
  mirrored: boolean;
  stripBg: string;
  inkColor: string;
}) {
  const strips = [
    { inset: 3, bg: inkColor },
    { inset: 6, bg: stripBg, strokeWeight: 6 },
    { inset: 3, bg: stripBg, strokeWeight: 6 },
  ];

  const ordered = mirrored ? [...strips].reverse() : strips;

  return (
    <div className="flex h-full w-[9px] shrink-0 relative">
      {ordered.map(({ inset, bg, strokeWeight }, i) => (
        <div key={i} className="relative h-full w-[3px]">
          <div
            className="absolute left-0 right-0"
            style={{
              top: inset,
              bottom: inset,
              background: bg,
              ...(strokeWeight ? { boxShadow: `0 -${strokeWeight}px 0 0 ${inkColor}, 0 ${strokeWeight}px 0 0 ${inkColor}` } : {})
            }}
          />
        </div>
      ))}
    </div>
  );
}

/** One 9-px edge group — optionally styled with a background and outer shadows */
export function PixelEdge9({
  mirrored = false,
  inkColor = "var(--wiki-ink)",
  bgColor = "var(--wiki-surface)",
  isLeading = false,
  className,
}: {
  mirrored?: boolean;
  inkColor?: string;
  bgColor?: string;
  isLeading?: boolean;
  className?: string;
}) {
  const content = (
    <PixelEdge9Base
      mirrored={mirrored}
      stripBg={bgColor}
      inkColor={inkColor}
    />
  );

  if (isLeading) {
    return (
      <div className={cn("flex self-stretch shrink-0", className)}>
        {content}
      </div>
    );
  }

  return (
    <div
      className={cn("flex self-stretch shrink-0 relative", className)}
      style={{
        background: bgColor,
        boxShadow: `0 -3px 0 0 ${inkColor}, 0 3px 0 0 ${inkColor}`,
      }}
    >
      {content}
    </div>
  );
}

/** Three 9-px groups stacked = 27px — used as the inner content edge */
export function PixelEdge27({
  mirrored = false,
  inkColor = "var(--wiki-ink)",
  bgColor = "var(--wiki-surface)",
  className,
}: {
  mirrored?: boolean;
  inkColor?: string;
  bgColor?: string;
  className?: string;
}) {
  // Pattern: [Leading/Base] [Styled] [Styled]
  // If mirrored (Right Edge), the leading block should be at the end (the most right).
  // If not mirrored (Left Edge), the leading block should be at the start (the most left).

  const blocks = [
    <PixelEdge9 key={1} mirrored={mirrored} isLeading={true} inkColor={inkColor} bgColor={bgColor} className="h-full" />,
    <PixelEdge9 key={2} mirrored={mirrored} isLeading={false} inkColor={inkColor} bgColor={bgColor} className="h-full" />,
    <PixelEdge9 key={3} mirrored={mirrored} isLeading={false} inkColor={inkColor} bgColor={bgColor} className="h-full" />,
  ];

  if (mirrored) {
    blocks.reverse();
  }

  return (
    <div className={cn("flex self-stretch w-[27px] shrink-0 relative", className)}>
      {blocks}
    </div>
  );
}
