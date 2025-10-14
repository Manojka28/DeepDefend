import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid, Legend,
} from 'recharts'
import { RefreshCw, TrendingUp, Shield, AlertTriangle, Activity } from 'lucide-react'
import { deepdefendAPI, Stats } from '@/lib/api'
import { useStore } from '@/store'
import toast from 'react-hot-toast'

const COLORS = {
  deepfake: '#ff2d55',
  real: '#00ff88',
  video: '#00f5ff',
  audio: '#ffb300',
}

const tooltipStyle = {
  background: '#111124',
  border: '1px solid rgba(0,245,255,0.1)',
  borderRadius: 2,
  fontFamily: 'JetBrains Mono',
  fontSize: 11,
  color: '#e0e0f0',
}

export default function StatsPage() {
  const { stats, setStats, history } = useStore()
  const [compare, setCompare] = useState<Record<string, unknown> | null>(null)
  const [loading, setLoading] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const fetchAll = async () => {
    setLoading(true)
    try {
      const [s, c] = await Promise.all([deepdefendAPI.getStats(), deepdefendAPI.getCompare()])
      setStats(s)
      setCompare(c)
    } catch {
      toast.error('Failed to load stats')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAll()
  }, [])

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.stat-card', {
        y: 25,
        opacity: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: 'power3.out',
      })
    }, containerRef)
    return () => ctx.revert()
  }, [stats])

  const pieData = stats
    ? [
        { name: 'DEEPFAKE', value: stats.deepfakes_detected },
        { name: 'REAL', value: stats.real_videos },
      ]
    : []

  const barData = stats
    ? [
        { name: 'VIDEO', score: Math.round(stats.avg_video_score * 100) },
        { name: 'AUDIO', score: Math.round(stats.avg_audio_score * 100) },
        { name: 'CONFIDENCE', score: Math.round(stats.avg_confidence) },
      ]
    : []

  // Build timeline from history
  const timelineData = history.slice().reverse().slice(-10).map((h, i) => ({
    name: `#${i + 1}`,
    video: Math.round((h as Record<string, unknown> & { overall_scores?: { overall_video_score: number } }).overall_scores?.overall_video_score ?? 0 * 100),
    audio: Math.round((h as Record<string, unknown> & { overall_scores?: { overall_audio_score: number } }).overall_scores?.overall_audio_score ?? 0 * 100),
    confidence: h.confidence,
  }))

  return (
    <div ref={containerRef} className="w-full max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="font-mono text-xs text-gray-600 tracking-widest mb-1">[ DETECTION STATISTICS ]</p>
          <h2 className="font-display text-4xl tracking-wider text-white">
            SYSTEM <span className="text-cyan-DEFAULT">STATS</span>
          </h2>
        </div>
        <button
          onClick={fetchAll}
          className="p-2 border border-border text-gray-500 hover:text-cyan-DEFAULT hover:border-cyan-dark transition-colors"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Top KPI cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'TOTAL SCANS', value: stats.total_analyses, icon: Activity, color: '#00f5ff' },
            { label: 'DEEPFAKES', value: stats.deepfakes_detected, icon: AlertTriangle, color: '#ff2d55' },
            { label: 'AUTHENTIC', value: stats.real_videos, icon: Shield, color: '#00ff88' },
            { label: 'AVG CONFIDENCE', value: `${stats.avg_confidence.toFixed(1)}%`, icon: TrendingUp, color: '#ffb300' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="stat-card panel p-5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 opacity-5 flex items-end justify-end pr-2 pb-2">
                <Icon size={40} style={{ color }} strokeWidth={1} />
              </div>
              <div className="font-display text-4xl" style={{ color }}>{value}</div>
              <div className="font-mono text-[10px] text-gray-600 tracking-widest mt-1">{label}</div>
              <div className="mt-3 h-px w-full" style={{ background: `linear-gradient(90deg, ${color}60, transparent)` }} />
            </div>
          ))}
        </div>
      )}

      {/* Charts row */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Pie chart */}
        <div className="stat-card panel p-5">
          <h3 className="font-mono text-xs text-gray-500 tracking-widest mb-4">VERDICT DISTRIBUTION</h3>
          {stats && stats.total_analyses > 0 ? (
            <div className="flex items-center gap-4">
              <ResponsiveContainer width="60%" height={180}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    strokeWidth={0}
                    dataKey="value"
                  >
                    {pieData.map((_, idx) => (
                      <Cell key={idx} fill={idx === 0 ? COLORS.deepfake : COLORS.real} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-3">
                {pieData.map((d, i) => (
                  <div key={d.name}>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ background: i === 0 ? COLORS.deepfake : COLORS.real }} />
                      <span className="font-mono text-[10px] text-gray-500">{d.name}</span>
                    </div>
                    <div className="font-display text-2xl ml-4" style={{ color: i === 0 ? COLORS.deepfake : COLORS.real }}>
                      {d.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-44 flex items-center justify-center">
              <p className="font-mono text-xs text-gray-700">NO DATA YET</p>
            </div>
          )}
        </div>

        {/* Bar chart */}
        <div className="stat-card panel p-5">
          <h3 className="font-mono text-xs text-gray-500 tracking-widest mb-4">AVERAGE SCORES</h3>
          {stats && stats.total_analyses > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={barData} barSize={28}>
                <CartesianGrid stroke="rgba(255,255,255,0.03)" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: '#555577', fontSize: 9, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fill: '#555577', fontSize: 9, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`${v}%`]} />
                <Bar dataKey="score" radius={[2, 2, 0, 0]}>
                  {barData.map((_, i) => (
                    <Cell key={i} fill={[COLORS.video, COLORS.audio, COLORS.deepfake][i]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-44 flex items-center justify-center">
              <p className="font-mono text-xs text-gray-700">NO DATA YET</p>
            </div>
          )}
        </div>
      </div>

      {/* Line chart — recent history */}
      {timelineData.length > 1 && (
        <div className="stat-card panel p-5">
          <h3 className="font-mono text-xs text-gray-500 tracking-widest mb-4">RECENT ANALYSIS TREND</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={timelineData}>
              <CartesianGrid stroke="rgba(255,255,255,0.03)" />
              <XAxis dataKey="name" tick={{ fill: '#555577', fontSize: 9, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fill: '#555577', fontSize: 9, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`${v}%`]} />
              <Legend wrapperStyle={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: '#555577' }} />
              <Line type="monotone" dataKey="confidence" stroke={COLORS.deepfake} strokeWidth={1.5} dot={{ r: 2, fill: COLORS.deepfake }} name="Confidence" />
              <Line type="monotone" dataKey="video" stroke={COLORS.video} strokeWidth={1.5} dot={{ r: 2, fill: COLORS.video }} name="Video" />
              <Line type="monotone" dataKey="audio" stroke={COLORS.audio} strokeWidth={1.5} dot={{ r: 2, fill: COLORS.audio }} name="Audio" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Compare block */}
      {compare && compare.comparison && (
        <div className="stat-card panel p-5">
          <h3 className="font-mono text-xs text-gray-500 tracking-widest mb-4">VIDEO vs AUDIO DETECTION DOMINANCE</h3>
          <div className="grid grid-cols-3 gap-3 text-center">
            {[
              { label: 'VIDEO DOMINANT', value: (compare.percentages as Record<string,number>)?.video_dominant, color: COLORS.video },
              { label: 'BALANCED', value: (compare.percentages as Record<string,number>)?.balanced, color: '#888' },
              { label: 'AUDIO DOMINANT', value: (compare.percentages as Record<string,number>)?.audio_dominant, color: COLORS.audio },
            ].map(({ label, value, color }) => (
              <div key={label} className="bg-void p-4">
                <div className="font-display text-3xl" style={{ color }}>{value?.toFixed(1)}%</div>
                <div className="font-mono text-[9px] text-gray-600 tracking-widest mt-1">{label}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
