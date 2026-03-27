/**
 * GlitchText — Full standalone reusable glitch component.
 *
 * Props:
 *   text             (string)  — text to display
 *   as               (string)  — HTML element tag, default 'span'
 *   className        (string)  — additional classes
 *   style            (object)  — inline styles for the wrapper
 *   interval         (number|[min,max]) — ms between glitches (default [2000, 5000])
 *   glitchDuration   (number)  — ms the glitch lasts (default 420)
 *   colors           (object)  — { primary, secondary } for RGB split layers
 *   aria-label       (string)  — optional accessible label override
 *
 * Features:
 *   - Self-scheduling with randomised intervals
 *   - Two chromatic aberration ghost layers (upper + lower clip)
 *   - CSS `anim-rgb-shift` applied to outer element for horizontal drift
 *   - Full prefers-reduced-motion support
 *   - Accessible — screen readers read `text` directly
 */

import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  forwardRef,
} from 'react'
import { useReducedMotion } from 'framer-motion'

const GlitchText = forwardRef(function GlitchText(
  {
    text,
    as: Tag = 'span',
    className = '',
    style = {},
    interval = [2000, 5000],
    glitchDuration = 420,
    colors = {
      primary:   '#ff5555',  // upper clip — red
      secondary: '#00d4ff',  // lower clip — cyan
    },
    'aria-label': ariaLabel,
    children,
    ...rest
  },
  ref
) {
  const [glitching,  setGlitching]  = useState(false)
  const timerRef                     = useRef(null)
  const prefersReduced               = useReducedMotion()

  const scheduleNext = useCallback(() => {
    const [min, max] = Array.isArray(interval) ? interval : [interval, interval * 1.6]
    const delay      = min + Math.random() * (max - min)

    timerRef.current = setTimeout(() => {
      setGlitching(true)
      timerRef.current = setTimeout(() => {
        setGlitching(false)
        scheduleNext()
      }, glitchDuration)
    }, delay)
  }, [interval, glitchDuration])

  useEffect(() => {
    if (prefersReduced) return
    scheduleNext()
    return () => clearTimeout(timerRef.current)
  }, [prefersReduced, scheduleNext])

  // The displayed content — text prop or children
  const content = text ?? children

  return (
    <Tag
      ref={ref}
      className={`
        relative inline-block select-none
        ${glitching && !prefersReduced ? 'anim-rgb-shift' : ''}
        ${className}
      `}
      style={style}
      aria-label={ariaLabel ?? (typeof content === 'string' ? content : undefined)}
      {...rest}
    >
      {/* ── Main readable text ── */}
      <span className="relative z-10" aria-hidden={ariaLabel ? 'true' : undefined}>
        {content}
      </span>

      {/* ── Glitch layer A: upper clip, shifts left ── */}
      {glitching && !prefersReduced && (
        <span
          aria-hidden="true"
          className="absolute inset-0 z-20 pointer-events-none"
          style={{
            color:                  colors.primary,
            clipPath:               'inset(15% 0 58% 0)',
            transform:              'translate(-5px, -2px)',
            opacity:                0.88,
            fontFeatureSettings:    'inherit',
          }}
        >
          {content}
        </span>
      )}

      {/* ── Glitch layer B: lower clip, shifts right ── */}
      {glitching && !prefersReduced && (
        <span
          aria-hidden="true"
          className="absolute inset-0 z-20 pointer-events-none"
          style={{
            color:     colors.secondary,
            clipPath:  'inset(62% 0 8% 0)',
            transform: 'translate(5px, 2px)',
            opacity:   0.78,
          }}
        >
          {content}
        </span>
      )}

      {/* ── Glitch layer C: mid clip, no shift ── */}
      {glitching && !prefersReduced && (
        <span
          aria-hidden="true"
          className="absolute inset-0 z-20 pointer-events-none"
          style={{
            color:     '#ff79c6',
            clipPath:  'inset(38% 0 38% 0)',
            transform: 'translate(-2px, 1px)',
            opacity:   0.5,
          }}
        >
          {content}
        </span>
      )}
    </Tag>
  )
})

export default GlitchText
