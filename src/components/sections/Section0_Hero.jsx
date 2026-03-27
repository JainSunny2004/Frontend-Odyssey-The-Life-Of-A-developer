import React, { useRef, useState, useEffect, useMemo, useCallback } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import gsap from 'gsap'
import { useGSAP } from '@/hooks/useGSAP'

/* ============================================================
   CONSTANTS
   ============================================================ */
const CODE_RAIN = [
  'undefined', 'null', 'NaN', '404', '500',
  'npm install', 'git push --force', 'works on my machine',
  'syntax error', 'node_modules', 'CORS', 'useEffect',
  '// TODO: fix this', 'async/await', 'merge conflict',
  'it depends', '// temporary fix', 'deprecated',
  'rm -rf node_modules', 'yarn.lock', 'segfault',
  '// don\'t touch', 'hotfix/prod', 'localhost:3000',
]

const HERO_STATS = [
  { value: '847', label: 'avg commits per project', color: '#00ff88' },
  { value: '47',  label: 'tabs always open',        color: '#00d4ff' },
  { value: '∞',   label: 'cups of coffee',          color: '#d4a017' },
  { value: '0',   label: 'hours of sleep',          color: '#ff5555' },
]

const CHAPTERS = [
  { num: '01', title: 'The Beginning',      color: '#00ff88', icon: '🌱' },
  { num: '02', title: 'Stack Overflow',      color: '#00d4ff', icon: '🔍' },
  { num: '03', title: 'Debugging Abyss',    color: '#ff5555', icon: '🐛' },
  { num: '04', title: 'Deadline Hell',      color: '#bd93f9', icon: '⏰' },
  { num: '05', title: 'Coffee Religion',    color: '#d4a017', icon: '☕' },
  { num: '06', title: 'Enlightenment',      color: '#f5e6d3', icon: '✨' },
]

/* ============================================================
   FLOATING CODE WORD
   ============================================================ */
function FloatingWord({ word, x, y, delay, duration, opacity }) {
  return (
    <motion.span
      className="absolute font-mono text-xs pointer-events-none select-none whitespace-nowrap"
      style={{ left: `${x}%`, top: `${y}%`, color: `rgba(0,255,136,${opacity})` }}
      initial={{ opacity: 0, y: 0 }}
      animate={{ opacity: [0, opacity, opacity, 0], y: -100 }}
      transition={{
        duration,
        delay,
        repeat:      Infinity,
        repeatDelay: 3 + Math.random() * 4,
        ease:        'linear',
      }}
    >
      {word}
    </motion.span>
  )
}

/* ============================================================
   TYPEWRITER SUBTITLE
   ============================================================ */
function TypewriterText({ text, onDone, speed = 35 }) {
  const [displayed, setDisplayed] = useState('')
  const idxRef = useRef(0)
  const timerRef = useRef(null)
  const prefersReduced = useReducedMotion()

  useEffect(() => {
    if (prefersReduced) {
      setDisplayed(text)
      onDone?.()
      return
    }

    const type = () => {
      if (idxRef.current <= text.length) {
        setDisplayed(text.slice(0, idxRef.current))
        idxRef.current++
        timerRef.current = setTimeout(type, speed + Math.random() * 20)
      } else {
        onDone?.()
      }
    }

    timerRef.current = setTimeout(type, 400)
    return () => clearTimeout(timerRef.current)
  }, [text, speed, onDone, prefersReduced])

  return (
    <span>
      {displayed}
      {displayed.length < text.length && (
        <span className="typewriter-cursor text-transparent" aria-hidden="true">&nbsp;</span>
      )}
    </span>
  )
}

/* ============================================================
   MAIN SECTION
   ============================================================ */
export default function Section0_Hero() {
  const sectionRef     = useRef(null)
  const [phase, setPhase] = useState(0)
  // phase 0 = initial, 1 = title in, 2 = subtitle done, 3 = stats, 4 = cta+chapters

  const prefersReduced = useReducedMotion()

  // Floating words
  const floatingWords = useMemo(() =>
    Array.from({ length: 22 }, (_, i) => ({
      id:       i,
      word:     CODE_RAIN[i % CODE_RAIN.length],
      x:        3 + (i * 41 + 11) % 88,
      y:        5 + (i * 31 + 9)  % 80,
      delay:    i * 0.5,
      duration: 7 + (i % 5),
      opacity:  0.06 + (i % 4) * 0.03,
    })),
  [])

  // GSAP headline entrance
  useGSAP(() => {
    if (prefersReduced) {
      setPhase(4)
      return
    }

    const tl = gsap.timeline({ delay: 0.2 })

    tl.from('.h0-badge', {
      y: 20, opacity: 0, duration: 0.5, ease: 'power3.out',
    })
    .from('.h0-the', {
      y: 50, opacity: 0, duration: 0.55, ease: 'power3.out',
    }, '-=0.15')
    .from('.h0-life', {
      y: 80, opacity: 0, duration: 0.7, ease: 'power3.out',
    }, '-=0.3')
    .from('.h0-ofa', {
      y: 40, opacity: 0, duration: 0.5, ease: 'power3.out',
    }, '-=0.4')
    .from('.h0-developer', {
      y: 80, opacity: 0, duration: 0.75, ease: 'power3.out',
      onComplete: () => setPhase(1),
    }, '-=0.35')
  }, sectionRef, [])

  const handleSubtitleDone = useCallback(() => setPhase(2), [])

  useEffect(() => {
    if (phase === 2) {
      const t = setTimeout(() => setPhase(3), 200)
      return () => clearTimeout(t)
    }
    if (phase === 3) {
      const t = setTimeout(() => setPhase(4), 600)
      return () => clearTimeout(t)
    }
  }, [phase])

  const handleBegin = useCallback(() => {
    const s1 = document.getElementById('section-1')
    s1?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  return (
    <section
      id="section-0"
      ref={sectionRef}
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-bg-void"
      aria-label="Introduction: The Life of a Developer"
    >
      {/* ── Floating background code words ── */}
      {!prefersReduced && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
          {floatingWords.map(w => <FloatingWord key={w.id} {...w} />)}
        </div>
      )}

      {/* ── Radial centre glow ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          background: `
            radial-gradient(ellipse 90% 70% at 50% 50%,
              rgba(0,255,136,0.04) 0%, transparent 65%),
            radial-gradient(ellipse 60% 40% at 20% 80%,
              rgba(0,212,255,0.03) 0%, transparent 60%),
            radial-gradient(ellipse 50% 50% at 80% 20%,
              rgba(189,147,249,0.03) 0%, transparent 60%)
          `,
        }}
      />

      {/* ── Grid ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,255,136,1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,255,136,1) 1px, transparent 1px)
          `,
          backgroundSize: '4.5rem 4.5rem',
          opacity: 0.018,
        }}
      />

      {/* ══════════════════ MAIN CONTENT ══════════════════ */}
      <div className="relative z-10 container-wide px-4 sm:px-6 flex flex-col items-center text-center gap-7 sm:gap-9 py-28">

        {/* Badge */}
        <div
          className="h0-badge inline-flex items-center gap-2.5 font-mono text-xs text-neon-green/60
            tracking-[0.3em] uppercase border border-neon-green/20 px-4 py-1.5
            rounded-full bg-neon-green/5"
          aria-label="An interactive scrollytelling experience — 6 chapters"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-neon-green anim-neon-pulse" aria-hidden="true" />
          Interactive Experience · 6 Chapters
        </div>

        {/* ── Headline ── */}
        <div
          className="space-y-1 sm:space-y-2"
          role="heading"
          aria-level="1"
          aria-label="The Life of a Developer"
        >
          <div className="overflow-hidden">
            <p className="h0-the font-space font-black text-white/25 text-lg sm:text-2xl tracking-[0.18em] uppercase">
              The
            </p>
          </div>

          <div className="overflow-hidden">
            <h1
              className="h0-life font-space font-black leading-none"
              style={{
                fontSize:              'clamp(4rem, 13vw, 9.5rem)',
                background:            'linear-gradient(135deg, #00ff88 0%, #00d4ff 45%, #bd93f9 100%)',
                WebkitBackgroundClip:  'text',
                WebkitTextFillColor:   'transparent',
                backgroundClip:        'text',
                letterSpacing:         '-0.03em',
              }}
            >
              Life
            </h1>
          </div>

          <div className="overflow-hidden">
            <p className="h0-ofa font-space font-black text-white/25 text-lg sm:text-2xl tracking-[0.14em] uppercase">
              of a
            </p>
          </div>

          <div className="overflow-hidden">
            <h2
              className="h0-developer font-space font-black leading-none"
              style={{
                fontSize:      'clamp(2.4rem, 8vw, 6rem)',
                color:         '#f0f6fc',
                letterSpacing: '-0.025em',
              }}
            >
              Developer
            </h2>
          </div>
        </div>

        {/* ── Subtitle ── */}
        <div className="min-h-[3rem] flex items-center max-w-lg" aria-live="polite">
          {(phase >= 1 || prefersReduced) && (
            <p className="font-inter text-base sm:text-lg text-white/40 leading-relaxed">
              <TypewriterText
                text="From writing your first Hello World to shipping at 5 AM — everything they don't teach you."
                onDone={handleSubtitleDone}
                speed={30}
              />
            </p>
          )}
        </div>

        {/* ── Stats ── */}
        <AnimatePresence>
          {(phase >= 3 || prefersReduced) && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full max-w-2xl"
              aria-label="Developer life statistics"
            >
              {HERO_STATS.map(({ value, label, color }, i) => (
                <motion.div
                  key={label}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{
                    delay:    i * 0.1,
                    type:     'spring',
                    stiffness: 260,
                    damping:   20,
                  }}
                  whileHover={{ scale: 1.05, y: -3 }}
                  className="glass-card rounded-xl p-3 sm:p-4 flex flex-col items-center gap-1"
                >
                  <span
                    className="font-mono text-2xl sm:text-3xl font-black"
                    style={{ color, textShadow: `0 0 20px ${color}80` }}
                    aria-label={`${label}: ${value}`}
                  >
                    {value}
                  </span>
                  <span className="font-inter text-[10px] sm:text-xs text-white/35 text-center leading-tight">
                    {label}
                  </span>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── CTA Button ── */}
        <AnimatePresence>
          {(phase >= 4 || prefersReduced) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center gap-4"
            >
              <motion.button
                onClick={handleBegin}
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.96 }}
                aria-label="Begin the journey — scroll to Chapter 1"
                className="group relative overflow-hidden rounded-2xl focus-visible:outline-2 focus-visible:outline-neon-green"
              >
                <div
                  className="relative z-10 flex items-center gap-3 px-8 py-4 font-space text-base font-bold text-bg-void"
                  style={{
                    background:  'linear-gradient(135deg, #00ff88, #00d4ff)',
                    boxShadow:   '0 0 30px rgba(0,255,136,0.45), 0 0 80px rgba(0,255,136,0.15)',
                  }}
                >
                  Begin the Journey
                  <motion.span
                    animate={{ y: [0, 6, 0] }}
                    transition={{ duration: 1.2, repeat: Infinity }}
                    aria-hidden="true"
                  >
                    ↓
                  </motion.span>
                </div>
                {/* Sweep shine */}
                <div
                  className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 z-20 pointer-events-none"
                  style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent)' }}
                  aria-hidden="true"
                />
              </motion.button>

              <p className="font-mono text-[10px] text-white/20">
                scroll or click to start
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Chapter preview strip ── */}
        <AnimatePresence>
          {(phase >= 4 || prefersReduced) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="w-full max-w-2xl"
              aria-label="6 chapters in this story"
            >
              <p className="font-mono text-[10px] text-white/20 uppercase tracking-widest mb-4">
                your journey ahead
              </p>

              {/* Connecting line */}
              <div className="relative">
                <div
                  className="absolute top-2.5 left-0 right-0 h-px"
                  style={{
                    background: 'linear-gradient(90deg, #00ff88, #00d4ff, #ff5555, #bd93f9, #d4a017, #f5e6d3)',
                    opacity:    0.2,
                  }}
                  aria-hidden="true"
                />

                {/* Chapter dots */}
                <div className="relative flex items-start justify-between">
                  {CHAPTERS.map((ch, i) => (
                    <motion.div
                      key={ch.num}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{
                        delay:    0.3 + i * 0.08,
                        type:     'spring',
                        stiffness: 300,
                        damping:   22,
                      }}
                      className="flex flex-col items-center gap-2 flex-1"
                    >
                      {/* Dot */}
                      <div
                        className="w-5 h-5 rounded-full border-2 flex items-center justify-center"
                        style={{
                          borderColor: ch.color,
                          background:  `${ch.color}15`,
                          boxShadow:   `0 0 10px ${ch.color}50`,
                        }}
                        aria-hidden="true"
                      >
                        <span className="text-[10px]">{ch.icon}</span>
                      </div>

                      {/* Number */}
                      <span
                        className="font-mono text-[10px] font-bold"
                        style={{ color: ch.color, opacity: 0.7 }}
                      >
                        {ch.num}
                      </span>

                      {/* Title — desktop only */}
                      <span className="hidden sm:block font-inter text-[9px] text-white/25 text-center leading-tight max-w-[70px]">
                        {ch.title}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Scroll bounce indicator ── */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
        aria-hidden="true"
      >
        <span className="font-mono text-[10px] text-white/20 uppercase tracking-widest">scroll</span>
        <div className="w-px h-10 bg-gradient-to-b from-neon-green/40 to-transparent" />
      </motion.div>

      {/* ── Bottom fade ── */}
      <div
        className="absolute bottom-0 left-0 right-0 h-40 pointer-events-none"
        aria-hidden="true"
        style={{ background: 'linear-gradient(to bottom, transparent, rgba(10,10,15,1))' }}
      />
    </section>
  )
}
