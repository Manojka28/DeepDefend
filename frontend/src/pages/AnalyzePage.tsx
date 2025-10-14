import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { useStore } from '@/store'
import UploadZone from '@/components/analysis/UploadZone'
import VerdictDisplay from '@/components/analysis/VerdictDisplay'

export default function AnalyzePage() {
  const { status, result } = useStore()
  const headRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(headRef.current, {
        y: -20,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out',
      })
    })
    return () => ctx.revert()
  }, [])

  const showResult = status === 'complete' && result

  return (
    <div className="w-full">
      {!showResult ? (
        <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
          {/* Decorative top text */}
          <div ref={headRef} className="text-center mb-10">
            <div className="inline-flex items-center gap-3 mb-6">
              <div className="h-px w-16 bg-gradient-to-r from-transparent to-cyan-DEFAULT/50" />
              <span className="font-mono text-[10px] text-cyan-dark tracking-widest">DEEPDEFEND v1.0</span>
              <div className="h-px w-16 bg-gradient-to-l from-transparent to-cyan-DEFAULT/50" />
            </div>
            <p className="font-body text-gray-500 max-w-sm mx-auto text-sm leading-relaxed">
              Advanced multi-modal AI detection combining computer vision and audio analysis for highest accuracy
            </p>
          </div>

          <UploadZone />

          {/* Feature pills */}
          <div className="mt-10 flex flex-wrap justify-center gap-2">
            {['Frame-by-Frame Analysis', 'Audio Synthesis Detection', 'AI-Powered Fusion', 'Interval Breakdown', 'Explainable Results'].map(f => (
              <span key={f} className="font-mono text-[10px] text-gray-600 tracking-widest px-3 py-1.5 border border-border rounded-sm">
                {f.toUpperCase()}
              </span>
            ))}
          </div>
        </div>
      ) : (
        <div className="px-4 py-8">
          <VerdictDisplay result={result} />
        </div>
      )}
    </div>
  )
}
