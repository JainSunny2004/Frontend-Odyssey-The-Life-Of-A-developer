import React, {
  useRef,
  useState,
  useEffect,
  useCallback,
  useMemo,
  Suspense,
  lazy,
} from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@/hooks/useGSAP'
import { useSectionScrollProgress } from '@/hooks/useScrollProgress'

gsap.registerPlugin(ScrollTrigger)

// Lazy-load the heavy Three.js scene
const CoffeeScene = lazy(() => import('@/components/ui/CoffeeScene'))

/* ============================================================
   CONSTANTS
   ============================================================ */

const COFFEE_STATS = [
  {
    id:      'cups',
    label:   'Cups today',
    target:  7,
    suffix:  '',
    color:   'text-coffee-amber',
    glow:    'rgba(212,160,23,0.7)',
    icon:    '☕',
    note:    'and it\'s only 2 PM',
  },
  {
    id:      'lines',
    label:   'Lines per cup',
    target:  340,
    suffix:  '',
    color:   'text-coffee-light',
    glow:    'rgba(200,168,130,0.6)',
    icon:    '💻',
    note:    'quality not guaranteed',
  },
  {
    id:      'bugs',
    label:   'Bugs after cup 5',
    target:  0,
    suffix:  '',
    display: '???',
    color:   'text-neon-red',
    glow:    'rgba(255,85,85,0.6)',
    icon:    '🐛',
    note:    'correlation or causation?',
  },
  {
    id:      'cost',
    label:   'Monthly coffee spend',
    target:  347,
    suffix:  '$',
    prefix:  '$',
    color:   'text-coffee-cream',
    glow:    'rgba(245,230,211,0.5)',
    icon:    '💸',
    note:    'cheaper than therapy',
  },
]

const COFFEE_LAWS = [
  {
    number: 'I',
    title:  'The First Law of Coffee',
    law:    'A developer at rest will remain at rest until acted upon by coffee.',
    sub:    'Newton\'s zeroth law, revised for software engineers.',
  },
  {
    number: 'II',
    title:  'The Second Law of Coffee',
    law:    'The productivity of a developer is directly proportional to the quality of the coffee, up to cup 4.',
    sub:    'After cup 4, the law inverts. This is known as "the chaos threshold."',
  },
  {
    number: 'III',
    title:  'The Third Law of Coffee',
    law:    'For every empty mug, there is an equal and opposite urge to refill it instead of fixing the bug.',
    sub:    'Confirmed by 10 years of empirical research (procrastination).',
  },
]

const COFFEE_TYPES = [
  { name: 'Espresso',   time: '9:00 AM',  effect: 'Boots up the OS',         emoji: '⚡', cups: 1 },
  { name: 'Americano',  time: '10:30 AM', effect: 'Opens 12 tabs',           emoji: '📂', cups: 1 },
  { name: 'Latte',      time: '12:00 PM', effect: 'Fake work mode on',       emoji: '💼', cups: 1 },
  { name: 'Cold Brew',  time: '2:00 PM',  effect: 'Actual work begins',      emoji: '🚀', cups: 1 },
  { name: 'Double Shot',time: '4:00 PM',  effect: 'Typing very loudly',      emoji: '⌨️', cups: 1 },
  { name: 'Espresso',   time: '6:30 PM',  effect: 'Wait what time is it',    emoji: '🕐', cups: 1 },
  { name: 'Any Liquid', time: '11:00 PM', effect: 'Just send it',            emoji: '🔥', cups: 1 },
]

/* ============================================================
   ANIMATED COUNTER
   ============================================================ */
function CoffeeCounter({ stat, active }) {
  const [value,   setValue]   = useState(0)
  const rafRef    = useRef(null)
  const startRef  = useRef(null)
  const prefersReduced = useReducedMotion()

  useEffect(() => {
    if (!active) return
    if (stat.display) return  // '???' type — no animation needed

    if (prefersReduced) {
      setValue(stat.target)
      return
    }

    const duration = 1600 + Math.random() * 600
    startRef.current = performance.now()

    const animate = (now) => {
      const elapsed  = now - startRef.current
      const progress = Math.min(elapsed / duration, 1)
      // Custom ease — fast start, slow finish
      const eased    = progress < 0.7
        ? progress / 0.7 * 0.85
        : 0.85 + (progress - 0.7) / 0.3 * 0.15
      setValue(Math.floor(eased * stat.target))
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate)
      } else {
        setValue(stat.target)
      }
    }

    rafRef.current = requestAnimationFrame(animate)

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [active, stat.target, stat.display, prefersReduced])

  const displayValue = stat.display
    ? stat.display
    : `${stat.prefix || ''}${value.toLocaleString()}${stat.suffix || ''}`

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.9 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
      className="
        glass-card rounded-2xl p-5 sm:p-6
        border border-coffee-mid/20
        flex flex-col gap-3
        relative overflow-hidden
        group
        hover:border-coffee-amber/30
        transition-colors duration-300
      "
      style={{ background: 'rgba(44,24,16,0.5)' }}
    >
      {/* Warm background glow */}
      <div
        className="
          absolute inset-0 opacity-0 group-hover:opacity-100
          transition-opacity duration-500
          pointer-events-none
        "
        style={{
          background:
            `radial-gradient(ellipse 80% 80% at 50% 50%, ${stat.glow.replace('0.7', '0.06')} 0%, transparent 70%)`,
        }}
        aria-hidden="true"
      />

      {/* Icon + label */}
      <div className="flex items-center gap-2">
        <span className="text-xl" aria-hidden="true">{stat.icon}</span>
        <p className="font-inter text-xs text-coffee-light/50 uppercase tracking-wider">
          {stat.label}
        </p>
      </div>

      {/* Value */}
      <div
        className={`font-mono text-4xl sm:text-5xl font-black leading-none ${stat.color}`}
        style={{ textShadow: `0 0 20px ${stat.glow}` }}
        aria-label={`${stat.label}: ${displayValue}`}
      >
        {displayValue}
      </div>

      {/* Note */}
      <p className="font-inter text-xs text-coffee-light/30 italic">
        {stat.note}
      </p>
    </motion.div>
  )
}

/* ============================================================
   COFFEE LAWS CARDS
   ============================================================ */
function CoffeeLawCard({ law, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: index % 2 === 0 ? -40 : 40 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{
        delay:    index * 0.15,
        duration: 0.6,
        ease:     [0.22, 1, 0.36, 1],
      }}
      className="
        relative
        glass-card rounded-2xl p-6 sm:p-7
        border border-coffee-mid/25
        overflow-hidden
        group
      "
      style={{ background: 'rgba(44,24,16,0.45)' }}
      role="article"
      aria-label={`${law.title}: ${law.law}`}
    >
      {/* Law number — large decorative */}
      <span
        className="
          absolute -top-4 -right-2
          font-mono font-black text-8xl sm:text-9xl
          text-coffee-mid/10
          pointer-events-none select-none
          leading-none
        "
        aria-hidden="true"
      >
        {law.number}
      </span>

      {/* Left amber accent line */}
      <div
        className="
          absolute left-0 top-0 bottom-0
          w-1 rounded-l-2xl
        "
        style={{ background: 'linear-gradient(to bottom, #d4a017, #6f4e37)' }}
        aria-hidden="true"
      />

      <div className="pl-3">
        {/* Title */}
        <p className="font-mono text-[10px] text-coffee-amber/60 uppercase tracking-widest mb-2">
          {law.title}
        </p>

        {/* Law text */}
        <blockquote className="
          font-space text-base sm:text-lg font-semibold
          text-coffee-cream/90
          leading-snug
          mb-3
        ">
          "{law.law}"
        </blockquote>

        {/* Sub text */}
        <p className="font-inter text-xs text-coffee-light/40 italic leading-relaxed">
          {law.sub}
        </p>
      </div>
    </motion.div>
  )
}

/* ============================================================
   DAILY COFFEE SCHEDULE
   ============================================================ */
function CoffeeSchedule() {
  return (
    <div
      className="space-y-2"
      role="list"
      aria-label="Developer daily coffee consumption schedule"
    >
      {COFFEE_TYPES.map((item, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ delay: i * 0.07, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="
            flex items-center gap-3 sm:gap-4
            px-3 sm:px-4 py-2.5
            rounded-xl
            border border-coffee-mid/15
            hover:border-coffee-amber/25
            transition-all duration-200
            group
          "
          style={{ background: 'rgba(44,24,16,0.3)' }}
          role="listitem"
          aria-label={`${item.time} — ${item.name}: ${item.effect}`}
        >
          {/* Time */}
          <span className="
            font-mono text-[10px] sm:text-xs
            text-coffee-light/40
            w-16 sm:w-20 flex-shrink-0
          ">
            {item.time}
          </span>

          {/* Emoji */}
          <span className="text-base flex-shrink-0" aria-hidden="true">
            {item.emoji}
          </span>

          {/* Coffee name */}
          <span className="
            font-space text-xs sm:text-sm font-semibold
            text-coffee-cream/80
            group-hover:text-coffee-amber
            transition-colors duration-200
            w-24 sm:w-28 flex-shrink-0
          ">
            {item.name}
          </span>

          {/* Effect */}
          <span className="
            font-inter text-xs
            text-coffee-light/50
            flex-1 min-w-0 truncate
          ">
            → {item.effect}
          </span>
        </motion.div>
      ))}
    </div>
  )
}

/* ============================================================
   POUR ANIMATION OVERLAY
   Triggered when cup is clicked.
   ============================================================ */
function PourEffect({ visible, onComplete }) {
  useEffect(() => {
    if (!visible) return
    const t = setTimeout(onComplete, 1400)
    return () => clearTimeout(t)
  }, [visible, onComplete])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.1 }}
          transition={{ duration: 0.3 }}
          className="
            absolute inset-0 z-20
            flex items-center justify-center
            pointer-events-none
            rounded-2xl overflow-hidden
          "
          aria-live="polite"
          aria-label="Coffee pour animation"
        >
          {/* Amber glow burst */}
          <motion.div
            initial={{ scale: 0, opacity: 0.8 }}
            animate={{ scale: 2.5, opacity: 0 }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            className="absolute w-32 h-32 rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(212,160,23,0.6) 0%, transparent 70%)' }}
            aria-hidden="true"
          />

          {/* Text */}
          <motion.div
            initial={{ y: 0, opacity: 1 }}
            animate={{ y: -30, opacity: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="
              font-space text-lg font-bold
              text-coffee-amber
              z-10
            "
            style={{ textShadow: '0 0 20px rgba(212,160,23,0.8)' }}
          >
            ☕ +1 cup
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/* ============================================================
   DEPENDENCY METAPHOR CARD
   ============================================================ */
function DependencyCard() {
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(() => {
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [])

  return (
    <div
      className="terminal-window w-full"
      role="region"
      aria-label="Coffee as a runtime dependency"
    >
      {/* Title bar */}
      <div className="terminal-titlebar">
        <span className="terminal-dot terminal-dot-red"    aria-hidden="true" />
        <span className="terminal-dot terminal-dot-yellow" aria-hidden="true" />
        <span className="terminal-dot terminal-dot-green"  aria-hidden="true" />
        <span className="ml-3 font-mono text-xs text-white/30">
          package.json
        </span>
        <button
          onClick={handleCopy}
          aria-label={copied ? 'Copied to clipboard' : 'Copy package.json snippet'}
          className="
            ml-auto
            font-mono text-[10px]
            text-coffee-amber/50 hover:text-coffee-amber/80
            transition-colors duration-150
            focus-visible:outline-2 focus-visible:outline-coffee-amber
            rounded px-1
          "
        >
          {copied ? '✓ copied' : 'copy'}
        </button>
      </div>

      <div className="terminal-body p-4 text-xs sm:text-sm leading-relaxed">
        <div>
          <span className="token-punctuation">{'{'}</span>
        </div>
        <div className="pl-4">
          <span className="token-string">"name"</span>
          <span className="token-punctuation">: </span>
          <span className="token-value">"my-startup"</span>
          <span className="token-punctuation">,</span>
        </div>
        <div className="pl-4">
          <span className="token-string">"version"</span>
          <span className="token-punctuation">: </span>
          <span className="token-value">"1.0.0"</span>
          <span className="token-punctuation">,</span>
        </div>
        <div className="pl-4">
          <span className="token-string">"dependencies"</span>
          <span className="token-punctuation">: {'{'}</span>
        </div>
        <div className="pl-8">
          <span className="token-string">"react"</span>
          <span className="token-punctuation">: </span>
          <span className="token-value">"^18.3.1"</span>
          <span className="token-punctuation">,</span>
        </div>
        <div className="pl-8">
          <span className="token-string">"express"</span>
          <span className="token-punctuation">: </span>
          <span className="token-value">"^4.21.0"</span>
          <span className="token-punctuation">,</span>
        </div>
        <div className="pl-8 flex items-center gap-2">
          <span>
            <span className="text-coffee-amber">"coffee"</span>
            <span className="token-punctuation">: </span>
            <span className="token-value">"*"</span>
            <span className="token-punctuation">,</span>
          </span>
          <span className="token-comment text-[10px]">// non-negotiable</span>
        </div>
        <div className="pl-8">
          <span className="token-string">"motivation"</span>
          <span className="token-punctuation">: </span>
          <span className="token-value">"peerDependency"</span>
          <span className="token-punctuation">,</span>
        </div>
        <div className="pl-8">
          <span className="token-string">"sleep"</span>
          <span className="token-punctuation">: </span>
          <span className="text-neon-red/80">"^0.0.1"</span>
          <span className="token-comment"> // deprecated</span>
        </div>
        <div className="pl-4">
          <span className="token-punctuation">{'}'}</span>
          <span className="token-punctuation">,</span>
        </div>
        <div className="pl-4">
          <span className="token-string">"devDependencies"</span>
          <span className="token-punctuation">: {'{'}</span>
        </div>
        <div className="pl-8">
          <span className="token-string">"work-life-balance"</span>
          <span className="token-punctuation">: </span>
          <span className="text-neon-red/80">"0.0.0-NOTFOUND"</span>
        </div>
        <div className="pl-4">
          <span className="token-punctuation">{'}'}</span>
        </div>
        <div>
          <span className="token-punctuation">{'}'}</span>
        </div>
      </div>
    </div>
  )
}

/* ============================================================
   MAIN SECTION
   ============================================================ */
export default function Section5_CoffeeReligion() {
  const sectionRef    = useRef(null)
  const heroRef       = useRef(null)
  const sceneWrapRef  = useRef(null)
  const statsRef      = useRef(null)
  const lawsRef       = useRef(null)
  const bgRef         = useRef(null)

  const [fillLevel,     setFillLevel]     = useState(0)
  const [pourVisible,   setPourVisible]   = useState(false)
  const [extraCups,     setExtraCups]     = useState(0)
  const [statsActive,   setStatsActive]   = useState(false)
  const [sceneLoaded,   setSceneLoaded]   = useState(false)
  const [cupClicks,     setCupClicks]     = useState(0)

  const prefersReduced = useReducedMotion()
  const sectionProgress = useSectionScrollProgress(sectionRef)

  // Load scene after mount
  useEffect(() => {
    const t = setTimeout(() => setSceneLoaded(true), 300)
    return () => clearTimeout(t)
  }, [])

  // Derived fill level: scroll 0→0.6 fills the cup, extra clicks top it up
  const computedFill = useMemo(() => {
    const baseFill = Math.min(sectionProgress * 1.8, 1)
    const clickBonus = Math.min(extraCups * 0.15, 0.3)
    return Math.min(baseFill + clickBonus, 1)
  }, [sectionProgress, extraCups])

  useEffect(() => {
    setFillLevel(computedFill)
  }, [computedFill])

  // Handle cup click — pour animation + fill bonus
  const handleCupClick = useCallback(() => {
    if (pourVisible) return
    setPourVisible(true)
    setExtraCups(c => c + 1)
    setCupClicks(c => c + 1)
  }, [pourVisible])

  const handlePourComplete = useCallback(() => {
    setPourVisible(false)
  }, [])

  /* ── GSAP: hero entrance ── */
  useGSAP(() => {
    if (!heroRef.current) return

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger:       heroRef.current,
        start:         'top 80%',
        toggleActions: 'play none none reverse',
      },
    })

    if (prefersReduced) {
      setStatsActive(true)
      return
    }

    tl.from('.s5-eyebrow', {
      y: 25, opacity: 0, duration: 0.5, ease: 'power3.out',
    })
    .from('.s5-headline', {
      y: 50, opacity: 0, duration: 0.7, ease: 'power3.out',
    }, '-=0.3')
    .from('.s5-tagline', {
      y: 25, opacity: 0, duration: 0.5, ease: 'power3.out',
    }, '-=0.4')
  }, sectionRef, [])

  /* ── GSAP: SCROLL-TRIGGERED BACKGROUND COLOR TRANSITION
     dark navy → coffee dark → coffee cream tones           ── */
  useGSAP(() => {
    if (!sectionRef.current || prefersReduced) return

    // Phase 1: Enter — dark navy → coffee dark
    gsap.to(sectionRef.current, {
      backgroundColor: 'rgba(28,14,8,1)',
      scrollTrigger: {
        trigger: sectionRef.current,
        start:   'top 70%',
        end:     'center center',
        scrub:   2,
      },
    })

    // Phase 2: Deep scroll — coffee dark → warm amber-brown
    gsap.to(sectionRef.current, {
      backgroundColor: 'rgba(44,24,16,1)',
      scrollTrigger: {
        trigger: sectionRef.current,
        start:   'center center',
        end:     'bottom 30%',
        scrub:   2,
      },
    })

    // Background warmth overlay fades in
    if (bgRef.current) {
      gsap.fromTo(
        bgRef.current,
        { opacity: 0 },
        {
          opacity: 1,
          scrollTrigger: {
            trigger: sectionRef.current,
            start:   'top 60%',
            end:     'center top',
            scrub:   2,
          },
        }
      )
    }
  }, sectionRef, [])

  /* ── GSAP: 3D scene canvas parallax ── */
  useGSAP(() => {
    if (!sceneWrapRef.current || prefersReduced) return

    gsap.fromTo(
      sceneWrapRef.current,
      { y: 40, opacity: 0 },
      {
        y:       0,
        opacity: 1,
        scrollTrigger: {
          trigger:       sceneWrapRef.current,
          start:         'top 85%',
          toggleActions: 'play none none reverse',
          duration:      0.8,
        },
        duration: 0.8,
        ease:     'power3.out',
      }
    )

    // Subtle float while in view
    gsap.to(sceneWrapRef.current, {
      y:       '-=18',
      scrollTrigger: {
        trigger: sectionRef.current,
        start:   'top bottom',
        end:     'bottom top',
        scrub:   2,
      },
      ease: 'none',
    })
  }, sectionRef, [])

  /* ── GSAP: stats counter trigger ── */
  useGSAP(() => {
    if (!statsRef.current) return
    ScrollTrigger.create({
      trigger: statsRef.current,
      start:   'top 80%',
      onEnter: () => setStatsActive(true),
    })
    if (prefersReduced) setStatsActive(true)
  }, sectionRef, [])

  /* ── GSAP: laws section reveal ── */
  useGSAP(() => {
    if (!lawsRef.current || prefersReduced) return

    gsap.from(lawsRef.current, {
      scrollTrigger: {
        trigger:       lawsRef.current,
        start:         'top 80%',
        toggleActions: 'play none none reverse',
      },
      y:       40,
      opacity: 0,
      duration: 0.7,
      ease:    'power3.out',
    })
  }, sectionRef, [])

  // Cup clicks easter egg message
  const easterEggMessage = useMemo(() => {
    if (cupClicks >= 10) return '🤯 You need help. And more coffee.'
    if (cupClicks >= 7)  return '😬 Okay we\'re concerned now.'
    if (cupClicks >= 5)  return '⚡ Vibrating at the speed of caffeine'
    if (cupClicks >= 3)  return '☕☕☕ That\'s a lot of coffee'
    if (cupClicks >= 1)  return '☕ Delicious'
    return null
  }, [cupClicks])

  return (
    <section
      id="section-5"
      ref={sectionRef}
      aria-label="Chapter 5: The Coffee Religion"
      className="relative bg-bg-void overflow-hidden"
      style={{ backgroundColor: 'rgba(10,10,15,1)' }}
    >
      {/* ── Warm background gradient overlay (fades in on scroll) ── */}
      <div
        ref={bgRef}
        className="absolute inset-0 pointer-events-none opacity-0"
        aria-hidden="true"
        style={{
          background: `
            radial-gradient(ellipse 100% 60% at 50% 0%,
              rgba(111,78,55,0.18) 0%, transparent 60%),
            radial-gradient(ellipse 80% 80% at 80% 100%,
              rgba(44,24,16,0.4) 0%, transparent 70%)
          `,
        }}
      />

      {/* ── Neon border top — amber ── */}
      <div
        className="absolute top-0 left-0 right-0 h-px pointer-events-none"
        aria-hidden="true"
        style={{
          background:
            'linear-gradient(90deg, transparent, rgba(212,160,23,0.6), rgba(111,78,55,0.4), transparent)',
        }}
      />

      {/* ── Subtle warm grid ── */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.02]"
        aria-hidden="true"
        style={{
          backgroundImage: `
            linear-gradient(rgba(212,160,23,1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(212,160,23,1) 1px, transparent 1px)
          `,
          backgroundSize: '4rem 4rem',
        }}
      />

      <div className="container-wide px-4 sm:px-6 lg:px-8 py-24 sm:py-32 space-y-24 sm:space-y-32">

        {/* ══════════════════════════════════════════
            BLOCK 1 — HERO + 3D SCENE
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
                s5-eyebrow
                inline-flex items-center gap-2
                font-mono text-xs text-coffee-amber/60
                tracking-[0.3em] uppercase
                border border-coffee-amber/20
                px-4 py-1.5 rounded-full
                bg-coffee-amber/5
              "
              aria-label="Chapter 5 of 6"
            >
              Chapter 05 / 06
            </div>

            {/* Headline */}
            <div className="s5-headline space-y-2">
              <h2 className="font-space font-black text-title text-coffee-cream">
                The Coffee{' '}
                <span
                  className="anim-neon-pulse"
                  style={{
                    color:      '#d4a017',
                    textShadow: '0 0 20px rgba(212,160,23,0.7), 0 0 50px rgba(212,160,23,0.3)',
                  }}
                >
                  Religion
                </span>
              </h2>
            </div>

            {/* Tagline */}
            <div className="s5-tagline space-y-5 max-w-lg">
              <blockquote
                className="
                  font-space text-xl sm:text-2xl font-semibold
                  text-coffee-cream/90
                  border-l-2 border-coffee-amber/50
                  pl-5
                  leading-snug
                "
              >
                "Coffee is not a beverage.{' '}
                <span
                  className="anim-neon-pulse"
                  style={{ color: '#d4a017' }}
                >
                  It is a runtime dependency.
                </span>
                "
              </blockquote>

              <p className="font-inter text-sm sm:text-base text-coffee-light/50 leading-relaxed">
                Your codebase runs on logic and algorithms.
                You run on caffeine and unresolved anxiety.
                Without coffee, the developer process exits with code 1.
              </p>

              {/* Fill level indicator */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-coffee-light/40 uppercase tracking-wide">
                    Current caffeine level
                  </span>
                  <span
                    className="font-mono text-xs text-coffee-amber/70"
                    aria-live="polite"
                    aria-label={`Caffeine level: ${Math.round(fillLevel * 100)}%`}
                  >
                    {Math.round(fillLevel * 100)}%
                  </span>
                </div>
                <div className="h-2 bg-coffee-dark/60 rounded-full overflow-hidden border border-coffee-mid/20">
                  <motion.div
                    className="h-full rounded-full"
                    style={{
                      width:      `${fillLevel * 100}%`,
                      background: 'linear-gradient(90deg, #6f4e37, #d4a017)',
                      boxShadow:  '0 0 10px rgba(212,160,23,0.5)',
                    }}
                    aria-hidden="true"
                  />
                </div>
                <p className="font-mono text-[10px] text-coffee-light/25 italic">
                  {fillLevel < 0.3 ? 'critically low — code quality degrading' :
                   fillLevel < 0.6 ? 'suboptimal — may introduce typos' :
                   fillLevel < 0.9 ? 'adequate — functioning as intended' :
                   '☕ maximum capacity — absolutely vibrating'}
                </p>
              </div>
            </div>

            {/* Easter egg message */}
            <AnimatePresence mode="wait">
              {easterEggMessage && (
                <motion.div
                  key={cupClicks}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="
                    font-mono text-sm text-coffee-amber
                    glass-card rounded-xl px-4 py-3
                    border border-coffee-amber/20
                    bg-coffee-dark/40
                  "
                  role="status"
                  aria-live="polite"
                >
                  {easterEggMessage}
                  {cupClicks >= 10 && (
                    <span className="block text-xs text-coffee-light/40 mt-1">
                      (clicks: {cupClicks} — please go to bed)
                    </span>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* RIGHT — 3D Coffee Scene */}
          <div
            ref={sceneWrapRef}
            className="
              relative
              order-1 lg:order-2
              flex items-center justify-center
            "
          >
            {/* Warm radial glow behind scene */}
            <div
              className="
                absolute inset-0 -z-10
                rounded-2xl
              "
              style={{
                background: `
                  radial-gradient(ellipse 80% 80% at 50% 60%,
                    rgba(111,78,55,0.25) 0%, transparent 70%)
                `,
              }}
              aria-hidden="true"
            />

            {/* Scene container */}
            <div className="relative w-full aspect-square max-w-[340px] sm:max-w-[400px] lg:max-w-full lg:h-[400px] xl:h-[460px]">
              {sceneLoaded && (
                <Suspense
                  fallback={
                    <div className="
                      w-full h-full flex items-center justify-center
                      font-mono text-xs text-coffee-amber/40
                    ">
                      brewing...
                    </div>
                  }
                >
                  <CoffeeScene
                    fillLevel={fillLevel}
                    onCupClick={handleCupClick}
                    className="w-full h-full"
                  />
                </Suspense>
              )}

              {/* Pour effect overlay */}
              <PourEffect
                visible={pourVisible}
                onComplete={handlePourComplete}
              />

              {/* Corner decoration */}
              <div
                className="
                  absolute -bottom-4 -right-4
                  w-16 h-16
                  border-b-2 border-r-2
                  border-coffee-amber/20
                  rounded-br-lg
                  pointer-events-none
                "
                aria-hidden="true"
              />
              <div
                className="
                  absolute -top-4 -left-4
                  w-16 h-16
                  border-t-2 border-l-2
                  border-coffee-mid/20
                  rounded-tl-lg
                  pointer-events-none
                "
                aria-hidden="true"
              />
            </div>

            {/* Cups poured count */}
            {cupClicks > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="
                  absolute -top-3 -right-3
                  font-mono text-[10px] font-bold
                  text-coffee-dark
                  bg-coffee-amber
                  w-7 h-7 rounded-full
                  flex items-center justify-center
                  shadow-coffee
                "
                aria-label={`${cupClicks} cups poured`}
              >
                {cupClicks}
              </motion.div>
            )}
          </div>
        </div>

        {/* ══════════════════════════════════════════
            BLOCK 2 — COFFEE STATS
        ══════════════════════════════════════════ */}
        <div ref={statsRef} className="space-y-8">
          <div className="text-center space-y-2">
            <h3 className="font-space text-2xl sm:text-3xl font-bold text-coffee-cream">
              Your{' '}
              <span style={{ color: '#d4a017', textShadow: '0 0 20px rgba(212,160,23,0.6)' }}>
                Coffee
              </span>
              {' '}Consumption Stats
            </h3>
            <p className="font-inter text-sm text-coffee-light/40">
              These numbers were audited. We found no inaccuracies.
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {COFFEE_STATS.map(stat => (
              <CoffeeCounter key={stat.id} stat={stat} active={statsActive} />
            ))}
          </div>

          {/* Dependency card */}
          <div className="max-w-xl">
            <DependencyCard />
          </div>
        </div>

        {/* ══════════════════════════════════════════
            BLOCK 3 — LAWS OF COFFEE
        ══════════════════════════════════════════ */}
        <div ref={lawsRef} className="space-y-8">
          <div className="space-y-2">
            <h3 className="font-space text-2xl sm:text-3xl font-bold text-coffee-cream">
              The Three{' '}
              <span style={{ color: '#d4a017' }}>Laws</span>
            </h3>
            <p className="font-inter text-sm text-coffee-light/40">
              Peer-reviewed by the International Society of Overcaffeinated Engineers.
            </p>
          </div>

          <div className="space-y-4">
            {COFFEE_LAWS.map((law, i) => (
              <CoffeeLawCard key={law.number} law={law} index={i} />
            ))}
          </div>
        </div>

        {/* ══════════════════════════════════════════
            BLOCK 4 — DAILY SCHEDULE
        ══════════════════════════════════════════ */}
        <div className="space-y-8">
          <div className="space-y-2">
            <h3 className="font-space text-2xl sm:text-3xl font-bold text-coffee-cream">
              The Daily{' '}
              <span style={{ color: '#d4a017' }}>Ritual</span>
            </h3>
            <p className="font-inter text-sm text-coffee-light/40">
              Not a habit. Not an addiction. A{' '}
              <em className="not-italic font-semibold text-coffee-amber/70">
                structured engineering workflow.
              </em>
            </p>
          </div>

          <CoffeeSchedule />

          {/* Bottom callout */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="
              text-center
              rounded-2xl p-6 sm:p-10
              border border-coffee-amber/25
              max-w-2xl mx-auto
              space-y-4
              relative overflow-hidden
            "
            style={{ background: 'rgba(44,24,16,0.6)' }}
          >
            {/* Background warmth */}
            <div
              className="absolute inset-0 pointer-events-none"
              aria-hidden="true"
              style={{
                background:
                  'radial-gradient(ellipse 80% 80% at 50% 50%, rgba(212,160,23,0.06) 0%, transparent 70%)',
              }}
            />

            <p className="text-4xl" aria-hidden="true">☕</p>
            <h4
              className="font-space text-xl sm:text-2xl font-bold"
              style={{ color: '#f5e6d3' }}
            >
              The next section contains{' '}
              <span style={{ color: '#d4a017' }}>clean code.</span>
            </h4>
            <p className="font-inter text-sm text-coffee-light/40 leading-relaxed max-w-sm mx-auto">
              You made it. You survived the bugs, the deadlines, the Stack Overflow
              despair. All that caffeine was{' '}
              <em className="not-italic font-medium text-coffee-amber/70">building toward something.</em>
            </p>
            <div className="
              pt-3 border-t border-coffee-amber/10
              font-mono text-xs text-coffee-light/25
            ">
              <span className="text-coffee-amber/40">// </span>
              next: enlightenment.jsx — loading...
            </div>
          </motion.div>
        </div>

      </div>

      {/* ── Bottom fade — coffee to void transition ── */}
      <div
        className="absolute bottom-0 left-0 right-0 h-40 pointer-events-none"
        aria-hidden="true"
        style={{
          background:
            'linear-gradient(to bottom, transparent, rgba(10,10,15,1))',
        }}
      />
    </section>
  )
}

