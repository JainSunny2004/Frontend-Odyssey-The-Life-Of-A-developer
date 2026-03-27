import React, {
  useRef,
  useState,
  useEffect,
  useCallback,
  useMemo,
  Suspense,
} from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float } from '@react-three/drei'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import * as THREE from 'three'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ScrollToPlugin } from 'gsap/ScrollToPlugin'
import { useGSAP } from '@/hooks/useGSAP'

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin)

/* ============================================================
   CONSTANTS
   ============================================================ */

const WISDOM_CARDS = [
  {
    id:      'wc-1',
    front:   { emoji: '😭', problem: 'It works on my machine!' },
    back:    { emoji: '🚢', solution: 'Ship the machine.', detail: 'Docker. Containerise everything. Never say those words again.' },
    accent:  'amber',
  },
  {
    id:      'wc-2',
    front:   { emoji: '🤯', problem: 'My function does 47 things.' },
    back:    { emoji: '✂️', solution: 'Make 47 functions.', detail: 'Single Responsibility Principle. Your future self will cry tears of joy.' },
    accent:  'green',
  },
  {
    id:      'wc-3',
    front:   { emoji: '😤', problem: 'Nobody comments their code.' },
    back:    { emoji: '📖', solution: 'Write self-documenting code.', detail: 'If you need a comment to explain it, refactor until you don\'t.' },
    accent:  'blue',
  },
  {
    id:      'wc-4',
    front:   { emoji: '🔥', problem: 'The PR has 4,000 lines changed.' },
    back:    { emoji: '🍕', solution: 'Slice it into small PRs.', detail: 'Reviewers are humans. Probably. Respect their finite attention spans.' },
    accent:  'purple',
  },
  {
    id:      'wc-5',
    front:   { emoji: '😰', problem: 'I\'m scared to refactor this.' },
    back:    { emoji: '🧪', solution: 'Write tests first.', detail: 'Fear is just untested code. Tests are your safety net. Use them.' },
    accent:  'amber',
  },
  {
    id:      'wc-6',
    front:   { emoji: '🤦', problem: 'We have no documentation.' },
    back:    { emoji: '📝', solution: 'Write the README you wish you had.', detail: 'Start with "Why does this exist?" Future hires will love you for it.' },
    accent:  'green',
  },
]

const ACCENT_STYLES = {
  amber:  {
    border:    'border-coffee-amber/30',
    glow:      '0 0 20px rgba(212,160,23,0.3)',
    bg:        'bg-coffee-amber/5',
    text:      'text-coffee-amber',
    backBg:    'bg-coffee-dark/80',
    backBorder:'border-coffee-amber/40',
  },
  green:  {
    border:    'border-neon-green/25',
    glow:      '0 0 20px rgba(0,255,136,0.25)',
    bg:        'bg-neon-green/5',
    text:      'text-neon-green',
    backBg:    'bg-bg-deep/90',
    backBorder:'border-neon-green/35',
  },
  blue:   {
    border:    'border-neon-blue/25',
    glow:      '0 0 20px rgba(0,212,255,0.25)',
    bg:        'bg-neon-blue/5',
    text:      'text-neon-blue',
    backBg:    'bg-bg-deep/90',
    backBorder:'border-neon-blue/35',
  },
  purple: {
    border:    'border-neon-purple/25',
    glow:      '0 0 20px rgba(189,147,249,0.25)',
    bg:        'bg-neon-purple/5',
    text:      'text-neon-purple',
    backBg:    'bg-bg-deep/90',
    backBorder:'border-neon-purple/35',
  },
}

const JUNIOR_CODE = `function getUserData(id) {
  let data;
  for(var i=0;i<users.length;i++){
    if(users[i].id==id){
      data=users[i]
    }
  }
  return data
}`

const SENIOR_CODE = `// Returns user by ID or null if not found
const getUserById = (id) =>
  users.find(user => user.id === id) ?? null`

const DOCKER_STEPS = [
  { icon: '📦', label: 'FROM node:20-alpine',   color: 'text-neon-blue',   delay: 0    },
  { icon: '📁', label: 'WORKDIR /app',           color: 'text-neon-green',  delay: 0.15 },
  { icon: '📋', label: 'COPY package*.json ./',  color: 'text-neon-yellow', delay: 0.3  },
  { icon: '⚙️', label: 'RUN npm ci',             color: 'text-neon-purple', delay: 0.45 },
  { icon: '🔄', label: 'COPY . .',               color: 'text-neon-green',  delay: 0.6  },
  { icon: '🚀', label: 'CMD ["node","index.js"]', color: 'text-coffee-amber',delay: 0.75 },
]

const CONFETTI_COLORS = [
  '#00ff88', '#00d4ff', '#bd93f9',
  '#f1fa8c', '#ff79c6', '#d4a017',
  '#ffffff', '#ff5555',
]

/* ============================================================
   CONFETTI BURST
   ============================================================ */
function ConfettiBurst({ active }) {
  const prefersReduced = useReducedMotion()

  const pieces = useMemo(() => {
    if (prefersReduced) return []
    return Array.from({ length: 60 }, (_, i) => ({
      id:       i,
      color:    CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      x:        (Math.random() - 0.5) * 120,
      y:        -(40 + Math.random() * 120),
      rotate:   Math.random() * 720 - 360,
      scale:    0.5 + Math.random() * 0.8,
      duration: 1.5 + Math.random() * 1.5,
      delay:    Math.random() * 0.6,
      width:    6 + Math.random() * 8,
      height:   4 + Math.random() * 6,
    }))
  }, [prefersReduced])

  return (
    <AnimatePresence>
      {active && !prefersReduced && (
        <div
          className="absolute inset-0 overflow-hidden pointer-events-none z-30"
          aria-hidden="true"
        >
          {pieces.map(p => (
            <motion.div
              key={p.id}
              initial={{ x: '50%', y: '50%', opacity: 1, scale: 0, rotate: 0 }}
              animate={{
                x:       `calc(50% + ${p.x}vw)`,
                y:       `${p.y}vh`,
                opacity: [1, 1, 0],
                scale:   p.scale,
                rotate:  p.rotate,
              }}
              exit={{ opacity: 0 }}
              transition={{
                duration: p.duration,
                delay:    p.delay,
                ease:     [0.25, 0.46, 0.45, 0.94],
              }}
              className="absolute rounded-sm"
              style={{
                width:           p.width,
                height:          p.height,
                backgroundColor: p.color,
                boxShadow:       `0 0 4px ${p.color}`,
                left:            0,
                top:             0,
              }}
            />
          ))}
        </div>
      )}
    </AnimatePresence>
  )
}

/* ============================================================
   WISDOM FLIP CARD
   ============================================================ */
function WisdomCard({ card, index }) {
  const [flipped,  setFlipped]  = useState(false)
  const [visited,  setVisited]  = useState(false)
  const prefersReduced = useReducedMotion()
  const cfg = ACCENT_STYLES[card.accent]

  const handleFlip = useCallback(() => {
    setFlipped(f => !f)
    if (!visited) setVisited(true)
  }, [visited])

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleFlip()
    }
  }, [handleFlip])

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.92 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{
        delay:    index * 0.1,
        duration: 0.55,
        ease:     [0.22, 1, 0.36, 1],
      }}
      className="group"
      style={{ perspective: '1000px', height: '200px' }}
    >
      <div
        role="button"
        tabIndex={0}
        aria-pressed={flipped}
        aria-label={`Wisdom card ${index + 1}: ${flipped ? card.back.solution : card.front.problem} — ${flipped ? 'click to see problem' : 'click to reveal solution'}`}
        onClick={handleFlip}
        onKeyDown={handleKeyDown}
        className="
          relative w-full h-full
          cursor-pointer
          focus-visible:outline-2 focus-visible:outline-neon-green
          rounded-2xl
        "
        style={{
          transformStyle:   'preserve-3d',
          transition:       prefersReduced ? 'none' : 'transform 0.55s cubic-bezier(0.34,1.56,0.64,1)',
          transform:        flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
      >
        {/* ── FRONT ── */}
        <div
          className={`
            absolute inset-0
            flex flex-col items-center justify-center
            gap-3 p-5 rounded-2xl
            border ${cfg.border}
            ${cfg.bg}
            text-center
          `}
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            background: 'rgba(13,17,23,0.85)',
            boxShadow: flipped ? 'none' : cfg.glow,
          }}
          aria-hidden={flipped}
        >
          <span className="text-3xl" aria-hidden="true">{card.front.emoji}</span>
          <p className="font-space text-sm sm:text-base font-semibold text-white/80 leading-snug">
            {card.front.problem}
          </p>
          <span className="
            font-mono text-[10px] text-white/25
            border border-white/10 px-2 py-0.5 rounded-full
            mt-auto
          ">
            click to enlighten →
          </span>
          {/* Visited dot */}
          {visited && (
            <span
              className="absolute top-3 right-3 w-1.5 h-1.5 rounded-full bg-neon-green/60"
              aria-hidden="true"
            />
          )}
        </div>

        {/* ── BACK ── */}
        <div
          className={`
            absolute inset-0
            flex flex-col items-center justify-center
            gap-2 p-5 rounded-2xl
            border ${cfg.backBorder}
            text-center
          `}
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform:  'rotateY(180deg)',
            background: 'rgba(13,17,23,0.95)',
            boxShadow:  flipped ? cfg.glow : 'none',
          }}
          aria-hidden={!flipped}
        >
          <span className="text-2xl" aria-hidden="true">{card.back.emoji}</span>
          <p className={`font-space text-sm font-bold ${cfg.text} leading-snug`}>
            {card.back.solution}
          </p>
          <p className="font-inter text-xs text-white/40 leading-relaxed max-w-[180px]">
            {card.back.detail}
          </p>
        </div>
      </div>
    </motion.div>
  )
}

/* ============================================================
   DOCKER VISUAL
   ============================================================ */
function DockerContainer({ isVisible }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 30 }}
      animate={isVisible
        ? { opacity: 1, scale: 1, y: 0 }
        : { opacity: 0, scale: 0.9, y: 30 }
      }
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="
        relative
        rounded-2xl overflow-hidden
        border border-neon-blue/25
      "
      style={{ background: 'rgba(10,15,30,0.9)' }}
      role="img"
      aria-label="Docker container visualization — Dockerfile steps"
    >
      {/* Header bar */}
      <div className="
        flex items-center gap-2
        px-4 py-3
        bg-neon-blue/5
        border-b border-neon-blue/20
      ">
        <span className="text-lg" aria-hidden="true">🐳</span>
        <span className="font-mono text-sm text-neon-blue font-semibold">
          Dockerfile
        </span>
        <span className="ml-auto font-mono text-[10px] text-neon-blue/40">
          it works everywhere now
        </span>
      </div>

      {/* Steps */}
      <div className="p-4 space-y-2">
        {DOCKER_STEPS.map((step, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={isVisible
              ? { opacity: 1, x: 0 }
              : { opacity: 0, x: -20 }
            }
            transition={{ delay: step.delay + 0.3, duration: 0.4 }}
            className="flex items-center gap-3"
          >
            <span className="text-sm flex-shrink-0 w-5 text-center" aria-hidden="true">
              {step.icon}
            </span>
            <code className={`font-mono text-xs sm:text-sm ${step.color}`}>
              {step.label}
            </code>
          </motion.div>
        ))}

        {/* Build success */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isVisible ? { opacity: 1 } : { opacity: 0 }}
          transition={{ delay: 1.5 }}
          className="
            mt-4 pt-3
            border-t border-neon-blue/15
            font-mono text-xs
            text-neon-green
            flex items-center gap-2
          "
          aria-live="polite"
        >
          <span
            className="w-2 h-2 rounded-full bg-neon-green anim-neon-pulse"
            aria-hidden="true"
          />
          Successfully built a1b2c3d4e5f6
          <span className="text-neon-green/40 ml-auto">0.8s</span>
        </motion.div>
      </div>

      {/* Outer glow */}
      <div
        className="absolute inset-0 rounded-2xl pointer-events-none"
        style={{
          boxShadow: 'inset 0 0 30px rgba(0,212,255,0.04)',
        }}
        aria-hidden="true"
      />
    </motion.div>
  )
}

/* ============================================================
   MENTORING MOMENT — TYPEWRITER REFACTOR
   ============================================================ */
function MentoringMoment({ active }) {
  const [phase,      setPhase]      = useState('junior')  // 'junior' | 'refactoring' | 'senior'
  const [juniorDone, setJuniorDone] = useState(false)
  const [seniorText, setSeniorText] = useState('')
  const [seniorDone, setSeniorDone] = useState(false)
  const timerRef = useRef(null)
  const prefersReduced = useReducedMotion()

  useEffect(() => {
    if (!active) return

    if (prefersReduced) {
      setJuniorDone(true)
      setPhase('senior')
      setSeniorText(SENIOR_CODE)
      setSeniorDone(true)
      return
    }

    // Phase 1: show junior code for 1.5s
    timerRef.current = setTimeout(() => {
      setJuniorDone(true)
      // Phase 2: "refactoring..." pause
      timerRef.current = setTimeout(() => {
        setPhase('refactoring')
        // Phase 3: type senior code
        timerRef.current = setTimeout(() => {
          setPhase('senior')
          let i = 0
          const typeChar = () => {
            if (i <= SENIOR_CODE.length) {
              setSeniorText(SENIOR_CODE.slice(0, i))
              i++
              timerRef.current = setTimeout(typeChar, 28)
            } else {
              setSeniorDone(true)
            }
          }
          typeChar()
        }, 900)
      }, 800)
    }, 1500)

    return () => clearTimeout(timerRef.current)
  }, [active, prefersReduced])

  return (
    <div
      className="grid grid-cols-1 sm:grid-cols-2 gap-4"
      role="region"
      aria-label="Code mentoring: junior vs senior refactor"
    >
      {/* Junior code */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-sm" aria-hidden="true">🌱</span>
          <p className="font-mono text-xs text-white/40 uppercase tracking-wider">
            Junior Dev
          </p>
          <span className="
            ml-auto font-mono text-[9px]
            text-neon-yellow/60
            border border-neon-yellow/20
            px-1.5 py-0.5 rounded
          ">
            Day 1
          </span>
        </div>
        <div
          className="
            terminal-window
            rounded-xl overflow-hidden
            border border-neon-yellow/15
          "
        >
          <div className="terminal-titlebar">
            <span className="terminal-dot terminal-dot-red"    aria-hidden="true" />
            <span className="terminal-dot terminal-dot-yellow" aria-hidden="true" />
            <span className="terminal-dot terminal-dot-green"  aria-hidden="true" />
            <span className="ml-3 font-mono text-[10px] text-white/25">
              getUserData.js
            </span>
          </div>
          <pre className="p-4 font-mono text-xs text-white/60 leading-relaxed overflow-x-auto">
            {JUNIOR_CODE.split('\n').map((line, i) => (
              <div key={i}>
                <span className="text-white/15 select-none mr-3 text-[10px]">
                  {String(i + 1).padStart(2)}
                </span>
                {line
                  .replace(/function|var|let|return/g, m =>
                    `<keyword>${m}</keyword>`)
                  .split(/(<keyword>|<\/keyword>)/)
                  .reduce((acc, part, idx) => {
                    if (part === '<keyword>' || part === '</keyword>') return acc
                    return [...acc,
                      <span
                        key={idx}
                        className={
                          acc.length > 0 && acc[acc.length - 1]?.type === 'keyword'
                            ? 'token-keyword'
                            : ''
                        }
                      >
                        {part}
                      </span>
                    ]
                  }, [])
                }
                {line.includes('function') || line.includes('var') || line.includes('return')
                  ? (
                    <span>
                      {line.split(/(function|var|let|return)/g).map((part, pi) =>
                        ['function', 'var', 'let', 'return'].includes(part)
                          ? <span key={pi} className="token-keyword">{part}</span>
                          : <span key={pi}>{part}</span>
                      )}
                    </span>
                  )
                  : <span>{line}</span>
                }
              </div>
            ))}
          </pre>
        </div>
      </div>

      {/* Senior code */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-sm" aria-hidden="true">🧙</span>
          <p className="font-mono text-xs text-white/40 uppercase tracking-wider">
            Senior Refactor
          </p>
          <span className="
            ml-auto font-mono text-[9px]
            text-neon-green/60
            border border-neon-green/20
            px-1.5 py-0.5 rounded
          ">
            3 lines
          </span>
        </div>
        <div
          className="
            terminal-window
            rounded-xl overflow-hidden
            border border-neon-green/20
          "
        >
          <div className="terminal-titlebar">
            <span className="terminal-dot terminal-dot-red"    aria-hidden="true" />
            <span className="terminal-dot terminal-dot-yellow" aria-hidden="true" />
            <span className="terminal-dot terminal-dot-green"  aria-hidden="true" />
            <span className="ml-3 font-mono text-[10px] text-white/25">
              getUserById.js
            </span>
            {seniorDone && (
              <span className="ml-auto font-mono text-[9px] text-neon-green/60">
                ✓ clean
              </span>
            )}
          </div>

          <div
            className="p-4 font-mono text-xs leading-relaxed min-h-[120px]"
            aria-live="polite"
          >
            {phase === 'junior' && !juniorDone && (
              <p className="text-white/20 italic">waiting...</p>
            )}
            {phase === 'junior' && juniorDone && (
              <p className="text-neon-yellow/60 italic text-[11px]">
                Senior dev opens file...
              </p>
            )}
            {phase === 'refactoring' && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 0.8, repeat: Infinity }}
                className="text-neon-purple/70 italic text-[11px] typewriter-cursor"
              >
                refactoring
              </motion.p>
            )}
            {phase === 'senior' && (
              <pre className="text-neon-green/90 whitespace-pre-wrap break-words">
                {seniorText.split('\n').map((line, i) => (
                  <div key={i}>
                    <span className="text-white/15 select-none mr-3 text-[10px]">
                      {String(i + 1).padStart(2)}
                    </span>
                    {line.startsWith('//')
                      ? <span className="token-comment">{line}</span>
                      : line.includes('=>')
                      ? (
                        <>
                          {line.split(/(const|=>|\?\?)/g).map((p, pi) =>
                            ['const', '=>', '??'].includes(p)
                              ? <span key={pi} className="token-keyword">{p}</span>
                              : <span key={pi}>{p}</span>
                          )}
                        </>
                      )
                      : <span>{line}</span>
                    }
                  </div>
                ))}
                {phase === 'senior' && !seniorDone && (
                  <span className="typewriter-cursor text-transparent" aria-hidden="true">
                    &nbsp;
                  </span>
                )}
              </pre>
            )}
          </div>
        </div>

        {/* Senior comment */}
        <AnimatePresence>
          {seniorDone && (
            <motion.p
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="
                font-inter text-xs text-coffee-amber/60 italic
                px-1
              "
              aria-live="polite"
            >
              "Same logic. 14 lines → 3 lines. <br />
              Readability: priceless."
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

/* ============================================================
   3D GOLDEN ORB
   The enlightenment hero scene — simple, elegant.
   ============================================================ */
function GoldenOrb() {
  const meshRef  = useRef(null)
  const ringRef  = useRef(null)
  const ring2Ref = useRef(null)

  useFrame((state) => {
    const t = state.clock.elapsedTime
    if (meshRef.current) {
      meshRef.current.rotation.y = t * 0.2
      meshRef.current.rotation.x = Math.sin(t * 0.3) * 0.1
    }
    if (ringRef.current) {
      ringRef.current.rotation.z = t * 0.15
      ringRef.current.rotation.x = 1.2 + Math.sin(t * 0.2) * 0.05
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.z = -t * 0.1
      ring2Ref.current.rotation.y = t * 0.08
    }
  })

  return (
    <Float speed={1.2} rotationIntensity={0.15} floatIntensity={0.3}>
      <group>
        {/* Core orb */}
        <mesh ref={meshRef} castShadow>
          <sphereGeometry args={[0.7, 64, 64]} />
          <meshStandardMaterial
            color="#d4a017"
            emissive="#d4a017"
            emissiveIntensity={0.35}
            roughness={0.15}
            metalness={0.85}
            envMapIntensity={1.5}
          />
        </mesh>

        {/* Inner glow sphere */}
        <mesh>
          <sphereGeometry args={[0.68, 32, 32]} />
          <meshBasicMaterial
            color="#f5e6d3"
            transparent
            opacity={0.05}
            side={THREE.BackSide}
          />
        </mesh>

        {/* Orbit ring 1 */}
        <mesh ref={ringRef} rotation={[1.2, 0, 0]}>
          <torusGeometry args={[1.1, 0.018, 8, 80]} />
          <meshStandardMaterial
            color="#d4a017"
            emissive="#d4a017"
            emissiveIntensity={0.5}
            roughness={0.2}
            metalness={0.8}
            transparent
            opacity={0.7}
          />
        </mesh>

        {/* Orbit ring 2 */}
        <mesh ref={ring2Ref} rotation={[0.4, 0.6, 0]}>
          <torusGeometry args={[1.35, 0.012, 8, 80]} />
          <meshStandardMaterial
            color="#c8a882"
            emissive="#c8a882"
            emissiveIntensity={0.3}
            roughness={0.3}
            metalness={0.7}
            transparent
            opacity={0.5}
          />
        </mesh>

        {/* Orbiting small spheres */}
        {[0, 1, 2, 3].map(i => {
          const angle = (i / 4) * Math.PI * 2
          return (
            <mesh
              key={i}
              position={[
                Math.cos(angle) * 1.1,
                Math.sin(angle) * 0.3,
                Math.sin(angle) * 1.1,
              ]}
            >
              <sphereGeometry args={[0.055, 12, 12]} />
              <meshStandardMaterial
                color="#f5e6d3"
                emissive="#d4a017"
                emissiveIntensity={0.8}
                roughness={0.1}
                metalness={0.9}
              />
            </mesh>
          )
        })}

        {/* Point light from within */}
        <pointLight
          position={[0, 0, 0]}
          color="#d4a017"
          intensity={2}
          distance={5}
          decay={2}
        />
      </group>
    </Float>
  )
}

function EnlightenmentScene() {
  return (
    <>
      <ambientLight intensity={0.2} color="#f5e6d3" />
      <directionalLight position={[5, 5, 5]} intensity={0.8} color="#d4a017" />
      <pointLight position={[-3, 2, -2]} intensity={0.5} color="#c8a882" distance={10} />
      <GoldenOrb />
    </>
  )
}

/* ============================================================
   ACHIEVEMENT BADGES
   ============================================================ */
const ACHIEVEMENTS = [
  { emoji: '🎓', label: 'Survived Tutorial Hell',   color: 'text-neon-green'  },
  { emoji: '💀', label: 'Debugged the Impossible',  color: 'text-neon-red'    },
  { emoji: '⏰', label: 'Shipped at 5 AM',           color: 'text-neon-purple' },
  { emoji: '☕', label: 'Caffeine Dependent',        color: 'text-coffee-amber'},
  { emoji: '🐋', label: 'Docker Enlightened',        color: 'text-neon-blue'   },
  { emoji: '🧘', label: 'Clean Code Practitioner',  color: 'text-neon-green'  },
]

function AchievementBadge({ emoji, label, color, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{
        delay:    index * 0.08,
        type:     'spring',
        stiffness: 260,
        damping:   20,
      }}
      whileHover={{ scale: 1.08, y: -3 }}
      className="
        flex items-center gap-2.5
        px-3 py-2.5
        glass-card-neon rounded-xl
        border border-white/8
        hover:border-white/20
        transition-colors duration-200
        cursor-default
        group
      "
      aria-label={`Achievement unlocked: ${label}`}
    >
      <span className="text-lg flex-shrink-0" aria-hidden="true">{emoji}</span>
      <span className={`font-mono text-xs font-medium ${color} leading-tight`}>
        {label}
      </span>
    </motion.div>
  )
}

/* ============================================================
   CTA SECTION
   ============================================================ */
function CTASection() {
  const handleRestart = useCallback(() => {
    gsap.to(window, {
      duration: 1.6,
      scrollTo: { y: 0, offsetY: 0 },
      ease:     'power3.inOut',
    })
  }, [])

  return (
    <div
      className="text-center space-y-8"
      role="contentinfo"
      aria-label="Journey complete — call to action"
    >
      {/* Main message */}
      <div className="space-y-4">
        <motion.h3
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="
            font-space font-black
            text-4xl sm:text-5xl lg:text-6xl
            leading-tight
          "
          style={{
            background:    'linear-gradient(135deg, #d4a017 0%, #f5e6d3 40%, #c8a882 70%, #d4a017 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor:  'transparent',
            backgroundClip:       'text',
          }}
        >
          Your journey
          <br />
          never ends.
        </motion.h3>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="font-inter text-base sm:text-lg text-white/40 max-w-lg mx-auto leading-relaxed"
        >
          Every senior developer was once a junior dev Googling
          "how to center a div." The only difference is they kept going.
        </motion.p>
      </div>

      {/* Action buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.35, duration: 0.6 }}
        className="flex flex-col sm:flex-row items-center justify-center gap-4"
      >
        {/* GitHub placeholder */}
        <a
          href="https://github.com"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="View source code on GitHub (opens in new tab)"
          className="
            inline-flex items-center gap-2.5
            px-6 py-3
            rounded-xl
            font-space text-sm font-semibold
            text-bg-void
            transition-all duration-200
            hover:scale-105 hover:shadow-coffee
            focus-visible:outline-2 focus-visible:outline-coffee-amber
          "
          style={{
            background:  'linear-gradient(135deg, #d4a017, #c8a882)',
            boxShadow:   '0 0 20px rgba(212,160,23,0.3)',
          }}
        >
          <svg
            className="w-4 h-4"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
          </svg>
          View on GitHub
        </a>

        {/* Restart journey */}
        <button
          onClick={handleRestart}
          aria-label="Restart the journey — scroll back to the beginning"
          className="
            inline-flex items-center gap-2.5
            px-6 py-3
            rounded-xl
            font-space text-sm font-semibold
            text-coffee-amber
            border border-coffee-amber/30
            bg-coffee-amber/5
            hover:bg-coffee-amber/10
            hover:border-coffee-amber/50
            hover:scale-105
            transition-all duration-200
            focus-visible:outline-2 focus-visible:outline-coffee-amber
          "
        >
          <span aria-hidden="true">↑</span>
          Restart Journey
        </button>
      </motion.div>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.5, duration: 0.8 }}
        className="pt-8 border-t border-white/8 space-y-3"
        role="contentinfo"
        aria-label="Site footer"
      >
        <p className="font-mono text-sm text-white/30">
          Built with{' '}
          <span
            className="anim-neon-pulse"
            style={{ color: '#d4a017' }}
            aria-label="coffee"
          >
            ☕
          </span>
          {' '}and questionable life choices.
        </p>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          {[
            { label: 'React',        color: 'text-neon-blue'   },
            { label: 'GSAP',         color: 'text-neon-green'  },
            { label: 'Three.js',     color: 'text-white/40'    },
            { label: 'Framer Motion',color: 'text-neon-purple' },
            { label: 'Tailwind CSS', color: 'text-neon-blue'   },
          ].map(({ label, color }) => (
            <span
              key={label}
              className={`font-mono text-[10px] ${color} opacity-60`}
              aria-label={`Built with ${label}`}
            >
              {label}
            </span>
          ))}
        </div>
        <p className="font-mono text-[10px] text-white/15">
          © 2026 Frontend Odyssey · The Life of a Developer
        </p>
      </motion.footer>
    </div>
  )
}

/* ============================================================
   MAIN SECTION
   ============================================================ */
export default function Section6_Enlightenment() {
  const sectionRef   = useRef(null)
  const heroRef      = useRef(null)
  const cardsRef     = useRef(null)
  const dockerRef    = useRef(null)
  const mentorRef    = useRef(null)
  const ctaRef       = useRef(null)
  const sceneWrapRef = useRef(null)

  const [confettiActive,   setConfettiActive]   = useState(false)
  const [dockerVisible,    setDockerVisible]    = useState(false)
  const [mentoringActive,  setMentoringActive]  = useState(false)
  const [sceneLoaded,      setSceneLoaded]      = useState(false)
  const [allCardsFlipped,  setAllCardsFlipped]  = useState(false)

  const prefersReduced = useReducedMotion()

  // Load 3D scene after a beat
  useEffect(() => {
    const t = setTimeout(() => setSceneLoaded(true), 400)
    return () => clearTimeout(t)
  }, [])

  /* ── GSAP: hero entrance + confetti burst ── */
  useGSAP(() => {
    if (!heroRef.current) return

    ScrollTrigger.create({
      trigger:  heroRef.current,
      start:    'top 75%',
      onEnter:  () => {
        if (!prefersReduced) setConfettiActive(true)
        setTimeout(() => setConfettiActive(false), 3500)
      },
      once: true,
    })

    if (prefersReduced) return

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger:       heroRef.current,
        start:         'top 80%',
        toggleActions: 'play none none reverse',
      },
    })

    tl.from('.s6-eyebrow', {
      y: 25, opacity: 0, duration: 0.5, ease: 'power3.out',
    })
    .from('.s6-headline', {
      y: 60, opacity: 0, duration: 0.8, ease: 'power3.out',
    }, '-=0.3')
    .from('.s6-subtext', {
      y: 30, opacity: 0, duration: 0.6, ease: 'power3.out',
    }, '-=0.4')
    .from(sceneWrapRef.current, {
      scale: 0.8, opacity: 0, duration: 0.8, ease: 'back.out(1.5)',
    }, '-=0.6')
  }, sectionRef, [])

  /* ── GSAP: cards section reveal ── */
  useGSAP(() => {
    if (!cardsRef.current) return

    if (prefersReduced) return

    gsap.from('.s6-cards-heading', {
      scrollTrigger: {
        trigger:       cardsRef.current,
        start:         'top 85%',
        toggleActions: 'play none none reverse',
      },
      y: 30, opacity: 0, duration: 0.6, ease: 'power3.out',
    })
  }, sectionRef, [])

  /* ── GSAP: docker section ── */
  useGSAP(() => {
    if (!dockerRef.current) return

    ScrollTrigger.create({
      trigger: dockerRef.current,
      start:   'top 80%',
      onEnter: () => setDockerVisible(true),
      once:    true,
    })
  }, sectionRef, [])

  /* ── GSAP: mentoring section ── */
  useGSAP(() => {
    if (!mentorRef.current) return

    ScrollTrigger.create({
      trigger: mentorRef.current,
      start:   'top 75%',
      onEnter: () => setMentoringActive(true),
      once:    true,
    })
  }, sectionRef, [])

  /* ── GSAP: CTA staggered children ── */
  useGSAP(() => {
    if (!ctaRef.current || prefersReduced) return

    gsap.from(ctaRef.current, {
      scrollTrigger: {
        trigger:       ctaRef.current,
        start:         'top 85%',
        toggleActions: 'play none none reverse',
      },
      y:       50,
      opacity: 0,
      duration: 0.9,
      ease:    'power3.out',
    })
  }, sectionRef, [])

  /* ── GSAP: background — dark → warm golden ── */
  useGSAP(() => {
    if (prefersReduced) return

    // Warm glow fades in as section enters
    gsap.fromTo(
      sectionRef.current,
      { backgroundColor: 'rgba(10,10,15,1)' },
      {
        backgroundColor: 'rgba(18,14,8,1)',
        scrollTrigger: {
          trigger: sectionRef.current,
          start:   'top 60%',
          end:     'center center',
          scrub:   2,
        },
      }
    )

    // Deeper warmth by end of section
    gsap.fromTo(
      sectionRef.current,
      { backgroundColor: 'rgba(18,14,8,1)' },
      {
        backgroundColor: 'rgba(22,16,8,1)',
        scrollTrigger: {
          trigger: sectionRef.current,
          start:   'center center',
          end:     'bottom top',
          scrub:   2,
        },
      }
    )
  }, sectionRef, [])

  return (
    <section
      id="section-6"
      ref={sectionRef}
      aria-label="Chapter 6: Enlightenment — The Senior Developer Journey"
      className="relative bg-bg-void overflow-hidden"
    >
      {/* ── Confetti burst ── */}
      <ConfettiBurst active={confettiActive} />

      {/* ── Neon border top — golden ── */}
      <div
        className="absolute top-0 left-0 right-0 h-px pointer-events-none"
        aria-hidden="true"
        style={{
          background:
            'linear-gradient(90deg, transparent, rgba(212,160,23,0.8), rgba(245,230,211,0.4), rgba(212,160,23,0.8), transparent)',
        }}
      />

      {/* ── Warm radial glow ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          background: `
            radial-gradient(ellipse 80% 50% at 50% 10%,
              rgba(212,160,23,0.08) 0%, transparent 60%),
            radial-gradient(ellipse 60% 60% at 80% 80%,
              rgba(200,168,130,0.05) 0%, transparent 60%)
          `,
        }}
      />

      {/* ── Golden grid ── */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.02]"
        aria-hidden="true"
        style={{
          backgroundImage: `
            linear-gradient(rgba(212,160,23,1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(212,160,23,1) 1px, transparent 1px)
          `,
          backgroundSize: '5rem 5rem',
        }}
      />

      <div className="container-wide px-4 sm:px-6 lg:px-8 py-24 sm:py-32 space-y-28 sm:space-y-36">

        {/* ══════════════════════════════════════════
            BLOCK 1 — HERO
        ══════════════════════════════════════════ */}
        <div
          ref={heroRef}
          className="
            grid grid-cols-1 lg:grid-cols-2
            gap-12 lg:gap-16
            items-center
          "
        >
          {/* LEFT — Text */}
          <div className="space-y-7 order-2 lg:order-1">

            {/* Chapter label */}
            <div
              className="
                s6-eyebrow
                inline-flex items-center gap-2
                font-mono text-xs
                tracking-[0.3em] uppercase
                border px-4 py-1.5 rounded-full
              "
              style={{
                color:           'rgba(212,160,23,0.6)',
                borderColor:     'rgba(212,160,23,0.2)',
                backgroundColor: 'rgba(212,160,23,0.05)',
              }}
              aria-label="Chapter 6 of 6 — Final chapter"
            >
              Chapter 06 / 06 · Final
            </div>

            {/* Headline */}
            <div className="s6-headline space-y-2">
              <h2
                className="font-space font-black text-title leading-tight"
                style={{
                  background:    'linear-gradient(135deg, #f5e6d3 0%, #d4a017 40%, #c8a882 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor:  'transparent',
                  backgroundClip:       'text',
                }}
              >
                Enlightenment
              </h2>
            </div>

            {/* Sub text */}
            <div className="s6-subtext space-y-5 max-w-lg">
              <p className="font-inter text-base sm:text-lg text-coffee-light/60 leading-relaxed">
                You survived. The bugs, the deadlines, the imposter syndrome,
                the 47 tabs, the 4 AM commits. You came out the other side
                with{' '}
                <em className="not-italic font-semibold text-coffee-amber">
                  clean code, empathy, and opinions about whitespace.
                </em>
              </p>

              <blockquote
                className="
                  font-space text-lg sm:text-xl font-semibold
                  border-l-2 pl-5 leading-snug
                "
                style={{ borderColor: 'rgba(212,160,23,0.5)', color: '#f5e6d3' }}
              >
                "Good code is not written.
                It is{' '}
                <span style={{ color: '#d4a017' }}>
                  rewritten.
                </span>
                "
              </blockquote>

              <p className="font-mono text-xs text-coffee-light/30 italic">
                — Every senior developer, after their third rewrite
              </p>
            </div>

            {/* Achievement badges */}
            <div className="space-y-3">
              <p className="font-mono text-xs text-coffee-light/30 uppercase tracking-widest">
                Achievements unlocked
              </p>
              <div className="flex flex-wrap gap-2">
                {ACHIEVEMENTS.map((a, i) => (
                  <AchievementBadge key={a.label} {...a} index={i} />
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT — 3D Golden Orb */}
          <div
            ref={sceneWrapRef}
            className="
              relative
              order-1 lg:order-2
              flex items-center justify-center
            "
          >
            {/* Warm glow behind orb */}
            <div
              className="absolute inset-0 -z-10 rounded-full"
              style={{
                background:
                  'radial-gradient(ellipse 80% 80% at 50% 50%, rgba(212,160,23,0.15) 0%, transparent 70%)',
              }}
              aria-hidden="true"
            />

            {/* Canvas */}
            <div
              className="
                w-full aspect-square
                max-w-[320px] sm:max-w-[380px] lg:max-w-full
                lg:h-[380px] xl:h-[440px]
              "
              aria-hidden="true"
            >
              {sceneLoaded && (
                <Suspense fallback={null}>
                  <Canvas
                    camera={{ position: [0, 0, 4], fov: 40 }}
                    dpr={[1, 1.5]}
                    performance={{ min: 0.5 }}
                    gl={{ antialias: true, alpha: true }}
                    style={{ background: 'transparent' }}
                  >
                    <EnlightenmentScene />
                  </Canvas>
                </Suspense>
              )}
            </div>

            {/* Corner decorations */}
            <div
              className="absolute -top-4 -right-4 w-16 h-16 border-t-2 border-r-2 rounded-tr-lg pointer-events-none"
              style={{ borderColor: 'rgba(212,160,23,0.25)' }}
              aria-hidden="true"
            />
            <div
              className="absolute -bottom-4 -left-4 w-16 h-16 border-b-2 border-l-2 rounded-bl-lg pointer-events-none"
              style={{ borderColor: 'rgba(200,168,130,0.2)' }}
              aria-hidden="true"
            />
          </div>
        </div>

        {/* ══════════════════════════════════════════
            BLOCK 2 — WISDOM FLIP CARDS
        ══════════════════════════════════════════ */}
        <div ref={cardsRef} className="space-y-8">
          <div className="s6-cards-heading space-y-2">
            <h3
              className="font-space text-2xl sm:text-3xl font-bold"
              style={{ color: '#f5e6d3' }}
            >
              Senior Dev{' '}
              <span style={{ color: '#d4a017' }}>Wisdom Cards</span>
            </h3>
            <p className="font-inter text-sm text-coffee-light/40">
              Click each card to reveal the enlightened perspective.
              Flip them all to unlock inner peace.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {WISDOM_CARDS.map((card, i) => (
              <WisdomCard key={card.id} card={card} index={i} />
            ))}
          </div>

          {/* Flip all hint */}
          <p
            className="font-mono text-[10px] text-coffee-light/25 text-center"
            aria-live="polite"
          >
            {allCardsFlipped
              ? '✨ All wisdom absorbed. You are now a 10x developer. (Results may vary.)'
              : 'Flip all 6 cards to achieve enlightenment. Or just read the backs. No pressure.'}
          </p>
        </div>

        {/* ══════════════════════════════════════════
            BLOCK 3 — DOCKER SECTION
        ══════════════════════════════════════════ */}
        <div ref={dockerRef} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">

            {/* Text */}
            <div className="space-y-5">
              <h3
                className="font-space text-2xl sm:text-3xl font-bold"
                style={{ color: '#f5e6d3' }}
              >
                You Discovered{' '}
                <span style={{ color: '#00d4ff' }}>Docker</span>
              </h3>
              <p className="font-inter text-sm sm:text-base text-coffee-light/50 leading-relaxed">
                Six chapters of chaos, and it all led here. The moment you
                ran{' '}
                <code className="
                  font-mono text-neon-blue
                  bg-neon-blue/10 border border-neon-blue/20
                  px-1.5 py-0.5 rounded text-xs
                ">
                  docker run
                </code>
                {' '}and it worked on staging. Then prod.
                Then everywhere. A single tear rolled down your cheek.
              </p>

              <div className="space-y-3">
                {[
                  { before: '"It works on my machine"',  after: 'It works on every machine',       icon: '✅' },
                  { before: 'Dependency hell',           after: 'Containerised bliss',              icon: '📦' },
                  { before: '3 AM debug session',        after: 'docker logs instantly tells you',  icon: '🔍' },
                ].map(({ before, after, icon }) => (
                  <motion.div
                    key={before}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="
                      flex items-start gap-3
                      font-inter text-xs sm:text-sm
                    "
                  >
                    <span aria-hidden="true">{icon}</span>
                    <div>
                      <span className="line-through text-white/25">{before}</span>
                      <span className="text-white/30 mx-2">→</span>
                      <span className="text-coffee-cream/70">{after}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Docker visual */}
            <DockerContainer isVisible={dockerVisible} />
          </div>
        </div>

        {/* ══════════════════════════════════════════
            BLOCK 4 — MENTORING MOMENT
        ══════════════════════════════════════════ */}
        <div ref={mentorRef} className="space-y-8">
          <div className="space-y-2">
            <h3
              className="font-space text-2xl sm:text-3xl font-bold"
              style={{ color: '#f5e6d3' }}
            >
              The Mentoring{' '}
              <span style={{ color: '#d4a017' }}>Moment</span>
            </h3>
            <p className="font-inter text-sm text-coffee-light/40 leading-relaxed">
              A junior dev opens a PR. You don't reject it. You teach.
              That's what you always needed. That's what they need.
            </p>
          </div>

          <MentoringMoment active={mentoringActive} />
        </div>

        {/* ══════════════════════════════════════════
            BLOCK 5 — CTA + FOOTER
        ══════════════════════════════════════════ */}
        <div ref={ctaRef}>
          <CTASection />
        </div>

      </div>
    </section>
  )
}
