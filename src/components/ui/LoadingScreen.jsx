/**
 * LoadingScreen — Terminal-style boot sequence.
 * Mounts immediately, displays a sequence of lines + progress bar,
 * then calls onComplete() and fades out.
 *
 * Props:
 *   onComplete (fn) — called when boot sequence finishes
 */

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'

const BOOT_LINES = [
    {
        text: '> initializing frontend-odyssey v1.0.0',
        delay: 200,
        color: 'text-white/60',
    },
    {
        text: '> loading react@18.3.1...',
        delay: 400,
        color: 'text-neon-blue/80',
    },
    {
        text: '> loading gsap@3.x [ScrollTrigger, ScrollToPlugin]...',
        delay: 600,
        color: 'text-neon-green/80',
    },
    {
        text: '> loading three.js + @react-three/fiber...',
        delay: 820,
        color: 'text-neon-purple/80',
    },
    {
        text: '> loading framer-motion@11.x...',
        delay: 1000,
        color: 'text-neon-pink/80',
    },
    {
        text: '> brewing coffee...',
        delay: 1250,
        color: 'text-coffee-amber/90',
    },
    {
        text: '> resolving 1,247 peer dependencies...',
        delay: 1550,
        color: 'text-white/35',
    },
    {
        text: '> WARNING: sleep module not found',
        delay: 1800,
        color: 'text-neon-yellow/70',
    },
    {
        text: '> compiling developer memories...',
        delay: 2050,
        color: 'text-white/60',
    },
    {
        text: '> READY. scroll to begin.',
        delay: 2400,
        color: 'text-neon-green',
    },
]

const COMPLETE_DELAY = 3000 // ms after component mount
const FADE_OUT_DELAY = 500  // ms after onComplete is called before fully gone

export default function LoadingScreen({ onComplete }) {
    const [lines, setLines] = useState([])
    const [progress, setProgress] = useState(0)
    const [exiting, setExiting] = useState(false)

    const timers = useRef([])
    const prefersReduced = useReducedMotion()

    const addTimer = useCallback((fn, ms) => {
        const t = setTimeout(fn, ms)
        timers.current.push(t)
        return t
    }, [])

    useEffect(() => {
        if (prefersReduced) {
            // Skip animation — show all lines instantly, complete immediately
            setLines(BOOT_LINES)
            setProgress(100)
            setExiting(true)
            const t = setTimeout(onComplete, 300)
            return () => clearTimeout(t)
        }

        // Stagger lines
        BOOT_LINES.forEach((line, i) => {
            addTimer(() => {
                setLines(prev => [...prev, line])
                setProgress(Math.round(((i + 1) / BOOT_LINES.length) * 100))
            }, line.delay)
        })

        // Complete + exit
        addTimer(() => {
            setExiting(true)
            addTimer(onComplete, FADE_OUT_DELAY)
        }, COMPLETE_DELAY)

        return () => timers.current.forEach(clearTimeout)
    }, [prefersReduced, onComplete, addTimer])

    return (
        <AnimatePresence>
            {!exiting ? (
                <motion.div
                    key="loading"
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0, scale: 1.02, filter: 'blur(4px)' }}
                    transition={{ duration: 0.55, ease: 'easeIn' }}
                    className="
            fixed inset-0 z-[9999]
            bg-bg-void
            flex flex-col items-center justify-center
            px-6
          "
                    role="status"
                    aria-label="Loading Frontend Odyssey — boot sequence in progress"
                    aria-live="polite"
                >
                    {/* CRT scanline overlay */}
                    <div
                        className="absolute inset-0 crt-overlay pointer-events-none opacity-40"
                        aria-hidden="true"
                    />

                    {/* Ambient top glow */}
                    <div
                        className="absolute top-0 left-0 right-0 h-64 pointer-events-none"
                        aria-hidden="true"
                        style={{
                            background:
                                'radial-gradient(ellipse 80% 100% at 50% 0%, rgba(0,255,136,0.06) 0%, transparent 70%)',
                        }}
                    />

                    {/* Terminal window */}
                    <div className="
            terminal-window
            w-full max-w-lg
            border border-neon-green/20
            relative
          ">
                        {/* Title bar */}
                        <div className="terminal-titlebar">
                            <span className="terminal-dot terminal-dot-red" aria-hidden="true" />
                            <span className="terminal-dot terminal-dot-yellow" aria-hidden="true" />
                            <span className="terminal-dot terminal-dot-green" aria-hidden="true" />
                            <span className="ml-3 font-mono text-xs text-white/30">
                                frontend-odyssey — boot
                            </span>
                            <span className="ml-auto font-mono text-[10px] text-neon-green/40">
                                {progress}%
                            </span>
                        </div>

                        {/* Boot lines */}
                        <div
                            className="terminal-body space-y-1 min-h-[260px]"
                            aria-live="polite"
                        >
                            {lines.map((line, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: -8 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className={`font-mono text-xs sm:text-sm ${line.color}`}
                                >
                                    {line.text}
                                    {i === lines.length - 1 && progress < 100 && (
                                        <span
                                            className="typewriter-cursor text-transparent"
                                            aria-hidden="true"
                                        >
                                            &nbsp;
                                        </span>
                                    )}
                                </motion.div>
                            ))}
                        </div>

                        {/* Progress bar */}
                        <div className="px-4 pb-4">
                            <div className="h-1.5 bg-bg-border/60 rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full rounded-full"
                                    style={{
                                        background:
                                            'linear-gradient(90deg, #00ff88, #00d4ff, #bd93f9)',
                                        boxShadow: '0 0 10px rgba(0,255,136,0.5)',
                                    }}
                                    initial={{ width: '0%' }}
                                    animate={{ width: `${progress}%` }}
                                    transition={{ duration: 0.25, ease: 'linear' }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Footer hint */}
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: progress > 50 ? 0.3 : 0 }}
                        transition={{ duration: 0.5 }}
                        className="
              mt-6 font-mono text-[10px] text-white/30
              tracking-widest uppercase
            "
                        aria-hidden="true"
                    >
                        The journey of a thousand commits begins with a single npm install
                    </motion.p>
                </motion.div>
            ) : null}
        </AnimatePresence>
    )
}

