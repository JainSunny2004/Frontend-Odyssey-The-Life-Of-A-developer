import React, { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const PATHS = [
  {
    id:      'frontend',
    icon:    '🎨',
    title:   'Frontend',
    color:   '#00d4ff',
    border:  'border-neon-blue/40',
    glow:    'rgba(0,212,255,0.25)',
    fate:    'You will spend 40% of your career centering divs. The other 60% debating which CSS framework is "the best one this year." Pixel perfect or die.',
    skills:  ['React', 'CSS specificity wars', 'Figma opinions', 'Dark mode obsession'],
    warning: '⚠ Side effect: Strong opinions about 4px vs 8px spacing',
  },
  {
    id:      'backend',
    icon:    '⚙️',
    title:   'Backend',
    color:   '#00ff88',
    border:  'border-neon-green/40',
    glow:    'rgba(0,255,136,0.25)',
    fate:    'You will dream in JSON. Everyone will ask "so you make websites?" You will say yes. Explaining the difference is not worth the energy.',
    skills:  ['Node.js', 'Saying "it\'s a data issue"', 'SQL at 2AM', 'YAML trauma'],
    warning: '⚠ Side effect: Pathological fear of frontend tickets',
  },
  {
    id:      'fullstack',
    icon:    '🔥',
    title:   'Full Stack',
    color:   '#bd93f9',
    border:  'border-neon-purple/40',
    glow:    'rgba(189,147,249,0.25)',
    fate:    'You will be blamed for everything. Frontend broken — your fault. API down — also you. Production on fire at 3 AM — definitely you. Congratulations.',
    skills:  ['React', 'Node', 'Docker', 'Owning all the bugs'],
    warning: '⚠ Side effect: Your calendar is just one long incident report',
  },
]

export default function ChooseYourPath() {
  const [chosen,   setChosen]   = useState(null)
  const [revealed, setRevealed] = useState(false)

  const handleChoose = useCallback((id) => {
    if (chosen) return
    setChosen(id)
    setTimeout(() => setRevealed(true), 300)
  }, [chosen])

  const handleReset = useCallback(() => {
    setChosen(null)
    setRevealed(false)
  }, [])

  const chosenPath = PATHS.find(p => p.id === chosen)

  return (
    <div
      className="space-y-5"
      role="region"
      aria-label="Choose your developer path — interactive"
    >
      {/* Header */}
      <div className="space-y-1">
        <p className="font-mono text-[10px] text-white/25 uppercase tracking-[0.25em]">
          Interactive
        </p>
        <h3 className="font-space text-xl sm:text-2xl font-bold text-white">
          What kind of developer{' '}
          <span className="text-neon-green">are you?</span>
        </h3>
        {!chosen && (
          <p className="font-inter text-sm text-white/40">
            Choose your path. Your fate awaits. (It's already determined.)
          </p>
        )}
      </div>

      {/* Path cards */}
      <div
        className="grid grid-cols-1 sm:grid-cols-3 gap-3"
        role="group"
        aria-label="Developer path options"
      >
        {PATHS.map((path) => {
          const isChosen = chosen === path.id
          const isDimmed = chosen && chosen !== path.id

          return (
            <motion.button
              key={path.id}
              onClick={() => handleChoose(path.id)}
              disabled={!!chosen}
              whileHover={!chosen ? { scale: 1.04, y: -5 } : {}}
              whileTap={!chosen  ? { scale: 0.96 } : {}}
              animate={{
                opacity: isDimmed ? 0.3 : 1,
                scale:   isChosen ? 1.03 : 1,
              }}
              transition={{ duration: 0.3 }}
              className={`
                relative glass-card rounded-2xl p-5 sm:p-6
                border-2 ${path.border}
                flex flex-col items-center gap-3 text-center
                transition-colors duration-200
                disabled:cursor-default
                focus-visible:outline-2 focus-visible:outline-neon-green
              `}
              style={{
                boxShadow: isChosen
                  ? `0 0 25px ${path.glow}, 0 0 60px ${path.glow.replace('0.25','0.08')}`
                  : !chosen ? `0 0 0px transparent` : 'none',
                cursor: chosen ? 'default' : 'pointer',
              }}
              aria-label={`Choose ${path.title} developer`}
              aria-pressed={isChosen}
            >
              <span className="text-3xl sm:text-4xl" aria-hidden="true">
                {path.icon}
              </span>
              <span
                className="font-space text-base sm:text-lg font-bold"
                style={{ color: path.color }}
              >
                {path.title}
              </span>

              {!chosen && (
                <span className="font-mono text-[10px] text-white/25 border border-white/10 px-2.5 py-0.5 rounded-full">
                  click to choose →
                </span>
              )}

              {/* Chosen checkmark */}
              {isChosen && (
                <motion.div
                  initial={{ scale: 0, rotate: -45 }}
                  animate={{ scale: 1, rotate: 0 }}
                  className="absolute -top-2.5 -right-2.5 w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold bg-bg-void border-2"
                  style={{ borderColor: path.color, color: path.color }}
                  aria-hidden="true"
                >
                  ✓
                </motion.div>
              )}
            </motion.button>
          )
        })}
      </div>

      {/* Fate reveal */}
      <AnimatePresence>
        {revealed && chosenPath && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="glass-card-neon rounded-2xl p-5 sm:p-7 space-y-4"
            style={{
              border:     `1px solid ${chosenPath.color}35`,
              boxShadow:  `0 0 30px ${chosenPath.glow}`,
            }}
            role="alert"
            aria-live="polite"
            aria-label={`Your fate as a ${chosenPath.title} developer`}
          >
            {/* Header */}
            <div className="flex items-center gap-3">
              <span className="text-2xl" aria-hidden="true">{chosenPath.icon}</span>
              <div>
                <p className="font-mono text-[10px] text-white/30 uppercase tracking-widest">
                  fate sealed
                </p>
                <p className="font-space text-base font-bold" style={{ color: chosenPath.color }}>
                  {chosenPath.title} Developer
                </p>
              </div>
            </div>

            {/* Fate */}
            <p className="font-inter text-sm sm:text-base text-white/65 leading-relaxed">
              {chosenPath.fate}
            </p>

            {/* Skills */}
            <div className="flex flex-wrap gap-2">
              {chosenPath.skills.map(skill => (
                <span
                  key={skill}
                  className="font-mono text-[10px] px-2.5 py-1 rounded-full border text-white/55"
                  style={{ borderColor: `${chosenPath.color}30`, background: `${chosenPath.color}08` }}
                >
                  {skill}
                </span>
              ))}
            </div>

            {/* Warning */}
            <p className="font-mono text-xs italic" style={{ color: `${chosenPath.color}80` }}>
              {chosenPath.warning}
            </p>

            {/* Reset */}
            <button
              onClick={handleReset}
              className="font-mono text-[10px] text-white/25 hover:text-white/55 transition-colors underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-neon-green"
              aria-label="Choose a different path"
            >
              ← choose differently (your fate won't change)
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
