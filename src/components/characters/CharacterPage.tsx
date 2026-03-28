"use client";

import { forwardRef } from "react";
import MainCardCharacter from "@/components/detail/MainCardCharacter";
import { urlFor } from "@/sanity/lib/image";
import { Character } from "@/types/character";

// ─────────────────────────────────────────────────────────────────────────────
// Per-page backgrounds (Figma spec)
// ─────────────────────────────────────────────────────────────────────────────
const PAGE_BG_STOPS = "#171511 0%, #1F1C17 10%, #1F1C17 35%, #1D1B16 100%";

const LEFT_PAGE_BG = `linear-gradient(270deg, ${PAGE_BG_STOPS})`;
const RIGHT_PAGE_BG = `linear-gradient(90deg, ${PAGE_BG_STOPS})`;

// Outside stroke (AGENTS.md: box-shadow, not border)
const PAGE_BORDER_SHADOW = "0 -3px 0 0 #171510, 0 3px 0 0 #171510";

// Grid Padding constants
const PAGE_PAD_TOP = "56px";
const PAGE_PAD_BOTTOM = "64px";
const PAGE_PAD_INNER = "56px"; // Side near the spine (Right of left page, Left of right page)
const PAGE_PAD_OUTER = "32px"; // Side near the outer edge

interface CharacterPageProps {
  characters: Character[];
  isRight?: boolean;
}

/**
 * CharacterPage — one page of the flip book.
 *
 * react-pageflip clones each child and injects a DOM ref so it can measure
 * and reposition the element. The ref MUST be forwarded to the outermost div.
 *
 * IMPORTANT: StPageFlip calls `element.style.cssText = "..."` on the ref div,
 * which overwrites ALL inline styles. Keep the ref div free of inline `style`
 * props — visual styles live on child elements instead.
 */
const CharacterPage = forwardRef<HTMLDivElement, CharacterPageProps>(
  ({ characters, isRight = false }, ref) => (
    <div ref={ref}>
      {/* Background on child — safe from StPageFlip's cssText overwrite */}
      <div
        className="absolute inset-0"
        style={{
          background: isRight ? RIGHT_PAGE_BG : LEFT_PAGE_BG,
          boxShadow: PAGE_BORDER_SHADOW,
        }}
      />

      {/* Grid content */}
      <div
        className="absolute inset-0 grid grid-cols-3 grid-rows-3"
        style={{
          padding: isRight
            ? `${PAGE_PAD_TOP} ${PAGE_PAD_OUTER} ${PAGE_PAD_BOTTOM} ${PAGE_PAD_INNER}`
            : `${PAGE_PAD_TOP} ${PAGE_PAD_INNER} ${PAGE_PAD_BOTTOM} ${PAGE_PAD_OUTER}`,
          rowGap: "20px",
          columnGap: "16px",
          justifyItems: "stretch",
          alignItems: "stretch",
        }}
      >
        {characters.map((char) => (
          <MainCardCharacter
            key={char._id}
            charName={char.name}
            energyCost={char.energyCons}
            characterImage={urlFor(char.image).url()}
            fullSize={true}
          />
        ))}
      </div>
    </div>
  )
);

CharacterPage.displayName = "CharacterPage";
export default CharacterPage;
