"use client";

/**
 * FlipBook3D.tsx — v3
 *
 * Core fix (v3):
 *   Stage layer now uses stageOverride during animation.
 *
 *   CORRECT book physics:
 *     flipNext (spread N → N+1):
 *       - PageWrapper front  = pages[N*2+1]   (current RIGHT — the leaf that lifts)
 *       - PageWrapper back   = pages[(N+1)*2]  (next LEFT  — revealed on back face)
 *       - Stage LEFT         = pages[N*2]      (unchanged)
 *       - Stage RIGHT        = pages[(N+1)*2+1] ← override! (next RIGHT, peeking from behind)
 *
 *     flipPrev (spread N → N-1):
 *       - PageWrapper front  = pages[N*2]      (current LEFT — the leaf that sweeps back)
 *       - PageWrapper back   = pages[(N-1)*2+1] (prev RIGHT — revealed on back face)
 *       - Stage LEFT         = pages[(N-1)*2]  ← override! (prev LEFT, peeking from behind)
 *       - Stage RIGHT        = pages[N*2+1]    (unchanged)
 *
 * Other features retained from v2:
 *   - Multi-Segment bending (4 strips, staggered delay)
 *   - Dynamic shading via shadow MotionValues
 *   - forwardRef + useImperativeHandle (flipNext / flipPrev)
 *   - SSR guard
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
  AnimatePresence,
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
const SEGMENTS = 3;
const SEGMENT_STAGGER_MS = 35;

// ─────────────────────────────────────────────────────────────────────────────
// ShadowOverlay
// ─────────────────────────────────────────────────────────────────────────────

function ShadowOverlay({
  shadowValue,
  direction,
}: {
  shadowValue: MotionValue<number>;
  direction: "left" | "right";
}) {
  const opacity = useTransform(shadowValue, [0, 1], [0, 0.65]);
  return (
    <motion.div
      aria-hidden="true"
      style={{ opacity }}
      className={`fb3d-shadow-overlay fb3d-shadow-overlay--${direction}`}
    />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SegmentStrip — one horizontal band of the flipping leaf
// ─────────────────────────────────────────────────────────────────────────────

interface SegmentStripProps {
  segmentIndex: number;
  totalSegments: number;
  masterRotateY: MotionValue<number>;
  durationSec: number;
  /** -180 for flipNext, +180 for flipPrev */
  targetRotate: number;
  frontContent: ReactNode;
  backContent: ReactNode;
  flipPhase: "flipping-next" | "flipping-prev";
}

function SegmentStrip({
  segmentIndex,
  totalSegments,
  masterRotateY,
  durationSec,
  targetRotate,
  frontContent,
  backContent,
  flipPhase,
}: SegmentStripProps) {
  const topPct = (segmentIndex / totalSegments) * 100;
  const delayMs = segmentIndex * SEGMENT_STAGGER_MS;
  const effectiveDurationMs = durationSec * 1000;

  const localRotateY = useMotionValue(0);
  const stripFrontShadow = useMotionValue(0);
  const stripBackShadow = useMotionValue(0);

  useEffect(() => {
    const totalRange = 180;
    const off = masterRotateY.on("change", (masterVal) => {
      const masterProgress = Math.abs(masterVal) / totalRange;
      const masterMs = masterProgress * effectiveDurationMs;
      const stripMs = Math.max(0, masterMs - delayMs);
      const stripRange = effectiveDurationMs - delayMs;
      const stripProgress = Math.min(1, stripMs / stripRange);
      localRotateY.set(targetRotate * stripProgress);
    });
    return () => off();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [masterRotateY, targetRotate, delayMs, effectiveDurationMs]);

  useEffect(() => {
    const off = localRotateY.on("change", (v) => {
      const abs = Math.abs(v);
      if (abs <= 90) {
        stripFrontShadow.set(abs / 90);
        stripBackShadow.set(0);
      } else {
        stripFrontShadow.set(0);
        stripBackShadow.set(1 - (abs - 90) / 90);
      }
    });
    return () => off();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localRotateY]);

  const transformOrigin =
    flipPhase === "flipping-next" ? "left center" : "right center";

  // Calculate clip path insets: clipPath: inset(top right bottom left)
  // Distance from top is topPct
  // Distance from bottom is 100% - bottomPct
  const bottomPct = ((segmentIndex + 1) / totalSegments) * 100;
  const clipPathBase = `inset(${topPct}% 0 ${100 - bottomPct}% 0)`;

  // IMPORTANT v4: No overflow hidden on any 3D layer.
  return (
    <motion.div
      style={{
        position: "absolute",
        inset: 0, // Fill the half-container (wrapper)
        transformStyle: "preserve-3d",
        transformOrigin,
        rotateY: localRotateY,
      }}
    >
      {/* Front face */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backfaceVisibility: "hidden",
          WebkitBackfaceVisibility: "hidden",
          clipPath: clipPathBase,
          WebkitClipPath: clipPathBase, // Safari support
        }}
      >
        <div style={{ position: "absolute", inset: 0 }}>
          {frontContent}
        </div>
        <ShadowOverlay 
          shadowValue={stripFrontShadow} 
          direction={flipPhase === "flipping-next" ? "right" : "left"} 
        />
      </div>

      {/* Back face */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backfaceVisibility: "hidden",
          WebkitBackfaceVisibility: "hidden",
          transform: "rotateY(180deg)", // 180deg offset works perfectly for both -180 and +180 rotations
          clipPath: clipPathBase,
          WebkitClipPath: clipPathBase,
        }}
      >
        <div style={{ position: "absolute", inset: 0 }}>
          {backContent}
        </div>
        <ShadowOverlay 
          shadowValue={stripBackShadow} 
          direction={flipPhase === "flipping-next" ? "left" : "right"} 
        />
      </div>
    </motion.div>
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

    /**
     * During a flip, we override ONE of the two stage slots.
     * null = derive from committedSpreadIndex as usual.
     */
    const [stageLeftOverride, setStageLeftOverride] = useState<number | null>(null);
    const [stageRightOverride, setStageRightOverride] = useState<number | null>(null);

    /** The two pages carried by the animated leaf */
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

    // ── What the stage actually shows ────────────────────────────────────────
    const stageLine = useMemo(() => {
      const baseLeft  = committedSpreadIndex * 2;
      const baseRight = committedSpreadIndex * 2 + 1;
      return {
        left:  stageLeftOverride  !== null ? stageLeftOverride  : baseLeft,
        right: stageRightOverride !== null ? stageRightOverride : baseRight,
      };
    }, [committedSpreadIndex, stageLeftOverride, stageRightOverride]);

    // ── Shading Logic ───────────────────────────────────────────────────────
    // These shadows are cast onto the stage pages underneath the flipping leaf
    const stageLeftShadow = useTransform(masterRotateY, (v) => {
      if (v < -90) return (Math.abs(v) - 90) / 90; // flipNext landing
      if (v > 0 && v <= 90) return 1 - (v / 90);   // flipPrev lifting
      return 0;
    });

    const stageRightShadow = useTransform(masterRotateY, (v) => {
      if (v < 0 && v >= -90) return 1 - (Math.abs(v) / 90); // flipNext lifting
      if (v > 90) return (v - 90) / 90;                     // flipPrev landing
      return 0;
    });

    // ── flipNext ─────────────────────────────────────────────────────────────
    const flipNext = useCallback(async () => {
      if (isAnimating.current || !canFlipNext) return;
      isAnimating.current = true;

      const N = committedSpreadIndex;
      const nextSpread = N + 1;

      // The leaf that lifts: current RIGHT page
      const frontIdx = N * 2 + 1;
      // Revealed on back face: next LEFT page
      const backIdx  = nextSpread * 2;
      // Stage override: next RIGHT page peeks from behind the lifting leaf
      const stageRightIdx = nextSpread * 2 + 1;

      setFlippingPage({
        front: getPage(frontIdx),
        back:  getPage(backIdx),
        phase: "flipping-next",
      });
      setStageRightOverride(stageRightIdx);
      setPhase("flipping-next");

      // Wait for React to mount the flippingPage DOM + apply the stage right override
      requestAnimationFrame(() => {
        requestAnimationFrame(async () => {
          await animate(masterRotateY, -180, {
            duration: flipDuration / 1000,
            ease: FLIP_EASE,
          });

          // Animation done -> cleanup phase
          setCommittedSpreadIndex(nextSpread);
          setPhase("idle");
          setFlippingPage(null);
          setStageLeftOverride(null);
          setStageRightOverride(null);

          // Wait for React to unmount flippingPage before resetting masterRotateY
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

      // The leaf that sweeps back: current LEFT page
      const frontIdx = N * 2;
      // Revealed on back face: prev RIGHT page
      const backIdx  = prevSpread * 2 + 1;
      // Stage override: prev LEFT page peeks from behind the sweeping leaf
      const stageLeftIdx = prevSpread * 2;

      setFlippingPage({
        front: getPage(frontIdx),
        back:  getPage(backIdx),
        phase: "flipping-prev",
      });
      setStageLeftOverride(stageLeftIdx);
      setPhase("flipping-prev");

      // Wait for React to mount the flippingPage DOM + apply the stage left override
      requestAnimationFrame(() => {
        requestAnimationFrame(async () => {
          await animate(masterRotateY, 180, {
            duration: flipDuration / 1000,
            ease: FLIP_EASE,
          });

          // Animation done -> cleanup phase
          setCommittedSpreadIndex(prevSpread);
          setPhase("idle");
          setFlippingPage(null);
          setStageLeftOverride(null);
          setStageRightOverride(null);

          // Wait for React to unmount flippingPage before resetting masterRotateY
          requestAnimationFrame(() => {
            masterRotateY.set(0);
            isAnimating.current = false;
            onFlipPrev?.();
          });
        });
      });
    }, [canFlipPrev, committedSpreadIndex, getPage, masterRotateY, flipDuration, onFlipPrev]);

    // ── Keyboard ─────────────────────────────────────────────────────────────
    useEffect(() => {
      const handler = (e: KeyboardEvent) => {
        if (e.key === "ArrowRight") flipNext();
        if (e.key === "ArrowLeft")  flipPrev();
      };
      window.addEventListener("keydown", handler);
      return () => window.removeEventListener("keydown", handler);
    }, [flipNext, flipPrev]);

    // ── Imperative handle ─────────────────────────────────────────────────────
    useImperativeHandle(ref, () => ({ flipNext, flipPrev }), [flipNext, flipPrev]);

    // ── SSR ───────────────────────────────────────────────────────────────────
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
        {/* ─────────────────────────────────────────────────────────────────
            LAYER 1 (z-10): Stage
            During idle:   shows committedSpread (left + right)
            During flipNext: stage RIGHT overridden to nextSpread right
            During flipPrev: stage LEFT  overridden to prevSpread left
        ──────────────────────────────────────────────────────────────────── */}
        <div className="fb3d-stage" aria-hidden="true">
          <div className="fb3d-stage__left">
            {getPage(stageLine.left)}
            {phase !== "idle" && <ShadowOverlay shadowValue={stageLeftShadow} direction="left" />}
          </div>
          <div className="fb3d-stage__right">
            {getPage(stageLine.right)}
            {phase !== "idle" && <ShadowOverlay shadowValue={stageRightShadow} direction="right" />}
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────────────────
            LAYER 2 (z-20): Multi-Segment animated leaf
            flipNext: covers RIGHT half, pivot LEFT edge, rotates -180°
            flipPrev: covers LEFT  half, pivot RIGHT edge, rotates +180°
        ──────────────────────────────────────────────────────────────────── */}
        {phase !== "idle" && flippingPage !== null && (
          <div
            key="page-wrapper"
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              left:  phase === "flipping-next" ? "50%" : "0%",
              right: phase === "flipping-next" ? "0%"  : "50%",
              zIndex: 20,
            }}
          >
            {Array.from({ length: SEGMENTS }).map((_, i) => (
              <SegmentStrip
                key={i}
                segmentIndex={i}
                totalSegments={SEGMENTS}
                masterRotateY={masterRotateY}
                durationSec={flipDuration / 1000}
                targetRotate={phase === "flipping-next" ? -180 : 180}
                frontContent={flippingPage.front}
                backContent={flippingPage.back}
                flipPhase={phase}
              />
            ))}
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────────
            LAYER 3 (z-30): Spine overlay
        ──────────────────────────────────────────────────────────────────── */}
        <div className="fb3d-spine" aria-hidden="true" />

        {/* ─────────────────────────────────────────────────────────────────
            Built-in nav (off by default)
        ──────────────────────────────────────────────────────────────────── */}
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

        {/* Empty state */}
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
