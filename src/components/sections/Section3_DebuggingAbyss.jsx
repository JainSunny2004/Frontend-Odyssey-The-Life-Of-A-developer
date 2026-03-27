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

const ERROR_MESSAGES = [
    { text: 'TypeError: Cannot read properties of undefined', size: 'text-xs', opacity: 0.7 },
    { text: 'ReferenceError: x is not defined', size: 'text-sm', opacity: 0.5 },
    { text: 'SyntaxError: Unexpected token }', size: 'text-xs', opacity: 0.8 },
    { text: 'Uncaught TypeError: undefined is not a function', size: 'text-xs', opacity: 0.6 },
    { text: '404 Not Found', size: 'text-base', opacity: 0.4 },
    { text: "Cannot read property 'map' of null", size: 'text-xs', opacity: 0.7 },
    { text: 'Maximum call stack size exceeded', size: 'text-sm', opacity: 0.5 },
    { text: 'NetworkError: Failed to fetch', size: 'text-xs', opacity: 0.6 },
    { text: 'Warning: Each child should have a unique key', size: 'text-xs', opacity: 0.4 },
    { text: 'ENOENT: no such file or directory', size: 'text-xs', opacity: 0.7 },
    { text: "Module not found: Can't resolve './utils'", size: 'text-sm', opacity: 0.5 },
    { text: 'Segmentation fault (core dumped)', size: 'text-base', opacity: 0.3 },
    { text: "Object is possibly 'undefined'", size: 'text-xs', opacity: 0.6 },
    { text: 'Infinite re-render detected', size: 'text-sm', opacity: 0.8 },
    { text: '500 Internal Server Error', size: 'text-sm', opacity: 0.5 },
    { text: 'Promise rejected with no handler', size: 'text-xs', opacity: 0.6 },
    { text: 'NaN is not a number (ironically)', size: 'text-xs', opacity: 0.4 },
    { text: 'React Hook called conditionally', size: 'text-xs', opacity: 0.7 },
    { text: 'ETIMEDOUT connect ECONNREFUSED', size: 'text-xs', opacity: 0.5 },
    { text: '; expected', size: 'text-2xl', opacity: 0.9 },
]

const BUG_TIMELINE = [
    {
        commit: 'a1b2c3d',
        time: '10:14 AM',
        message: 'fixed bug',
        mood: 'calm',
        note: 'Confident. Wrong.',
        diff: '- const x = data.value\n+ const x = data?.value',
    },
    {
        commit: 'e4f5a6b',
        time: '11:47 AM',
        message: 'fixed bug for real this time',
        mood: 'stressed',
        note: 'The "for real" is a bad sign.',
        diff: '- const x = data?.value\n+ const x = data?.value ?? 0\n// wait no',
    },
    {
        commit: 'c7d8e9f',
        time: '2:03 PM',
        message: 'ok THIS fixes it (tested locally)',
        mood: 'stressed',
        note: '"Tested locally" — famous last words.',
        diff: '+ console.log("here?")\n+ console.log("here???")\n+ console.log("WHY")',
    },
    {
        commit: '0a1b2c3',
        time: '4:58 PM',
        message: 'why',
        mood: 'panicked',
        note: 'Full emotional collapse in one word.',
        diff: '- // TODO: fix this properly\n+ // TODO: fix this properly (tried, failed)',
    },
    {
        commit: 'd4e5f6a',
        time: '11:32 PM',
        message: "it works don't touch it",
        mood: 'panicked',
        note: 'This line will survive into production forever.',
        diff: '+ // DO NOT TOUCH THIS. I MEAN IT.\n+ // Seriously. Walk away.\n+ x = x || x && !x ? x : !x',
    },
]

const MOOD_CONFIG = {
    calm: { color: 'text-neon-green', border: 'border-neon-green/30', bg: 'bg-neon-green/10', dot: 'bg-neon-green' },
    stressed: { color: 'text-neon-yellow', border: 'border-neon-yellow/30', bg: 'bg-neon-yellow/10', dot: 'bg-neon-yellow' },
    panicked: { color: 'text-neon-red', border: 'border-neon-red/30', bg: 'bg-neon-red/10', dot: 'bg-neon-red' },
}

/* ============================================================
   GLITCH HEADING
   ============================================================ */
function GlitchHeading({ text }) {
    const prefersReduced = useReducedMotion()
    const [glitching, setGlitching] = useState(false)
    const timerRef = useRef(null)

    useEffect(() => {
        if (prefersReduced) return
        const scheduleGlitch = () => {
            timerRef.current = setTimeout(() => {
                setGlitching(true)
                setTimeout(() => { setGlitching(false); scheduleGlitch() }, 400)
            }, 2000 + Math.random() * 3000)
        }
        scheduleGlitch()
        return () => clearTimeout(timerRef.current)
    }, [prefersReduced])

    return (
        <h2
            className={`font-space font-black text-title relative select-none ${glitching ? 'anim-rgb-shift' : ''}`}
            style={{ color: 'var(--color-neon-red)' }}
            aria-label={text}
        >
            <span className="relative z-10">{text}</span>

            {glitching && !prefersReduced && (
                <span
                    aria-hidden="true"
                    className="absolute inset-0 font-space font-black text-title"
                    style={{ color: '#ff79c6', clipPath: 'inset(20% 0 55% 0)', transform: 'translate(-4px, -2px)', opacity: 0.8 }}
                >
                    {text}
                </span>
            )}
            {glitching && !prefersReduced && (
                <span
                    aria-hidden="true"
                    className="absolute inset-0 font-space font-black text-title"
                    style={{ color: '#00d4ff', clipPath: 'inset(60% 0 10% 0)', transform: 'translate(4px, 2px)', opacity: 0.7 }}
                >
                    {text}
                </span>
            )}
        </h2>
    )
}

/* ============================================================
   ERROR RAIN
   Stable positions generated once; visibility toggled by intensity.
   ============================================================ */
const RAIN_POOL = Array.from({ length: 40 }, (_, i) => {
    const error = ERROR_MESSAGES[i % ERROR_MESSAGES.length]
    const duration = 6 + ((i * 7) % 10)
    const delay = (i * 3.1) % 12
    const left = (i * 11.3) % 95
    return { ...error, duration, delay, left, id: i }
})

function ErrorRain({ intensity = 1 }) {
    const prefersReduced = useReducedMotion()
    const visibleCount = prefersReduced ? 0 : Math.min(Math.floor(20 * intensity), RAIN_POOL.length)

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
            {RAIN_POOL.slice(0, visibleCount).map(item => (
                <div
                    key={item.id}
                    className={`absolute font-mono whitespace-nowrap text-neon-red/80 ${item.size}`}
                    style={{
                        left: `${item.left}%`,
                        top: '-60px',
                        opacity: item.opacity * 0.6,
                        animation: `errorRain ${item.duration}s linear ${item.delay}s infinite`,
                        textShadow: '0 0 8px rgba(255,85,85,0.6)',
                        willChange: 'transform',
                    }}
                >
                    {item.text}
                </div>
            ))}
        </div>
    )
}

/* ============================================================
   SQUASHABLE BUG
   ============================================================ */
let bugIdCounter = 100

function Bug({ id, x, y, onSquash }) {
    const [squashed, setSquashed] = useState(false)
    const prefersReduced = useReducedMotion()
    const errorText = ERROR_MESSAGES[id % ERROR_MESSAGES.length].text

    const handleSquash = useCallback(() => {
        if (squashed) return
        setSquashed(true)
        setTimeout(() => onSquash(id, x, y), prefersReduced ? 0 : 320)
    }, [squashed, id, x, y, onSquash, prefersReduced])

    return (
        <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={squashed
                ? { scale: [1, 1.8, 0], opacity: [1, 1, 0], rotate: [0, 20, -20, 0] }
                : {
                    scale: 1,
                    opacity: 1,
                    boxShadow: [
                        '0 0 8px rgba(255,85,85,0.4)',
                        '0 0 20px rgba(255,85,85,0.8)',
                        '0 0 8px rgba(255,85,85,0.4)',
                    ],
                }
            }
            transition={squashed
                ? { duration: 0.32, ease: 'easeIn' }
                : {
                    type: 'spring',
                    stiffness: 300,
                    damping: 20,
                    delay: 0.05,
                    boxShadow: { duration: 1.6, repeat: Infinity, ease: 'easeInOut' },
                }
            }
            onClick={handleSquash}
            aria-label={`Click to squash bug: ${errorText}`}
            className="
                absolute flex items-center gap-1.5
                px-2.5 py-1.5 rounded-lg
                font-mono text-[10px] sm:text-xs
                text-neon-red
                border-2 border-neon-red/70
                bg-neon-red/15 backdrop-blur-sm
                cursor-pointer select-none
                whitespace-nowrap
                max-w-[200px] sm:max-w-[260px]
                hover:bg-neon-red/25 hover:border-neon-red
                focus-visible:outline-2 focus-visible:outline-neon-red
                transition-colors duration-100
            "
            style={{
                left: `${Math.min(Math.max(x, 2), 65)}%`,
                top: `${Math.min(Math.max(y, 5), 85)}%`,
                zIndex: squashed ? 1 : 10,
            }}
        >
            {/* Bouncing arrow — always visible until squashed */}
            {!squashed && (
                <motion.span
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 0.65, repeat: Infinity }}
                    className="absolute -top-6 left-1/2 -translate-x-1/2 text-base pointer-events-none"
                    aria-hidden="true"
                >
                    👆
                </motion.span>
            )}

            <span aria-hidden="true">🐛</span>
            <span className="truncate">{errorText}</span>

            {/* Always-visible SQUASH label */}
            {!squashed && (
                <span
                    className="
                        flex-shrink-0 font-mono text-[9px] font-bold
                        text-neon-red bg-neon-red/25
                        px-1.5 py-0.5 rounded border border-neon-red/50
                    "
                    aria-hidden="true"
                >
                    SQUASH!
                </span>
            )}
        </motion.button>
    )
}

function BugPlayground() {
    const prefersReduced = useReducedMotion()

    const [bugs, setBugs] = useState(() =>
        Array.from({ length: 5 }, (_, i) => ({
            id: i,
            x: 10 + (i * 17) % 60,
            y: 10 + (i * 19) % 80,
        }))
    )
    const [totalSquashed, setTotalSquashed] = useState(0)
    const [spawnAnim, setSpawnAnim] = useState(false)
    const [hasSquashedAny, setHasSquashedAny] = useState(false)

    const handleSquash = useCallback((squashedId, origX, origY) => {
        setBugs(prev => {
            const filtered = prev.filter(b => b.id !== squashedId)
            const newBugs = [0, 1].map(offset => ({
                id: ++bugIdCounter,
                x: Math.min(Math.max(origX + (offset === 0 ? -12 : 14) + Math.random() * 8, 2), 65),
                y: Math.min(Math.max(origY + (Math.random() - 0.5) * 20, 5), 85),
            }))
            return [...filtered, ...newBugs]
        })
        setTotalSquashed(n => n + 1)
        setHasSquashedAny(true)
        setSpawnAnim(true)
        setTimeout(() => setSpawnAnim(false), 600)
    }, [])

    return (
        <div
            className="relative w-full rounded-xl overflow-hidden border border-neon-red/20 bg-bg-void/90"
            style={{ height: '320px' }}
            role="region"
            aria-label="Bug playground — click bugs to squash them"
            aria-live="polite"
        >
            {/* Scanline overlay */}
            <div className="absolute inset-0 pointer-events-none z-20 crt-overlay" aria-hidden="true" />

            {/* Background grid */}
            <div
                className="absolute inset-0 opacity-[0.03] pointer-events-none"
                aria-hidden="true"
                style={{
                    backgroundImage: `
                        linear-gradient(rgba(255,85,85,1) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(255,85,85,1) 1px, transparent 1px)
                    `,
                    backgroundSize: '2.5rem 2.5rem',
                }}
            />

            {/* Big visible hint — disappears after first squash */}
            <AnimatePresence>
                {!hasSquashedAny && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.4 }}
                        className="absolute top-14 left-0 right-0 z-40 flex justify-center pointer-events-none"
                        aria-hidden="true"
                    >
                        <motion.div
                            animate={{ y: [0, -6, 0] }}
                            transition={{ duration: 0.75, repeat: Infinity }}
                            className="
                                flex items-center gap-2
                                font-space text-sm sm:text-base font-black
                                text-neon-red
                                bg-neon-red/15 border-2 border-neon-red/60
                                px-5 py-2.5 rounded-xl
                            "
                            style={{
                                boxShadow: '0 0 24px rgba(255,85,85,0.6), 0 0 60px rgba(255,85,85,0.2)',
                                textShadow: '0 0 14px rgba(255,85,85,0.9)',
                            }}
                        >
                            👆 CLICK ANY BUG TO SQUASH IT
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Spawn flash */}
            <AnimatePresence>
                {spawnAnim && !prefersReduced && (
                    <motion.div
                        initial={{ opacity: 0.3 }}
                        animate={{ opacity: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5 }}
                        className="absolute inset-0 pointer-events-none z-10 bg-neon-red/10 rounded-xl"
                        aria-hidden="true"
                    />
                )}
            </AnimatePresence>

            {/* Stats bar */}
            <div className="
                absolute top-0 left-0 right-0
                flex items-center justify-between
                px-4 py-2.5
                bg-bg-surface/80 backdrop-blur-sm
                border-b border-neon-red/20
                z-30
            ">
                <span className="font-mono text-xs text-neon-red/70 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-neon-red anim-neon-pulse-fast" aria-hidden="true" />
                    bugs/{bugs.length} active
                </span>
                <span className="font-mono text-xs text-white/30">
                    squashed: {totalSquashed} — new spawned: {totalSquashed * 2}
                </span>
                <span
                    className="font-mono text-[10px] text-neon-red/40"
                    aria-live="polite"
                    aria-label={`${bugs.length} bugs remaining`}
                >
                    {bugs.length > 15
                        ? '⚠ containment failing'
                        : !hasSquashedAny
                            ? '← click a bug!'
                            : 'keep squashing'}
                </span>
            </div>

            {/* Bugs */}
            <div className="absolute inset-0 pt-10" aria-label="Bug field">
                <AnimatePresence>
                    {bugs.map(bug => (
                        <Bug key={bug.id} {...bug} onSquash={handleSquash} />
                    ))}
                </AnimatePresence>
            </div>

            {/* Too many bugs warning */}
            <AnimatePresence>
                {bugs.length > 20 && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        className="
                            absolute bottom-3 left-1/2 -translate-x-1/2
                            font-mono text-[10px] text-neon-red
                            bg-neon-red/10 border border-neon-red/30
                            px-3 py-1.5 rounded-full whitespace-nowrap z-30
                        "
                        aria-live="assertive"
                        role="alert"
                    >
                        🚨 Bug population: uncontrollable. Ship it.
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

/* ============================================================
   BUG TIMELINE
   ============================================================ */
function BugTimelineCard({ commit, index, isVisible }) {
    const cfg = MOOD_CONFIG[commit.mood]

    return (
        <motion.div
            initial={{ opacity: 0, x: index % 2 === 0 ? -40 : 40, filter: 'blur(6px)' }}
            animate={isVisible
                ? { opacity: 1, x: 0, filter: 'blur(0px)' }
                : { opacity: 0, x: index % 2 === 0 ? -40 : 40, filter: 'blur(6px)' }
            }
            transition={{ delay: index * 0.12, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className={`relative glass-card rounded-xl p-4 sm:p-5 border ${cfg.border} ${cfg.bg}`}
            role="listitem"
            aria-label={`Commit ${index + 1}: ${commit.message}`}
        >
            {/* Top row */}
            <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2 min-w-0">
                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${cfg.dot}`} aria-hidden="true" />
                    <code className="font-mono text-xs text-white/30 flex-shrink-0">{commit.commit}</code>
                    <span className="font-mono text-[10px] text-white/20 hidden sm:block">{commit.time}</span>
                </div>
                <span className={`flex-shrink-0 font-mono text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full border ${cfg.border} ${cfg.color}`}>
                    {commit.mood}
                </span>
            </div>

            <p className={`font-mono text-sm font-semibold mb-2 ${cfg.color}`}>
                git commit -m "{commit.message}"
            </p>
            <p className="font-inter text-xs text-white/40 italic mb-3">{commit.note}</p>

            <pre
                className="
                    font-mono text-[10px] sm:text-xs
                    bg-bg-void/60 border border-bg-border/40
                    rounded-lg p-3 overflow-x-auto
                    leading-relaxed whitespace-pre-wrap break-words
                "
                aria-label={`Code diff for commit ${commit.commit}`}
            >
                {commit.diff.split('\n').map((line, i) => (
                    <div
                        key={i}
                        className={
                            line.startsWith('+') ? 'text-neon-green' :
                                line.startsWith('-') ? 'text-neon-red' :
                                    'text-white/40'
                        }
                    >
                        {line}
                    </div>
                ))}
            </pre>
        </motion.div>
    )
}

function BugTimeline({ isVisible }) {
    return (
        <div className="relative" role="list" aria-label="Bug fix attempt timeline">
            <div
                className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-neon-red/60 via-neon-red/20 to-transparent ml-[7px] sm:ml-0 sm:left-1/2 sm:-ml-px hidden sm:block"
                aria-hidden="true"
                style={{
                    transformOrigin: 'top',
                    transform: isVisible ? 'scaleY(1)' : 'scaleY(0)',
                    transition: 'transform 1.2s ease-out',
                }}
            />
            <div className="space-y-4 sm:space-y-6">
                {BUG_TIMELINE.map((commit, i) => (
                    <div
                        key={commit.commit}
                        className={`sm:grid sm:grid-cols-2 sm:gap-8 ${i % 2 === 0 ? '' : 'sm:[&>*]:col-start-2'}`}
                    >
                        <div className={i % 2 !== 0 ? 'sm:col-start-2' : ''}>
                            <BugTimelineCard commit={commit} index={i} isVisible={isVisible} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

/* ============================================================
   SHAKE WRAPPER
   ============================================================ */
function ShakeOnEntry({ children, className = '' }) {
    const ref = useRef(null)
    const [shaking, setShaking] = useState(false)
    const prefersReduced = useReducedMotion()

    useEffect(() => {
        if (!ref.current || prefersReduced) return
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setShaking(true)
                    setTimeout(() => setShaking(false), 650)
                    observer.disconnect()
                }
            },
            { threshold: 0.3 }
        )
        observer.observe(ref.current)
        return () => observer.disconnect()
    }, [prefersReduced])

    return (
        <div ref={ref} className={`${className} ${shaking && !prefersReduced ? 'anim-shake' : ''}`}>
            {children}
        </div>
    )
}

/* ============================================================
   CONSOLE.LOG DETECTIVE
   ============================================================ */
const SUSPECT_LINES = [
    { id: 0, code: 'async function loadUser(id) {', clickable: false, isBug: false, output: null, note: null },
    { id: 1, code: '  const res = await fetch("/api/" + id)', clickable: true, isBug: false, output: 'Response { status: 200, ok: true }', note: 'The network call looks fine. Keep going.' },
    { id: 2, code: '  const json = await res.json()', clickable: true, isBug: false, output: '{ user: null, message: "not found" }', note: 'Suspicious. user is null here...' },
    { id: 3, code: '  const name = json.user.name', clickable: true, isBug: true, output: "💥 TypeError: Cannot read properties of null (reading 'name')", note: '🎯 HERE. json.user is null — you never checked for it.' },
    { id: 4, code: '  return name.toUpperCase()', clickable: true, isBug: false, output: '[never reached — execution stopped above]', note: 'This line is innocent.' },
    { id: 5, code: '}', clickable: false, isBug: false, output: null, note: null },
]

function ConsoleLogDetective() {
    const [revealed, setRevealed] = useState({})
    const [bugFound, setBugFound] = useState(false)
    const [attempts, setAttempts] = useState(0)

    const handleReveal = useCallback((line) => {
        if (!line.clickable || revealed[line.id]) return
        setRevealed(prev => ({ ...prev, [line.id]: true }))
        setAttempts(a => a + 1)
        if (line.isBug) setBugFound(true)
    }, [revealed])

    const handleReset = useCallback(() => {
        setRevealed({})
        setBugFound(false)
        setAttempts(0)
    }, [])

    return (
        <div className="space-y-4" role="region" aria-label="Console.log detective — find the bug">
            <div className="space-y-1">
                <p className="font-mono text-[10px] text-white/25 uppercase tracking-[0.25em]">
                    Interactive — console.log detective
                </p>
                <h3 className="font-space text-xl sm:text-2xl font-bold text-white">
                    Find the bug <span className="text-neon-red">with console.log</span>
                </h3>
                <p className="font-inter text-sm text-white/40">
                    Click each line to add a console.log. Find where it breaks.
                </p>
            </div>

            <div className="terminal-window rounded-xl overflow-hidden">
                <div className="terminal-titlebar">
                    <span className="terminal-dot terminal-dot-red" aria-hidden="true" />
                    <span className="terminal-dot terminal-dot-yellow" aria-hidden="true" />
                    <span className="terminal-dot terminal-dot-green" aria-hidden="true" />
                    <span className="ml-3 font-mono text-[10px] text-white/30">
                        loadUser.js — click lines to add console.log
                    </span>
                    <span className="ml-auto font-mono text-[10px] text-white/20">
                        {attempts} log{attempts !== 1 ? 's' : ''} added
                    </span>
                </div>
                <div className="terminal-body space-y-0.5">
                    {SUSPECT_LINES.map((line, i) => (
                        <div key={line.id}>
                            <motion.div
                                whileHover={line.clickable && !revealed[line.id] ? { x: 4 } : {}}
                                onClick={() => handleReveal(line)}
                                className={`
                                    group relative flex items-start gap-3
                                    px-3 py-1.5 rounded
                                    transition-colors duration-150
                                    border-l-2
                                    ${!line.clickable
                                        ? 'cursor-default border-transparent'
                                        : revealed[line.id] && line.isBug
                                            ? 'bg-neon-red/12 border-neon-red/60 cursor-default'
                                            : revealed[line.id]
                                                ? 'bg-neon-green/5 border-neon-green/20 cursor-default'
                                                : 'hover:bg-white/5 border-transparent hover:border-neon-yellow/40 cursor-pointer'
                                    }
                                `}
                                role={line.clickable ? 'button' : undefined}
                                aria-label={line.clickable ? `Add console.log to: ${line.code}` : undefined}
                                tabIndex={line.clickable && !revealed[line.id] ? 0 : undefined}
                                onKeyDown={e => e.key === 'Enter' && handleReveal(line)}
                            >
                                <span className="font-mono text-[10px] text-white/15 select-none w-4 text-right flex-shrink-0 pt-px">
                                    {i + 1}
                                </span>
                                <span className={`font-mono text-xs flex-1 ${revealed[line.id] && line.isBug ? 'text-neon-red/90' : 'text-white/70'}`}>
                                    {line.code}
                                </span>
                                {line.clickable && !revealed[line.id] && (
                                    <span className="flex-shrink-0 font-mono text-[9px] text-neon-yellow/40 opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden="true">
                                        + log →
                                    </span>
                                )}
                                {revealed[line.id] && (
                                    <span className={`flex-shrink-0 text-[10px] ${line.isBug ? 'text-neon-red' : 'text-neon-green/60'}`} aria-hidden="true">
                                        {line.isBug ? '🐛' : '✓'}
                                    </span>
                                )}
                            </motion.div>

                            <AnimatePresence>
                                {revealed[line.id] && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.22 }}
                                        className="overflow-hidden"
                                    >
                                        <div className={`ml-7 mr-3 mb-1 px-3 py-2 rounded border-l-2 ${line.isBug ? 'bg-neon-red/8 border-neon-red/50' : 'bg-bg-void/60 border-neon-green/20'}`}>
                                            <p className={`font-mono text-[10px] ${line.isBug ? 'text-neon-red/90' : 'text-neon-green/70'}`}>
                                                &gt; {line.output}
                                            </p>
                                            {line.note && (
                                                <p className="font-mono text-[10px] text-white/30 italic mt-0.5">// {line.note}</p>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ))}
                </div>
            </div>

            <AnimatePresence>
                {bugFound && (
                    <motion.div
                        initial={{ opacity: 0, y: 12, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ type: 'spring', stiffness: 280, damping: 22 }}
                        className="glass-card-neon border-neon-red/30 rounded-xl p-4 space-y-2"
                        role="alert"
                        aria-live="assertive"
                    >
                        <p className="font-space text-base font-bold text-neon-red">🎯 Bug Located — Line 4</p>
                        <p className="font-inter text-xs text-white/55 leading-relaxed">
                            <code className="text-neon-red/80">json.user</code> is{' '}
                            <code className="text-neon-red/80">null</code> when the API finds no user,
                            but you access <code className="text-neon-red/80">.name</code> directly.
                            Fix: <code className="text-neon-green/80">json.user?.name ?? 'Unknown'</code>
                        </p>
                        <p className="font-mono text-[10px] text-white/25 italic">
                            Found in {attempts} console.log{attempts !== 1 ? 's' : ''}.{' '}
                            {attempts <= 2 ? 'Impressive instinct.' : attempts <= 4 ? 'Decent.' : 'Took a while, but we got there.'}
                        </p>
                        <button
                            onClick={handleReset}
                            className="font-mono text-[10px] text-white/25 hover:text-white/50 transition-colors underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-neon-green"
                        >
                            ← try again from scratch
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

/* ============================================================
   STACK TRACE DECODER
   ============================================================ */
const TRACE_FRAMES = [
    {
        raw: "TypeError: Cannot read properties of undefined (reading 'map')",
        decoded: "You called .map() on undefined. It is not an array. It has never been an array.",
        icon: '💥', color: 'text-neon-red',
    },
    {
        raw: '  at ProductList (ProductList.jsx:23:18)',
        decoded: 'YOUR code. Your file. Your line 23. There is nobody else to blame right now.',
        icon: '🫵', color: 'text-neon-yellow',
    },
    {
        raw: '  at renderWithHooks (react-dom.development.js:14985)',
        decoded: 'React called your component. It immediately encountered a problem of your creation.',
        icon: '😰', color: 'text-neon-blue',
    },
    {
        raw: '  at updateFunctionComponent (react-dom.development.js:17457)',
        decoded: 'React tried to update your component. The component turned on React.',
        icon: '😤', color: 'text-neon-purple',
    },
    {
        raw: '  at performUnitOfWork (react-dom.development.js:25701)',
        decoded: 'This is deep in React internals. You made React come all the way here. Think about that.',
        icon: '🤦', color: 'text-neon-green',
    },
    {
        raw: '  at workLoop (scheduler.development.js:266)',
        decoded: 'The scheduler. Completely innocent. Just doing its job. You ruined its entire afternoon.',
        icon: '🤷', color: 'text-white',
    },
]

function StackTraceDecoder() {
    const [decoded, setDecoded] = useState({})
    const allDecoded = Object.keys(decoded).length === TRACE_FRAMES.length

    const handleDecode = useCallback((i) => {
        setDecoded(prev => ({ ...prev, [i]: true }))
    }, [])

    return (
        <div className="space-y-4" role="region" aria-label="Stack trace decoder — click to translate">
            <div className="space-y-1">
                <p className="font-mono text-[10px] text-white/25 uppercase tracking-[0.25em]">
                    Interactive — stack trace decoder
                </p>
                <h3 className="font-space text-xl sm:text-2xl font-bold text-white">
                    What does this <span className="text-neon-red">actually mean?</span>
                </h3>
                <p className="font-inter text-sm text-white/40">
                    Click each line to get the plain-English translation.
                </p>
            </div>

            <div className="terminal-window rounded-xl overflow-hidden">
                <div className="terminal-titlebar">
                    <span className="terminal-dot terminal-dot-red" aria-hidden="true" />
                    <span className="terminal-dot terminal-dot-yellow" aria-hidden="true" />
                    <span className="terminal-dot terminal-dot-green" aria-hidden="true" />
                    <span className="ml-3 font-mono text-[10px] text-white/30">Uncaught Error — click each line</span>
                    <span className="ml-auto font-mono text-[10px] text-neon-red/40">
                        {Object.keys(decoded).length}/{TRACE_FRAMES.length} decoded
                    </span>
                </div>
                <div className="terminal-body space-y-0.5">
                    {TRACE_FRAMES.map((frame, i) => (
                        <div key={i}>
                            <motion.button
                                whileHover={!decoded[i] ? { x: 4 } : {}}
                                onClick={() => handleDecode(i)}
                                disabled={decoded[i]}
                                className={`
                                    w-full text-left px-3 py-1.5 rounded
                                    font-mono text-[10px] sm:text-xs
                                    transition-colors duration-150
                                    ${decoded[i] ? 'cursor-default bg-white/5' : 'cursor-pointer hover:bg-white/8'}
                                    ${i === 0 ? 'text-neon-red/85 font-semibold' : 'text-white/40'}
                                `}
                                aria-label={decoded[i] ? frame.raw : `Click to decode: ${frame.raw}`}
                                aria-expanded={decoded[i]}
                            >
                                <span className="flex items-center justify-between gap-2">
                                    <span className="truncate">{frame.raw}</span>
                                    {!decoded[i] && (
                                        <span className="flex-shrink-0 font-mono text-[9px] text-neon-yellow/30" aria-hidden="true">
                                            decode →
                                        </span>
                                    )}
                                    {decoded[i] && (
                                        <span className="flex-shrink-0 text-sm" aria-hidden="true">{frame.icon}</span>
                                    )}
                                </span>
                            </motion.button>

                            <AnimatePresence>
                                {decoded[i] && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        transition={{ duration: 0.22 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="mx-3 mb-1 px-3 py-2 rounded bg-bg-void/60 border-l-2 border-white/10">
                                            <p className={`font-inter text-xs ${frame.color} opacity-80`}>
                                                {frame.icon} {frame.decoded}
                                            </p>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ))}
                </div>
            </div>

            <AnimatePresence>
                {allDecoded && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 22 }}
                        className="glass-card rounded-xl p-4 border border-neon-green/20"
                        role="alert"
                        aria-live="polite"
                    >
                        <p className="font-space text-sm font-bold text-neon-green mb-1">
                            ✓ Stack Trace Fully Decoded
                        </p>
                        <p className="font-inter text-xs text-white/45 leading-relaxed">
                            Root cause: line 23, ProductList.jsx. It was always your file.
                            The 5 lines of React internals below it are innocent bystanders who just happened to be nearby.
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

/* ============================================================
   MAIN SECTION
   ============================================================ */
export default function Section3_DebuggingAbyss() {
    const sectionRef = useRef(null)
    const heroRef = useRef(null)
    const timelineRef = useRef(null)
    const bugRef = useRef(null)
    const pinRef = useRef(null)

    const [timelineVisible, setTimelineVisible] = useState(false)
    const [rainIntensity, setRainIntensity] = useState(0.5)

    const prefersReduced = useReducedMotion()

    /* ── GSAP: Hero entrance ── */
    useGSAP(() => {
        if (prefersReduced) { setTimelineVisible(true); return }

        gsap.timeline({
            scrollTrigger: {
                trigger: heroRef.current,
                start: 'top 80%',
                toggleActions: 'play none none none',
            },
        })
            .from('.s3-eyebrow', { y: 30, opacity: 0, duration: 0.5, ease: 'power3.out' })
            .from('.s3-title', { y: 0, opacity: 0, duration: 0.1, ease: 'none' }, '-=0.1')
            .from('.s3-subtitle', { y: 30, opacity: 0, duration: 0.6, ease: 'power3.out' }, '-=0.3')
            .from('.s3-tagline', { y: 20, opacity: 0, duration: 0.5, ease: 'power3.out' }, '-=0.3')
    }, sectionRef, [])

    /* ── GSAP: Pin hero while rain intensifies ── */
    useGSAP(() => {
        if (prefersReduced || !pinRef.current) return
        ScrollTrigger.create({
            trigger: pinRef.current,
            start: 'top 80px',
            end: () => `+=${window.innerHeight * 1.2}`,
            pin: true,
            pinSpacing: true,
            onUpdate: (self) => setRainIntensity(0.5 + self.progress * 1.5),
        })
    }, sectionRef, [])

    /* ── GSAP: Timeline reveal ── */
    useGSAP(() => {
        if (!timelineRef.current) return
        ScrollTrigger.create({
            trigger: timelineRef.current,
            start: 'top 75%',
            onEnter: () => setTimelineVisible(true),
        })
        if (prefersReduced) { setTimelineVisible(true); return }
        gsap.from(timelineRef.current, {
            scrollTrigger: {
                trigger: timelineRef.current,
                start: 'top 80%',
                toggleActions: 'play none none reverse',
            },
            y: 60, opacity: 0, duration: 0.8, ease: 'power3.out',
        })
    }, sectionRef, [])

    /* ── GSAP: Bug playground reveal ── */
    useGSAP(() => {
        if (!bugRef.current || prefersReduced) return
        gsap.from(bugRef.current, {
            scrollTrigger: {
                trigger: bugRef.current,
                start: 'top 85%',
                toggleActions: 'play none none reverse',
            },
            y: 50, opacity: 0, duration: 0.7, ease: 'power3.out',
        })
    }, sectionRef, [])

    /* ── GSAP: Background color scrub ── */
    useGSAP(() => {
        if (prefersReduced) return
        gsap.fromTo(
            sectionRef.current,
            { backgroundColor: 'rgba(10,10,15,1)' },
            {
                backgroundColor: 'rgba(20,5,5,1)',
                scrollTrigger: { trigger: sectionRef.current, start: 'top bottom', end: 'center center', scrub: 2 },
            }
        )
        gsap.fromTo(
            sectionRef.current,
            { backgroundColor: 'rgba(20,5,5,1)' },
            {
                backgroundColor: 'rgba(10,10,15,1)',
                scrollTrigger: { trigger: sectionRef.current, start: 'center center', end: 'bottom top', scrub: 2 },
            }
        )
    }, sectionRef, [])

    return (
        <section
            id="section-3"
            ref={sectionRef}
            aria-label="Chapter 3: The Debugging Abyss"
            className="relative bg-bg-void overflow-hidden"
        >
            {/* ── Neon border top ── */}
            <div
                className="absolute top-0 left-0 right-0 h-px pointer-events-none"
                aria-hidden="true"
                style={{ background: 'linear-gradient(90deg, transparent, rgba(255,85,85,0.6), transparent)' }}
            />

            {/* ══════════════════════════════════════════
                BLOCK 1 — PINNED HERO WITH ERROR RAIN
            ══════════════════════════════════════════ */}
            <div ref={pinRef} className="relative" style={{ minHeight: '100vh' }}>
                <ErrorRain intensity={rainIntensity} />

                <div
                    className="absolute inset-0 pointer-events-none"
                    aria-hidden="true"
                    style={{
                        background: `radial-gradient(ellipse 80% 60% at 50% 40%,
                            rgba(255,85,85,0.07) 0%, transparent 65%)`,
                    }}
                />
                <div
                    className="absolute inset-0 pointer-events-none opacity-[0.025]"
                    aria-hidden="true"
                    style={{
                        backgroundImage: `
                            linear-gradient(rgba(255,85,85,1) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,85,85,1) 1px, transparent 1px)
                        `,
                        backgroundSize: '3rem 3rem',
                    }}
                />

                <div
                    ref={heroRef}
                    className="
                        relative z-10 container-wide
                        px-4 sm:px-6 lg:px-8
                        flex flex-col items-center justify-center
                        min-h-screen py-28 text-center gap-6
                    "
                >
                    <div
                        className="
                            s3-eyebrow inline-flex items-center gap-2
                            font-mono text-xs text-neon-red/60
                            tracking-[0.3em] uppercase
                            border border-neon-red/20
                            px-4 py-1.5 rounded-full bg-neon-red/5
                        "
                        aria-label="Chapter 3 of 6"
                    >
                        Chapter 03 / 06
                    </div>

                    <ShakeOnEntry className="s3-title">
                        <GlitchHeading text="THE DEBUGGING ABYSS" />
                    </ShakeOnEntry>

                    <p className="s3-subtitle font-inter text-base sm:text-xl text-white/50 max-w-xl leading-relaxed">
                        It's never just{' '}
                        <code className="font-mono text-neon-red bg-neon-red/10 border border-neon-red/20 px-1.5 py-0.5 rounded text-sm">
                            a missing semicolon.
                        </code>
                        {' '}It is always, without exception,{' '}
                        <em className="text-neon-red not-italic font-medium">deeply personal.</em>
                    </p>

                    <div className="s3-tagline glass-card-neon border-neon-red/20 rounded-2xl px-6 sm:px-10 py-5 max-w-lg space-y-2">
                        <p className="font-mono text-xs text-neon-red/50 uppercase tracking-widest">
                            Famous last words
                        </p>
                        <blockquote className="font-space text-lg sm:text-2xl font-bold text-white">
                            "I'll just <span className="text-glow-red">debug this quickly</span>. Give me 5 minutes."
                        </blockquote>
                        <p className="font-mono text-xs text-white/25 italic">
                            — You, 6 hours ago. It's still not fixed.
                        </p>
                    </div>

                    {!prefersReduced && (
                        <motion.div
                            animate={{ y: [0, 8, 0], opacity: [0.4, 0.8, 0.4] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="absolute bottom-8 font-mono text-xs text-neon-red/40 flex flex-col items-center gap-2"
                            aria-hidden="true"
                        >
                            <span>scroll to witness the carnage</span>
                            <span>↓</span>
                        </motion.div>
                    )}
                </div>
            </div>

            {/* ══════════════════════════════════════════
                BLOCK 2 — BUG PLAYGROUND
            ══════════════════════════════════════════ */}
            <div
                ref={bugRef}
                className="relative z-10 container-wide px-4 sm:px-6 lg:px-8 py-20 sm:py-28 space-y-8"
            >
                <div className="space-y-3 max-w-xl">
                    <h3 className="font-space text-2xl sm:text-3xl font-bold text-white">
                        Squash the <span className="text-glow-red">Bug</span>
                    </h3>
                    <p className="font-inter text-sm text-white/40 leading-relaxed">
                        Each time you fix one, two more appear. This is not a metaphor.
                        This is your Tuesday afternoon.
                    </p>
                </div>

                <BugPlayground />

                <div className="glass-card-neon border-neon-red/15 rounded-xl p-4 flex items-start gap-3 max-w-xl">
                    <span className="text-xl flex-shrink-0 mt-0.5" aria-hidden="true">💡</span>
                    <div className="font-mono text-xs text-white/40 leading-relaxed space-y-1">
                        <p className="text-neon-red/70 font-semibold">Console.log driven development</p>
                        <p>
                            Step 1: Add console.log("here")<br />
                            Step 2: Add console.log("here 2")<br />
                            Step 3: Add console.log("WHY IS IT NOT HERE")<br />
                            Step 4: It was a typo. It's always a typo.
                        </p>
                    </div>
                </div>
            </div>

            {/* ══════════════════════════════════════════
                BLOCK 2B — CONSOLE LOG DETECTIVE + STACK TRACE
            ══════════════════════════════════════════ */}
            <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                className="relative z-10 container-wide px-4 sm:px-6 lg:px-8 pb-20 sm:pb-24"
            >
                <div className="text-center mb-10 space-y-2">
                    <h3 className="font-space text-2xl sm:text-3xl font-bold text-white">
                        The <span className="text-glow-red">Debugging Toolkit</span>
                    </h3>
                    <p className="font-inter text-sm text-white/35 max-w-md mx-auto">
                        Two classic developer experiences. Neither ends well.
                    </p>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
                    <ConsoleLogDetective />
                    <StackTraceDecoder />
                </div>
            </motion.div>

            {/* ══════════════════════════════════════════
                BLOCK 3 — BUG FIX TIMELINE
            ══════════════════════════════════════════ */}
            <div
                ref={timelineRef}
                className="relative z-10 container-wide px-4 sm:px-6 lg:px-8 pb-24 sm:pb-32 space-y-10"
            >
                <div className="text-center space-y-3">
                    <h3 className="font-space text-2xl sm:text-3xl font-bold text-white">
                        The <span className="text-glow-red">Fix</span> History
                    </h3>
                    <p className="font-inter text-sm text-white/40 max-w-md mx-auto leading-relaxed">
                        One bug. Five commits. A journey through the five stages of developer grief.
                    </p>
                </div>

                <div
                    className="grid grid-cols-5 gap-1 sm:gap-2 max-w-xl mx-auto"
                    aria-label="Five stages of developer grief"
                >
                    {['Denial', 'Anger', 'Bargaining', 'Despair', 'Acceptance'].map((stage, i) => (
                        <div
                            key={stage}
                            className={`
                                text-center font-mono text-[9px] sm:text-[10px]
                                py-1.5 px-1 rounded border
                                transition-all duration-300
                                ${timelineVisible
                                    ? i < 2
                                        ? 'border-neon-green/30 text-neon-green/60 bg-neon-green/5'
                                        : i < 4
                                            ? 'border-neon-yellow/30 text-neon-yellow/60 bg-neon-yellow/5'
                                            : 'border-neon-red/30 text-neon-red/60 bg-neon-red/5'
                                    : 'border-bg-border/30 text-white/20'
                                }
                            `}
                        >
                            {stage}
                        </div>
                    ))}
                </div>

                <BugTimeline isVisible={timelineVisible} />

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7 }}
                    className="text-center glass-card-neon border-neon-red/20 rounded-2xl p-6 sm:p-8 max-w-2xl mx-auto space-y-3"
                >
                    <p className="text-3xl sm:text-4xl" aria-hidden="true">🏴‍☠️</p>
                    <h4 className="font-space text-lg sm:text-xl font-bold text-white">
                        The bug was there from the beginning.
                    </h4>
                    <p className="font-inter text-sm text-white/40 leading-relaxed">
                        It was in the requirements. It was in the architecture.
                        It was in the PRD that nobody read.
                        You just introduced 4 new bugs while hunting it.
                    </p>
                    <div className="font-mono text-xs text-neon-red/50 border-t border-neon-red/10 pt-3 mt-3">
                        <span className="text-neon-red/30">/* </span>
                        git blame shows it was your own commit. From this morning.
                        <span className="text-neon-red/30"> */</span>
                    </div>
                </motion.div>
            </div>

            {/* ── Bottom fade ── */}
            <div
                className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none z-20"
                aria-hidden="true"
                style={{ background: 'linear-gradient(to bottom, transparent, var(--color-bg-void))' }}
            />
        </section>
    )
}
