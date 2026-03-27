/**
 * ScrollProgress — Fixed thin bar at top of viewport.
 * Tracks overall page scroll progress 0–1 → fills left to right.
 * Gradient cycles through the project's neon palette.
 */

import React, { useState, useEffect, useCallback, useRef } from 'react'

export default function ScrollProgress() {
  const [progress, setProgress] = useState(0)
  const rafRef = useRef(null)

  const compute = useCallback(() => {
    const doc          = document.documentElement
    const scrollTop    = window.scrollY || doc.scrollTop
    const scrollHeight = doc.scrollHeight - doc.clientHeight
    if (scrollHeight <= 0) { setProgress(0); return }
    setProgress(Math.min(scrollTop / scrollHeight, 1))
  }, [])

  const onScroll = useCallback(() => {
    if (rafRef.current) return
    rafRef.current = requestAnimationFrame(() => {
      compute()
      rafRef.current = null
    })
  }, [compute])

  useEffect(() => {
    compute()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [compute, onScroll])

  const pct = Math.round(progress * 100)

  return (
    <div
      role="progressbar"
      aria-label="Page reading progress"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
      className="fixed top-0 left-0 right-0 z-[9998] h-[2px] pointer-events-none"
      style={{ background: 'rgba(30,32,48,0.25)' }}
    >
      {/* Fill bar */}
      <div
        className="h-full"
        style={{
          width:      `${pct}%`,
          background: 'linear-gradient(90deg, #00ff88 0%, #00d4ff 33%, #bd93f9 66%, #d4a017 100%)',
          boxShadow:  '0 0 8px rgba(0,255,136,0.6), 0 0 20px rgba(0,212,255,0.25)',
          transition: 'width 80ms linear',
          willChange: 'width',
        }}
      />

      {/* Leading glow dot */}
      {progress > 0.01 && progress < 0.99 && (
        <div
          className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full -translate-x-1/2"
          style={{
            left:       `${pct}%`,
            background: '#00ff88',
            boxShadow:  '0 0 6px #00ff88, 0 0 14px rgba(0,255,136,0.6)',
          }}
          aria-hidden="true"
        />
      )}
    </div>
  )
}
