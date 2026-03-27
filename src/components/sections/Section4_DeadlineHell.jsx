import React, {
    useRef,
    useState,
    useEffect,
    useCallback,
    useMemo,
} from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@/hooks/useGSAP'

gsap.registerPlugin(ScrollTrigger)

/* ============================================================
   CONSTANTS
   ============================================================ */

const COMMITS = [
    {
        time: '9:00 AM',
        hash: 'f3a1b2c',
        message: 'Initial commit',
        mood: 'calm',
        icon: '🌅',
        sub: 'Full of hope. Coffee #1.',
    },
    {
        time: '11:30 AM',
        hash: 'a4d7e8f',
        message: 'added feature',
        mood: 'calm',
        icon: '☕',
        sub: 'Going well. Coffee #2.',
    },
    {
        time: '2:00 PM',
        hash: 'b9c2d3e',
        message: 'added feature (actually this time)',
        mood: 'stressed',
        icon: '🤔',
        sub: '"Small change" has 47 dependencies.',
    },
    {
        time: '5:45 PM',
        hash: 'c1e4f5a',
        message: 'fixes',
        mood: 'stressed',
        icon: '😰',
        sub: 'Scope creep achieved sentience.',
    },
    {
        time: '8:30 PM',
        hash: 'd2f6a7b',
        message: 'more fixes',
        mood: 'stressed',
        icon: '🍕',
        sub: 'Ordered pizza. Ate it cold.',
    },
    {
        time: '11:00 PM',
        hash: 'e3a8b9c',
        message: 'pls work',
        mood: 'panicked',
        icon: '😱',
        sub: 'Talking to the computer. It ignores you.',
    },
    {
        time: '2:00 AM',
        hash: 'f4b1c2d',
        message: 'why god why',
        mood: 'panicked',
        icon: '☠️',
        sub: 'CSS decided to have opinions.',
    },
    {
        time: '4:58 AM',
        hash: 'a5c3d4e',
        message: 'FINAL_v3_ACTUALLY_FINAL_FOR_REAL',
        mood: 'panicked',
        icon: '🔥',
        sub: 'This is the one. It has to be.',
    },
    {
        time: '5:00 AM',
        hash: 'b6d4e5f',
        message: 'revert: everything is broken',
        mood: 'panicked',
        icon: '💀',
        sub: 'git log will remember this forever.',
    },
]

const MOOD_STYLES = {
    calm: {
        dot: 'bg-neon-green',
        text: 'text-neon-green',
        border: 'border-neon-green/25',
        bg: 'bg-neon-green/8',
        line: 'rgba(0,255,136,0.4)',
    },
    stressed: {
        dot: 'bg-neon-yellow',
        text: 'text-neon-yellow',
        border: 'border-neon-yellow/25',
        bg: 'bg-neon-yellow/8',
        line: 'rgba(241,250,140,0.4)',
    },
    panicked: {
        dot: 'bg-neon-red',
        text: 'text-neon-red',
        border: 'border-neon-red/25',
        bg: 'bg-neon-red/8',
        line: 'rgba(255,85,85,0.4)',
    },
}

const SLEEP_MILESTONES = [
    { hours: 0, label: 'Just woke up', emoji: '😴' },
    { hours: 8, label: 'Feeling productive', emoji: '💪' },
    { hours: 16, label: 'Questionable decisions', emoji: '🤔' },
    { hours: 24, label: 'Seeing code in dreams', emoji: '👁️' },
    { hours: 32, label: 'Is this real?', emoji: '👻' },
    { hours: 40, label: 'One with the machine', emoji: '🤖' },
]

const ENERGY_DRINK_LABELS = [
    'Monster', 'Red Bull', 'Celsius', 'Ghost',
    'Reign', '5-hour', 'NOS', 'Rockstar',
]

/* ============================================================
   ANIMATED CLOCK
   Hands spin progressively faster as commit desperation rises.
   ============================================================ */
function AnimatedClock({ speedMultiplier = 1 }) {
    const hourRef = useRef(null)
    const minuteRef = useRef(null)
    const secondRef = useRef(null)
    const rafRef = useRef(null)
    const startRef = useRef(Date.now())
    const prefersReduced = useReducedMotion()

    useEffect(() => {
        if (prefersReduced) return

        // Base: 1 real second = 1 sim-second. At speedMultiplier=10, time flies.
        const animate = () => {
            const elapsed = (Date.now() - startRef.current) / 1000
            const speed = Math.pow(speedMultiplier, 2.5) // exponential acceleration

            const totalSec = elapsed * speed
            const sDeg = (totalSec % 60) * 6
            const mDeg = (totalSec % 3600) * 0.1
            const hDeg = (totalSec % 43200) * (360 / 43200)

            if (secondRef.current) secondRef.current.style.transform = `rotate(${sDeg}deg)`
            if (minuteRef.current) minuteRef.current.style.transform = `rotate(${mDeg}deg)`
            if (hourRef.current) hourRef.current.style.transform = `rotate(${hDeg}deg)`

            rafRef.current = requestAnimationFrame(animate)
        }

        rafRef.current = requestAnimationFrame(animate)
        return () => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current)
        }
    }, [speedMultiplier, prefersReduced])

    const isBlurring = speedMultiplier > 5

    return (
        <div
            className="relative flex items-center justify-center"
            role="img"
            aria-label={`Clock spinning at ${Math.round(speedMultiplier * 10) / 10}x speed — deadline approaching`}
        >
            {/* Outer glow ring */}
            <div
                className="
          absolute inset-0 rounded-full
          anim-neon-border
        "
                style={{
                    boxShadow: speedMultiplier > 4
                        ? '0 0 30px rgba(255,85,85,0.5), 0 0 60px rgba(255,85,85,0.2)'
                        : '0 0 20px rgba(189,147,249,0.3)',
                }}
                aria-hidden="true"
            />

            {/* Clock face */}
            <svg
                viewBox="0 0 120 120"
                className="w-28 h-28 sm:w-36 sm:h-36"
                aria-hidden="true"
            >
                {/* Face */}
                <circle
                    cx="60" cy="60" r="56"
                    fill="#0d1117"
                    stroke={speedMultiplier > 4 ? '#ff5555' : '#bd93f9'}
                    strokeWidth="2.5"
                    opacity="0.9"
                />

                {/* Hour markers */}
                {Array.from({ length: 12 }, (_, i) => {
                    const angle = (i * 30 - 90) * (Math.PI / 180)
                    const x1 = 60 + 46 * Math.cos(angle)
                    const y1 = 60 + 46 * Math.sin(angle)
                    const x2 = 60 + 52 * Math.cos(angle)
                    const y2 = 60 + 52 * Math.sin(angle)
                    return (
                        <line
                            key={i}
                            x1={x1} y1={y1} x2={x2} y2={y2}
                            stroke={speedMultiplier > 4 ? '#ff5555' : '#bd93f9'}
                            strokeWidth={i % 3 === 0 ? 2.5 : 1}
                            opacity="0.6"
                        />
                    )
                })}

                {/* HOUR hand */}
                <g
                    ref={hourRef}
                    style={{ transformOrigin: '60px 60px' }}
                >
                    <line
                        x1="60" y1="60" x2="60" y2="28"
                        stroke="#f0f6fc"
                        strokeWidth="3"
                        strokeLinecap="round"
                        opacity="0.9"
                    />
                </g>

                {/* MINUTE hand */}
                <g
                    ref={minuteRef}
                    style={{ transformOrigin: '60px 60px' }}
                >
                    <line
                        x1="60" y1="60" x2="60" y2="18"
                        stroke={speedMultiplier > 4 ? '#ff5555' : '#bd93f9'}
                        strokeWidth="2"
                        strokeLinecap="round"
                        opacity="0.9"
                    />
                </g>

                {/* SECOND hand */}
                <g
                    ref={secondRef}
                    style={{
                        transformOrigin: '60px 60px',
                        filter: isBlurring ? 'blur(1px)' : 'none',
                    }}
                >
                    <line
                        x1="60" y1="68" x2="60" y2="14"
                        stroke="#ff5555"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        opacity="0.8"
                    />
                </g>

                {/* Center dot */}
                <circle cx="60" cy="60" r="3.5" fill="#ff5555" opacity="0.9" />

                {/* Speed indicator text */}
                {speedMultiplier > 2 && (
                    <text
                        x="60" y="80"
                        textAnchor="middle"
                        fill="#ff5555"
                        fontSize="7"
                        fontFamily="JetBrains Mono, monospace"
                        opacity="0.6"
                    >
                        {speedMultiplier > 7 ? 'TIME DILATING' :
                            speedMultiplier > 4 ? 'PANIC MODE' :
                                'RUNNING LATE'}
                    </text>
                )}
            </svg>
        </div>
    )
}

/* ============================================================
   ENERGY DRINK CAN  (SVG inline)
   ============================================================ */
function EnergyDrinkCan({ label, index, visible }) {
    const colors = [
        { body: '#1a2a1a', stripe: '#00ff88', text: '#00ff88' },
        { body: '#1a1a2a', stripe: '#00d4ff', text: '#00d4ff' },
        { body: '#2a1a1a', stripe: '#ff5555', text: '#ff5555' },
        { body: '#2a2a1a', stripe: '#f1fa8c', text: '#f1fa8c' },
        { body: '#2a1a2a', stripe: '#bd93f9', text: '#bd93f9' },
        { body: '#1a2a2a', stripe: '#ff79c6', text: '#ff79c6' },
        { body: '#1a1a1a', stripe: '#8be9fd', text: '#8be9fd' },
        { body: '#2a1a1a', stripe: '#ffb86c', text: '#ffb86c' },
    ]
    const c = colors[index % colors.length]
    const tiltDeg = (index % 2 === 0 ? 1 : -1) * (index % 3) * 6

    return (
        <motion.div
            initial={{ y: 60, opacity: 0, scale: 0.6 }}
            animate={visible
                ? { y: 0, opacity: 1, scale: 1 }
                : { y: 60, opacity: 0, scale: 0.6 }
            }
            transition={{
                delay: index * 0.12,
                type: 'spring',
                stiffness: 240,
                damping: 18,
            }}
            className="relative flex-shrink-0"
            style={{ transform: `rotate(${tiltDeg}deg)` }}
            aria-hidden="true"
        >
            <svg
                viewBox="0 0 36 72"
                className="w-8 h-16 sm:w-10 sm:h-20 drop-shadow-lg"
            >
                {/* Can body */}
                <rect x="2" y="8" width="32" height="58" rx="4" fill={c.body} />
                {/* Rim top */}
                <ellipse cx="18" cy="8" rx="16" ry="4" fill="#2a2a2a" />
                {/* Tab top */}
                <ellipse cx="18" cy="5" rx="10" ry="3" fill="#3a3a3a" />
                <rect x="15" y="2" width="6" height="4" rx="1" fill="#444" />
                {/* Stripe */}
                <rect x="2" y="28" width="32" height="14" fill={c.stripe} opacity="0.85" />
                {/* Label text */}
                <text
                    x="18" y="38"
                    textAnchor="middle"
                    fill={c.body}
                    fontSize="5.5"
                    fontWeight="bold"
                    fontFamily="JetBrains Mono, monospace"
                >
                    {label.slice(0, 7)}
                </text>
                {/* Bottom rim */}
                <ellipse cx="18" cy="66" rx="16" ry="4" fill="#1a1a1a" />
                {/* Shine */}
                <rect x="6" y="14" width="3" height="40" rx="1.5" fill="white" opacity="0.06" />
            </svg>
        </motion.div>
    )
}

function CanPile({ progress }) {
    const visibleCount = Math.floor(progress * ENERGY_DRINK_LABELS.length)

    return (
        <div
            className="
        flex items-end gap-1
        relative
      "
            role="img"
            aria-label={`${visibleCount} energy drinks consumed so far`}
            aria-live="polite"
        >
            {/* Desk surface line */}
            <div
                className="
          absolute -bottom-2 left-0 right-0
          h-px
          bg-gradient-to-r from-transparent via-neon-purple/30 to-transparent
        "
                aria-hidden="true"
            />

            {ENERGY_DRINK_LABELS.map((label, i) => (
                <EnergyDrinkCan
                    key={label}
                    label={label}
                    index={i}
                    visible={i < visibleCount}
                />
            ))}
        </div>
    )
}

/* ============================================================
   SLEEP COUNTER
   ============================================================ */
function SleepCounter({ targetHours, active }) {
    const [current, setCurrent] = useState(0)
    const rafRef = useRef(null)
    const startRef = useRef(null)
    const prefersReduced = useReducedMotion()

    useEffect(() => {
        if (!active) return
        if (prefersReduced) { setCurrent(targetHours); return }

        const duration = 1800
        startRef.current = performance.now()

        const animate = (now) => {
            const elapsed = now - startRef.current
            const progress = Math.min(elapsed / duration, 1)
            const eased = 1 - Math.pow(1 - progress, 3)
            setCurrent(Math.floor(eased * targetHours))
            if (progress < 1) {
                rafRef.current = requestAnimationFrame(animate)
            }
        }

        rafRef.current = requestAnimationFrame(animate)
        return () => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current)
        }
    }, [active, targetHours, prefersReduced])

    const milestone = useMemo(() =>
        [...SLEEP_MILESTONES].reverse().find(m => current >= m.hours) ||
        SLEEP_MILESTONES[0],
        [current])

    const dangerLevel = current > 30 ? 'text-neon-red' :
        current > 20 ? 'text-neon-yellow' :
            'text-neon-green'

    return (
        <div
            className="glass-card-neon rounded-2xl p-6 sm:p-8 space-y-5"
            role="meter"
            aria-label={`Hours without sleep: ${current}`}
            aria-valuenow={current}
            aria-valuemin={0}
            aria-valuemax={targetHours}
        >
            {/* Label */}
            <div className="flex items-center justify-between">
                <p className="font-mono text-xs text-white/40 uppercase tracking-widest">
                    Hours without sleep
                </p>
                <span className="text-xl" aria-hidden="true">{milestone.emoji}</span>
            </div>

            {/* Giant number */}
            <div className="flex items-baseline gap-2">
                <span
                    className={`font-mono text-6xl sm:text-7xl font-black leading-none ${dangerLevel}`}
                    style={{
                        textShadow: current > 30
                            ? '0 0 20px rgba(255,85,85,0.8), 0 0 50px rgba(255,85,85,0.3)'
                            : '0 0 20px rgba(0,255,136,0.6)',
                    }}
                >
                    {current}
                </span>
                <span className="font-mono text-lg text-white/25">hrs</span>
            </div>

            {/* Progress bar */}
            <div
                className="h-2 bg-bg-border/60 rounded-full overflow-hidden"
                aria-hidden="true"
            >
                <motion.div
                    className={`h-full rounded-full ${current > 30 ? 'bg-neon-red' :
                        current > 20 ? 'bg-neon-yellow' : 'bg-neon-green'
                        }`}
                    initial={{ width: '0%' }}
                    animate={{ width: `${(current / targetHours) * 100}%` }}
                    transition={{ duration: 0.1 }}
                    style={{
                        boxShadow: current > 30
                            ? '0 0 12px rgba(255,85,85,0.7)'
                            : '0 0 10px rgba(0,255,136,0.5)',
                    }}
                />
            </div>

            {/* Milestone label */}
            <p
                className="font-inter text-sm text-white/40 italic"
                aria-live="polite"
            >
                Status:{' '}
                <span className={`not-italic font-medium ${dangerLevel}`}>
                    {milestone.label}
                </span>
            </p>
        </div>
    )
}

/* ============================================================
   COMMIT TIMELINE
   ============================================================ */
function CommitNode({ commit, index, isVisible, isLast }) {
    const cfg = MOOD_STYLES[commit.mood]
    const prefersReduced = useReducedMotion()

    return (
        <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isVisible
                ? { opacity: 1, x: 0 }
                : { opacity: 0, x: -30 }
            }
            transition={{
                delay: prefersReduced ? 0 : index * 0.1,
                duration: 0.5,
                ease: [0.22, 1, 0.36, 1],
            }}
            className="relative flex gap-4 sm:gap-5"
            role="listitem"
            aria-label={`${commit.time}: git commit -m "${commit.message}"`}
        >
            {/* Timeline track */}
            <div className="flex flex-col items-center flex-shrink-0">
                {/* Node dot */}
                <motion.div
                    animate={isVisible
                        ? { scale: [0, 1.3, 1], opacity: [0, 1, 1] }
                        : { scale: 0, opacity: 0 }
                    }
                    transition={{
                        delay: prefersReduced ? 0 : index * 0.1 + 0.1,
                        duration: 0.4,
                    }}
                    className={`
            relative
            w-3.5 h-3.5 rounded-full flex-shrink-0
            border-2 ${cfg.border}
            ${cfg.dot}
            z-10
            mt-1
          `}
                    style={{
                        boxShadow: `0 0 8px ${cfg.line}, 0 0 20px ${cfg.line.replace('0.4', '0.15')}`,
                    }}
                    aria-hidden="true"
                >
                    {/* Pulse ring on panic commits */}
                    {commit.mood === 'panicked' && !prefersReduced && (
                        <motion.div
                            className="absolute inset-0 rounded-full"
                            animate={{ scale: [1, 2.2], opacity: [0.7, 0] }}
                            transition={{ duration: 1.2, repeat: Infinity }}
                            style={{ backgroundColor: cfg.line }}
                            aria-hidden="true"
                        />
                    )}
                </motion.div>

                {/* Connector line */}
                {!isLast && (
                    <motion.div
                        className="w-px flex-1 mt-1"
                        initial={{ scaleY: 0 }}
                        animate={isVisible ? { scaleY: 1 } : { scaleY: 0 }}
                        transition={{
                            delay: prefersReduced ? 0 : index * 0.1 + 0.2,
                            duration: 0.4,
                        }}
                        style={{
                            background: `linear-gradient(to bottom, ${cfg.line}, rgba(255,255,255,0.05))`,
                            transformOrigin: 'top',
                            minHeight: '2.5rem',
                        }}
                        aria-hidden="true"
                    />
                )}
            </div>

            {/* Card */}
            <div
                className={`
          flex-1 pb-4
          glass-card rounded-xl p-3 sm:p-4
          border ${cfg.border}
          group
          hover:border-opacity-50
          transition-all duration-200
          min-w-0
        `}
                style={{ background: `rgba(10,10,15,0.85)` }}
            >
                {/* Top row */}
                <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="text-base flex-shrink-0" aria-hidden="true">
                        {commit.icon}
                    </span>
                    <code className="font-mono text-[10px] text-white/25 flex-shrink-0">
                        {commit.hash}
                    </code>
                    <span className="font-mono text-[10px] text-white/20 ml-auto flex-shrink-0">
                        {commit.time}
                    </span>
                </div>

                {/* Commit message */}
                <p className={`font-mono text-xs sm:text-sm font-semibold ${cfg.text} mb-1.5 break-words`}>
                    "{commit.message}"
                </p>

                {/* Narrator note */}
                <p className="font-inter text-[11px] sm:text-xs text-white/35 italic">
                    {commit.sub}
                </p>
            </div>
        </motion.div>
    )
}

function CommitLog({ isVisible }) {
    return (
        <div
            className="
        relative
        space-y-0
      "
            role="list"
            aria-label="Git commit history — deadline spiral"
        >
            {COMMITS.map((commit, i) => (
                <CommitNode
                    key={commit.hash}
                    commit={commit}
                    index={i}
                    isVisible={isVisible}
                    isLast={i === COMMITS.length - 1}
                />
            ))}
        </div>
    )
}

/* ============================================================
   WINDOW PARALLAX (night → dawn sky)
   ============================================================ */
function WindowView({ progress }) {
    // 0 = deep night (purple/black), 1 = pre-dawn orange/amber
    const skyColor = useMemo(() => {
        const r = Math.round(10 + progress * 40)
        const g = Math.round(10 + progress * 20)
        const b = Math.round(25 + progress * 10)
        return `rgb(${r},${g},${b})`
    }, [progress])

    const horizonColor = useMemo(() => {
        const opacity = progress * 0.6
        return `rgba(212,160,23,${opacity})`
    }, [progress])

    const starOpacity = Math.max(0, 1 - progress * 2)

    return (
        <div
            className="
        relative w-full rounded-xl overflow-hidden
        border border-neon-purple/20
      "
            style={{ height: '200px', background: skyColor }}
            role="img"
            aria-label={`Window view: ${progress < 0.3 ? 'deep night' : progress < 0.7 ? 'late night' : 'approaching dawn'}`}
        >
            {/* Stars */}
            <div
                className="absolute inset-0"
                style={{ opacity: starOpacity }}
                aria-hidden="true"
            >
                {useMemo(() =>
                    Array.from({ length: 40 }, (_, i) => (
                        <div
                            key={i}
                            className="absolute rounded-full bg-white"
                            style={{
                                width: `${1 + (i % 3) * 0.5}px`,
                                height: `${1 + (i % 3) * 0.5}px`,
                                left: `${(i * 37 + 13) % 100}%`,
                                top: `${(i * 29 + 7) % 60}%`,
                                opacity: 0.4 + (i % 4) * 0.15,
                                animation: `neonPulse ${2 + (i % 3)}s ease-in-out ${i * 0.3}s infinite`,
                            }}
                        />
                    )),
                    [])}
            </div>

            {/* City skyline silhouette */}
            <svg
                className="absolute bottom-0 left-0 right-0 w-full"
                viewBox="0 0 400 80"
                preserveAspectRatio="none"
                aria-hidden="true"
            >
                {/* Horizon glow */}
                <defs>
                    <linearGradient id="horizonGlow" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={horizonColor} stopOpacity="0.8" />
                        <stop offset="100%" stopColor={horizonColor} stopOpacity="0" />
                    </linearGradient>
                </defs>
                <rect x="0" y="50" width="400" height="30" fill="url(#horizonGlow)" />

                {/* Buildings */}
                <rect x="0" y="30" width="30" height="50" fill="#0a0a0f" />
                <rect x="35" y="50" width="20" height="30" fill="#0a0a0f" />
                <rect x="60" y="20" width="25" height="60" fill="#0d1117" />
                <rect x="90" y="40" width="18" height="40" fill="#0a0a0f" />
                <rect x="115" y="15" width="35" height="65" fill="#0d1117" />
                <rect x="155" y="35" width="22" height="45" fill="#0a0a0f" />
                <rect x="185" y="25" width="28" height="55" fill="#0d1117" />
                <rect x="220" y="45" width="16" height="35" fill="#0a0a0f" />
                <rect x="242" y="18" width="40" height="62" fill="#0d1117" />
                <rect x="288" y="38" width="24" height="42" fill="#0a0a0f" />
                <rect x="318" y="28" width="30" height="52" fill="#0d1117" />
                <rect x="355" y="42" width="20" height="38" fill="#0a0a0f" />
                <rect x="380" y="22" width="20" height="58" fill="#0d1117" />

                {/* Lit windows */}
                {[
                    [65, 24], [68, 30], [75, 24], [120, 19], [125, 26],
                    [130, 33], [188, 29], [195, 36], [248, 22], [255, 29],
                    [262, 36], [321, 32], [328, 39],
                ].map(([x, y], i) => (
                    <rect
                        key={i}
                        x={x} y={y} width="4" height="4"
                        fill={progress > 0.5 ? '#f1fa8c' : '#bd93f9'}
                        opacity={0.5 + (i % 3) * 0.15}
                    />
                ))}
            </svg>

            {/* Dawn label */}
            <AnimatePresence>
                {progress > 0.7 && (
                    <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="
              absolute top-3 right-3
              font-mono text-[10px]
              text-coffee-amber/70
              bg-coffee-dark/60 backdrop-blur-sm
              px-2 py-1 rounded
              border border-coffee-amber/20
            "
                        aria-live="polite"
                    >
                        5:00 AM — dawn
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

/* ============================================================
   DESK SCENE  (foreground parallax layer)
   ============================================================ */
function DeskScene({ scrollProgress, cansProgress }) {
    return (
        <div
            className="
        relative w-full
        glass-card rounded-2xl p-5 sm:p-6
        border-neon-purple/15
        overflow-hidden
      "
            role="img"
            aria-label="Developer desk at 4 AM"
        >
            {/* Flickering overhead light */}
            <div
                className="
          absolute top-0 left-1/2 -translate-x-1/2
          w-24 h-1
          rounded-full
          anim-flicker
        "
                style={{
                    background:
                        'linear-gradient(90deg, transparent, rgba(189,147,249,0.6), transparent)',
                    boxShadow: '0 0 20px rgba(189,147,249,0.3), 0 0 60px rgba(189,147,249,0.1)',
                }}
                aria-hidden="true"
            />

            {/* Window */}
            <div className="mb-4">
                <p className="font-mono text-[10px] text-white/25 uppercase tracking-widest mb-2">
                    window.exe
                </p>
                <WindowView progress={scrollProgress} />
            </div>

            {/* Desk items row */}
            <div className="flex items-end justify-between gap-4 flex-wrap">
                {/* Monitor glow */}
                <div
                    className="
            flex-1 min-w-[140px]
            h-20 rounded-lg
            border border-neon-purple/20
            relative overflow-hidden
            flex items-center justify-center
          "
                    aria-hidden="true"
                >
                    <div
                        className="
              absolute inset-0
              anim-flicker
            "
                        style={{
                            background:
                                'radial-gradient(ellipse 80% 70% at 50% 50%, rgba(189,147,249,0.12) 0%, transparent 70%)',
                        }}
                    />
                    <div className="text-center z-10">
                        <p className="font-mono text-[9px] text-neon-purple/50">
                            localhost:5173
                        </p>
                        <p className="font-mono text-[10px] text-neon-red/70 mt-1">
                            Cannot read property
                        </p>
                        <p className="font-mono text-[9px] text-neon-red/50">
                            of undefined (again)
                        </p>
                    </div>
                </div>

                {/* Can pile */}
                <div className="flex-shrink-0">
                    <p className="font-mono text-[10px] text-white/25 mb-2 uppercase tracking-widest">
                        fuel consumed
                    </p>
                    <CanPile progress={cansProgress} />
                </div>
            </div>

            {/* Keyboard hint */}
            <div className="mt-4 flex items-center gap-2">
                <div className="flex gap-1" aria-hidden="true">
                    {['Ctrl', 'Z', 'Z', 'Z'].map((k, i) => (
                        <kbd
                            key={i}
                            className="
                font-mono text-[9px] text-white/30
                bg-bg-surface/60 border border-bg-border/60
                px-1.5 py-0.5 rounded
              "
                        >
                            {k}
                        </kbd>
                    ))}
                </div>
                <span className="font-inter text-[10px] text-white/20 italic">
                    undo everything and start over
                </span>
            </div>
        </div>
    )
}

/* ============================================================
   MAIN SECTION
   ============================================================ */
export default function Section4_DeadlineHell() {
    const sectionRef = useRef(null)
    const heroRef = useRef(null)
    const pinRef = useRef(null)
    const timelineRef = useRef(null)
    const counterRef = useRef(null)

    const [scrollProgress, setScrollProgress] = useState(0)
    const [clockSpeed, setClockSpeed] = useState(1)
    const [cansProgress, setCansProgress] = useState(0)
    const [sleepHours, setSleepHours] = useState(0)
    const [counterActive, setCounterActive] = useState(false)
    const [timelineVisible, setTimelineVisible] = useState(false)

    const prefersReduced = useReducedMotion()

    /* ── GSAP: hero entrance ── */
    useGSAP(() => {
        if (!heroRef.current) return

        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: heroRef.current,
                start: 'top 80%',
                toggleActions: 'play none none reverse',

            },
        })

        if (prefersReduced) {
            setTimelineVisible(true)
            setCounterActive(true)
            return
        }

        tl.from('.s4-eyebrow', {
            y: 30, opacity: 0, duration: 0.5, ease: 'power3.out',
        })
            .from('.s4-headline', {
                y: 50, opacity: 0, duration: 0.7, ease: 'power3.out',
            }, '-=0.3')
            .from('.s4-subtitle', {
                y: 30, opacity: 0, duration: 0.6, ease: 'power3.out',
            }, '-=0.4')
            .from('.s4-irony', {
                y: 20, opacity: 0, duration: 0.5, ease: 'power3.out',
            }, '-=0.3')
    }, sectionRef, [])

    /* ── GSAP: sticky pin — drives clock speed, cans, window ── */
    useGSAP(() => {
        if (!pinRef.current || prefersReduced) {
            setScrollProgress(1)
            setClockSpeed(9)
            setCansProgress(1)
            setSleepHours(36)
            setCounterActive(true)
            setTimelineVisible(true)
            return
        }

        const totalCommits = COMMITS.length
        let pinTrigger

        pinTrigger = ScrollTrigger.create({
            trigger: pinRef.current,
            start: 'top 80px',
            end: () => `+=${window.innerHeight * 1.2}`,
            pin: true,
            pinSpacing: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            refreshPriority: 0,   // ← Section3 registers first (higher priority = first)
            onUpdate: (self) => setRainIntensity(0.5 + self.progress * 1.5),
        })

        return () => pinTrigger?.kill()
    }, sectionRef, [])

    /* ── GSAP: timeline reveal (fallback for non-pinned) ── */
    useGSAP(() => {
        if (!timelineRef.current || prefersReduced) return

        ScrollTrigger.create({
            trigger: timelineRef.current,
            start: 'top 80%',
            onEnter: () => setTimelineVisible(true),
        })
    }, sectionRef, [])

    /* ── GSAP: counter reveal (fallback) ── */
    useGSAP(() => {
        if (!counterRef.current || prefersReduced) return

        ScrollTrigger.create({
            trigger: counterRef.current,
            start: 'top 80%',
            onEnter: () => setCounterActive(true),
        })
    }, sectionRef, [])

    /* ── GSAP: background shift dark → deep purple ── */
    useGSAP(() => {
        if (prefersReduced) return

        gsap.fromTo(
            sectionRef.current,
            { backgroundColor: 'rgba(10,10,15,1)' },
            {
                backgroundColor: 'rgba(12,8,22,1)',
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: 'top bottom',
                    end: 'bottom top',
                    scrub: 2,
                },
            }
        )
    }, sectionRef, [])

    return (
        <section
            id="section-4"
            ref={sectionRef}
            aria-label="Chapter 4: Deadline Hell"
            className="relative bg-bg-void overflow-hidden"
        >
            {/* ── Neon border top ── */}
            <div
                className="absolute top-0 left-0 right-0 h-px pointer-events-none"
                aria-hidden="true"
                style={{
                    background:
                        'linear-gradient(90deg, transparent, rgba(189,147,249,0.5), rgba(255,85,85,0.5), transparent)',
                }}
            />

            {/* ── Purple grid ── */}
            <div
                className="absolute inset-0 pointer-events-none opacity-[0.025]"
                aria-hidden="true"
                style={{
                    backgroundImage: `
            linear-gradient(rgba(189,147,249,1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(189,147,249,1) 1px, transparent 1px)
          `,
                    backgroundSize: '3.5rem 3.5rem',
                }}
            />

            {/* ── Purple/red radial glow ── */}
            <div
                className="absolute inset-0 pointer-events-none"
                aria-hidden="true"
                style={{
                    background: `
            radial-gradient(ellipse 70% 50% at 30% 40%,
              rgba(189,147,249,0.06) 0%, transparent 65%),
            radial-gradient(ellipse 50% 40% at 70% 60%,
              rgba(255,85,85,0.05) 0%, transparent 60%)
          `,
                }}
            />

            <div className="container-wide px-4 sm:px-6 lg:px-8 py-24 sm:py-32 space-y-24 sm:space-y-32">

                {/* ══════════════════════════════════════════
            BLOCK 1 — HERO
        ══════════════════════════════════════════ */}
                <div ref={heroRef} className="space-y-8">

                    {/* Chapter label */}
                    <div
                        className="
              s4-eyebrow
              inline-flex items-center gap-2
              font-mono text-xs text-neon-purple/60
              tracking-[0.3em] uppercase
              border border-neon-purple/20
              px-4 py-1.5 rounded-full
              bg-neon-purple/5
            "
                        aria-label="Chapter 4 of 6"
                    >
                        Chapter 04 / 06
                    </div>

                    <div className="s4-headline">
                        <h2 className="font-space font-black text-title text-white">
                            Deadline{' '}
                            <span className="text-glow-purple anim-flicker">Hell</span>
                        </h2>
                    </div>

                    {/* Client quote */}
                    <div className="s4-subtitle max-w-2xl space-y-4">
                        <div className="
              glass-card-neon border-neon-purple/25
              rounded-2xl px-6 sm:px-8 py-5
              space-y-2
            ">
                            <p className="font-mono text-xs text-neon-purple/50 uppercase tracking-widest">
                                Slack message — Monday 9:03 AM
                            </p>
                            <blockquote className="font-space text-xl sm:text-3xl font-bold text-white leading-tight">
                                "Hey, can you make{' '}
                                <span className="text-glow-purple">just a small change</span>
                                {' '}before Friday?"
                            </blockquote>
                            <p className="font-mono text-xs text-white/25 italic">
                                — The Client (who has never written code)
                            </p>
                        </div>
                    </div>

                    {/* Ironic subtitle */}
                    <motion.div
                        className="
              s4-irony
              space-y-1
            "
                    >
                        <p className="font-inter text-base sm:text-lg text-white/50 leading-relaxed">
                            6 days.{' '}
                            <span className="text-neon-yellow font-medium">247 commits.</span>
                            {' '}3 existential crises.{' '}
                            <span className="text-neon-red font-medium">0 sleep.</span>
                        </p>
                        <p className="font-mono text-sm text-white/30 italic">
                            git log --oneline | wc -l returns 247. You feel nothing.
                        </p>
                    </motion.div>
                </div>

                {/* ══════════════════════════════════════════
            BLOCK 2 — PINNED: CLOCK + DESK + TIMELINE
        ══════════════════════════════════════════ */}
                <div
                    ref={pinRef}
                    className="
            grid grid-cols-1 lg:grid-cols-2
            gap-8 lg:gap-12
            items-start
          "
                    aria-label="Deadline night — interactive timeline"
                >
                    {/* ── LEFT: Clock + desk scene ── */}
                    <div className="space-y-6">

                        {/* Clock row */}
                        <div className="flex items-center gap-6 flex-wrap">
                            <AnimatedClock speedMultiplier={clockSpeed} />

                            <div className="space-y-2 flex-1 min-w-[140px]">
                                <p className="font-mono text-xs text-white/30 uppercase tracking-widest">
                                    Current vibe
                                </p>
                                <AnimatePresence mode="wait">
                                    <motion.p
                                        key={Math.floor(clockSpeed)}
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -8 }}
                                        transition={{ duration: 0.3 }}
                                        className={`
                      font-space text-sm sm:text-base font-semibold
                      ${clockSpeed > 7 ? 'text-neon-red' :
                                                clockSpeed > 4 ? 'text-neon-yellow' :
                                                    'text-neon-green'}
                    `}
                                        aria-live="polite"
                                    >
                                        {clockSpeed > 7 ? '🔥 Why does time move so fast' :
                                            clockSpeed > 5 ? '😱 Deadline in T-minus hours' :
                                                clockSpeed > 3 ? '😰 Still optimistic (lie)' :
                                                    clockSpeed > 2 ? '🤔 This is fine' :
                                                        '☕ Just started. Totally fine.'}
                                    </motion.p>
                                </AnimatePresence>
                                <p className="font-mono text-[10px] text-white/20">
                                    speed: {Math.round(clockSpeed * 10) / 10}x
                                </p>
                            </div>
                        </div>

                        {/* Desk scene */}
                        <DeskScene
                            scrollProgress={scrollProgress}
                            cansProgress={cansProgress}
                        />
                    </div>

                    {/* ── RIGHT: Commit log ── */}
                    <div ref={timelineRef} className="space-y-4">
                        <div className="flex items-center justify-between">
                            <p className="font-mono text-xs text-white/30 uppercase tracking-widest">
                                git log —oneline
                            </p>
                            <span className="font-mono text-[10px] text-neon-purple/50">
                                {COMMITS.length} commits
                            </span>
                        </div>

                        <CommitLog isVisible={timelineVisible} />
                    </div>
                </div>

                {/* ══════════════════════════════════════════
            BLOCK 3 — SLEEP COUNTER + STATS
        ══════════════════════════════════════════ */}
                <div
                    ref={counterRef}
                    className="space-y-8"
                >
                    <div className="
            grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3
            gap-5
          ">
                        {/* Sleep counter */}
                        <div className="sm:col-span-2 lg:col-span-1">
                            <SleepCounter
                                targetHours={36}
                                active={counterActive}
                            />
                        </div>

                        {/* Quick stats */}
                        {[
                            {
                                value: '247',
                                label: 'total commits',
                                sub: 'git log --oneline | wc -l',
                                color: 'text-neon-purple',
                            },
                            {
                                value: '3',
                                label: 'existential crises',
                                sub: 'one per day, on schedule',
                                color: 'text-neon-red',
                            },
                        ].map(({ value, label, sub, color }) => (
                            <div
                                key={label}
                                className="glass-card-neon rounded-2xl p-6 space-y-3 flex flex-col justify-between"
                            >
                                <div>
                                    <p className={`font-mono text-5xl sm:text-6xl font-black leading-none ${color}`}>
                                        {value}
                                    </p>
                                    <p className="font-space text-sm font-semibold text-white/70 mt-2">
                                        {label}
                                    </p>
                                </div>
                                <p className="font-mono text-[10px] text-white/25 italic">{sub}</p>
                            </div>
                        ))}
                    </div>

                    {/* Final callout */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7 }}
                        className="
              text-center
              glass-card-neon border-neon-purple/20
              rounded-2xl p-6 sm:p-10
              max-w-2xl mx-auto
              space-y-4
            "
                    >
                        <p className="text-4xl" aria-hidden="true">⏰</p>
                        <h3 className="font-space text-xl sm:text-2xl font-bold text-white">
                            The{' '}
                            <span className="text-glow-purple">Pull Request</span>
                            {' '}is merged.
                        </h3>
                        <p className="font-inter text-sm text-white/40 leading-relaxed max-w-md mx-auto">
                            The client replies: "Looks great! Quick question —
                            can we also change the button colour?
                            Should be a{' '}
                            <em className="text-neon-purple not-italic font-medium">
                                small change.
                            </em>
                            "
                        </p>
                        <div className="
              pt-3 border-t border-neon-purple/10
              font-mono text-xs text-white/20
            ">
                            Your eye twitches. You open a new branch.
                            <br />
                            <span className="text-neon-purple/40">
                                hotfix/button-color-actually-small-change
                            </span>
                        </div>
                    </motion.div>
                </div>

            </div>

            {/* ── Bottom fade ── */}
            <div
                className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none z-10"
                aria-hidden="true"
                style={{
                    background:
                        'linear-gradient(to bottom, transparent, var(--color-bg-void))',
                }}
            />
        </section>
    )
}
