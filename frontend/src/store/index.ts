import { create } from 'zustand'
import { AnalysisResult, HistoryItem, Stats } from '@/lib/api'

type AnalysisStatus = 'idle' | 'uploading' | 'analyzing' | 'complete' | 'error'

interface AppState {
  // Current analysis
  status: AnalysisStatus
  uploadProgress: number
  result: AnalysisResult | null
  error: string | null

  // History & stats
  history: HistoryItem[]
  stats: Stats | null

  // UI
  activeTab: 'analyze' | 'history' | 'stats'

  // Actions
  setStatus: (status: AnalysisStatus) => void
  setUploadProgress: (progress: number) => void
  setResult: (result: AnalysisResult | null) => void
  setError: (error: string | null) => void
  setHistory: (history: HistoryItem[]) => void
  setStats: (stats: Stats) => void
  setActiveTab: (tab: 'analyze' | 'history' | 'stats') => void
  reset: () => void
}

export const useStore = create<AppState>((set) => ({
  status: 'idle',
  uploadProgress: 0,
  result: null,
  error: null,
  history: [],
  stats: null,
  activeTab: 'analyze',

  setStatus: (status) => set({ status }),
  setUploadProgress: (uploadProgress) => set({ uploadProgress }),
  setResult: (result) => set({ result }),
  setError: (error) => set({ error }),
  setHistory: (history) => set({ history }),
  setStats: (stats) => set({ stats }),
  setActiveTab: (activeTab) => set({ activeTab }),
  reset: () => set({ status: 'idle', uploadProgress: 0, result: null, error: null }),
}))
