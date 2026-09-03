'use client'

import { motion } from 'framer-motion'

interface WordProgressRingProps {
  currentWords: number
  minWords: number
  maxWords?: number
  size?: number
}

export function WordProgressRing({
  currentWords,
  minWords,
  maxWords = 250,
  size = 72,
}: WordProgressRingProps) {
  const strokeWidth = 6
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius

  // Percentage towards minimum words
  const percentage = Math.min(100, Math.round((currentWords / minWords) * 100)) || 0
  const progressRatio = Math.min(1, currentWords / minWords)
  const strokeDashoffset = circumference - progressRatio * circumference

  // Dynamic Color
  const isComplete = currentWords >= minWords
  const isApproaching = currentWords >= minWords * 0.5 && !isComplete
  const isOverMax = maxWords ? currentWords > maxWords : false

  let strokeColor = '#ef4444' // Red
  let badgeBg = 'bg-red-50 text-red-700 border-red-200'
  let label = 'आणखी शब्द आवश्यक'

  if (isOverMax) {
    strokeColor = '#f59e0b'
    badgeBg = 'bg-amber-50 text-amber-700 border-amber-200'
    label = 'कमाल मर्यादा गाठली'
  } else if (isComplete) {
    strokeColor = '#10b981' // Green
    badgeBg = 'bg-emerald-50 text-emerald-700 border-emerald-200'
    label = 'किमान मर्यादा पूर्ण ✓'
  } else if (isApproaching) {
    strokeColor = '#f59e0b' // Amber
    badgeBg = 'bg-amber-50 text-amber-700 border-amber-200'
    label = 'छान सुरुवात'
  }

  return (
    <div className="flex items-center gap-3 bg-white/90 backdrop-blur-xs p-2.5 rounded-2xl border border-[oklch(0.88_0.02_250)] shadow-xs">
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#e2e8f0"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Animated progress circle */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            animate={{ strokeDashoffset }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            strokeLinecap="round"
            fill="transparent"
          />
        </svg>
        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-xs font-bold text-slate-800 leading-none">
            {currentWords}
          </span>
          <span className="text-[9px] text-slate-500 font-medium leading-tight mt-0.5">
            /{minWords}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-1.5">
          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${badgeBg}`}>
            {label}
          </span>
        </div>
        <span className="text-[11px] text-slate-500 font-medium">
          {percentage}% पूर्ण {maxWords ? `(कमाल: ${maxWords})` : ''}
        </span>
      </div>
    </div>
  )
}
