import React, {
  useRef,
  useState,
  useEffect,
  useCallback,
  useMemo,
  Suspense,
} from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Float, MeshDistortMaterial } from '@react-three/drei'
import { motion, AnimatePresence } from 'framer-motion'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@/hooks/useGSAP'
import * as THREE from 'three'

gsap.registerPlugin(ScrollTrigger)

/* ============================================================
   CONSTANTS
   ============================================================ */

const TYPEWRITER_SEQUENCE = [
  { text: '<!DOCTYPE html>',                       color: 'token-tag',      delay: 80  },
  { text: '<html>',                                color: 'token-tag',      delay: 80  },
  { text: '  <body>',                              color: 'token-tag',      delay: 80  },
  { text: '    <h1>Hello, World!</h1>',            color: 'token-tag',      delay: 60  },
  { text: '  </body>',                             color: 'token-tag',      delay: 80  },
  { text: '</html>',                               color: 'token-tag',      delay: 80  },
  { text: '',                                      color: '',               delay: 400 },
  { text: '/* Wait, I can make it look better */', color: 'token-comment',  delay: 60  },
  { text: 'h1 {',                                  color: 'token-punctuation', delay: 80 },
  { text: '  color: #ff00ff;',                    color: 'token-value',    delay: 60  },
  { text: '  font-size: 999px;',                  color: 'token-value',    delay: 60  },
  { text: '  animation: spin 1s infinite;',       color: 'token-value',    delay: 60  },
  { text: '}',                                     color: 'token-punctuation', delay: 200 },
  { text: '',                                      color: '',               delay: 500 },
  { text: '// Perfection.',                        color: 'token-comment',  delay: 80  },
  { text: 'console.log("I am a genius")',          color: 'token-function', delay: 60  },
]

const MATRIX_CHARS =
  'アイウエオカキクケコサシスセソタチツテトナニヌネノABCDEF0123456789<>/{}[]();'

/* ============================================================
   MATRIX RAIN  (canvas-based, performant)
   ============================================================ */
function MatrixRain() {
  const canvasRef = useRef(null)
  const animRef   = useRef(null)

  useEffect(() => {
    // Respect reduced motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const canvas  = canvasRef.current
    if (!canvas) return
    const ctx     = canvas.getContext('2d')
    const fontSize = 13
    let cols, drops

    const resize = () => {
      canvas.width  = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
      cols  = Math.floor(canvas.width / fontSize)
      drops = Array(cols).fill(1)
    }

    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    const draw = () => {
      // Semi-transparent fade — creates trailing effect
      ctx.fillStyle = 'rgba(10, 10, 15, 0.06)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      ctx.fillStyle = '#00ff88'
      ctx.font      = `${fontSize}px "JetBrains Mono", monospace`

      for (let i = 0; i < drops.length; i++) {
        const char = MATRIX_CHARS[Math.floor(Math.random() * MATRIX_CHARS.length)]
        ctx.fillStyle = drops[i] * fontSize < canvas.height * 0.2
          ? 'rgba(0,255,136,0.9)'   // brighter near top
          : 'rgba(0,255,136,0.25)'  // dim further down
        ctx.fillText(char, i * fontSize, drops[i] * fontSize)

        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0
        }
        drops[i]++
      }

      animRef.current = requestAnimationFrame(draw)
    }

    animRef.current = requestAnimationFrame(draw)

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current)
      ro.disconnect()
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="matrix-bg absolute inset-0 w-full h-full"
      aria-hidden="true"
      style={{ opacity: 0.07 }}
    />
  )
}

/* ============================================================
   3D LAPTOP / MONITOR SCENE
   ============================================================ */

/** The glowing screen panel */
function ScreenMesh({ hovered }) {
  const meshRef  = useRef()
  const glowRef  = useRef()

  useFrame((state) => {
    if (!meshRef.current) return
    const t = state.clock.elapsedTime
    meshRef.current.rotation.y = Math.sin(t * 0.3) * 0.15
    meshRef.current.rotation.x = Math.sin(t * 0.2) * 0.05 - 0.05
    if (glowRef.current) {
      glowRef.current.intensity = 1.2 + Math.sin(t * 2) * 0.3
    }
  })

  return (
    <group ref={meshRef}>
      {/* Monitor base */}
      <mesh position={[0, -1.6, 0]} castShadow>
        <cylinderGeometry args={[0.5, 0.7, 0.12, 32]} />
        <meshStandardMaterial color="#1a1f2e" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Monitor stand */}
      <mesh position={[0, -1.1, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.12, 1.0, 16]} />
        <meshStandardMaterial color="#161b22" metalness={0.9} roughness={0.15} />
      </mesh>

      {/* Monitor bezel */}
      <mesh position={[0, 0, 0]} castShadow>
        <boxGeometry args={[3.6, 2.4, 0.15]} />
        <meshStandardMaterial color="#0d1117" metalness={0.6} roughness={0.3} />
      </mesh>

      {/* Screen glow backing */}
      <mesh position={[0, 0, 0.09]}>
        <boxGeometry args={[3.3, 2.1, 0.01]} />
        <meshStandardMaterial
          color="#00ff88"
          emissive="#00ff88"
          emissiveIntensity={hovered ? 0.4 : 0.2}
          transparent
          opacity={0.15}
        />
      </mesh>

      {/* Screen surface — distorted material for glitchy look */}
      <mesh position={[0, 0, 0.1]}>
        <boxGeometry args={[3.2, 2.0, 0.01]} />
        <MeshDistortMaterial
          color="#0a0f1a"
          emissive="#003322"
          emissiveIntensity={0.5}
          distort={hovered ? 0.08 : 0.02}
          speed={2}
          roughness={0.1}
          metalness={0.2}
        />
      </mesh>

      {/* Floating code glyphs above screen */}
      {[[-0.8, 0.4, 0.2], [0.5, -0.3, 0.2], [-0.3, -0.5, 0.2], [0.9, 0.5, 0.2]].map(
        ([x, y, z], i) => (
          <mesh key={i} position={[x, y, z]}>
            <boxGeometry args={[0.25, 0.06, 0.01]} />
            <meshStandardMaterial
              color="#00ff88"
              emissive="#00ff88"
              emissiveIntensity={0.8 + i * 0.1}
              transparent
              opacity={0.6}
            />
          </mesh>
        )
      )}

      {/* Screen glow point light */}
      <pointLight
        ref={glowRef}
        position={[0, 0, 0.5]}
        color="#00ff88"
        intensity={1.2}
        distance={4}
        decay={2}
      />
    </group>
  )
}

/** Floating particles orbiting the monitor */
function Particles() {
  const mesh   = useRef()
  const count  = 80

  const { positions, speeds } = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const speeds    = []
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2
      const phi   = Math.acos(2 * Math.random() - 1)
      const r     = 2.5 + Math.random() * 1.5
      positions[i * 3]     = r * Math.sin(phi) * Math.cos(theta)
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.6
      positions[i * 3 + 2] = r * Math.cos(phi)
      speeds.push(0.1 + Math.random() * 0.3)
    }
    return { positions, speeds }
  }, [])

  useFrame((state) => {
    if (!mesh.current) return
    const t = state.clock.elapsedTime
    mesh.current.rotation.y = t * 0.08
    mesh.current.rotation.x = Math.sin(t * 0.05) * 0.1
  })

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          array={positions}
          count={count}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.04}
        color="#00ff88"
        transparent
        opacity={0.7}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  )
}

/** Mouse-tracking camera rig */
function CameraRig({ mouse }) {
  const { camera } = useThree()

  useFrame(() => {
    camera.position.x += (mouse.current.x * 0.5 - camera.position.x) * 0.05
    camera.position.y += (mouse.current.y * 0.3 - camera.position.y) * 0.05
    camera.lookAt(0, 0, 0)
  })

  return null
}

function MonitorScene({ mouse }) {
  const [hovered, setHovered] = useState(false)

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.15} />
      <directionalLight position={[5, 5, 5]} intensity={0.6} color="#ffffff" />
      <pointLight position={[-4, 3, 2]}  color="#00d4ff"  intensity={0.8} distance={10} />
      <pointLight position={[4, -3, -2]} color="#bd93f9"  intensity={0.5} distance={10} />

      {/* Camera */}
      <CameraRig mouse={mouse} />

      {/* Main monitor with float animation */}
      <Float
        speed={1.5}
        rotationIntensity={0.2}
        floatIntensity={0.4}
        floatingRange={[-0.15, 0.15]}
      >
        <group
          onPointerEnter={() => setHovered(true)}
          onPointerLeave={() => setHovered(false)}
        >
          <ScreenMesh hovered={hovered} />
        </group>
      </Float>

      {/* Orbiting particles */}
      <Particles />
    </>
  )
}

/* ============================================================
   TYPEWRITER COMPONENT
   ============================================================ */
function TypewriterCode({ started }) {
  const [lines,   setLines]   = useState([])
  const [current, setCurrent] = useState('')
  const [lineIdx, setLineIdx] = useState(0)
  const [charIdx, setCharIdx] = useState(0)
  const [done,    setDone]    = useState(false)
  const timeoutRef = useRef(null)

  const prefersReduced = useMemo(
    () => typeof window !== 'undefined' &&
          window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    []
  )

  useEffect(() => {
    if (!started) return

    // Reduced motion: render all at once
    if (prefersReduced) {
      setLines(TYPEWRITER_SEQUENCE)
      setDone(true)
      return
    }

    if (lineIdx >= TYPEWRITER_SEQUENCE.length) {
      setDone(true)
      return
    }

    const line = TYPEWRITER_SEQUENCE[lineIdx]
    const fullText = line.text

    if (charIdx < fullText.length) {
      const perChar = line.delay / Math.max(fullText.length, 1)
      timeoutRef.current = setTimeout(() => {
        setCurrent(fullText.slice(0, charIdx + 1))
        setCharIdx(c => c + 1)
      }, Math.min(perChar, 60))
    } else {
      // Line complete — pause then advance
      timeoutRef.current = setTimeout(() => {
        setLines(prev => [...prev, { ...line, text: fullText }])
        setCurrent('')
        setLineIdx(l => l + 1)
        setCharIdx(0)
      }, line.delay)
    }

    return () => clearTimeout(timeoutRef.current)
  }, [started, lineIdx, charIdx, prefersReduced])

  return (
    <div
      className="terminal-window w-full max-w-lg xl:max-w-xl"
      role="region"
      aria-label="Code editor — typewriter animation"
      aria-live="polite"
    >
      {/* Title bar */}
      <div className="terminal-titlebar">
        <span className="terminal-dot terminal-dot-red"  aria-hidden="true" />
        <span className="terminal-dot terminal-dot-yellow" aria-hidden="true" />
        <span className="terminal-dot terminal-dot-green"  aria-hidden="true" />
        <span className="ml-3 font-mono text-xs text-white/30">
          genius_code.html
        </span>
        <span className="ml-auto font-mono text-xs text-neon-green/40">
          ● unsaved
        </span>
      </div>

      {/* Code body */}
      <div className="terminal-body crt-overlay p-4 min-h-[220px] sm:min-h-[260px]">
        {/* Line numbers + completed lines */}
        {lines.map((line, i) => (
          <div key={i} className="flex gap-3 leading-relaxed">
            <span
              className="select-none text-white/20 w-5 text-right flex-shrink-0 font-mono text-xs"
              aria-hidden="true"
            >
              {i + 1}
            </span>
            {line.text === '' ? (
              <span className="text-transparent select-none">&nbsp;</span>
            ) : (
              <span className={`font-mono text-xs sm:text-sm ${line.color}`}>
                {line.text}
              </span>
            )}
          </div>
        ))}

        {/* Currently typing line */}
        {!done && (
          <div className="flex gap-3 leading-relaxed">
            <span
              className="select-none text-white/20 w-5 text-right flex-shrink-0 font-mono text-xs"
              aria-hidden="true"
            >
              {lines.length + 1}
            </span>
            <span
              className={`
                font-mono text-xs sm:text-sm
                ${TYPEWRITER_SEQUENCE[lineIdx]?.color || ''}
                typewriter-cursor
              `}
            >
              {current}
            </span>
          </div>
        )}

        {/* Done — blinking cursor on last line */}
        {done && (
          <div className="flex gap-3 mt-1">
            <span className="select-none text-white/20 w-5 text-right flex-shrink-0 font-mono text-xs">
              {TYPEWRITER_SEQUENCE.length + 1}
            </span>
            <span
              className="font-mono text-xs sm:text-sm text-neon-green/70 typewriter-cursor"
              aria-label="Cursor — code complete"
            />
          </div>
        )}
      </div>

      {/* Status bar */}
      <div className="
        px-4 py-1.5
        bg-neon-green text-bg-void
        font-mono text-[10px]
        flex items-center justify-between
      ">
        <span>💡 Day 1 · Line 1 · Col {charIdx || 1}</span>
        <span>UTF-8 · HTML · GENIUS MODE ON</span>
      </div>
    </div>
  )
}

/* ============================================================
   FLOATING BADGES
   ============================================================ */
const BADGES = [
  { text: 'HTML God',       color: 'border-neon-green/40  text-neon-green',  delay: 0.3 },
  { text: 'CSS Wizard',     color: 'border-neon-blue/40   text-neon-blue',   delay: 0.5 },
  { text: '10x Developer',  color: 'border-neon-purple/40 text-neon-purple', delay: 0.7 },
  { text: 'Ship It ™',      color: 'border-neon-yellow/40 text-neon-yellow', delay: 0.9 },
]

function FloatingBadge({ text, color, delay, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{
        delay,
        type: 'spring',
        stiffness: 200,
        damping: 15,
      }}
      className={`
        glass-card-neon
        px-3 py-1.5
        font-mono text-xs font-semibold
        border ${color}
        whitespace-nowrap
        cursor-default
        select-none
      `}
      style={{
        animation: `float ${4 + index * 0.8}s ease-in-out ${delay}s infinite`,
      }}
      aria-hidden="true"
    >
      {text}
    </motion.div>
  )
}

/* ============================================================
   SCROLL DOWN INDICATOR
   ============================================================ */
function ScrollCue() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 3.5, duration: 0.6 }}
      className="
        absolute bottom-8 left-1/2 -translate-x-1/2
        flex flex-col items-center gap-2
        font-mono text-xs text-white/30
        pointer-events-none
      "
      aria-label="Scroll down to continue"
    >
      <span>scroll to continue</span>
      <motion.div
        animate={{ y: [0, 6, 0] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        className="w-5 h-8 rounded-full border border-white/20 flex items-start justify-center pt-1.5"
        aria-hidden="true"
      >
        <div className="w-1 h-2 rounded-full bg-neon-green/60" />
      </motion.div>
    </motion.div>
  )
}

/* ============================================================
   MAIN SECTION COMPONENT
   ============================================================ */
export default function Section1_Beginning() {
  const sectionRef  = useRef(null)
  const headlineRef = useRef(null)
  const subRef      = useRef(null)
  const editorRef   = useRef(null)
  const badgesRef   = useRef(null)
  const canvasWrapRef = useRef(null)
  const mouse         = useRef({ x: 0, y: 0 })

  const [typewriterStarted, setTypewriterStarted] = useState(false)
  const [sceneReady,        setSceneReady]         = useState(false)

  // ── Mouse tracking for 3D camera ──
  const handleMouseMove = useCallback((e) => {
    const rect = sectionRef.current?.getBoundingClientRect()
    if (!rect) return
    mouse.current = {
      x: ((e.clientX - rect.left) / rect.width  - 0.5) * 2,
      y: ((e.clientY - rect.top)  / rect.height - 0.5) * -2,
    }
  }, [])

  // ── GSAP entrance animations ──
  useGSAP(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) {
      setTypewriterStarted(true)
      return
    }

    const tl = gsap.timeline({
      onComplete: () => setTypewriterStarted(true),
    })

    // Headline flies in from left
    tl.from(headlineRef.current, {
      x: -80,
      opacity: 0,
      duration: 0.9,
      ease: 'power3.out',
    })

    // Sub-text slides in from left with slight delay
    tl.from(subRef.current, {
      x: -60,
      opacity: 0,
      duration: 0.7,
      ease: 'power3.out',
    }, '-=0.5')

    // Editor zooms in from right
    tl.from(editorRef.current, {
      x: 80,
      opacity: 0,
      duration: 0.8,
      ease: 'power3.out',
    }, '-=0.6')

    // Canvas wrapper fades up
    tl.from(canvasWrapRef.current, {
      y: 40,
      opacity: 0,
      duration: 0.7,
      ease: 'power3.out',
    }, '-=0.5')
  }, sectionRef, [])

  // ── GSAP scroll-triggered exit ──
  useGSAP(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    ScrollTrigger.create({
      trigger: sectionRef.current,
      start:   'bottom 80%',
      end:     'bottom 20%',
      scrub:   1.5,
      onUpdate: (self) => {
        const p = self.progress
        if (!sectionRef.current) return
        gsap.set(sectionRef.current, {
          '--exit-progress': p,
        })
      },
    })

    gsap.to(sectionRef.current, {
      scrollTrigger: {
        trigger: sectionRef.current,
        start:   'bottom 75%',
        end:     'bottom top',
        scrub:   2,
      },
      opacity: 0.3,
      scale:   0.96,
      filter:  'blur(4px)',
      ease:    'none',
    })
  }, sectionRef, [])

  // ── Start 3D scene after short delay ──
  useEffect(() => {
    const t = setTimeout(() => setSceneReady(true), 200)
    return () => clearTimeout(t)
  }, [])

  return (
    <section
      id="section-1"
      ref={sectionRef}
      aria-label="Chapter 1: The Beginning"
      onMouseMove={handleMouseMove}
      className="
        section-base section-full
        relative flex items-center
        bg-bg-void
        overflow-hidden
      "
    >
      {/* ── Matrix rain background ── */}
      <MatrixRain />

      {/* ── Radial gradient overlay ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          background: `
            radial-gradient(ellipse 80% 60% at 50% 50%,
              rgba(0,255,136,0.04) 0%,
              transparent 70%
            ),
            radial-gradient(ellipse 40% 40% at 80% 20%,
              rgba(0,212,255,0.06) 0%,
              transparent 60%
            )
          `,
        }}
      />

      {/* ── Grid background pattern ── */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        aria-hidden="true"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,255,136,1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,255,136,1) 1px, transparent 1px)
          `,
          backgroundSize: '4rem 4rem',
        }}
      />

      {/* ── Chapter label ── */}
      <div
        className="
          absolute top-20 left-1/2 -translate-x-1/2
          font-mono text-xs text-neon-green/40
          tracking-[0.3em] uppercase
          border border-neon-green/15
          px-4 py-1.5 rounded-full
          bg-neon-green/5
        "
        aria-label="Chapter 1 of 6"
      >
        Chapter 01 / 06
      </div>

      {/* ── Main content grid ── */}
      <div className="
        relative z-10 container-wide
        grid grid-cols-1 lg:grid-cols-2
        gap-10 xl:gap-16
        items-center
        pt-24 pb-16 sm:pt-28
        px-4 sm:px-6 lg:px-8
      ">

        {/* ── LEFT: Text content ── */}
        <div className="flex flex-col gap-6 order-2 lg:order-1">

          {/* Eyebrow */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="
              inline-flex items-center gap-2
              font-mono text-xs text-neon-green
              self-start
            "
          >
            <span
              className="w-2 h-2 rounded-full bg-neon-green anim-neon-pulse-fast"
              aria-hidden="true"
            />
            Day 1 · First Commit
          </motion.div>

          {/* Headline */}
          <div ref={headlineRef}>
            <h1
              className="
                font-space font-black
                text-hero
                text-white
                leading-[1.0]
              "
            >
              The{' '}
              <span className="text-glow-green relative">
                Beginning
                {/* Underline decoration */}
                <span
                  className="
                    absolute -bottom-1 left-0 right-0
                    h-[3px] rounded-full
                    bg-gradient-to-r from-neon-green to-transparent
                  "
                  aria-hidden="true"
                />
              </span>
            </h1>
          </div>

          {/* Sub-headline */}
          <div ref={subRef} className="flex flex-col gap-3">
            <p className="
              font-inter text-base sm:text-lg
              text-white/60
              max-w-md
              leading-relaxed
            ">
              Day 1. Line 1. You wrote{' '}
              <code className="
                font-mono text-neon-green
                bg-neon-green/10 border border-neon-green/20
                px-1.5 py-0.5 rounded text-sm
              ">
                &lt;h1&gt;Hello, World!&lt;/h1&gt;
              </code>{' '}
              and immediately thought to yourself —
            </p>
            <blockquote className="
              font-space text-xl sm:text-2xl font-semibold
              text-neon-green/90
              border-l-2 border-neon-green/50
              pl-4
              italic
            ">
              "I am basically a god."
            </blockquote>
            <p className="font-inter text-sm text-white/35 max-w-sm">
              You were wrong. But it was{' '}
              <span className="text-coffee-amber">the most important</span>{' '}
              wrong you'd ever be.
            </p>
          </div>

          {/* Floating skill badges */}
          <div
            ref={badgesRef}
            className="flex flex-wrap gap-2 pt-2"
            aria-label="Self-proclaimed skills on Day 1"
          >
            {BADGES.map((badge, i) => (
              <FloatingBadge key={badge.text} {...badge} index={i} />
            ))}
          </div>

          {/* Stats row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.2, duration: 0.6 }}
            className="
              grid grid-cols-3 gap-3 pt-2
              max-w-xs
            "
            aria-label="Developer statistics on Day 1"
          >
            {[
              { value: '1',   label: 'line of code'     },
              { value: '∞',   label: 'confidence'       },
              { value: '0',   label: 'Stack Overflows'  },
            ].map(({ value, label }) => (
              <div
                key={label}
                className="
                  glass-card-neon
                  p-2.5 rounded-lg
                  flex flex-col items-center
                  text-center
                "
              >
                <span className="font-mono text-xl font-bold text-neon-green leading-none">
                  {value}
                </span>
                <span className="font-inter text-[10px] text-white/40 mt-1 leading-tight">
                  {label}
                </span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* ── RIGHT: Editor + 3D scene ── */}
        <div className="
          flex flex-col items-center gap-6
          order-1 lg:order-2
          relative
        ">

          {/* 3D Monitor canvas */}
          <div
            ref={canvasWrapRef}
            className="
              w-full aspect-square max-w-[360px] sm:max-w-[420px] lg:max-w-full
              lg:h-[300px] xl:h-[340px]
              relative
            "
            aria-hidden="true"
          >
            {sceneReady && (
              <Canvas
                camera={{ position: [0, 0, 6], fov: 45 }}
                dpr={[1, 1.5]}
                performance={{ min: 0.5 }}
                gl={{ antialias: true, alpha: true }}
                style={{ background: 'transparent' }}
              >
                <Suspense fallback={null}>
                  <MonitorScene mouse={mouse} />
                </Suspense>
              </Canvas>
            )}

            {/* Glow behind canvas */}
            <div
              className="
                absolute inset-0 -z-10
                rounded-2xl
              "
              style={{
                background:
                  'radial-gradient(ellipse 60% 60% at 50% 50%, rgba(0,255,136,0.08) 0%, transparent 70%)',
              }}
              aria-hidden="true"
            />
          </div>

          {/* Typewriter editor */}
          <div ref={editorRef} className="w-full">
            <TypewriterCode started={typewriterStarted} />
          </div>

          {/* Floating corner decoration */}
          <div
            className="
              absolute -top-4 -right-4
              w-20 h-20
              border-t-2 border-r-2
              border-neon-green/20
              rounded-tr-lg
              pointer-events-none
            "
            aria-hidden="true"
          />
          <div
            className="
              absolute -bottom-4 -left-4
              w-20 h-20
              border-b-2 border-l-2
              border-neon-blue/20
              rounded-bl-lg
              pointer-events-none
            "
            aria-hidden="true"
          />
        </div>
      </div>

      {/* ── Scroll cue ── */}
      <ScrollCue />

      {/* ── Bottom fade into next section ── */}
      <div
        className="
          absolute bottom-0 left-0 right-0
          h-32 pointer-events-none
        "
        aria-hidden="true"
        style={{
          background:
            'linear-gradient(to bottom, transparent, var(--color-bg-void))',
        }}
      />
    </section>
  )
}
