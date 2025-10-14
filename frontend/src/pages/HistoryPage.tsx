import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { Clock, AlertTriangle, CheckCircle, Trash2, RefreshCw } from 'lucide-react'
import { deepdefendAPI, HistoryItem } from '@/lib/api'
import { useStore } from '@/store'
import { formatTimestamp, formatDuration } from '@/lib/utils'
import toast from 'react-hot-toast'

export default function HistoryPage() {
  const { history, setHistory } = useStore()
  const [loading, setLoading] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const fetchHistory = async () => {
    setLoading(true)
    try {
      const data = await deepdefendAPI.getHistory(50)
      setHistory(data)
    } catch {
      toast.error('Failed to load history')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHistory()
  }, [])

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.history-row', {
        x: -20,
        opacity: 0,
        duration: 0.5,
        stagger: 0.06,
        ease: 'power3.out',
      })
    }, containerRef)
    return () => ctx.revert()
  }, [history])

  const handleClear = async () => {
    try {
      await deepdefendAPI.clearHistory()
      setHistory([])
      toast.success('History cleared', {
        style: { background: '#111124', color: '#e0e0f0', border: '1px solid rgba(0,245,255,0.2)' },
      })
    } catch {
      toast.error('Failed to clear history')
    }
  }

  return (
    <div ref={containerRef} className="w-full max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="font-mono text-xs text-gray-600 tracking-widest mb-1">[ ANALYSIS HISTORY ]</p>
          <h2 className="font-display text-4xl tracking-wider text-white">
            RECENT <span className="text-cyan-DEFAULT">SCANS</span>
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchHistory}
            className="p-2 border border-border text-gray-500 hover:text-cyan-DEFAULT hover:border-cyan-dark transition-colors"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
          {history.length > 0 && (
            <button
              onClick={handleClear}
              className="flex items-center gap-2 px-4 py-2 border border-red-DEFAULT/30 text-red-DEFAULT/70 hover:text-red-DEFAULT hover:border-red-DEFAULT/60 transition-colors font-mono text-xs tracking-widest"
            >
              <Trash2 size={12} />
              CLEAR
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="panel overflow-hidden">
        {/* Table header */}
        <div className="grid grid-cols-12 gap-3 px-5 py-3 border-b border-border bg-void">
          {['FILE', 'VERDICT', 'CONFIDENCE', 'DURATION', 'TIMESTAMP'].map((h, i) => (
            <div
              key={h}
              className={`font-mono text-[10px] text-gray-600 tracking-widest ${
                i === 0 ? 'col-span-4' : i === 4 ? 'col-span-2' : 'col-span-2'
              }`}
            >
              {h}
            </div>
          ))}
        </div>

        {/* Rows */}
        {loading && history.length === 0 ? (
          <div className="py-16 text-center">
            <div className="inline-block w-6 h-6 border border-cyan-DEFAULT border-t-transparent rounded-full cyber-spin mb-3" />
            <p className="font-mono text-xs text-gray-600">LOADING HISTORY...</p>
          </div>
        ) : history.length === 0 ? (
          <div className="py-16 text-center">
            <Clock size={32} className="mx-auto text-gray-700 mb-3" strokeWidth={1} />
            <p className="font-mono text-xs text-gray-600 tracking-widest">NO ANALYSIS HISTORY</p>
            <p className="font-mono text-[10px] text-gray-700 mt-1">Upload a video to get started</p>
          </div>
        ) : (
          history.map((item: HistoryItem, idx) => {
            const isDeepfake = item.verdict === 'DEEPFAKE'
            const color = isDeepfake ? '#ff2d55' : '#00ff88'
            return (
              <div
                key={item.analysis_id}
                className="history-row grid grid-cols-12 gap-3 px-5 py-4 border-b border-border/50 hover:bg-white/[0.02] transition-colors"
              >
                {/* File */}
                <div className="col-span-4 flex items-center gap-2 min-w-0">
                  <div className="w-1 h-full min-h-[16px] flex-shrink-0" style={{ background: color, boxShadow: `0 0 6px ${color}` }} />
                  <span className="font-mono text-xs text-gray-300 truncate">{item.filename}</span>
                </div>

                {/* Verdict */}
                <div className="col-span-2 flex items-center gap-1.5">
                  {isDeepfake
                    ? <AlertTriangle size={11} style={{ color }} />
                    : <CheckCircle size={11} style={{ color }} />
                  }
                  <span className="font-mono text-[10px] tracking-widest" style={{ color }}>{item.verdict}</span>
                </div>

                {/* Confidence */}
                <div className="col-span-2">
                  <div className="font-mono text-xs" style={{ color }}>{item.confidence.toFixed(1)}%</div>
                  <div className="mt-1 h-px bg-border overflow-hidden">
                    <div className="h-full" style={{ width: `${item.confidence}%`, background: color }} />
                  </div>
                </div>

                {/* Duration */}
                <div className="col-span-2 font-mono text-xs text-gray-500">
                  {formatDuration(item.video_duration)}
                </div>

                {/* Timestamp */}
                <div className="col-span-2 font-mono text-[10px] text-gray-600">
                  {formatTimestamp(item.timestamp)}
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Summary bar */}
      {history.length > 0 && (
        <div className="flex items-center gap-6 font-mono text-xs text-gray-600 px-1">
          <span>{history.length} total scans</span>
          <span className="text-red-DEFAULT/70">{history.filter(h => h.verdict === 'DEEPFAKE').length} deepfakes</span>
          <span className="text-green-DEFAULT/70">{history.filter(h => h.verdict === 'REAL').length} authentic</span>
        </div>
      )}
    </div>
  )
}
