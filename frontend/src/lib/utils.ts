import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`
}

export function formatFileSize(mb: number): string {
  if (mb < 1) return `${Math.round(mb * 1024)} KB`
  return `${mb.toFixed(1)} MB`
}

export function formatTimestamp(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function scoreToPercent(score: number): number {
  return Math.round(score * 100)
}

export function getVerdictColor(verdict: string): string {
  return verdict === 'DEEPFAKE' ? 'var(--red)' : 'var(--green)'
}

export function getScoreColor(score: number): string {
  if (score >= 0.7) return '#ff2d55'
  if (score >= 0.4) return '#ffb300'
  return '#00ff88'
}

export function getRiskLevel(score: number): string {
  if (score >= 0.8) return 'CRITICAL'
  if (score >= 0.6) return 'HIGH'
  if (score >= 0.4) return 'MEDIUM'
  return 'LOW'
}
