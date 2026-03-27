/**
 * NoiseBg — Full-bleed SVG noise texture layer.
 * Used as a subtle grain overlay on top of all sections
 * to break up flat color gradients and add tactility.
 * Rendered once, `pointer-events-none`, `fixed` so it
 * doesn't affect scroll performance.
 */

import React from 'react'

export default function NoiseBg({ opacity = 0.028 }) {
  return (
    <div
      className="fixed inset-0 z-[9990] pointer-events-none"
      aria-hidden="true"
      style={{ opacity }}
    >
      <svg
        className="w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
      >
        <filter id="noise-filter">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.72"
            numOctaves="4"
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect
          width="100%"
          height="100%"
          filter="url(#noise-filter)"
          opacity="1"
        />
      </svg>
    </div>
  )
}
