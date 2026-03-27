import React, { useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'

const SUSPECTS = [
  { name: 'Alex (Intern)',  probability: '2%',  color: '#00d4ff', emoji: '👶' },
  { name: 'npm update',     probability: '5%',  color: '#f1fa8c', emoji: '📦' },
  { name: 'Legacy code',    probability: '8%',  color: '#ffb86c', emoji: '🦕' },
  { name: 'The PM',         probability: '1%',  color: '#bd93f9', emoji: '🎭' },
  { name: 'Copy-paste SO',  probability: '12%', color: '#00ff88', emoji: '📋' },
  { name: 'YOU',            probability: '99%', color: '#ff5555', emoji: '🫵' },
  { name: 'Cosmic rays',    probability: '0%',  color: '#c8a882', emoji: '☄️'  },
  { name: 'YOU (again)',    probability: '100%',color: '#ff5555', emoji: '💀' },
]

const BROKEN_LINES = [
  { line: 17,  code: 'const data = fetch(url)' },
  { line: 42,  code: 'if (user = null)' },
  { line: 103, code: '// TODO: fix this properly' },
  { line: 256, code: 'return undefined' },
]

export default function GitBlameSpin() {
  const [spinning,  setSpinning]  = useState(false)
  const [result,    setResult]    = useState(null)
  const [tickIdx,   setTickIdx]   = useState(0)
  const [lineIdx,   setLineIdx]   = useState(0)
  const [spins,     setSpins]     = useState(0)
  const tickRef     = useRef(null)
  const prefersReduced = useReducedMotion()

  const currentLine = BROKEN_LINES[lineIdx % BROKEN_LINES.length]

  const handleBlame = useCallback(() => {
    if (spinning) return
    setSpinning(true)
    setResult(null)

    if (prefersReduced) {
      setResult(SUSPECTS[SUSPECTS.length - 1])
      setSpinning(false)
      setSpins(s => s + 1)
      return
    }

    // Tick through suspects, always land on YOU
    let tick = 0
    const totalTicks = 14 + Math.floor(Math.random() * 6)

    const run = () => {
      setTickIdx(t => (t + 1) % SUSPECTS.length)
      tick++
      if (tick < totalTicks) {
        // Slow down near the end
        const delay = tick < totalTicks * 0.6 ? 80 : tick < totalTicks * 0.85 ? 140 : 250
        tickRef.current = setTimeout(run, delay)
      } else {
        // Always land on YOU (index 5 or 7)
        const youIdx = spins % 2 === 0 ? 5 : 7
        setTickIdx(youIdx)
        setResult(SUSPECTS[youIdx])
        setSpinning(false)
        setSpins(s => s + 1)
      }
    }

    tickRef.current = setTimeout(run, 80)
  }, [spinning, spins, prefersReduced])

  return (
    <div
      className="space-y-5"
      role="region"
      aria-label="Git blame roulette — find who wrote the broken code"
    >
      {/* Header */}
      <div className="space-y-1">
        <p className="font-mono text-[10px] text-white/25 uppercase tracking-[0.25em]">
          Interactive — git blame roulette
        </p>
        <h3 className="font-space text-xl sm:text-2xl font-bold text-white">
          Who wrote this{' '}
          <span className="text-neon-red">broken code?</span>
        </h3>
      </div>

      {/* Broken code line */}
      <div
        className="terminal-window rounded-xl overflow-hidden"
        aria-label={`Broken code on line ${currentLine.line}`}
      >
        <div className="terminal-titlebar">
          <span className="terminal-dot terminal-dot-red"    aria-hidden="true" />
          <span className="terminal-dot terminal-dot-yellow" aria-hidden="true" />
          <span className="terminal-dot terminal-dot-green"  aria-hidden="true" />
          <span className="ml-3 font-mono text-[10px] text-white/30">mystery_file.js</span>
        </div>
        <div className="terminal-body space-y-1">
          {[currentLine.line - 1, currentLine.line, currentLine.line + 1].map((n, i) => (
            <div key={n} className="flex gap-3 items-center">
              <span className="text-white/15 select-none text-[10px] w-8 text-right flex-shrink-0">
                {n}
              </span>
              <span
                className={`font-mono text-xs ${
                  i === 1 ? 'text-neon-red/90 bg-neon-red/10 px-2 py-0.5 rounded flex-1' : 'text-white/30'
                }`}
              >
                {i === 0 ? '// everything was fine until...' :
                 i === 1 ? currentLine.code :
                 '// 💀'}
              </span>
              {i === 1 && (
                <span className="text-neon-red/60 text-xs flex-shrink-0" aria-hidden="true">← 🔴</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Roulette wheel display */}
      <div
        className="glass-card rounded-2xl p-5 border border-neon-red/15 space-y-4"
        aria-live="polite"
      >
        <div className="flex items-center justify-between">
          <span className="font-mono text-xs text-white/30">Scanning git history...</span>
          {spinning && (
            <motion.span
              animate={{ rotate: 360 }}
              transition={{ duration: 0.5, repeat: Infinity, ease: 'linear' }}
              className="font-mono text-xs text-neon-blue/60"
              aria-hidden="true"
            >
              ⟳
            </motion.span>
          )}
        </div>

        {/* Suspect slots */}
        <div className="relative h-16 overflow-hidden rounded-xl bg-bg-deep/60 border border-bg-border/40">
          {/* Side fade masks */}
          <div
            className="absolute inset-y-0 left-0 w-12 z-10 pointer-events-none"
            style={{ background: 'linear-gradient(90deg, rgba(8,8,16,0.95), transparent)' }}
            aria-hidden="true"
          />
          <div
            className="absolute inset-y-0 right-0 w-12 z-10 pointer-events-none"
            style={{ background: 'linear-gradient(270deg, rgba(8,8,16,0.95), transparent)' }}
            aria-hidden="true"
          />

          {/* Centre selector line */}
          <div
            className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-24 z-10 pointer-events-none rounded border"
            style={{
              borderColor: result ? result.color + '60' : 'rgba(255,255,255,0.08)',
              background:  result ? `${result.color}10` : 'transparent',
              transition:  'all 0.3s',
            }}
            aria-hidden="true"
          />

          {/* Scrolling suspects */}
          <AnimatePresence mode="wait">
            <motion.div
              key={tickIdx}
              initial={{ y: spinning ? -30 : 0, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 30, opacity: 0 }}
              transition={{ duration: 0.08 }}
              className="absolute inset-0 flex items-center justify-center gap-6"
              aria-hidden="true"
            >
              {[-2, -1, 0, 1, 2].map(offset => {
                const idx = (tickIdx + offset + SUSPECTS.length) % SUSPECTS.length
                const s = SUSPECTS[idx]
                const isCenter = offset === 0
                return (
                  <div
                    key={offset}
                    className={`flex flex-col items-center transition-all duration-150 ${
                      isCenter ? 'scale-110' : 'scale-75 opacity-30'
                    }`}
                  >
                    <span className="text-base">{s.emoji}</span>
                    <span
                      className="font-mono text-[9px] font-bold whitespace-nowrap"
                      style={{ color: isCenter ? s.color : 'rgba(255,255,255,0.3)' }}
                    >
                      {s.name}
                    </span>
                  </div>
                )
              })}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Result reveal */}
        <AnimatePresence>
          {result && !spinning && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="text-center space-y-2 pt-2 border-t border-bg-border/40"
              role="alert"
            >
              <p className="font-mono text-[10px] text-white/30 uppercase tracking-wider">
                git blame says...
              </p>
              <p
                className="font-space text-2xl sm:text-3xl font-black"
                style={{ color: result.color, textShadow: `0 0 20px ${result.color}80` }}
              >
                {result.emoji} {result.name}
              </p>
              <p className="font-mono text-xs text-white/30">
                Probability: {result.probability}
                {result.name.includes('YOU') && ' — as always.'}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Blame button */}
        <motion.button
          onClick={handleBlame}
          disabled={spinning}
          whileHover={!spinning ? { scale: 1.03 } : {}}
          whileTap={!spinning  ? { scale: 0.96 } : {}}
          className="w-full py-3 rounded-xl font-space text-sm font-bold transition-all duration-200 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-neon-red"
          style={{
            background:  spinning ? 'rgba(30,32,48,0.6)' : 'linear-gradient(135deg, #ff5555, #ff79c6)',
            color:       spinning ? 'rgba(255,255,255,0.3)' : '#0a0a0f',
            boxShadow:   spinning ? 'none' : '0 0 20px rgba(255,85,85,0.35)',
          }}
          aria-label={spinning ? 'Scanning git history...' : 'Run git blame — find the culprit'}
        >
          {spinning ? '⟳ Scanning git history...' : spins > 0 ? '🔍 Blame again (it\'s still you)' : '🔍 Run git blame'}
        </motion.button>
      </div>

      {/* Next line button */}
      <button
        onClick={() => setLineIdx(l => l + 1)}
        className="font-mono text-[10px] text-white/20 hover:text-white/45 transition-colors focus-visible:outline-2 focus-visible:outline-neon-green"
        aria-label="Show different broken code line"
      >
        → try a different broken line
      </button>
    </div>
  )
}
