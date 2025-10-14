import { useRef, useEffect } from 'react'
import { gsap } from 'gsap'
import { SuspiciousInterval } from '@/lib/api'
import { scoreToPercent, getScoreColor } from '@/lib/utils'

interface Props {
  intervals: SuspiciousInterval[]
  duration: number
}

export default function SuspiciousTimeline({ intervals, duration }: Props) {
  const barsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.timeline-bar', {
        scaleX: 0,
        transformOrigin: 'left center',
        duration: 0.8,
        stagger: 0.05,
        ease: 'power3.out',
        delay: 0.3,
      })
    }, barsRef)
    return () => ctx.revert()
  }, [intervals])

  return (
    <div className="space-y-4">
      {/* Visual timeline strip */}
      <div className="relative h-8 bg-black rounded-sm overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
        {intervals.map((interval) => {
          const parts = interval.interval.split('-')
          const start = parseFloat(parts[0])
          const end = parseFloat(parts[1])
          const left = (start / duration) * 100
          const width = ((end - start) / duration) * 100
          const combined = (interval.video_score + interval.audio_score) / 2
          const color = getScoreColor(combined)
          return (
            <div
              key={interval.interval}
              className="absolute top-0 h-full opacity-80 hover:opacity-100 transition-opacity cursor-pointer"
              style={{
                left: `${left}%`,
                width: `${Math.max(width, 0.5)}%`,
                background: color,
                boxShadow: `0 0 6px ${color}`,
              }}
              title={`${interval.interval}s — Video: ${scoreToPercent(interval.video_score)}% Audio: ${scoreToPercent(interval.audio_score)}%`}
            />
          )
        })}
        {/* Duration label */}
        <div className="absolute right-2 top-1/2 -translate-y-1/2 font-mono text-[9px] text-gray-600">
          {duration.toFixed(1)}s
        </div>
      </div>

      {/* Interval rows */}
      <div ref={barsRef} className="space-y-2 max-h-64 overflow-y-auto pr-1">
        {intervals.map((interval) => {
          const combined = (interval.video_score + interval.audio_score) / 2
          const color = getScoreColor(combined)
          const vidPct = scoreToPercent(interval.video_score)
          const audPct = scoreToPercent(interval.audio_score)

          return (
            <div key={interval.interval} className="grid grid-cols-12 gap-2 items-center py-2 border-b border-border/50">
              {/* Time */}
              <div className="col-span-2 font-mono text-[10px] text-gray-500">{interval.interval}s</div>

              {/* Video bar */}
              <div className="col-span-4">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[9px] text-gray-600 w-6">VID</span>
                  <div className="flex-1 h-1 bg-surface rounded-full overflow-hidden">
                    <div
                      className="timeline-bar h-full rounded-full"
                      style={{ width: `${vidPct}%`, background: getScoreColor(interval.video_score), boxShadow: `0 0 4px ${getScoreColor(interval.video_score)}` }}
                    />
                  </div>
                  <span className="font-mono text-[9px] w-7 text-right" style={{ color: getScoreColor(interval.video_score) }}>{vidPct}%</span>
                </div>
              </div>

              {/* Audio bar */}
              <div className="col-span-4">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[9px] text-gray-600 w-6">AUD</span>
                  <div className="flex-1 h-1 bg-surface rounded-full overflow-hidden">
                    <div
                      className="timeline-bar h-full rounded-full"
                      style={{ width: `${audPct}%`, background: getScoreColor(interval.audio_score), boxShadow: `0 0 4px ${getScoreColor(interval.audio_score)}` }}
                    />
                  </div>
                  <span className="font-mono text-[9px] w-7 text-right" style={{ color: getScoreColor(interval.audio_score) }}>{audPct}%</span>
                </div>
              </div>

              {/* Risk badge */}
              <div className="col-span-2 text-right">
                <span
                  className="font-mono text-[9px] px-1.5 py-0.5 rounded-sm tracking-widest"
                  style={{ color, border: `1px solid ${color}40`, background: `${color}10` }}
                >
                  {scoreToPercent(combined)}%
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Regions legend */}
      {intervals.some(i => i.video_regions.length > 0 || i.audio_regions.length > 0) && (
        <div className="flex flex-wrap gap-2 pt-2">
          <span className="font-mono text-[9px] text-gray-600 tracking-widest">DETECTED REGIONS:</span>
          {Array.from(new Set(intervals.flatMap(i => [...i.video_regions, ...i.audio_regions]))).map(r => (
            <span key={r} className="font-mono text-[9px] px-2 py-0.5 bg-surface border border-border text-gray-400 rounded-sm">
              {r.replace(/_/g, ' ').toUpperCase()}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
