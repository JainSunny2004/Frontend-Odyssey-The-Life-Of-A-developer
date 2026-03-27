import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'

const MESSAGES = [
  { threshold: 0,  text: 'Calm. Suspiciously calm.',               color: '#00ff88' },
  { threshold: 12, text: 'Typing with mild urgency.',              color: '#00ff88' },
  { threshold: 28, text: 'The keyboard is beginning to feel it.', color: '#f1fa8c' },
  { threshold: 45, text: 'Someone nearby just backed away.',       color: '#f1fa8c' },
  { threshold: 62, text: 'CTRL+Z won\'t save you now.',           color: '#ffb86c' },
  { threshold: 78, text: 'The keyboard is filing a complaint.',    color: '#ff5555' },
  { threshold: 90, text: '💀 DEADLINE MODE: FULLY ACTIVATED',     color: '#ff5555' },
]

const VISUAL_KEYS = [
  ['Esc', 'F1', 'F2', 'F3', 'F4'],
  ['`',   '1',  '2',  '3',  'Tab'],
  ['Ctrl','A',  'S',  'D',  'F'],
  ['Shift','Z', 'X',  'C',  'V'],
]

export default function KeyboardRageMeter() {
  const [rage,       setRage]       = useState(0)
  const [history,    setHistory]    = useState([])
  const [activeKey,  setActiveKey]  = useState(null)
  const [totalKeys,  setTotalKeys]  = useState(0)
  const [shaking,    setShaking]    = useState(false)
  const inputRef    = useRef(null)
  const decayRef    = useRef(null)
  const shakeTimerRef = useRef(null)
  const prefersReduced = useReducedMotion()

  const currentMsg = useMemo(() =>
    [...MESSAGES].reverse().find(m => rage >= m.threshold) ?? MESSAGES[0],
  [rage])

  // Decay rage over time
  useEffect(() => {
    decayRef.current = setInterval(() => {
      setRage(r => Math.max(0, r - 1.5))
    }, 180)
    return () => clearInterval(decayRef.current)
  }, [])

  const handleKeyDown = useCallback((e) => {
    e.preventDefault()

    const key = e.key
    const boost =
      key === 'Backspace'  ? 5  :
      key === 'Delete'     ? 5  :
      key === 'Escape'     ? 7  :
      key === 'Enter'      ? 4  :
      e.ctrlKey || e.metaKey ? 6 :
      e.shiftKey           ? 4  :
      2

    setRage(r => {
      const next = Math.min(100, r + boost)
      if (next > 80 && !prefersReduced) {
        clearTimeout(shakeTimerRef.current)
        setShaking(true)
        shakeTimerRef.current = setTimeout(() => setShaking(false), 500)
      }
      return next
    })

    const label = key === ' ' ? '␣' : key.length === 1 ? key : key.slice(0, 4)
    setActiveKey(label)
    setHistory(prev => [...prev.slice(-8), label])
    setTotalKeys(t => t + 1)
    setTimeout(() => setActiveKey(null), 150)
  }, [prefersReduced])

  const handleReset = useCallback(() => {
    setRage(0)
    setHistory([])
    setTotalKeys(0)
  }, [])

  return (
    <div
      className="space-y-5"
      role="region"
      aria-label="Keyboard rage meter — deadline stress simulator"
    >
      {/* Header */}
      <div className="space-y-1">
        <p className="font-mono text-[10px] text-white/25 uppercase tracking-[0.25em]">
          Interactive — deadline stress simulator
        </p>
        <h3 className="font-space text-xl sm:text-2xl font-bold text-white">
          How hard are you{' '}
          <span className="text-neon-red">typing?</span>
        </h3>
      </div>

      {/* Capture zone */}
      <motion.div
        animate={shaking ? { x: [-6, 6, -4, 4, -2, 2, 0] } : {}}
        transition={{ duration: 0.4 }}
        className={`
          relative glass-card rounded-2xl p-4 sm:p-5
          border transition-colors duration-200 cursor-text
          ${rage > 60
            ? 'border-neon-red/50'
            : rage > 30
            ? 'border-neon-yellow/30'
            : 'border-neon-green/20 focus-within:border-neon-green/40'}
        `}
        onClick={() => inputRef.current?.focus()}
        role="group"
      >
        {/* Hidden input */}
        <input
          ref={inputRef}
          onKeyDown={handleKeyDown}
          className="absolute inset-0 opacity-0 w-full h-full cursor-text"
          aria-label="Click here and type anything to register keystrokes"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          readOnly={false}
          tabIndex={0}
        />

        {/* Key history */}
        <div className="flex items-center gap-1.5 flex-wrap min-h-[38px]">
          <span className="font-mono text-[10px] text-white/20 flex-shrink-0 mr-1">
            click + type:
          </span>
          <AnimatePresence mode="popLayout">
            {history.map((k, i) => (
              <motion.kbd
                key={`${i}-${k}-${totalKeys}`}
                initial={{ opacity: 0, scale: 0.5, y: -12 }}
                animate={{ opacity: 0.7, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.7, y: 8 }}
                transition={{ duration: 0.18 }}
                className="font-mono text-[10px] text-white/70 bg-bg-surface border border-bg-border/70 px-1.5 py-0.5 rounded"
              >
                {k}
              </motion.kbd>
            ))}
          </AnimatePresence>

          {history.length === 0 && (
            <motion.span
              animate={{ opacity: [0.3, 0.7, 0.3] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="font-mono text-xs text-white/20 italic"
            >
              tap here, then type anything...
            </motion.span>
          )}
        </div>
      </motion.div>

      {/* Rage bar */}
      <div className="space-y-2.5">
        <div className="flex justify-between items-center">
          <span className="font-mono text-xs text-white/35 uppercase tracking-wider">
            Rage Level
          </span>
          <div className="flex items-center gap-3">
            <span className="font-mono text-[10px] text-white/25">
              {totalKeys} keys pressed
            </span>
            <motion.span
              key={Math.floor(rage / 5)}
              initial={{ scale: 1.4 }}
              animate={{ scale: 1 }}
              className="font-mono text-sm font-black"
              style={{ color: currentMsg.color, textShadow: `0 0 12px ${currentMsg.color}80` }}
              aria-live="polite"
              aria-label={`Rage level: ${Math.round(rage)}%`}
            >
              {Math.round(rage)}%
            </motion.span>
          </div>
        </div>

        {/* Bar */}
        <div className="h-5 bg-bg-border/50 rounded-full overflow-hidden relative">
          <motion.div
            className="h-full rounded-full"
            style={{
              background:
                rage > 75 ? 'linear-gradient(90deg, #ff5555, #ff79c6)' :
                rage > 45 ? 'linear-gradient(90deg, #f1fa8c, #ffb86c)' :
                'linear-gradient(90deg, #00ff88, #00d4ff)',
              boxShadow: `0 0 14px ${currentMsg.color}80`,
            }}
            animate={{ width: `${rage}%` }}
            transition={{ duration: 0.12 }}
          />

          {/* 80% danger marker */}
          <div
            className="absolute inset-y-0 w-0.5 bg-neon-red/40"
            style={{ left: '80%' }}
            aria-hidden="true"
          />
          <span
            className="absolute top-0.5 font-mono text-[8px] text-neon-red/40"
            style={{ left: '81%' }}
            aria-hidden="true"
          >
            danger
          </span>
        </div>

        {/* Status message */}
        <AnimatePresence mode="wait">
          <motion.p
            key={currentMsg.text}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.22 }}
            className="font-mono text-xs italic"
            style={{ color: currentMsg.color }}
            aria-live="polite"
          >
            {currentMsg.text}
          </motion.p>
        </AnimatePresence>
      </div>

      {/* Visual keyboard */}
      <div
        className="space-y-1.5"
        aria-hidden="true"
      >
        {VISUAL_KEYS.map((row, ri) => (
          <div key={ri} className="flex gap-1.5">
            {row.map((k) => (
              <motion.div
                key={k}
                animate={activeKey === k
                  ? {
                      scale:      [1, 0.82, 1],
                      background: ['rgba(30,32,48,0.8)', `${currentMsg.color}30`, 'rgba(30,32,48,0.8)'],
                      borderColor:[`rgba(30,32,48,0.9)`, currentMsg.color, 'rgba(30,32,48,0.9)'],
                    }
                  : {}
                }
                transition={{ duration: 0.18 }}
                className="font-mono text-[9px] text-white/30 bg-bg-surface/70 border border-bg-border/70 px-2 py-1.5 rounded flex-shrink-0 min-w-[2rem] text-center"
              >
                {k}
              </motion.div>
            ))}
          </div>
        ))}
      </div>

      {/* Max rage easter egg */}
      <AnimatePresence>
        {rage >= 92 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="font-mono text-xs text-center text-neon-red p-4 border border-neon-red/30 rounded-xl bg-neon-red/5 space-y-1"
            role="alert"
            aria-live="assertive"
          >
            <p className="font-bold">🔥 MAXIMUM RAGE ACHIEVED</p>
            <p className="text-neon-red/60">Step away from the keyboard. Nobody needs this code today.</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reset */}
      {totalKeys > 0 && (
        <button
          onClick={handleReset}
          className="font-mono text-[10px] text-white/20 hover:text-white/45 transition-colors underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-neon-green"
          aria-label="Reset rage meter"
        >
          ← reset (take a breath first)
        </button>
      )}
    </div>
  )
}
