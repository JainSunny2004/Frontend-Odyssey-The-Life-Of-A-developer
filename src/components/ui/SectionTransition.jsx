/**
 * SectionTransition — Decorative horizontal divider between sections.
 *
 * Props:
 *   from   (string) — accent color leaving  ('green'|'red'|'yellow'|'purple'|'amber')
 *   to     (string) — accent color entering
 *   label  (string) — optional chapter label shown in centre
 */

import React from 'react'
import { motion } from 'framer-motion'

const COLOR_MAP = {
  green:  'rgba(0,255,136,',
  red:    'rgba(255,85,85,',
  yellow: 'rgba(241,250,140,',
  purple: 'rgba(189,147,249,',
  blue:   'rgba(0,212,255,',
  amber:  'rgba(212,160,23,',
  white:  'rgba(240,246,252,',
}

export default function SectionTransition({ from = 'green', to = 'purple', label }) {
  const fromColor = COLOR_MAP[from] ?? COLOR_MAP.white
  const toColor   = COLOR_MAP[to]   ?? COLOR_MAP.white

  return (
    <div
      className="relative w-full overflow-hidden pointer-events-none"
      style={{ height: '80px' }}
      aria-hidden="true"
    >
      {/* Left gradient arm */}
      <div
        className="absolute left-0 top-1/2 -translate-y-1/2"
        style={{
          width:      'calc(50% - 80px)',
          height:     '1px',
          background: `linear-gradient(90deg, transparent, ${fromColor}0.5))`,
        }}
      />

      {/* Centre label */}
      {label && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="
            absolute left-1/2 top-1/2
            -translate-x-1/2 -translate-y-1/2
            font-mono text-[9px] uppercase tracking-[0.3em]
            text-white/25
            bg-bg-void
            px-4 py-1.5
            border border-bg-border/60
            rounded-full
            whitespace-nowrap
          "
        >
          {label}
        </motion.div>
      )}

      {/* Right gradient arm */}
      <div
        className="absolute right-0 top-1/2 -translate-y-1/2"
        style={{
          width:      'calc(50% - 80px)',
          height:     '1px',
          background: `linear-gradient(270deg, transparent, ${toColor}0.5))`,
        }}
      />

      {/* Centre dot */}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full"
        style={{
          background: `linear-gradient(135deg, ${fromColor}0.8), ${toColor}0.8))`,
          boxShadow:  `0 0 8px ${fromColor}0.5), 0 0 8px ${toColor}0.5)`,
        }}
      />
    </div>
  )
}
