import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { AlertTriangle, CheckCircle, Eye, Volume2, Cpu, Clock, FileVideo, Layers } from 'lucide-react'
import { AnalysisResult } from '@/lib/api'
import { formatDuration, formatFileSize, formatTimestamp, scoreToPercent } from '@/lib/utils'
import { useStore } from '@/store'
import SuspiciousTimeline from './SuspiciousTimeline'
import ScoreRadar from './ScoreRadar'

interface Props {
  result: AnalysisResult
}

export default function VerdictDisplay({ result }: Props) {
  const { reset } = useStore()
  const containerRef = useRef<HTMLDivElement>(null)
  const verdictRef = useRef<HTMLDivElement>(null)
  const confRef = useRef<HTMLSpanElement>(null)
  const isDeepfake = result.verdict === 'DEEPFAKE'

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Stagger in panels
      gsap.from('.result-panel', {
        y: 30,
        opacity: 0,
        duration: 0.6,
        stagger: 0.12,
        ease: 'power3.out',
      })

      // Confidence counter
      const obj = { value: 0 }
      gsap.to(obj, {
        value: result.confidence,
        duration: 1.5,
        ease: 'power2.out',
        delay: 0.5,
        onUpdate: () => {
          if (confRef.current) {
            confRef.current.textContent = `${Math.round(obj.value)}%`
          }
        },
      })

      // Verdict glow pulse
      gsap.to(verdictRef.current, {
        filter: isDeepfake
          ? 'drop-shadow(0 0 20px rgba(255,45,85,0.8))'
          : 'drop-shadow(0 0 20px rgba(0,255,136,0.8))',
        repeat: -1,
        yoyo: true,
        duration: 1.5,
        ease: 'sine.inOut',
      })
    })
    return () => ctx.revert()
  }, [result, isDeepfake])

  const verdictColor = isDeepfake ? '#ff2d55' : '#00ff88'
  const verdictBg = isDeepfake ? 'rgba(255,45,85,0.06)' : 'rgba(0,255,136,0.06)'

  return (
    <div ref={containerRef} className="w-full max-w-5xl mx-auto space-y-4">
      {/* Top header */}
      <div className="result-panel flex items-center justify-between">
        <div>
          <p className="font-mono text-xs text-gray-600 tracking-widest mb-1">ANALYSIS COMPLETE · {formatTimestamp(result.timestamp)}</p>
          <p className="font-mono text-xs text-gray-700">ID: {result.analysis_id}</p>
        </div>
        <button
          onClick={reset}
          className="font-mono text-xs text-gray-500 hover:text-cyan-DEFAULT transition-colors tracking-widest border border-border px-4 py-2 hover:border-cyan-dark"
        >
          NEW ANALYSIS
        </button>
      </div>

      {/* Main verdict card */}
      <div
        className="result-panel panel p-8 text-center relative overflow-hidden"
        style={{ background: verdictBg, borderColor: `${verdictColor}30` }}
      >
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: `repeating-linear-gradient(45deg, ${verdictColor} 0, ${verdictColor} 1px, transparent 0, transparent 50%)`,
          backgroundSize: '20px 20px',
        }} />

        <div ref={verdictRef} className="relative">
          {isDeepfake ? (
            <AlertTriangle size={48} className="mx-auto mb-4" style={{ color: verdictColor }} strokeWidth={1} />
          ) : (
            <CheckCircle size={48} className="mx-auto mb-4" style={{ color: verdictColor }} strokeWidth={1} />
          )}

          <div className="font-display text-7xl md:text-8xl tracking-widest" style={{ color: verdictColor }}>
            {result.verdict}
          </div>

          <div className="mt-4 flex items-center justify-center gap-3">
            <span className="font-mono text-sm text-gray-500">CONFIDENCE</span>
            <span ref={confRef} className="font-display text-4xl" style={{ color: verdictColor }}>0%</span>
          </div>
        </div>
      </div>

      {/* Score grid */}
      <div className="result-panel grid grid-cols-3 gap-px bg-border">
        {[
          { label: 'VIDEO SCORE', value: result.overall_scores.overall_video_score, icon: Eye },
          { label: 'AUDIO SCORE', value: result.overall_scores.overall_audio_score, icon: Volume2 },
          { label: 'COMBINED', value: result.overall_scores.overall_combined_score, icon: Cpu },
        ].map(({ label, value, icon: Icon }) => {
          const pct = scoreToPercent(value)
          const color = pct >= 70 ? '#ff2d55' : pct >= 40 ? '#ffb300' : '#00ff88'
          return (
            <div key={label} className="bg-panel p-5 text-center">
              <Icon size={16} className="mx-auto mb-2 text-gray-600" />
              <div className="font-display text-3xl" style={{ color }}>{pct}%</div>
              <div className="font-mono text-[10px] text-gray-600 tracking-widest mt-1">{label}</div>
              <div className="mt-3 h-px bg-surface overflow-hidden">
                <div
                  className="h-full transition-all duration-1000"
                  style={{ width: `${pct}%`, background: color, boxShadow: `0 0 6px ${color}` }}
                />
              </div>
            </div>
          )
        })}
      </div>

      {/* Video info + Radar */}
      <div className="result-panel grid md:grid-cols-2 gap-4">
        {/* Video metadata */}
        <div className="panel p-5">
          <h3 className="font-mono text-xs text-gray-500 tracking-widest mb-4">VIDEO METADATA</h3>
          <div className="space-y-3">
            {[
              { label: 'Duration', value: formatDuration(result.video_info.duration), icon: Clock },
              { label: 'File Size', value: formatFileSize(result.video_info.file_size_mb), icon: FileVideo },
              { label: 'FPS', value: result.video_info.fps.toFixed(2), icon: Layers },
              { label: 'Total Frames', value: result.video_info.total_frames.toLocaleString(), icon: Eye },
              { label: 'Intervals Analyzed', value: result.total_intervals_analyzed, icon: Cpu },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon size={12} className="text-gray-600" />
                  <span className="font-mono text-xs text-gray-500">{label}</span>
                </div>
                <span className="font-mono text-xs text-gray-200">{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Radar chart */}
        <div className="panel p-5">
          <h3 className="font-mono text-xs text-gray-500 tracking-widest mb-4">DETECTION RADAR</h3>
          <ScoreRadar result={result} />
        </div>
      </div>

      {/* Suspicious intervals */}
      {result.suspicious_intervals.length > 0 && (
        <div className="result-panel panel p-5">
          <h3 className="font-mono text-xs text-gray-500 tracking-widest mb-4">
            SUSPICIOUS INTERVALS — {result.suspicious_intervals.length} DETECTED
          </h3>
          <SuspiciousTimeline intervals={result.suspicious_intervals} duration={result.video_info.duration} />
        </div>
      )}

      {/* AI Analysis */}
      <div className="result-panel panel p-5">
        <h3 className="font-mono text-xs text-gray-500 tracking-widest mb-4">AI ANALYSIS REPORT</h3>
        <div
          className="font-mono text-xs text-gray-300 leading-relaxed"
          style={{
            background: 'rgba(0,0,0,0.3)',
            border: '1px solid rgba(0,245,255,0.06)',
            padding: '16px',
            borderRadius: '2px',
          }}
        >
          <span className="text-cyan-dark mr-2">{'>'}</span>
          {result.detailed_analysis}
        </div>
      </div>
    </div>
  )
}
