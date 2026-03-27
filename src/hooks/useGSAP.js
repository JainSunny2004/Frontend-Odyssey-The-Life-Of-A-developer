/**
 * useGSAP — Context-scoped GSAP hook with automatic cleanup.
 *
 * Signature: useGSAP(callback, scopeRef, deps)
 *   - callback  : Function — called within gsap.context()
 *   - scopeRef  : React ref to a DOM element — scopes selector queries
 *   - deps      : Dependency array — triggers revert + re-run on change
 *
 * All ScrollTriggers and tweens created inside callback are automatically
 * reverted when deps change or component unmounts (via ctx.revert()).
 */

import { useLayoutEffect, useEffect, useRef } from 'react'
import gsap from 'gsap'

// SSR-safe layout effect
const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect

export function useGSAP(callback, scopeRef, deps = []) {
  // Stable ref to always-fresh callback — avoids stale closure issues
  // while keeping the effect deps array clean
  const savedCallback = useRef(callback)

  useIsomorphicLayoutEffect(() => {
    savedCallback.current = callback
  })

  useIsomorphicLayoutEffect(() => {
    // Scope can be a ref object OR a DOM element OR null
    const scope = scopeRef?.current ?? null

    // Create context — scopes selector strings like '.my-element'
    // to descendants of `scope`, preventing cross-section interference
    const ctx = gsap.context(() => {
      savedCallback.current()
    }, scope)

    // Cleanup: reverts ALL animations, ScrollTriggers, and
    // matchMedia listeners created within this context
    return () => ctx.revert()

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}
