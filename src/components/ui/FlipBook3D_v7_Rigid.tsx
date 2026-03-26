"use client";

/**
 * FlipBook3D.tsx — v7 (Ultimate Optimization)
 *
 * Core fix (v7):
 *   - REMOVED Multi-Segment slicing completely to eliminate layout duplication and image tearing.
 *   - Replaced with Single-Segment Rigid Flip: The animated leaf renders EXACTLY ONCE.
 *   - Retained Double RequestAnimationFrame (dRAF) to perfectly sync React DOM removal with Framer Motion, ending the 1-frame flash.
 *   - Enhanced Dynamic Shading: Bending illusion achieved purely through shifting gradient opacities rather than physical DOM cuts.
 */

import {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
  forwardRef,
  useImperativeHandle,
  ReactNode,
} from "react";
import {
  motion,
  useMotionValue,
  useTransform,
  animate,
  MotionValue,
} from "framer-motion";
import "./FlipBook3D.css";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface FlipBook3DHandle {
  flipNext: () => void;
  flipPrev: () => void;
}

export interface FlipBook3DProps {
  pages: ReactNode[];
  flipDuration?: number;
  onFlipNext?: () => void;
  onFlipPrev?: () => void;
  canFlipPrev?: boolean;
  canFlipNext?: boolean;
  showBuiltInNav?: boolean;
  className?: string;
}

type FlipPhase = "idle" | "flipping-next" | "flipping-prev";

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const FLIP_EASE = [0.645, 0.045, 0.355, 1.0] as const;

// ─────────────────────────────────────────────────────────────────────────────
// ShadowOverlay
// ─────────────────────────────────────────────────────────────────────────────

function ShadowOverlay({
  shadowValue,
  direction,
}: {
  shadowValue: MotionValue<number>;
  direction: "front" | "back";
}) {
  const opacity = useTransform(shadowValue, [0, 1], [0, 0.6]);
  return (
    <motion.div
      aria-hidden="true"
      style={{ opacity }}
      className={`fb3d-shadow-overlay fb3d-shadow-overlay--${direction}`}
    />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────

const FlipBook3D = forwardRef<FlipBook3DHandle, FlipBook3DProps>(
  function FlipBook3D(
    {
      pages,
      flipDuration = 700,
      onFlipNext,
      onFlipPrev,
      canFlipPrev = false,
      canFlipNext = false,
      showBuiltInNav = false,
      className = "",
    },
    ref
  ) {
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    const [phase, setPhase] = useState<FlipPhase>("idle");
    const [committedSpreadIndex, setCommittedSpreadIndex] = useState(0);

    const [stageLeftOverride, setStageLeftOverride] = useState<number | null>(null);
    const [stageRightOverride, setStageRightOverride] = useState<number | null>(null);

    const [flippingPage, setFlippingPage] = useState<{
      front: ReactNode;
      back: ReactNode;
      phase: "flipping-next" | "flipping-prev";
    } | null>(null);

    const masterRotateY = useMotionValue(0);
    const totalSpreads = useMemo(() => Math.ceil(pages.length / 2), [pages.length]);
    const isAnimating = useRef(false);

    // ── Helper ──────────────────────────────────────────────────────────────
    const getPage = useCallback(
      (idx: number): ReactNode | null =>
        idx >= 0 && idx < pages.length ? pages[idx] : null,
      [pages]
    );

    // ── Stage Logic ─────────────────────────────────────────────────────────
    const stageLine = useMemo(() => {
      const baseLeft  = committedSpreadIndex * 2;
      const baseRight = committedSpreadIndex * 2 + 1;
      return {
        left:  stageLeftOverride  !== null ? stageLeftOverride  : baseLeft,
        right: stageRightOverride !== null ? stageRightOverride : baseRight,
      };
    }, [committedSpreadIndex, stageLeftOverride, stageRightOverride]);

    // ── Shading Logic ───────────────────────────────────────────────────────
    const frontShadow = useTransform(masterRotateY, (v) => {
      const abs = Math.abs(v);
      if (abs <= 90) return abs / 90;
      return 0;
    });

    const backShadow = useTransform(masterRotateY, (v) => {
      const abs = Math.abs(v);
      if (abs > 90) return 1 - (abs - 90) / 90;
      return 0;
    });

    // ── flipNext ─────────────────────────────────────────────────────────────
    const flipNext = useCallback(async () => {
      if (isAnimating.current || !canFlipNext) return;
      isAnimating.current = true;

      const N = committedSpreadIndex;
      const nextSpread = N + 1;

      const frontIdx = N * 2 + 1;
      const backIdx  = nextSpread * 2;
      const stageRightIdx = nextSpread * 2 + 1;

      setFlippingPage({
        front: getPage(frontIdx),
        back:  getPage(backIdx),
        phase: "flipping-next",
      });
      setStageRightOverride(stageRightIdx);
      setPhase("flipping-next");

      requestAnimationFrame(() => {
        requestAnimationFrame(async () => {
          await animate(masterRotateY, -180, {
            duration: flipDuration / 1000,
            ease: FLIP_EASE,
          });

          setCommittedSpreadIndex(nextSpread);
          setPhase("idle");
          setFlippingPage(null);
          setStageLeftOverride(null);
          setStageRightOverride(null);

          requestAnimationFrame(() => {
            masterRotateY.set(0);
            isAnimating.current = false;
            onFlipNext?.();
          });
        });
      });
    }, [canFlipNext, committedSpreadIndex, getPage, masterRotateY, flipDuration, onFlipNext]);

    // ── flipPrev ─────────────────────────────────────────────────────────────
    const flipPrev = useCallback(async () => {
      if (isAnimating.current || !canFlipPrev) return;
      isAnimating.current = true;

      const N = committedSpreadIndex;
      const prevSpread = N - 1;

      const frontIdx = N * 2;
      const backIdx  = prevSpread * 2 + 1;
      const stageLeftIdx = prevSpread * 2;

      setFlippingPage({
        front: getPage(frontIdx),
        back:  getPage(backIdx),
        phase: "flipping-prev",
      });
      setStageLeftOverride(stageLeftIdx);
      setPhase("flipping-prev");

      requestAnimationFrame(() => {
        requestAnimationFrame(async () => {
          await animate(masterRotateY, 180, {
            duration: flipDuration / 1000,
            ease: FLIP_EASE,
          });

          setCommittedSpreadIndex(prevSpread);
          setPhase("idle");
          setFlippingPage(null);
          setStageLeftOverride(null);
          setStageRightOverride(null);

          requestAnimationFrame(() => {
            masterRotateY.set(0);
            isAnimating.current = false;
            onFlipPrev?.();
          });
        });
      });
    }, [canFlipPrev, committedSpreadIndex, getPage, masterRotateY, flipDuration, onFlipPrev]);

    useEffect(() => {
      const handler = (e: KeyboardEvent) => {
        if (e.key === "ArrowRight") flipNext();
        if (e.key === "ArrowLeft")  flipPrev();
      };
      window.addEventListener("keydown", handler);
      return () => window.removeEventListener("keydown", handler);
    }, [flipNext, flipPrev]);

    useImperativeHandle(ref, () => ({ flipNext, flipPrev }), [flipNext, flipPrev]);

    if (!mounted) {
      return (
        <div
          className={`fb3d-book-container ${className}`}
          style={{ visibility: "hidden" }}
          aria-hidden="true"
        />
      );
    }

    // ── Render ────────────────────────────────────────────────────────────────
    return (
      <div
        className={`fb3d-book-container ${className}`}
        role="region"
        aria-label="Flip Book"
      >
        <div className="fb3d-stage" aria-hidden="true">
          <div className="fb3d-stage__left">{getPage(stageLine.left)}</div>
          <div className="fb3d-stage__right">{getPage(stageLine.right)}</div>
        </div>

        {/* 
            SINGLE SEGMENT LEAF
            Only 1 clean DOM clone of the character page. Perfectly performant!
        */}
        {phase !== "idle" && flippingPage !== null && (
          <motion.div
            key="page-wrapper"
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              left:  phase === "flipping-next" ? "50%" : "0%",
              right: phase === "flipping-next" ? "0%"  : "50%",
              zIndex: 20,
              transformStyle: "preserve-3d",
              transformOrigin: phase === "flipping-next" ? "left center" : "right center",
              rotateY: masterRotateY,
            }}
          >
            {/* Front face */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                backfaceVisibility: "hidden",
                WebkitBackfaceVisibility: "hidden",
                overflow: "hidden",
              }}
            >
              {flippingPage.front}
              <ShadowOverlay shadowValue={frontShadow} direction="front" />
            </div>

            {/* Back face */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                backfaceVisibility: "hidden",
                WebkitBackfaceVisibility: "hidden",
                transform: "rotateY(180deg)",
                overflow: "hidden",
              }}
            >
              {flippingPage.back}
              <ShadowOverlay shadowValue={backShadow} direction="back" />
            </div>
          </motion.div>
        )}

        <div className="fb3d-spine" aria-hidden="true" />

        {showBuiltInNav && totalSpreads > 1 && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              pointerEvents: "none",
              zIndex: 40,
              padding: "0 24px",
            }}
          >
            <button
              onClick={flipPrev}
              disabled={!canFlipPrev || phase !== "idle"}
              aria-label="Previous page"
              style={{ pointerEvents: "auto" }}
            >
              ◀
            </button>
            <button
              onClick={flipNext}
              disabled={!canFlipNext || phase !== "idle"}
              aria-label="Next page"
              style={{ pointerEvents: "auto" }}
            >
              ▶
            </button>
          </div>
        )}

        {pages.length === 0 && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 50,
              color: "var(--wiki-text-muted, #888)",
              fontFamily: "var(--font-pixel, monospace)",
              fontSize: "0.875rem",
            }}
          >
            No pages to display.
          </div>
        )}
      </div>
    );
  }
);

export default FlipBook3D;
