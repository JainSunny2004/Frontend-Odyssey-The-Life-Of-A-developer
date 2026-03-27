import React, { useEffect, useRef } from 'react'
import { useScrollProgress } from '@/hooks/useScrollProgress'

/**
 * ProgressBar
 * Fixed top bar that fills 0→100% as the user scrolls.
 * Styled as a VSCode compilation bar: "Compiling life... X%"
 */
export default function ProgressBar() {
  const { progress } = useScrollProgress()
  const barRef       = useRef(null)
  const labelRef     = useRef(null)
  const percentage   = Math.round(progress * 100)

  // Direct DOM mutation — avoids React re-render on every scroll tick
  useEffect(() => {
    if (barRef.current) {
      barRef.current.style.width = `${percentage}%`
    }
    if (labelRef.current) {
      labelRef.current.textContent =
        percentage < 100
          ? `Compiling life... ${percentage}%`
          : `Build successful ✓`
    }
  }, [percentage])

  return (
    <div
      role="progressbar"
      aria-label="Page scroll progress"
      aria-valuenow={percentage}
      aria-valuemin={0}
      aria-valuemax={100}
      className="fixed top-0 left-0 right-0 z-[70] h-[3px] bg-bg-deep"
    >
      {/* Fill bar */}
      <div
        ref={barRef}
        className="h-full bg-neon-green transition-none will-change-[width]"
        style={{
          boxShadow: '0 0 10px rgba(0,255,136,0.8), 0 0 25px rgba(0,255,136,0.35)',
          width: '0%',
        }}
      />

      {/* Label pill — appears after 2% scroll to avoid flash */}
      {percentage > 2 && (
        <div
          className="
            absolute right-3 top-2
            font-mono text-[10px] font-medium tracking-wider
            text-neon-green/80
            bg-bg-void/90 backdrop-blur-sm
            px-2 py-0.5 rounded-sm
            border border-neon-green/20
            pointer-events-none
            hidden sm:block
          "
        >
          <span ref={labelRef}>Compiling life... {percentage}%</span>
        </div>
      )}
    </div>
  )
}
