"use client";

import { Suspense, useState, useRef, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import FlipBook3D, { FlipBook3DHandle } from "@/components/ui/FlipBook3D";
import SpreadPagination from "@/components/ui/SpreadPagination";
import CharacterPage from "./CharacterPage";
import { Character } from "@/types/character";

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────
const CHARS_PER_PAGE = 9;

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function chunkArray<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

// ─────────────────────────────────────────────────────────────────────────────
// Inner (needs useSearchParams → requires Suspense boundary)
// ─────────────────────────────────────────────────────────────────────────────

function CharactersFlipBookInner({ characters }: { characters: Character[] }) {
  const searchParams = useSearchParams();

  const pages = useMemo(
    () => chunkArray(characters, CHARS_PER_PAGE),
    [characters]
  );
  const totalSpreads = Math.ceil(pages.length / 2);

  // Read initial spread from URL (?page=1 → spread 0)
  const urlPage = parseInt(searchParams.get("page") ?? "1", 10);
  const initialSpread = Math.min(Math.max(urlPage - 1, 0), totalSpreads - 1);

  // spreadIndex tracks which spread is currently "committed" in the UI
  const [spreadIndex, setSpreadIndex] = useState(initialSpread);
  const isFirst = spreadIndex <= 0;
  const isLast = spreadIndex >= totalSpreads - 1;

  // Imperative ref — lets us call flipNext/flipPrev inside FlipBook3D
  const flipBookRef = useRef<FlipBook3DHandle>(null);

  // SpreadPagination callbacks → trigger animation in FlipBook3D, then sync state
  const handlePrev = () => {
    if (isFirst) return;
    flipBookRef.current?.flipPrev();
    setSpreadIndex((s) => Math.max(s - 1, 0));
  };

  const handleNext = () => {
    if (isLast) return;
    flipBookRef.current?.flipNext();
    setSpreadIndex((s) => Math.min(s + 1, totalSpreads - 1));
  };

  const pageNodes = useMemo(
    () =>
      pages.map((pageChars, i) => (
        <CharacterPage key={i} characters={pageChars} isRight={i % 2 === 1} />
      )),
    [pages]
  );

  if (characters.length === 0) return null;

  return (
    <div className="relative w-full h-full overflow-visible">
      <FlipBook3D
        ref={flipBookRef}
        pages={pageNodes}
        flipDuration={900}
        canFlipNext={!isLast}
        canFlipPrev={!isFirst}
        showBuiltInNav={false}
      />

      {totalSpreads > 1 && (
        <SpreadPagination
          currentPage={spreadIndex + 1}
          totalPages={totalSpreads}
          onPrev={handlePrev}
          onNext={handleNext}
        />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Public export
// ─────────────────────────────────────────────────────────────────────────────

export default function CharactersFlipBook({
  characters,
}: {
  characters: Character[];
}) {
  return (
    <Suspense fallback={null}>
      <CharactersFlipBookInner characters={characters} />
    </Suspense>
  );
}
