import { Toaster } from 'react-hot-toast'
import { useStore } from '@/store'
import Navbar from '@/components/layout/Navbar'
import HeroBackground from '@/components/sections/HeroBackground'
import AnalyzePage from '@/pages/AnalyzePage'
import HistoryPage from '@/pages/HistoryPage'
import StatsPage from '@/pages/StatsPage'

export default function App() {
  const { activeTab } = useStore()

  return (
    <div className="min-h-screen bg-void scan-lines relative">
      {/* Animated particle canvas background */}
      <HeroBackground />

      {/* Grid overlay */}
      <div className="fixed inset-0 bg-grid pointer-events-none" style={{ zIndex: 1 }} />

      {/* Radial vignette */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          zIndex: 1,
          background: 'radial-gradient(ellipse at center, transparent 40%, rgba(5,5,8,0.6) 100%)',
        }}
      />

      {/* Navbar */}
      <div style={{ position: 'relative', zIndex: 50 }}>
        <Navbar />
      </div>

      {/* Main content */}
      <main
        className="relative pt-20 pb-16 max-w-7xl mx-auto px-4"
        style={{ zIndex: 10 }}
      >
        {activeTab === 'analyze' && <AnalyzePage />}
        {activeTab === 'history' && (
          <div className="pt-8">
            <HistoryPage />
          </div>
        )}
        {activeTab === 'stats' && (
          <div className="pt-8">
            <StatsPage />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer
        className="fixed bottom-0 left-0 right-0 h-8 flex items-center justify-between px-6"
        style={{
          zIndex: 40,
          background: 'rgba(5,5,8,0.9)',
          borderTop: '1px solid rgba(0,245,255,0.06)',
          backdropFilter: 'blur(10px)',
        }}
      >
        <span className="font-mono text-[9px] text-gray-700 tracking-widest">
          DEEPDEFEND SYSTEM · MULTI-MODAL DEEPFAKE DETECTION
        </span>
        <div className="flex items-center gap-4">
          <span className="font-mono text-[9px] text-gray-700">
            POWERED BY PYTORCH · GEMINI · FASTAPI
          </span>
          <div className="flex items-center gap-1">
            <div className="w-1 h-1 rounded-full bg-green-DEFAULT animate-pulse" />
            <span className="font-mono text-[9px] text-green-dim">SYSTEM NOMINAL</span>
          </div>
        </div>
      </footer>

      <Toaster position="bottom-right" />
    </div>
  )
}
