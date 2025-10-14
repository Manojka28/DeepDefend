import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: API_BASE,
  timeout: 300000, // 5 min for large video analysis
})

export interface AnalysisResult {
  verdict: 'DEEPFAKE' | 'REAL'
  confidence: number
  overall_scores: {
    overall_video_score: number
    overall_audio_score: number
    overall_combined_score: number
  }
  detailed_analysis: string
  suspicious_intervals: SuspiciousInterval[]
  total_intervals_analyzed: number
  video_info: {
    duration: number
    fps: number
    total_frames: number
    file_size_mb: number
  }
  analysis_id: string
  timestamp: string
}

export interface SuspiciousInterval {
  interval: string
  video_score: number
  audio_score: number
  video_regions: string[]
  audio_regions: string[]
}

export interface HistoryItem {
  analysis_id: string
  filename: string
  verdict: 'DEEPFAKE' | 'REAL'
  confidence: number
  timestamp: string
  video_duration: number
}

export interface Stats {
  total_analyses: number
  deepfakes_detected: number
  real_videos: number
  avg_confidence: number
  avg_video_score: number
  avg_audio_score: number
}

export interface IntervalDetail {
  interval_id: number
  time_range: string
  start: number
  end: number
  video_score: number
  audio_score: number
  combined_score: number
  verdict: string
  suspicious_regions: { video: string[]; audio: string[] }
  has_face: boolean
  has_audio: boolean
}

export const deepdefendAPI = {
  async analyzeVideo(
    file: File,
    intervalDuration = 2.0,
    onUploadProgress?: (progress: number) => void
  ): Promise<AnalysisResult> {
    const formData = new FormData()
    formData.append('file', file)

    const response = await api.post<AnalysisResult>(
      `/api/analyze?interval_duration=${intervalDuration}`,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => {
          if (onUploadProgress && e.total) {
            onUploadProgress(Math.round((e.loaded * 100) / e.total))
          }
        },
      }
    )
    return response.data
  },

  async getHistory(limit = 10): Promise<HistoryItem[]> {
    const response = await api.get<HistoryItem[]>(`/api/history?limit=${limit}`)
    return response.data
  },

  async getStats(): Promise<Stats> {
    const response = await api.get<Stats>('/api/stats')
    return response.data
  },

  async getIntervals(analysisId: string): Promise<{ analysis_id: string; total_intervals: number; intervals: IntervalDetail[] }> {
    const response = await api.get(`/api/intervals/${analysisId}`)
    return response.data
  },

  async getCompare() {
    const response = await api.get('/api/compare')
    return response.data
  },

  async getHealth() {
    const response = await api.get('/api/health')
    return response.data
  },

  async clearHistory() {
    const response = await api.delete('/api/clear-history')
    return response.data
  },
}
