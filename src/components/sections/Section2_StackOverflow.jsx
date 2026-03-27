import React, {
  useRef,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@/hooks/useGSAP'

gsap.registerPlugin(ScrollTrigger)

/* ============================================================
   CONSTANTS
   ============================================================ */

const TERMINAL_SEQUENCE = [
  {
    type: 'input',
    text: 'npm install life',
    delay: 80,
    pause: 600,
  },
  {
    type: 'output',
    lines: [
      { text: 'npm warn deprecated meaning@1.0.0: Use purpose instead', cls: 'terminal-output-warning' },
      { text: 'npm warn deprecated happiness@3.2.1: No longer maintained', cls: 'terminal-output-warning' },
      { text: 'npm warn deprecated work-life-balance@0.0.1: Never existed', cls: 'terminal-output-warning' },
      { text: '', cls: '' },
      { text: 'added 847 packages in 4.2s', cls: 'terminal-output-muted' },
      { text: '', cls: '' },
      { text: '⚠  found 847 vulnerabilities (412 moderate, 435 critical)', cls: 'terminal-output-error' },
      { text: '   run `npm audit fix --force` to fix them, or `npm audit`', cls: 'terminal-output-muted' },
      { text: '   for details. Good luck.', cls: 'terminal-output-muted' },
    ],
    pause: 900,
  },
  {
    type: 'input',
    text: 'npm install --force happiness',
    delay: 70,
    pause: 500,
  },
  {
    type: 'output',
    lines: [
      { text: 'npm error 404 Not Found: happiness@latest', cls: 'terminal-output-error' },
      { text: "npm error 404 'happiness' is not in this registry.", cls: 'terminal-output-error' },
      { text: '', cls: '' },
      { text: 'npm error A complete log of this run can be found in:', cls: 'terminal-output-muted' },
      { text: '    /Users/you/.npm/_logs/why-do-i-do-this.log', cls: 'terminal-output-muted' },
    ],
    pause: 700,
  },
  {
    type: 'input',
    text: 'npm install --save-dev motivation',
    delay: 70,
    pause: 400,
  },
  {
    type: 'output',
    lines: [
      { text: 'npm error peer dep conflict: requires node@">=∞"', cls: 'terminal-output-error' },
      { text: "npm error Fix the upstream dependency conflict, or retry", cls: 'terminal-output-muted' },
      { text: '', cls: '' },
      { text: '$ google: "how to fix npm peer dependency conflict"', cls: 'terminal-output-success' },
      { text: '  Opening tab 47 of 47...', cls: 'terminal-output-warning' },
    ],
    pause: 0,
  },
]

const TAB_DATA = [
  { title: 'How to center a div', votes: '8.4k', href: '#' },
  { title: 'npm ERR! peer dep conflict 2024', votes: '3.1k', href: '#' },
  { title: 'React hooks: exhaustive-deps warning', votes: '5.7k', href: '#' },
  { title: 'Cannot read property of undefined', votes: '12k', href: '#' },
  { title: 'Flexbox vs Grid: which one to use', votes: '9.2k', href: '#' },
  { title: 'Git: how to undo a commit', votes: '22k', href: '#' },
  { title: 'Promise is not defined', votes: '4.3k', href: '#' },
  { title: 'async/await vs .then() - when to use', votes: '7.8k', href: '#' },
  { title: 'Z-index not working', votes: '6.5k', href: '#' },
  { title: 'CORS error localhost fix', votes: '18k', href: '#' },
  { title: 'useEffect runs twice React 18', votes: '11k', href: '#' },
  { title: 'TypeError: map is not a function', votes: '9.9k', href: '#' },
  { title: 'How to remove node_modules properly', votes: '2.1k', href: '#' },
  { title: 'Why is my API returning 401', votes: '5.2k', href: '#' },
  { title: 'Tailwind styles not applying', votes: '3.8k', href: '#' },
  { title: 'Is it okay to copy code from SO?', votes: '∞', href: '#' },
]

const MOMENTS = [
  {
    id: 'moment-1',
    heading: 'The Search Begins',
    emoji: '🔍',
    body: `It's a simple task. "Just add a dropdown." 40 minutes later you have 23 Stack Overflow tabs, a Medium article from 2017, and a Reddit thread where everyone is wrong.`,
    stat: { value: '23', label: 'tabs opened' },
    accent: 'neon-blue',
  },
  {
    id: 'moment-2',
    heading: 'Copy. Paste. Pray.',
    emoji: '🙏',
    body: 'You find the answer. It has 847 upvotes. You paste it. Different error. You paste the answer to that error. Original error returns. You accept this is your life now.',
    stat: { value: '847', label: 'upvotes blindly trusted' },
    accent: 'neon-purple',
  },
  {
    id: 'moment-3',
    heading: 'Imposter Mode: Active',
    emoji: '👻',
    body: '"Am I even a developer?" — you think, while 80% of senior engineers are googling the exact same thing right now. The difference is they feel less bad about it.',
    stat: { value: '94%', label: 'of devs feel this' },
    accent: 'neon-green',
  },
]

const TOOLTIP_ANSWERS = [
  'Top answer: accepted 2009. Code uses jQuery 1.3.',
  'Marked duplicate of a question that is also marked duplicate.',
  '47 answers, none work for your version.',
  'Top comment: "Why do you need to do this?"',
  'Best answer: "Just use [framework you\'re not using]"',
  'Thread closed. Reason: "Not a real question."',
  '3 answers, all say the opposite thing.',
  'Only answer: "Did you try turning it off and on?"',
]

/* ============================================================
   MINI TERMINAL
   Inline terminal that runs the TERMINAL_SEQUENCE automatically.
   ============================================================ */
function MiniTerminal({ active }) {
  const [rendered, setRendered] = useState([])
  const [currentLine, setCurrentLine] = useState('')
  const [isDone, setIsDone] = useState(false)
  const bodyRef = useRef(null)

  // ── All sequence state in ONE ref — zero async race conditions ──
  const seq = useRef({
    idx: 0,       // TERMINAL_SEQUENCE index
    charIdx: 0,       // characters typed so far
    phase: 'input', // 'input' | 'output'
    outputIdx: 0,       // index within step.lines
    timer: null,
    running: false,
  })

  // Auto-scroll
  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight
    }
  }, [rendered, currentLine])

  // Tick function — purely ref-driven, no stale state
  const tick = useCallback(() => {
    const s = seq.current
    if (!s.running) return

    // Bounds check first
    if (s.idx >= TERMINAL_SEQUENCE.length) {
      s.running = false
      setIsDone(true)
      return
    }

    const step = TERMINAL_SEQUENCE[s.idx]

    // Defensive: step must exist
    if (!step) {
      s.running = false
      setIsDone(true)
      return
    }

    if (s.phase === 'input') {
      const text = step.text ?? ''

      if (s.charIdx < text.length) {
        // Type next character
        s.charIdx++
        setCurrentLine(text.slice(0, s.charIdx))
        s.timer = setTimeout(tick, (step.delay ?? 80) + Math.random() * 20)

      } else {
        // Input line complete — commit to rendered, move to output phase
        setRendered(prev => [...prev, { kind: 'input', text }])
        setCurrentLine('')
        s.phase = 'output'
        s.outputIdx = 0
        s.timer = setTimeout(tick, step.pause ?? 400)
      }

    } else {
      // Output phase
      const lines = Array.isArray(step.lines) ? step.lines : []

      if (s.outputIdx < lines.length) {
        // Emit next output line
        const line = lines[s.outputIdx] ?? {}
        setRendered(prev => [
          ...prev,
          { kind: 'output', text: line.text ?? '', cls: line.cls ?? '' },
        ])
        s.outputIdx++
        s.timer = setTimeout(tick, 90)

      } else {
        // Output done — move to next sequence step
        const pause = step.pause ?? 400
        s.idx++
        s.charIdx = 0
        s.phase = 'input'
        s.outputIdx = 0

        if (s.idx >= TERMINAL_SEQUENCE.length) {
          // Last step finished
          s.timer = setTimeout(() => {
            s.running = false
            setIsDone(true)
          }, pause)
        } else {
          s.timer = setTimeout(tick, pause)
        }
      }
    }
  }, []) // ← no deps — reads/writes only via ref

  // Kick off on active
  useEffect(() => {
    if (!active) return

    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (prefersReduced) {
      // Dump everything instantly
      const all = []
      TERMINAL_SEQUENCE.forEach(step => {
        if (!step) return
        if (step.type === 'input') {
          all.push({ kind: 'input', text: step.text ?? '' })
        } else {
          ; (Array.isArray(step.lines) ? step.lines : []).forEach(l => {
            all.push({ kind: 'output', text: l?.text ?? '', cls: l?.cls ?? '' })
          })
        }
      })
      setRendered(all)
      setIsDone(true)
      return
    }

    // Start animated sequence
    seq.current.running = true
    seq.current.timer = setTimeout(tick, 600) // initial delay

    return () => {
      seq.current.running = false
      if (seq.current.timer) clearTimeout(seq.current.timer)
    }
  }, [active, tick])

  return (
    <div
      className="terminal-window w-full"
      role="log"
      aria-label="Interactive terminal — npm install sequence"
      aria-live="polite"
    >
      {/* Title bar */}
      <div className="terminal-titlebar">
        <span className="terminal-dot terminal-dot-red" aria-hidden="true" />
        <span className="terminal-dot terminal-dot-yellow" aria-hidden="true" />
        <span className="terminal-dot terminal-dot-green" aria-hidden="true" />
        <span className="ml-3 font-mono text-xs text-white/30 flex items-center gap-2">
          <span
            className="w-2 h-2 rounded-full bg-neon-green/60 anim-neon-pulse"
            aria-hidden="true"
          />
          zsh — frontend-odyssey
        </span>
        <span className="ml-auto font-mono text-[10px] text-white/20">
          node v20.11.0
        </span>
      </div>

      {/* Body */}
      <div
        ref={bodyRef}
        className="terminal-body max-h-52 overflow-y-auto scrollbar-thin"
        style={{ scrollbarWidth: 'thin' }}
      >
        {rendered.map((item, i) => (
          <div key={i} className="leading-relaxed">
            {item.kind === 'input' ? (
              <div className="flex gap-2 items-start">
                <span className="terminal-prompt select-none flex-shrink-0" aria-hidden="true">
                  ~$
                </span>
                <span className="terminal-command font-mono text-xs sm:text-sm">
                  {item.text}
                </span>
              </div>
            ) : (
              <div className={`font-mono text-xs sm:text-sm pl-5 ${item.cls || 'text-white/60'}`}>
                {item.text || <span className="select-none">&nbsp;</span>}
              </div>
            )}
          </div>
        ))}

        {/* Currently typing line */}
        {!isDone && (
          <div className="flex gap-2 items-start">
            <span className="terminal-prompt select-none flex-shrink-0" aria-hidden="true">
              ~$
            </span>
            <span className="terminal-command font-mono text-xs sm:text-sm typewriter-cursor">
              {currentLine}
            </span>
          </div>
        )}

        {/* Idle cursor when done */}
        {isDone && (
          <div className="flex gap-2 items-start mt-1">
            <span className="terminal-prompt select-none" aria-hidden="true">~$</span>
            <span
              className="font-mono text-xs typewriter-cursor text-transparent"
              aria-hidden="true"
            >
              &nbsp;
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

/* ============================================================
   BROWSER TAB
   ============================================================ */
function BrowserTab({ tab, index, total, isActive, parallaxOffset }) {
  const [tooltip, setTooltip] = useState(false)
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 })

  const tooltipText = TOOLTIP_ANSWERS[index % TOOLTIP_ANSWERS.length]

  const handleMouseEnter = useCallback((e) => {
    setTooltip(true)
    setTooltipPos({ x: e.clientX, y: e.clientY })
  }, [])

  const handleMouseMove = useCallback((e) => {
    setTooltipPos({ x: e.clientX, y: e.clientY })
  }, [])

  // Chaotic positioning — tabs overflow and stack
  const rotation = useMemo(() => (index % 2 === 0 ? 1 : -1) * (index % 4) * 0.8, [index])
  const zIdx = isActive ? 20 : total - index

  return (
    <>
      <motion.div
        initial={{ scale: 0, opacity: 0, y: -20 }}
        animate={{ scale: 1, opacity: 1, y: parallaxOffset }}
        transition={{
          delay: index * 0.04,
          type: 'spring',
          stiffness: 280,
          damping: 22,
        }}
        onMouseEnter={handleMouseEnter}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setTooltip(false)}
        onFocus={() => setTooltip(true)}
        onBlur={() => setTooltip(false)}
        tabIndex={0}
        role="button"
        aria-label={`Browser tab: ${tab.title}`}
        aria-describedby={tooltip ? `tooltip-${index}` : undefined}
        style={{
          rotate: rotation,
          zIndex: zIdx,
          translateY: parallaxOffset,
        }}
        whileHover={{ scale: 1.06, zIndex: 30, rotate: 0 }}
        className={`
          relative
          flex items-center gap-2
          px-3 py-1.5
          rounded-t-lg
          border-t border-l border-r
          font-mono text-[10px] sm:text-xs
          cursor-pointer
          max-w-[160px] sm:max-w-[190px]
          truncate
          transition-colors duration-150
          select-none
          ${isActive
            ? 'bg-bg-surface border-neon-blue/40 text-white shadow-lg shadow-neon-blue/10'
            : 'bg-bg-deep/90 border-bg-border/60 text-white/50 hover:text-white/80 hover:bg-bg-surface/70'
          }
        `}
      >
        {/* Favicon placeholder */}
        <span
          className="flex-shrink-0 w-3 h-3 rounded-sm bg-neon-yellow/30 flex items-center justify-center text-[8px]"
          aria-hidden="true"
        >
          📄
        </span>

        <span className="truncate flex-1">{tab.title}</span>

        {/* Vote count */}
        <span className="flex-shrink-0 text-neon-green/50 text-[9px]">
          ↑{tab.votes}
        </span>
      </motion.div>

      {/* Tooltip portal-style (fixed position) */}
      <AnimatePresence>
        {tooltip && (
          <motion.div
            id={`tooltip-${index}`}
            role="tooltip"
            initial={{ opacity: 0, scale: 0.9, y: 6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 6 }}
            transition={{ duration: 0.15 }}
            className="
              fixed z-[90]
              max-w-[220px] sm:max-w-xs
              glass-card-neon
              px-3 py-2.5
              font-mono text-xs
              text-white/80
              pointer-events-none
            "
            style={{
              left: Math.min(tooltipPos.x + 14, window.innerWidth - 240),
              top: tooltipPos.y - 60,
            }}
          >
            <span className="text-neon-yellow/70 block text-[10px] mb-1 uppercase tracking-wide">
              Top Answer
            </span>
            {tooltipText}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

/* ============================================================
   TAB EXPLOSION — the wall of 47 tabs
   ============================================================ */
function TabExplosion({ scrollProgress }) {
  // Split tabs into foreground (fast parallax) and background (slow)
  const foreground = TAB_DATA.slice(0, 8)
  const background = TAB_DATA.slice(8)

  // Parallax offsets
  const fgOffset = scrollProgress * -60  // moves up faster
  const bgOffset = scrollProgress * -25  // moves up slower

  const [tabCount, setTabCount] = useState(16)

  // Tabs multiply as scroll progresses
  useEffect(() => {
    const target = Math.min(16 + Math.floor(scrollProgress * 31), 47)
    setTabCount(target)
  }, [scrollProgress])

  return (
    <div
      className="relative w-full"
      aria-label={`${tabCount} browser tabs open`}
      aria-live="polite"
    >
      {/* Tab count badge */}
      <motion.div
        className="
          absolute -top-8 right-0
          font-mono text-xs font-bold
          text-neon-red
          flex items-center gap-1.5
        "
        animate={{ scale: tabCount > 40 ? [1, 1.15, 1] : 1 }}
        transition={{ duration: 0.3, repeat: tabCount > 40 ? Infinity : 0, repeatDelay: 0.8 }}
        aria-live="polite"
      >
        <span
          className="w-2 h-2 rounded-full bg-neon-red anim-neon-pulse-fast"
          aria-hidden="true"
        />
        {tabCount} tabs open
      </motion.div>

      {/* Tab bar chrome */}
      <div className="
        relative
        bg-bg-deep border border-bg-border/60
        rounded-xl overflow-hidden
        shadow-2xl shadow-black/40
      ">
        {/* Browser chrome header */}
        <div className="
          flex items-center gap-2 px-3 py-2
          bg-bg-surface/80
          border-b border-bg-border/50
        ">
          <span className="terminal-dot terminal-dot-red" aria-hidden="true" />
          <span className="terminal-dot terminal-dot-yellow" aria-hidden="true" />
          <span className="terminal-dot terminal-dot-green" aria-hidden="true" />
          <div className="
            flex-1 mx-3
            bg-bg-deep/60
            rounded px-3 py-1
            font-mono text-[10px] text-white/30
            flex items-center gap-2
          ">
            <span aria-hidden="true">🔒</span>
            stackoverflow.com/questions/how-do-i-center-a-div
          </div>
        </div>

        {/* Tabs row — scrollable, overflowing deliberately */}
        <div
          className="
            relative
            flex flex-wrap gap-0.5
            p-2 pb-0
            bg-bg-void/60
            max-h-32 overflow-hidden
          "
          role="tablist"
          aria-label="Open browser tabs"
        >
          {/* Background tabs (slow parallax) */}
          <div
            className="
              absolute inset-0
              flex flex-wrap gap-0.5 p-2
              pointer-events-none
            "
            aria-hidden="true"
            style={{ transform: `translateY(${bgOffset}px)` }}
          >
            {background.map((tab, i) => (
              <div
                key={`bg-${i}`}
                className="
                  flex items-center gap-1.5
                  px-2 py-1
                  bg-bg-deep/50 border border-bg-border/30
                  rounded-t text-[9px] text-white/20
                  max-w-[120px] truncate
                  font-mono
                "
              >
                <span>📄</span>
                <span className="truncate">{tab.title}</span>
              </div>
            ))}
          </div>

          {/* Foreground tabs (fast parallax, interactive) */}
          <div
            className="relative flex flex-wrap gap-0.5 z-10"
            style={{ transform: `translateY(${fgOffset}px)` }}
          >
            {foreground.map((tab, i) => (
              <BrowserTab
                key={`fg-${i}`}
                tab={tab}
                index={i}
                total={foreground.length}
                isActive={i === 3}
                parallaxOffset={0}
              />
            ))}
          </div>
        </div>

        {/* Page content area */}
        <div className="
          p-4 font-mono text-xs
          border-t border-bg-border/40
          bg-bg-void/80
          min-h-[80px]
          flex items-center justify-center
        ">
          <span className="text-white/25 text-center">
            Loading answer... (checking if it still works in 2026)
          </span>
        </div>
      </div>
    </div>
  )
}

/* ============================================================
   IMPOSTER SYNDROME COUNTER
   ============================================================ */
function ImposterCounter({ active }) {
  const [count, setCount] = useState(0)
  const [maxCount] = useState(1247)
  const rafRef = useRef(null)
  const startRef = useRef(null)

  const prefersReduced = useMemo(
    () => typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    []
  )

  useEffect(() => {
    if (!active) return
    if (prefersReduced) { setCount(maxCount); return }

    const duration = 2200 // ms
    startRef.current = performance.now()

    const animate = (now) => {
      const elapsed = now - startRef.current
      const progress = Math.min(elapsed / duration, 1)
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.floor(eased * maxCount))
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate)
      }
    }

    rafRef.current = requestAnimationFrame(animate)

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [active, maxCount, prefersReduced])

  const badges = [
    { label: 'Answers copied', value: count.toLocaleString(), color: 'text-neon-red' },
    { label: 'Tabs ever opened', value: '∞', color: 'text-neon-yellow' },
    { label: '"I\'ll understand it later"', value: '100%', color: 'text-neon-purple' },
  ]

  return (
    <div
      className="grid grid-cols-1 sm:grid-cols-3 gap-3"
      aria-label="Developer imposter syndrome statistics"
    >
      {badges.map(({ label, value, color }) => (
        <div
          key={label}
          className="glass-card-neon p-4 rounded-xl flex flex-col items-center text-center gap-1"
        >
          <span
            className={`font-mono text-2xl sm:text-3xl font-black ${color}`}
            aria-label={`${label}: ${value}`}
          >
            {value}
          </span>
          <span className="font-inter text-xs text-white/40 leading-snug">
            {label}
          </span>
        </div>
      ))}
    </div>
  )
}

/* ============================================================
   STICKY MOMENT CARD
   ============================================================ */
function MomentCard({ moment, isActive }) {
  return (
    <AnimatePresence mode="wait">
      {isActive && (
        <motion.div
          key={moment.id}
          initial={{ opacity: 0, x: 40, filter: 'blur(8px)' }}
          animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
          exit={{ opacity: 0, x: -40, filter: 'blur(8px)' }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="glass-card-neon rounded-2xl p-6 sm:p-8"
          role="article"
          aria-label={`Moment: ${moment.heading}`}
        >
          {/* Icon */}
          <div className="text-4xl mb-4" aria-hidden="true">
            {moment.emoji}
          </div>

          {/* Heading */}
          <h3
            className={`
              font-space text-xl sm:text-2xl font-bold mb-3
              ${moment.accent === 'neon-blue' ? 'text-neon-blue' :
                moment.accent === 'neon-purple' ? 'text-neon-purple' :
                  'text-neon-green'}
            `}
          >
            {moment.heading}
          </h3>

          {/* Body */}
          <p className="font-inter text-sm sm:text-base text-white/60 leading-relaxed mb-5">
            {moment.body}
          </p>

          {/* Stat */}
          <div className="
            flex items-center gap-3
            font-mono text-xs
            text-white/30
            border-t border-bg-border/40
            pt-4
          ">
            <span
              className={`
                text-2xl font-black
                ${moment.accent === 'neon-blue' ? 'text-neon-blue' :
                  moment.accent === 'neon-purple' ? 'text-neon-purple' :
                    'text-neon-green'}
              `}
            >
              {moment.stat.value}
            </span>
            <span>{moment.stat.label}</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/* ============================================================
   MAIN SECTION
   ============================================================ */
export default function Section2_StackOverflow() {
  const sectionRef = useRef(null)
  const stickyRef = useRef(null)
  const headingRef = useRef(null)
  const terminalRef = useRef(null)
  const tabsRef = useRef(null)
  const counterRef = useRef(null)
  const momentsRef = useRef(null)

  const [terminalActive, setTerminalActive] = useState(false)
  const [counterActive, setCounterActive] = useState(false)
  const [activeMoment, setActiveMoment] = useState(0)
  const [tabScrollProg, setTabScrollProg] = useState(0)

  /* ── GSAP: heading + terminal entrance ── */
  useGSAP(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    // Heading reveal
    gsap.from(headingRef.current, {
      scrollTrigger: {
        trigger: headingRef.current,
        start: 'top 85%',
        toggleActions: 'play none none reverse',
      },
      y: 50,
      opacity: 0,
      duration: 0.8,
      ease: 'power3.out',
      onComplete: () => setTerminalActive(true),
    })

    // Terminal slides in
    if (!prefersReduced) {
      gsap.from(terminalRef.current, {
        scrollTrigger: {
          trigger: terminalRef.current,
          start: 'top 88%',
          toggleActions: 'play none none reverse',
        },
        y: 40,
        opacity: 0,
        duration: 0.7,
        ease: 'power3.out',
        delay: 0.2,
      })
    } else {
      setTerminalActive(true)
    }

    // Tabs section reveals
    gsap.from(tabsRef.current, {
      scrollTrigger: {
        trigger: tabsRef.current,
        start: 'top 85%',
        toggleActions: 'play none none reverse',
      },
      y: 60,
      opacity: 0,
      duration: 0.8,
      ease: 'power3.out',
    })
  }, sectionRef, [])

  /* ── GSAP: sticky moments pin ── */
  useGSAP(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setActiveMoment(0)
      setCounterActive(true)
      return
    }

    if (!momentsRef.current || !stickyRef.current) return

    // Pin the sticky panel while scrubbing through 3 moments
    const pinTrigger = ScrollTrigger.create({
      trigger: stickyRef.current,
      start: 'top 80px',
      end: () => `+=${window.innerHeight * 2.5}`,
      pin: true,
      pinSpacing: true,
      anticipatePin: 1,
      onUpdate: (self) => {
        const p = self.progress
        // 0–0.33 → moment 0, 0.33–0.66 → moment 1, 0.66–1 → moment 2
        const idx = Math.min(Math.floor(p * 3), 2)
        setActiveMoment(idx)
        setTabScrollProg(Math.min(p * 1.5, 1))
        if (p > 0.5) setCounterActive(true)
      },
    })

    return () => pinTrigger.kill()
  }, sectionRef, [])

  /* ── GSAP: counter section reveal ── */
  useGSAP(() => {
    if (!counterRef.current) return
    ScrollTrigger.create({
      trigger: counterRef.current,
      start: 'top 80%',
      onEnter: () => setCounterActive(true),
    })
  }, sectionRef, [])

  /* ── GSAP: section-wide background color shift ── */
  useGSAP(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    gsap.fromTo(
      sectionRef.current,
      { backgroundColor: 'rgba(10,10,15,1)' },
      {
        backgroundColor: 'rgba(13,10,25,1)',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      }
    )
  }, sectionRef, [])

  return (
    <section
      id="section-2"
      ref={sectionRef}
      aria-label="Chapter 2: Stack Overflow Hell"
      className="
        relative
        bg-bg-void
        overflow-hidden
      "
    >
      {/* ── Decorative neon border top ── */}
      <div
        className="absolute top-0 left-0 right-0 h-px pointer-events-none"
        aria-hidden="true"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(0,212,255,0.5), transparent)',
        }}
      />

      {/* ── Grid background ── */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.025]"
        aria-hidden="true"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,212,255,1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,212,255,1) 1px, transparent 1px)
          `,
          backgroundSize: '3rem 3rem',
        }}
      />

      {/* ── Radial glow ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          background: `
            radial-gradient(ellipse 70% 50% at 50% 30%,
              rgba(0,212,255,0.05) 0%, transparent 70%)
          `,
        }}
      />

      <div className="container-wide px-4 sm:px-6 lg:px-8 py-24 sm:py-32 space-y-20 sm:space-y-28">

        {/* ══════════════════════════════════════════
            BLOCK 1 — HEADING + TERMINAL
        ══════════════════════════════════════════ */}
        <div className="space-y-10">

          {/* Chapter label */}
          <div
            className="
              inline-flex items-center gap-2
              font-mono text-xs text-neon-blue/60
              tracking-[0.3em] uppercase
              border border-neon-blue/20
              px-4 py-1.5 rounded-full
              bg-neon-blue/5
            "
            aria-label="Chapter 2 of 6"
          >
            Chapter 02 / 06
          </div>

          {/* Heading */}
          <div ref={headingRef}>
            <h2 className="font-space font-black text-title text-white">
              Stack{' '}
              <span className="text-glow-blue">Overflow</span>{' '}
              <span className="text-white/50">Hell</span>
            </h2>
            <p className="
              font-inter text-base sm:text-lg text-white/50
              mt-4 max-w-xl leading-relaxed
            ">
              47 tabs open. 3 different answers. Each one from a different year.
              None of them work. But the{' '}
              <em className="text-neon-blue not-italic font-medium">
                copy button sure does.
              </em>
            </p>
          </div>

          {/* Terminal + side callout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            <div ref={terminalRef}>
              <MiniTerminal active={terminalActive} />
            </div>

            {/* Callout card */}
            <div className="
              glass-card-neon rounded-xl p-6
              space-y-4
              border-neon-blue/20
            ">
              <div className="flex items-start gap-3">
                <span className="text-2xl flex-shrink-0" aria-hidden="true">💡</span>
                <div>
                  <p className="font-space text-sm font-semibold text-neon-blue mb-1">
                    Pro tip from Senior Dev
                  </p>
                  <p className="font-inter text-sm text-white/50 leading-relaxed">
                    &quot;The first answer with 5000 upvotes is probably wrong for your version.
                    Scroll to the one with 47 upvotes from 3 years later.
                    That one&apos;s wrong too, but in a more instructive way.&quot;
                  </p>
                </div>
              </div>

              <div className="border-t border-bg-border/40 pt-4 space-y-2">
                {[
                  '✅  Copy code',
                  '✅  Paste code',
                  '❌  Understand code',
                  '✅  Ship code',
                  '🔥  Watch code explode in prod',
                ].map((step, i) => (
                  <p
                    key={i}
                    className="font-mono text-xs text-white/50"
                  >
                    {step}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════
            BLOCK 2 — STICKY MOMENTS + TAB EXPLOSION
        ══════════════════════════════════════════ */}
        <div
          ref={stickyRef}
          className="
            grid grid-cols-1 lg:grid-cols-2
            gap-8 lg:gap-12
            items-start
          "
          aria-label="The three stages of Stack Overflow dependency"
        >
          {/* LEFT: Tab explosion (parallax foreground/background) */}
          <div ref={tabsRef} className="space-y-4">
            <p className="font-mono text-xs text-white/30 uppercase tracking-widest">
              Your browser, right now
            </p>
            <TabExplosion scrollProgress={tabScrollProg} />

            {/* Tab chaos quote */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: tabScrollProg > 0.3 ? 1 : 0 }}
              className="
                font-mono text-xs text-white/30 italic
                text-center pt-2
              "
              aria-live="polite"
            >
              {tabScrollProg > 0.8
                ? '"just one more tab" — you, 31 tabs ago'
                : tabScrollProg > 0.5
                  ? '"i\'ll close these later" — also you'
                  : '"maybe this one has the answer"'}
            </motion.p>
          </div>

          {/* RIGHT: Scrolling moments */}
          <div className="space-y-4">
            {/* Progress dots */}
            <div
              className="flex gap-2 items-center"
              role="tablist"
              aria-label="Story moments navigation"
            >
              {MOMENTS.map((m, i) => (
                <button
                  key={m.id}
                  role="tab"
                  aria-selected={activeMoment === i}
                  aria-label={`Moment ${i + 1}: ${m.heading}`}
                  onClick={() => setActiveMoment(i)}
                  className={`
                    h-1.5 rounded-full transition-all duration-300
                    focus-visible:outline-2 focus-visible:outline-neon-blue
                    ${activeMoment === i
                      ? 'w-8 bg-neon-blue'
                      : 'w-3 bg-white/20 hover:bg-white/40'
                    }
                  `}
                />
              ))}
              <span className="font-mono text-[10px] text-white/25 ml-1">
                {activeMoment + 1} / {MOMENTS.length}
              </span>
            </div>

            {/* Moment card */}
            <div className="relative min-h-[260px] sm:min-h-[280px]">
              {MOMENTS.map((moment, i) => (
                <div
                  key={moment.id}
                  className="absolute inset-0"
                >
                  <MomentCard moment={moment} isActive={activeMoment === i} />
                </div>
              ))}
            </div>

            {/* Manual navigation arrows */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setActiveMoment(m => Math.max(0, m - 1))}
                disabled={activeMoment === 0}
                aria-label="Previous moment"
                className="
                  w-9 h-9 rounded-full
                  border border-bg-border/60
                  flex items-center justify-center
                  text-white/40 hover:text-white/80
                  hover:border-neon-blue/40
                  disabled:opacity-20 disabled:cursor-not-allowed
                  transition-all duration-150
                  focus-visible:outline-2 focus-visible:outline-neon-blue
                "
              >
                ←
              </button>
              <button
                onClick={() => setActiveMoment(m => Math.min(MOMENTS.length - 1, m + 1))}
                disabled={activeMoment === MOMENTS.length - 1}
                aria-label="Next moment"
                className="
                  w-9 h-9 rounded-full
                  border border-bg-border/60
                  flex items-center justify-center
                  text-white/40 hover:text-white/80
                  hover:border-neon-blue/40
                  disabled:opacity-20 disabled:cursor-not-allowed
                  transition-all duration-150
                  focus-visible:outline-2 focus-visible:outline-neon-blue
                "
              >
                →
              </button>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════
            BLOCK 3 — IMPOSTER SYNDROME COUNTER
        ══════════════════════════════════════════ */}
        <div ref={counterRef} className="space-y-8">
          <div className="text-center space-y-2">
            <h3 className="font-space text-2xl sm:text-3xl font-bold text-white">
              Your{' '}
              <span className="text-glow-purple">Imposter Syndrome</span>
              {' '}Stats
            </h3>
            <p className="font-inter text-sm text-white/40">
              Compiled from your browser history and personal shame.
            </p>
          </div>

          <ImposterCounter active={counterActive} />

          {/* Bottom quote */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="
              text-center
              font-mono text-sm text-white/30
              border border-bg-border/40
              rounded-xl p-4
              bg-bg-surface/20
              max-w-lg mx-auto
            "
          >
            <span className="text-neon-blue/60">/* </span>
            Everyone googles &quot;how to center a div&quot;.
            Even the person who wrote CSS.
            <span className="text-neon-blue/60"> */</span>
          </motion.div>
        </div>

      </div>

      {/* ── Bottom fade ── */}
      <div
        className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
        aria-hidden="true"
        style={{
          background: 'linear-gradient(to bottom, transparent, var(--color-bg-void))',
        }}
      />
    </section>
  )
}
