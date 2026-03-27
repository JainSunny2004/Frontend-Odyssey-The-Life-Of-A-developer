import React from 'react'
import { motion } from 'framer-motion'

const MOOD_STYLES = {
  calm:     { dot: 'bg-neon-green',  text: 'text-neon-green',  border: 'border-neon-green/25',  line: 'rgba(0,255,136,0.4)'   },
  stressed: { dot: 'bg-neon-yellow', text: 'text-neon-yellow', border: 'border-neon-yellow/25', line: 'rgba(241,250,140,0.4)' },
  panicked: { dot: 'bg-neon-red',    text: 'text-neon-red',    border: 'border-neon-red/25',    line: 'rgba(255,85,85,0.4)'   },
}

function CommitNode({ commit, index, isVisible, isLast }) {
  const cfg = MOOD_STYLES[commit.mood] ?? MOOD_STYLES.calm

  return (
    <motion.div
      initial={{ opacity: 0, x: -30 }}
      animate={isVisible ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
      transition={{ delay: index * 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="relative flex gap-4"
      role="listitem"
      aria-label={`${commit.time}: ${commit.message}`}
    >
      {/* Track */}
      <div className="flex flex-col items-center flex-shrink-0">
        <motion.div
          animate={isVisible
            ? { scale: [0, 1.3, 1], opacity: [0, 1, 1] }
            : { scale: 0, opacity: 0 }
          }
          transition={{ delay: index * 0.1 + 0.1, duration: 0.4 }}
          className={`relative w-3.5 h-3.5 rounded-full flex-shrink-0 border-2 ${cfg.border} ${cfg.dot} z-10 mt-1`}
          style={{ boxShadow: `0 0 8px ${cfg.line}` }}
          aria-hidden="true"
        >
          {commit.mood === 'panicked' && (
            <motion.div
              className="absolute inset-0 rounded-full"
              animate={{ scale: [1, 2.2], opacity: [0.7, 0] }}
              transition={{ duration: 1.2, repeat: Infinity }}
              style={{ backgroundColor: cfg.line }}
              aria-hidden="true"
            />
          )}
        </motion.div>

        {!isLast && (
          <motion.div
            className="w-px flex-1 mt-1"
            initial={{ scaleY: 0 }}
            animate={isVisible ? { scaleY: 1 } : { scaleY: 0 }}
            transition={{ delay: index * 0.1 + 0.2, duration: 0.4 }}
            style={{
              background:      `linear-gradient(to bottom, ${cfg.line}, rgba(255,255,255,0.05))`,
              transformOrigin: 'top',
              minHeight:       '2.5rem',
            }}
            aria-hidden="true"
          />
        )}
      </div>

      {/* Card */}
      <div
        className={`flex-1 pb-4 glass-card rounded-xl p-3 sm:p-4 border ${cfg.border} min-w-0`}
        style={{ background: 'rgba(10,10,15,0.85)' }}
      >
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <span className="text-base flex-shrink-0" aria-hidden="true">{commit.icon}</span>
          <code className="font-mono text-[10px] text-white/25 flex-shrink-0">{commit.hash}</code>
          <span className="font-mono text-[10px] text-white/20 ml-auto flex-shrink-0">{commit.time}</span>
        </div>
        <p className={`font-mono text-xs sm:text-sm font-semibold ${cfg.text} mb-1.5 break-words`}>
          "{commit.message}"
        </p>
        {commit.sub && (
          <p className="font-inter text-[11px] sm:text-xs text-white/35 italic">{commit.sub}</p>
        )}
      </div>
    </motion.div>
  )
}

export default function CommitTimeline({ commits = [], isVisible = true }) {
  return (
    <div
      className="relative space-y-0"
      role="list"
      aria-label="Git commit history"
    >
      {commits.map((commit, i) => (
        <CommitNode
          key={commit.hash ?? i}
          commit={commit}
          index={i}
          isVisible={isVisible}
          isLast={i === commits.length - 1}
        />
      ))}
    </div>
  )
}
