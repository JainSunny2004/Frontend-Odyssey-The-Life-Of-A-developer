import { useState, useEffect, useRef, useCallback } from 'react'

/**
 * useScrollProgress
 * Returns scroll progress as a value between 0 and 1,
 * optimised with requestAnimationFrame to avoid layout thrashing.
 *
 * @returns {{ progress: number, scrollY: number, direction: 'up'|'down'|null }}
 */
export function useScrollProgress() {
  const [state, setState] = useState({
    progress:  0,
    scrollY:   0,
    direction: null,
  })

  const rafId      = useRef(null)
  const lastScrollY = useRef(0)
  const ticking    = useRef(false)

  const update = useCallback(() => {
    const scrollY     = window.scrollY
    const maxScroll   = document.documentElement.scrollHeight - window.innerHeight
    const progress    = maxScroll > 0 ? Math.min(scrollY / maxScroll, 1) : 0
    const direction   = scrollY > lastScrollY.current ? 'down' : scrollY < lastScrollY.current ? 'up' : null

    lastScrollY.current = scrollY
    ticking.current     = false

    setState({ progress, scrollY, direction })
  }, [])

  const onScroll = useCallback(() => {
    if (!ticking.current) {
      rafId.current   = requestAnimationFrame(update)
      ticking.current = true
    }
  }, [update])

  useEffect(() => {
    // Set initial state on mount
    update()

    window.addEventListener('scroll', onScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', onScroll)
      if (rafId.current) cancelAnimationFrame(rafId.current)
    }
  }, [onScroll, update])

  return state
}

/**
 * useSectionScrollProgress
 * Returns 0→1 progress scoped to a specific DOM element.
 *
 * @param {React.RefObject} ref - ref attached to the section element
 * @returns {number} progress 0–1
 */
export function useSectionScrollProgress(ref) {
  const [progress, setProgress] = useState(0)
  const rafId  = useRef(null)
  const ticking = useRef(false)

  const update = useCallback(() => {
    ticking.current = false
    if (!ref.current) return

    const { top, height } = ref.current.getBoundingClientRect()
    const vh = window.innerHeight
    // 0 when top hits bottom of viewport, 1 when bottom leaves top of viewport
    const raw = (vh - top) / (height + vh)
    setProgress(Math.min(Math.max(raw, 0), 1))
  }, [ref])

  const onScroll = useCallback(() => {
    if (!ticking.current) {
      rafId.current   = requestAnimationFrame(update)
      ticking.current = true
    }
  }, [update])

  useEffect(() => {
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (rafId.current) cancelAnimationFrame(rafId.current)
    }
  }, [onScroll, update])

  return progress
}
