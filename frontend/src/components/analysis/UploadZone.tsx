import { useCallback, useRef, useEffect, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { gsap } from 'gsap'
import { Upload, Film, AlertCircle, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'
import { deepdefendAPI } from '@/lib/api'
import { useStore } from '@/store'
import toast from 'react-hot-toast'

const ACCEPTED_TYPES = {
  'video/mp4': ['.mp4'],
  'video/avi': ['.avi'],
  'video/quicktime': ['.mov'],
  'video/x-matroska': ['.mkv'],
  'video/webm': ['.webm'],
}

export default function UploadZone() {
  const { status, uploadProgress, setStatus, setUploadProgress, setResult, setError, reset } = useStore()
  const containerRef = useRef<HTMLDivElement>(null)
  const glowRef = useRef<HTMLDivElement>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [intervalDuration, setIntervalDuration] = useState(2.0)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(containerRef.current, {
        y: 40,
        opacity: 0,
        duration: 1,
        ease: 'power3.out',
        delay: 0.5,
      })
    })
    return () => ctx.revert()
  }, [])

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return
    setSelectedFile(acceptedFiles[0])

    // Glow animation on drop
    gsap.to(glowRef.current, {
      opacity: 1,
      scale: 1.02,
      duration: 0.3,
      ease: 'power2.out',
      yoyo: true,
      repeat: 1,
    })
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_TYPES,
    maxFiles: 1,
    maxSize: 250 * 1024 * 1024,
  })

  const handleAnalyze = async () => {
    if (!selectedFile) return

    try {
      setStatus('uploading')

      const result = await deepdefendAPI.analyzeVideo(
        selectedFile,
        intervalDuration,
        (progress) => {
          setUploadProgress(progress)
          if (progress === 100) setStatus('analyzing')
        }
      )

      setResult(result)
      setStatus('complete')
      setSelectedFile(null)

      toast.success('Analysis complete!', {
        style: {
          background: '#111124',
          color: '#e0e0f0',
          border: '1px solid rgba(0,255,136,0.3)',
        },
      })
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Analysis failed. Please try again.'
      setError(msg)
      setStatus('error')
      toast.error(msg, {
        style: {
          background: '#111124',
          color: '#e0e0f0',
          border: '1px solid rgba(255,45,85,0.3)',
        },
      })
    }
  }

  const isProcessing = status === 'uploading' || status === 'analyzing'

  return (
    <div ref={containerRef} className="w-full max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6 text-center">
        <p className="font-mono text-xs text-gray-500 tracking-widest uppercase mb-2">
          [ MULTI-MODAL DEEPFAKE DETECTION ENGINE ]
        </p>
        <h2 className="font-display text-5xl md:text-6xl tracking-wider text-white">
          UPLOAD <span className="text-cyan-DEFAULT text-glow-cyan">VIDEO</span>
        </h2>
        <p className="mt-2 text-gray-400 text-sm font-body">
          Drop a video file to detect AI-generated synthetic media
        </p>
      </div>

      {/* Drop zone */}
      <div
        ref={glowRef}
        {...getRootProps()}
        className={cn(
          'upload-zone relative rounded-sm p-10 text-center cursor-pointer transition-all duration-300 corner-border',
          isDragActive && 'drag-active',
          isProcessing && 'pointer-events-none opacity-60'
        )}
      >
        <input {...getInputProps()} />

        {/* Animated corner accents */}
        <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-cyan-DEFAULT" style={{ boxShadow: '0 0 8px rgba(0,245,255,0.5)' }} />
        <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-cyan-DEFAULT" style={{ boxShadow: '0 0 8px rgba(0,245,255,0.5)' }} />
        <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-cyan-DEFAULT" style={{ boxShadow: '0 0 8px rgba(0,245,255,0.5)' }} />
        <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-cyan-DEFAULT" style={{ boxShadow: '0 0 8px rgba(0,245,255,0.5)' }} />

        {selectedFile ? (
          <div className="flex flex-col items-center gap-3">
            <Film size={44} className="text-cyan-DEFAULT" strokeWidth={1} />
            <div>
              <p className="font-mono text-sm text-cyan-DEFAULT">{selectedFile.name}</p>
              <p className="font-mono text-xs text-gray-500 mt-1">
                {(selectedFile.size / (1024 * 1024)).toFixed(1)} MB
              </p>
            </div>
            <p className="text-xs text-gray-600 font-mono">Click or drop to change file</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <Upload size={44} className={cn('transition-colors', isDragActive ? 'text-cyan-DEFAULT' : 'text-gray-600')} strokeWidth={1} />
              {isDragActive && (
                <div className="absolute inset-0 animate-ping">
                  <Upload size={44} className="text-cyan-DEFAULT opacity-30" strokeWidth={1} />
                </div>
              )}
            </div>
            <div>
              <p className="font-body text-gray-300">
                {isDragActive ? 'Release to analyze' : 'Drag & drop your video'}
              </p>
              <p className="font-mono text-xs text-gray-600 mt-1">
                MP4 · AVI · MOV · MKV · WEBM · Max 250MB
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Settings */}
      {!isProcessing && (
        <div className="mt-4 flex items-center gap-4 px-1">
          <label className="font-mono text-xs text-gray-500 tracking-widest whitespace-nowrap">
            INTERVAL
          </label>
          <input
            type="range"
            min={1}
            max={5}
            step={0.5}
            value={intervalDuration}
            onChange={(e) => setIntervalDuration(parseFloat(e.target.value))}
            className="flex-1 accent-cyan-DEFAULT h-0.5"
          />
          <span className="font-mono text-xs text-cyan-DEFAULT w-12 text-right">
            {intervalDuration}s
          </span>
        </div>
      )}

      {/* Progress */}
      {isProcessing && (
        <div className="mt-6 space-y-3">
          <div className="flex justify-between items-center">
            <span className="font-mono text-xs text-gray-400 tracking-widest">
              {status === 'uploading' ? 'UPLOADING...' : 'ANALYZING...'}
            </span>
            <span className="font-mono text-xs text-cyan-DEFAULT">
              {status === 'uploading' ? `${uploadProgress}%` : 'PROCESSING'}
            </span>
          </div>
          <div className="h-px bg-surface overflow-hidden" style={{ border: '1px solid rgba(0,245,255,0.1)' }}>
            <div
              className="h-full transition-all duration-300"
              style={{
                width: status === 'analyzing' ? '100%' : `${uploadProgress}%`,
                background: 'linear-gradient(90deg, var(--cyan) 0%, rgba(0,245,255,0.5) 100%)',
                boxShadow: '0 0 8px rgba(0,245,255,0.8)',
                animation: status === 'analyzing' ? 'progress-fill 2s ease-in-out infinite alternate' : undefined,
              }}
            />
          </div>
          {status === 'analyzing' && (
            <div className="font-mono text-xs text-gray-600 text-center tracking-widest">
              RUNNING NEURAL ANALYSIS · VIDEO + AUDIO FUSION · LLM REPORT GENERATION
            </div>
          )}
        </div>
      )}

      {/* CTA Button */}
      {!isProcessing && (
        <button
          onClick={selectedFile ? handleAnalyze : undefined}
          disabled={!selectedFile}
          className={cn(
            'w-full mt-6 py-4 font-display text-xl tracking-widest transition-all duration-300 relative overflow-hidden',
            selectedFile
              ? 'text-black cursor-pointer'
              : 'text-gray-700 cursor-not-allowed bg-surface border border-border'
          )}
          style={selectedFile ? {
            background: 'linear-gradient(135deg, #00f5ff 0%, #00c4cc 100%)',
            boxShadow: '0 0 30px rgba(0,245,255,0.3)',
          } : {}}
        >
          <span className="relative z-10 flex items-center justify-center gap-3">
            <Zap size={18} />
            {selectedFile ? 'INITIATE ANALYSIS' : 'SELECT A VIDEO FILE'}
          </span>
          {selectedFile && (
            <div className="absolute inset-0 opacity-0 hover:opacity-20 bg-white transition-opacity duration-300" />
          )}
        </button>
      )}

      {/* Error */}
      {status === 'error' && (
        <div className="mt-4 flex items-center gap-2 p-3 border border-red-DEFAULT/30 bg-red-glow rounded-sm">
          <AlertCircle size={14} className="text-red-DEFAULT flex-shrink-0" />
          <p className="font-mono text-xs text-red-DEFAULT">Analysis failed. Check server connection and try again.</p>
          <button onClick={reset} className="ml-auto font-mono text-xs text-gray-500 hover:text-white transition-colors">
            RESET
          </button>
        </div>
      )}
    </div>
  )
}
