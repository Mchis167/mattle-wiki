"use client";

import React, { ReactNode, CSSProperties } from "react";

type OutlineSize = 1 | 2 | 3 | 4;

interface OutlineTextProps {
  children: ReactNode;
  size?: OutlineSize;        // width of the outline in px
  color?: string;            // hex/rgba color for outline (No CSS variables)
  shadowX?: number;          // shadow offset-x in px
  shadowY?: number;          // shadow offset-y in px
  shadowSize?: number;       // thickness of the shadow in px (dilation)
  shadowColor?: string;      // hex/rgba color for shadow (No CSS variables)
  className?: string;
  style?: CSSProperties;
  as?: React.ElementType;    // render tag: h1, h2, span, p...
}

/**
 * OutlineText — component for dynamic text with SVG morphology outline.
 * 
 * Uses feMorphology (dilate) to create a sharp "outside stroke" suitable
 * for pixel art aesthetics.
 * 
 * NOTE: Does NOT support CSS variables for color/shadowColor because feFlood 
 * ignores them. Pass hex/rgba values.
 */
export default function OutlineText({
  children,
  size = 2,
  color = "#000000",
  shadowX = 0,
  shadowY = 0,
  shadowSize,
  shadowColor = "transparent",
  className = "",
  style = {},
  as: Tag = "span",
}: OutlineTextProps) {
  // If shadowSize is not provided, default to the stroke size
  const effectiveShadowSize = shadowSize ?? size;

  // Use unique ID per combination to enable caching
  const safeColor = color.replace("#", "").replace(/[(),\s%]/g, "-");
  const safeShadowColor = shadowColor.replace("#", "").replace(/[(),\s%]/g, "-");
  const filterId = `outline-${size}-${safeColor}-${shadowX}-${shadowY}-${effectiveShadowSize}-${safeShadowColor}`;

  return (
    <>
      <svg
        width="0"
        height="0"
        style={{ position: "absolute", width: 0, height: 0, overflow: "hidden" }}
        aria-hidden="true"
      >
        <defs>
          <filter id={filterId} x="-40%" y="-40%" width="180%" height="180%">
            {/* 1. Create Outline Stroke */}
            <feMorphology
              in="SourceAlpha"
              operator="dilate"
              radius={size}
              result="grown"
            />
            <feFlood floodColor={color} result="ink" />
            <feComposite in="ink" in2="grown" operator="in" result="outline" />

            {/* 2. Create Drop Shadow (Independently dilated) */}
            {(shadowX !== 0 || shadowY !== 0) && (
              <>
                <feMorphology
                  in="SourceAlpha"
                  operator="dilate"
                  radius={effectiveShadowSize}
                  result="shadowGrown"
                />
                <feOffset in="shadowGrown" dx={shadowX} dy={shadowY} result="offsetShadow" />
                <feFlood floodColor={shadowColor} result="shadowInk" />
                <feComposite
                  in="shadowInk"
                  in2="offsetShadow"
                  operator="in"
                  result="dropShadow"
                />
              </>
            )}

            {/* 3. Merge: Shadow (bottom) -> Outline (middle) -> Original (top) */}
            <feMerge>
              {(shadowX !== 0 || shadowY !== 0) && <feMergeNode in="dropShadow" />}
              <feMergeNode in="outline" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
      </svg>
      <Tag
        className={className}
        style={{ ...style, filter: `url(#${filterId})` }}
      >
        {children}
      </Tag>
    </>
  );
}
