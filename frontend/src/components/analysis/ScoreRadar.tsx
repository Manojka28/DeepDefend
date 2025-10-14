import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'
import { AnalysisResult } from '@/lib/api'
import { scoreToPercent } from '@/lib/utils'

interface Props {
  result: AnalysisResult
}

export default function ScoreRadar({ result }: Props) {
  const isDeepfake = result.verdict === 'DEEPFAKE'
  const color = isDeepfake ? '#ff2d55' : '#00ff88'

  const data = [
    { subject: 'VIDEO', value: scoreToPercent(result.overall_scores.overall_video_score) },
    { subject: 'AUDIO', value: scoreToPercent(result.overall_scores.overall_audio_score) },
    { subject: 'COMBINED', value: scoreToPercent(result.overall_scores.overall_combined_score) },
    { subject: 'CONFIDENCE', value: result.confidence },
    {
      subject: 'INTERVALS',
      value: Math.min(100, (result.suspicious_intervals.length / Math.max(result.total_intervals_analyzed, 1)) * 100),
    },
  ]

  return (
    <ResponsiveContainer width="100%" height={200}>
      <RadarChart data={data} margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
        <PolarGrid
          stroke="rgba(255,255,255,0.06)"
          gridType="polygon"
        />
        <PolarAngleAxis
          dataKey="subject"
          tick={{ fill: '#555577', fontSize: 9, fontFamily: 'JetBrains Mono', letterSpacing: 2 }}
        />
        <Radar
          name="Score"
          dataKey="value"
          stroke={color}
          fill={color}
          fillOpacity={0.15}
          strokeWidth={1.5}
        />
        <Tooltip
          contentStyle={{
            background: '#111124',
            border: `1px solid ${color}30`,
            borderRadius: 2,
            fontFamily: 'JetBrains Mono',
            fontSize: 11,
            color: '#e0e0f0',
          }}
          formatter={(v: number) => [`${Math.round(v)}%`, 'Score']}
        />
      </RadarChart>
    </ResponsiveContainer>
  )
}
