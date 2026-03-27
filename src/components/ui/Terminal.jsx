import React from 'react'

export default function Terminal({
  title    = 'terminal',
  children,
  className = '',
  style     = {},
}) {
  return (
    <div
      className={`terminal-window ${className}`}
      style={style}
    >
      <div className="terminal-titlebar">
        <span className="terminal-dot terminal-dot-red"    aria-hidden="true" />
        <span className="terminal-dot terminal-dot-yellow" aria-hidden="true" />
        <span className="terminal-dot terminal-dot-green"  aria-hidden="true" />
        <span className="ml-3 font-mono text-xs text-white/30 select-none">
          {title}
        </span>
      </div>
      <div className="terminal-body">
        {children}
      </div>
    </div>
  )
}
