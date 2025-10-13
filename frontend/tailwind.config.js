/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Bebas Neue"', 'Impact', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"Fira Code"', 'monospace'],
        body: ['"DM Sans"', 'sans-serif'],
      },
      colors: {
        black: '#050508',
        void: '#08080f',
        surface: '#0d0d1a',
        panel: '#111124',
        border: '#1a1a35',
        cyan: {
          DEFAULT: '#00f5ff',
          dim: '#00c4cc',
          dark: '#007a80',
          glow: 'rgba(0,245,255,0.15)',
        },
        red: {
          DEFAULT: '#ff2d55',
          dim: '#cc2444',
          dark: '#7a1530',
          glow: 'rgba(255,45,85,0.15)',
        },
        green: {
          DEFAULT: '#00ff88',
          dim: '#00cc6f',
          dark: '#007a40',
          glow: 'rgba(0,255,136,0.15)',
        },
        amber: {
          DEFAULT: '#ffb300',
          dim: '#cc8f00',
          dark: '#7a5500',
          glow: 'rgba(255,179,0,0.15)',
        },
      },
      animation: {
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'scan': 'scan 2s linear infinite',
        'flicker': 'flicker 4s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'radar': 'radar 3s linear infinite',
        'glitch': 'glitch 0.3s steps(2) infinite',
      },
      keyframes: {
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        flicker: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.85' },
          '75%': { opacity: '0.95' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        radar: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        glitch: {
          '0%': { clipPath: 'inset(0 0 98% 0)', transform: 'translate(-2px)' },
          '50%': { clipPath: 'inset(50% 0 30% 0)', transform: 'translate(2px)' },
          '100%': { clipPath: 'inset(80% 0 0 0)', transform: 'translate(0)' },
        },
      },
      backgroundImage: {
        'grid-pattern': `linear-gradient(rgba(0,245,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,245,255,0.03) 1px, transparent 1px)`,
        'hex-pattern': `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2300f5ff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      },
    },
  },
  plugins: [],
}
