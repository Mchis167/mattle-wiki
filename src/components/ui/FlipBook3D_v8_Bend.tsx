"use client";

/**
 * FlipBook3D_v8_Bend.tsx — v8 (Segmented Bend + v7 Lighting)
 *
 * Architecture — merges the best of v5 and v7:
 *
 *   v5 Multi-Segment bending:
 *     3 horizontal strips, each with an independently-staggered rotateY.
 *     Lower strips lag behind upper ones by SEGMENT_STAGGER_MS, creating a
 *     realistic page-curl arc rather than a rigid flat flip.
 *     clipPath on each strip face confines the content to its slice without
 *     overflow artifacts.
 *
 *   v7 State management:
 *     - initialSpreadIndex prop with sync useEffect + !isAnimating.current guard
 *     - Double-RAF mount pattern before animation start
 *     - onFlipNext/onFlipPrev called after animation + DOM settle
 *
 *   Unified shadow system (4 values):
 *     foldCreaseShadow  — Lambert 0°→90°, immediate crease as leaf lifts
 *     frontShadow       — Lambert 45°→90°, delayed darkening (Act 2)
 *     backShadow        — cos ease-out 90°→120°, back-face emergence (Act 3)
 *     castShadow        — sin bell curve 0°→90°, leaf cast-shadow onto stage
 *
 *   API: identical to v7 — fully drop-in compatible.
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
  initialSpreadIndex?: number;
  className?: string;
}

type FlipPhase = "idle" | "flipping-next" | "flipping-prev";

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const FLIP_EASE = [0.645, 0.045, 0.355, 1.0] as const;

/** Number of horizontal strips that form the curling leaf */
const SEGMENTS = 3;

/**
 * Each successive strip lags this many ms behind the strip above it.
 * Creates the arc: top strip leads, bottom strip trails → natural curl shape.
 */
const SEGMENT_STAGGER_MS = 22;

// ─────────────────────────────────────────────────────────────────────────────
// ShadowOverlay — gradient darkening on a face (front/back) or stage panel
// ─────────────────────────────────────────────────────────────────────────────

function ShadowOverlay({
  shadowValue,
  direction,
  maxOpacity = 0.65,
}: {
  shadowValue: MotionValue<number>;
  /** "left" → dark at left edge (spine side for flipNext)
   *  "right" → dark at right edge (spine side for flipPrev)  */
  direction: "left" | "right";
  maxOpacity?: number;
}) {
  const opacity = useTransform(shadowValue, [0, 1], [0, maxOpacity]);
  return (
    <motion.div
      aria-hidden="true"
      style={{ opacity }}
      className={`fb3d-shadow-overlay fb3d-shadow-overlay--${direction}`}
    />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SpecularHighlight — ánh trắng tại nếp gấp, peak tại ~40–55°
// ─────────────────────────────────────────────────────────────────────────────

function SpecularHighlight({
  rotateYVal,
  flipPhase,
}: {
  rotateYVal: MotionValue<number>;
  flipPhase: "flipping-next" | "flipping-prev";
}) {
  // Peak sáng tại 45° (sin(45°/90°*π) = 1), tắt ở 0° và 90°
  const opacity = useTransform(rotateYVal, (v) => {
    const abs = Math.abs(v);
    if (abs >= 90) return 0;
    return Math.sin((abs / 90) * Math.PI) * 0.85;
  });
  const side = flipPhase === "flipping-next" ? "left" : "right";
  return (
    <motion.div
      aria-hidden="true"
      style={{ opacity }}
      className={`fb3d-specular fb3d-specular--${side}`}
    />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FoldCreaseShadow — multi-stop gradient at the fold crease edge
// Simulates the paper-bending shadow that appears as soon as the leaf lifts.
// ─────────────────────────────────────────────────────────────────────────────

function FoldCreaseShadow({
  shadowValue,
  flipPhase,
}: {
  shadowValue: MotionValue<number>;
  flipPhase: "flipping-next" | "flipping-prev";
}) {
  const opacity = useTransform(shadowValue, [0, 1], [0, 1]);
  const side = flipPhase === "flipping-next" ? "left" : "right";
  return (
    <motion.div
      aria-hidden="true"
      style={{ opacity }}
      className={`fb3d-fold-crease fb3d-fold-crease--${side}`}
    />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CastShadowOverlay — shadow the lifting leaf casts onto the adjacent stage panel
// ─────────────────────────────────────────────────────────────────────────────

function CastShadowOverlay({
  shadowValue,
  direction,
}: {
  shadowValue: MotionValue<number>;
  direction: "left" | "right";
}) {
  const opacity = useTransform(shadowValue, [0, 1], [0, 0.45]);
  return (
    <motion.div
      aria-hidden="true"
      style={{ opacity }}
      className={`fb3d-cast-shadow fb3d-cast-shadow--${direction}`}
    />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SpineShadow — dynamic "fake border" shadow for the spine area
// ─────────────────────────────────────────────────────────────────────────────

function SpineShadow({
  rotateY,
  direction,
}: {
  rotateY: MotionValue<number>;
  direction: "left" | "right";
}) {
  const opacity = useTransform(rotateY, (v) => {
    const a = Math.abs(v);
    if (a < 3) return a / 3;
    if (a > 177) return (180 - a) / 3;
    return 1;
  });
  return (
    <motion.div
      aria-hidden="true"
      style={{ opacity }}
      className={`fb3d-spine-shadow fb3d-spine-shadow--${direction}`}
    />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SegmentStrip — one horizontal slice of the curling leaf
//
// Each strip independently tracks masterRotateY with a time-delay offset.
// Lower strips lag → the bottom of the page trails behind the top, producing
// the characteristic arc of a paper page being flipped.
//
// clipPath confines each strip to its vertical slice without duplicating DOM.
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
  const effectiveDurationMs = durationSec * 1000;
  const delayMs = segmentIndex * SEGMENT_STAGGER_MS;

  // This strip's own rotateY, driven by masterRotateY minus its delay offset
  const localRotateY = useMotionValue(0);

  useEffect(() => {
    const off = masterRotateY.on("change", (masterVal) => {
      const masterProgress = Math.abs(masterVal) / 180;
      const masterMs = masterProgress * effectiveDurationMs;
      const stripMs = Math.max(0, masterMs - delayMs);
      const stripRange = effectiveDurationMs - delayMs;
      const stripProgress = Math.min(1, stripMs / stripRange);
      localRotateY.set(targetRotate * stripProgress);
    });
    return () => off();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [masterRotateY, targetRotate, delayMs, effectiveDurationMs]);

  // ── Per-segment shadow values (based on THIS strip's own angle) ──────────
  // Khác v8: mỗi strip tính riêng từ localRotateY → curl có chiều sâu thật

  // Ambient + diffuse front darkening:
  //   ambient: 0°→90° nhẹ (giả lập occlusion sớm)
  //   diffuse: 45°→90° mạnh (Lambert Act 2)
  const localFrontShadow = useTransform(localRotateY, (v) => {
    const abs = Math.abs(v);
    if (abs >= 90) return 0;
    const ambient = (abs / 90) * 0.10;
    const diffuse = abs > 45
      ? (1 - Math.cos(((abs - 45) / 45) * (Math.PI / 2))) * 0.55
      : 0;
    return Math.min(ambient + diffuse, 1);
  });

  // Back face: sáng lên 90°→120°
  const localBackShadow = useTransform(localRotateY, (v) => {
    const abs = Math.abs(v);
    if (abs < 90) return 0;
    const t = Math.min((abs - 90) / 30, 1);
    return Math.cos(t * (Math.PI / 2));
  });

  // Fold crease: sin bell curve — mạnh nhất tại 45°
  const localFoldCrease = useTransform(localRotateY, (v) => {
    const abs = Math.abs(v);
    if (abs >= 90) return 0;
    return Math.sin((abs / 90) * Math.PI);
  });

  const transformOrigin =
    flipPhase === "flipping-next" ? "left center" : "right center";

  // Vertical clip: inset(top% 0 bottom% 0)
  const topPct = (segmentIndex / totalSegments) * 100;
  const bottomPct = ((segmentIndex + 1) / totalSegments) * 100;
  const clip = `inset(${topPct}% 0 ${100 - bottomPct}% 0)`;

  // Shadow direction: spine is always at the pivot edge
  const spineSide = flipPhase === "flipping-next" ? "left" : "right";

  return (
    <motion.div
      style={{
        position: "absolute",
        inset: 0,
        transformStyle: "preserve-3d",
        transformOrigin,
        rotateY: localRotateY,
      }}
    >
      {/* ── Front face ───────────────────────────────────────────────────────── */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backfaceVisibility: "hidden",
          WebkitBackfaceVisibility: "hidden",
          clipPath: clip,
          WebkitClipPath: clip,
        }}
      >
        {/* Content rendered at full size, clipped to this strip's slice */}
        <div style={{ position: "absolute", inset: 0 }}>{frontContent}</div>

        {/* General darkening: delayed to 45° so Act 1 (stage uncovering) reads first */}
        <ShadowOverlay
          shadowValue={localFrontShadow}
          direction={spineSide}
          maxOpacity={0.5}
        />

        {/* Fold crease: dùng localFoldCrease (per-strip) thay vì shared value */}
        <FoldCreaseShadow
          shadowValue={localFoldCrease}
          flipPhase={flipPhase}
        />

        {/* Specular: ánh trắng tại nếp gấp, peak tại 45° */}
        <SpecularHighlight
          rotateYVal={localRotateY}
          flipPhase={flipPhase}
        />
      </div>   {/* ← kết thúc front face */}

      {/* ── Back face ────────────────────────────────────────────────────────── */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backfaceVisibility: "hidden",
          WebkitBackfaceVisibility: "hidden",
          transform: "rotateY(180deg)",
          clipPath: clip,
          WebkitClipPath: clip,
        }}
      >
        <div style={{ position: "absolute", inset: 0 }}>{backContent}</div>

        <ShadowOverlay
          shadowValue={localBackShadow}
          direction={spineSide}
          maxOpacity={0.5}
        />
        <FoldCreaseShadow
          shadowValue={localBackShadow}
          flipPhase={flipPhase}
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
      initialSpreadIndex = 0,
      className = "",
    },
    ref
  ) {
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    const [phase, setPhase] = useState<FlipPhase>("idle");
    const [committedSpreadIndex, setCommittedSpreadIndex] = useState(
      initialSpreadIndex || 0
    );

    // isAnimating must be declared before the sync useEffect that reads it
    const isAnimating = useRef(false);

    // Sync committed spread when initialSpreadIndex changes externally
    // (e.g. browser back/forward or direct URL entry).
    // GUARD: never sync during animation — doing so mid-flip corrupts stageLine
    // (stage pages jump to wrong content before the leaf has landed).
    useEffect(() => {
      if (
        initialSpreadIndex !== undefined &&
        initialSpreadIndex !== committedSpreadIndex &&
        !isAnimating.current
      ) {
        setCommittedSpreadIndex(initialSpreadIndex);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialSpreadIndex]);

    const [stageLeftOverride, setStageLeftOverride] = useState<number | null>(
      null
    );
    const [stageRightOverride, setStageRightOverride] = useState<number | null>(
      null
    );

    const [flippingPage, setFlippingPage] = useState<{
      front: ReactNode;
      back: ReactNode;
      phase: "flipping-next" | "flipping-prev";
    } | null>(null);

    const masterRotateY = useMotionValue(0);
    const totalSpreads = useMemo(
      () => Math.ceil(pages.length / 2),
      [pages.length]
    );

    // ── Helpers ───────────────────────────────────────────────────────────────

    const getPage = useCallback(
      (idx: number): ReactNode | null =>
        idx >= 0 && idx < pages.length ? pages[idx] : null,
      [pages]
    );

    const stageLine = useMemo(() => {
      const baseLeft = committedSpreadIndex * 2;
      const baseRight = committedSpreadIndex * 2 + 1;
      return {
        left: stageLeftOverride !== null ? stageLeftOverride : baseLeft,
        right: stageRightOverride !== null ? stageRightOverride : baseRight,
      };
    }, [committedSpreadIndex, stageLeftOverride, stageRightOverride]);

    // Cast shadow — sin bell curve, peak ~45°, zero at 0° and 90°
    const castShadow = useTransform(masterRotateY, (v) => {
      const abs = Math.abs(v);
      if (abs >= 90) return 0;
      const t = abs / 90;
      return Math.sin(t * Math.PI) * 0.9;
    });

    // ── flipNext ──────────────────────────────────────────────────────────────

    const flipNext = useCallback(async () => {
      if (isAnimating.current || !canFlipNext) return;
      isAnimating.current = true;

      const N = committedSpreadIndex;
      const nextSpread = N + 1;

      // Leaf front  = current right page (the one that lifts)
      // Leaf back   = next left page (revealed on back face mid-flip)
      // Stage right = next right page (peeks from behind the lifting leaf)
      const frontIdx = N * 2 + 1;
      const backIdx = nextSpread * 2;
      const stageRightIdx = nextSpread * 2 + 1;

      setFlippingPage({
        front: getPage(frontIdx),
        back: getPage(backIdx),
        phase: "flipping-next",
      });
      setStageRightOverride(stageRightIdx);
      setPhase("flipping-next");

      // Double-RAF: wait for React to mount the leaf DOM and apply overrides
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

          // Single-RAF: wait for React to unmount leaf before resetting motor
          requestAnimationFrame(() => {
            masterRotateY.set(0);
            isAnimating.current = false;
            onFlipNext?.();
          });
        });
      });
    }, [
      canFlipNext,
      committedSpreadIndex,
      getPage,
      masterRotateY,
      flipDuration,
      onFlipNext,
    ]);

    // ── flipPrev ──────────────────────────────────────────────────────────────

    const flipPrev = useCallback(async () => {
      if (isAnimating.current || !canFlipPrev) return;
      isAnimating.current = true;

      const N = committedSpreadIndex;
      const prevSpread = N - 1;

      // Leaf front  = current left page (the one that sweeps back)
      // Leaf back   = prev right page (revealed on back face)
      // Stage left  = prev left page (peeks from behind the sweeping leaf)
      const frontIdx = N * 2;
      const backIdx = prevSpread * 2 + 1;
      const stageLeftIdx = prevSpread * 2;

      setFlippingPage({
        front: getPage(frontIdx),
        back: getPage(backIdx),
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
    }, [
      canFlipPrev,
      committedSpreadIndex,
      getPage,
      masterRotateY,
      flipDuration,
      onFlipPrev,
    ]);

    // ── Keyboard ──────────────────────────────────────────────────────────────

    useEffect(() => {
      const handler = (e: KeyboardEvent) => {
        if (e.key === "ArrowRight") flipNext();
        if (e.key === "ArrowLeft") flipPrev();
      };
      window.addEventListener("keydown", handler);
      return () => window.removeEventListener("keydown", handler);
    }, [flipNext, flipPrev]);

    useImperativeHandle(ref, () => ({ flipNext, flipPrev }), [
      flipNext,
      flipPrev,
    ]);

    // ── SSR guard ─────────────────────────────────────────────────────────────

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
        {/* ─────────────────────────────────────────────────────────────────────
            LAYER 1 (z-10) — Stage
            Idle:     shows committedSpread pages.
            flipNext: stage RIGHT overridden → next-spread right page peeks behind leaf.
            flipPrev: stage LEFT  overridden → prev-spread left  page peeks behind leaf.
            CastShadowOverlay renders on the panel ADJACENT to the lifting leaf.
        ───────────────────────────────────────────────────────────────────── */}
        <div className="fb3d-stage" aria-hidden="true">
          <div className="fb3d-stage__left">
            {getPage(stageLine.left)}
            {phase === "flipping-next" && (
              <CastShadowOverlay shadowValue={castShadow} direction="left" />
            )}
          </div>
          <div className="fb3d-stage__right">
            {getPage(stageLine.right)}
            {phase === "flipping-prev" && (
              <CastShadowOverlay shadowValue={castShadow} direction="right" />
            )}
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────────────────────
            LAYER 2 (z-20) — Multi-Segment curling leaf
            Wrapper: positions leaf over the correct half (left or right).
            Children: SEGMENTS strips, each clipped to its vertical slice,
                      each with an independently-staggered rotateY.
        ───────────────────────────────────────────────────────────────────── */}
        {phase !== "idle" && flippingPage !== null && (
          <div
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              left: phase === "flipping-next" ? "50%" : "0%",
              right: phase === "flipping-next" ? "0%" : "50%",
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
                flipPhase={flippingPage.phase}
              />
            ))}
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────────────
            LAYER 3 (z-30) — Spine overlay
        ───────────────────────────────────────────────────────────────────── */}
        <div className="fb3d-spine" aria-hidden="true">
          {phase === "flipping-next" && (
            <SpineShadow rotateY={masterRotateY} direction="right" />
          )}
          {phase === "flipping-prev" && (
            <SpineShadow rotateY={masterRotateY} direction="left" />
          )}
        </div>

        {/* ─────────────────────────────────────────────────────────────────────
            Built-in nav (off by default — use CharactersFlipBook / SpreadPagination)
        ───────────────────────────────────────────────────────────────────── */}
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
