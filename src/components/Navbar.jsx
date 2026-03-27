import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { scrollToTarget } from '@/hooks/useGSAP'

const SECTIONS = [
  { id: 'section-1', label: 'The Beginning',      emoji: '🌱' },
  { id: 'section-2', label: 'Stack Overflow Hell', emoji: '🔥' },
  { id: 'section-3', label: 'Debugging Abyss',     emoji: '💀' },
  { id: 'section-4', label: 'Deadline Hell',        emoji: '⏰' },
  { id: 'section-5', label: 'Coffee Religion',      emoji: '☕' },
  { id: 'section-6', label: 'Enlightenment',        emoji: '🏆' },
]

/**
 * Navbar
 * Fixed top, transparent with blur backdrop.
 * Tracks active section via IntersectionObserver.
 * Logo: "{ dev.life }" in JetBrains Mono.
 * On mobile: collapses to hamburger menu.
 */
export default function Navbar() {
  const [activeSection, setActiveSection]   = useState(0)
  const [isScrolled,    setIsScrolled]      = useState(false)
  const [menuOpen,      setMenuOpen]        = useState(false)
  const [visible,       setVisible]         = useState(true)
  const lastScrollY = useRef(0)
  const navRef      = useRef(null)

  // ── Track scroll direction for hide/show ──
  useEffect(() => {
    const handleScroll = () => {
      const current = window.scrollY
      // Show navbar when scrolling up or near top
      setVisible(current < lastScrollY.current || current < 100)
      setIsScrolled(current > 20)
      lastScrollY.current = current
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // ── Track active section via IntersectionObserver ──
  useEffect(() => {
    const observers = []

    SECTIONS.forEach((section, index) => {
      const el = document.getElementById(section.id)
      if (!el) return

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActiveSection(index)
        },
        { rootMargin: '-40% 0px -40% 0px', threshold: 0 }
      )

      observer.observe(el)
      observers.push(observer)
    })

    return () => observers.forEach(o => o.disconnect())
  }, [])

  // ── Close menu on resize to desktop ──
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) setMenuOpen(false)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // ── Close menu on outside click ──
  useEffect(() => {
    if (!menuOpen) return
    const handleClick = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [menuOpen])

  const handleNavClick = useCallback((sectionId) => {
    scrollToTarget(`#${sectionId}`, 1.2, 80)
    setMenuOpen(false)
  }, [])

  const handleLogoClick = useCallback(() => {
    scrollToTarget(0, 1.2, 0)
  }, [])

  return (
    <motion.nav
      ref={navRef}
      role="navigation"
      aria-label="Main navigation"
      initial={{ y: -80, opacity: 0 }}
      animate={{
        y:       visible ? 0 : -80,
        opacity: visible ? 1 : 0,
      }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className={`
        fixed top-0 left-0 right-0 z-[60]
        transition-all duration-300
        ${isScrolled
          ? 'bg-bg-void/80 backdrop-blur-xl border-b border-bg-border/60 shadow-lg shadow-black/20'
          : 'bg-transparent'
        }
      `}
    >
      <div className="container-wide px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 md:h-16">

          {/* ── Logo ── */}
          <button
            onClick={handleLogoClick}
            aria-label="Scroll to top — Frontend Odyssey home"
            className="
              font-mono text-sm sm:text-base font-semibold
              text-neon-green hover:text-neon-green
              transition-all duration-200
              group flex items-center gap-1
              focus-visible:outline-neon-green
            "
          >
            <span className="text-neon-purple group-hover:text-neon-blue transition-colors duration-200">
              {'{'}
            </span>
            <span className="text-neon-green anim-neon-pulse">
              dev.life
            </span>
            <span className="text-neon-purple group-hover:text-neon-blue transition-colors duration-200">
              {'}'}
            </span>
          </button>

          {/* ── Active section label (center, desktop only) ── */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.2 }}
              className="
                hidden lg:flex items-center gap-2
                font-mono text-xs text-neon-green/60
                bg-neon-green/5 border border-neon-green/15
                px-3 py-1 rounded-full
              "
              aria-live="polite"
              aria-label={`Current section: ${SECTIONS[activeSection]?.label}`}
            >
              <span>{SECTIONS[activeSection]?.emoji}</span>
              <span className="text-neon-green/80 font-medium">
                {SECTIONS[activeSection]?.label}
              </span>
              <span className="text-neon-green/30">
                {String(activeSection + 1).padStart(2, '0')}/{SECTIONS.length}
              </span>
            </motion.div>
          </AnimatePresence>

          {/* ── Desktop nav links ── */}
          <div
            className="hidden md:flex items-center gap-1"
            role="list"
          >
            {SECTIONS.map((section, index) => (
              <button
                key={section.id}
                role="listitem"
                onClick={() => handleNavClick(section.id)}
                aria-label={`Navigate to ${section.label}`}
                aria-current={activeSection === index ? 'true' : undefined}
                title={section.label}
                className={`
                  relative w-8 h-8 flex items-center justify-center
                  rounded-full text-sm
                  transition-all duration-200
                  focus-visible:outline-2 focus-visible:outline-neon-green
                  ${activeSection === index
                    ? 'bg-neon-green/15 text-neon-green scale-110'
                    : 'text-white/30 hover:text-white/70 hover:bg-white/5'
                  }
                `}
              >
                <span aria-hidden="true">{section.emoji}</span>

                {/* Active indicator dot */}
                {activeSection === index && (
                  <motion.span
                    layoutId="nav-active-dot"
                    className="
                      absolute -bottom-1 left-1/2 -translate-x-1/2
                      w-1 h-1 rounded-full bg-neon-green
                    "
                    style={{
                      boxShadow: '0 0 6px rgba(0,255,136,0.9)',
                    }}
                  />
                )}
              </button>
            ))}
          </div>

          {/* ── Mobile hamburger ── */}
          <button
            onClick={() => setMenuOpen(prev => !prev)}
            aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            className="
              md:hidden
              relative w-9 h-9 flex flex-col items-center justify-center gap-[5px]
              rounded-md
              text-white/70 hover:text-neon-green
              hover:bg-neon-green/10
              transition-all duration-200
              focus-visible:outline-2 focus-visible:outline-neon-green
            "
          >
            <motion.span
              animate={menuOpen ? { rotate: 45, y: 7 } : { rotate: 0, y: 0 }}
              transition={{ duration: 0.2 }}
              className="block w-5 h-[2px] bg-current rounded-full origin-center"
            />
            <motion.span
              animate={menuOpen ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }}
              transition={{ duration: 0.15 }}
              className="block w-5 h-[2px] bg-current rounded-full"
            />
            <motion.span
              animate={menuOpen ? { rotate: -45, y: -7 } : { rotate: 0, y: 0 }}
              transition={{ duration: 0.2 }}
              className="block w-5 h-[2px] bg-current rounded-full origin-center"
            />
          </button>
        </div>
      </div>

      {/* ── Mobile dropdown menu ── */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            id="mobile-menu"
            role="menu"
            aria-label="Section navigation"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="
              md:hidden overflow-hidden
              bg-bg-void/95 backdrop-blur-xl
              border-t border-bg-border/60
            "
          >
            <div className="px-4 py-3 space-y-1">
              {SECTIONS.map((section, index) => (
                <button
                  key={section.id}
                  role="menuitem"
                  onClick={() => handleNavClick(section.id)}
                  aria-label={`Navigate to ${section.label}`}
                  aria-current={activeSection === index ? 'page' : undefined}
                  className={`
                    w-full flex items-center gap-3
                    px-3 py-2.5 rounded-lg
                    font-inter text-sm text-left
                    transition-all duration-150
                    focus-visible:outline-2 focus-visible:outline-neon-green
                    ${activeSection === index
                      ? 'bg-neon-green/10 text-neon-green border border-neon-green/20'
                      : 'text-white/50 hover:text-white/80 hover:bg-white/5'
                    }
                  `}
                >
                  <span className="text-base" aria-hidden="true">
                    {section.emoji}
                  </span>
                  <span className="flex-1">{section.label}</span>
                  <span
                    className={`
                      font-mono text-xs
                      ${activeSection === index ? 'text-neon-green/60' : 'text-white/20'}
                    `}
                  >
                    {String(index + 1).padStart(2, '0')}
                  </span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}
