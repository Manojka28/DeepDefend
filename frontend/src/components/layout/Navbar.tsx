import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { Shield, Activity, Clock, BarChart3, Wifi } from 'lucide-react'
import { useStore } from '@/store'
import { cn } from '@/lib/utils'

export default function Navbar() {
  const { activeTab, setActiveTab } = useStore()
  const navRef = useRef<HTMLDivElement>(null)
  const logoRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(navRef.current, {
        y: -80,
        opacity: 0,
        duration: 1,
        ease: 'power3.out',
        delay: 0.2,
      })
      // Logo pulse
      gsap.to(logoRef.current, {
        filter: 'drop-shadow(0 0 12px rgba(0,245,255,0.9))',
        repeat: -1,
        yoyo: true,
        duration: 2,
        ease: 'sine.inOut',
      })
    })
    return () => ctx.revert()
  }, [])

  const tabs = [
    { id: 'analyze' as const, label: 'ANALYZE', icon: Activity },
    { id: 'history' as const, label: 'HISTORY', icon: Clock },
    { id: 'stats' as const, label: 'STATS', icon: BarChart3 },
  ]

  return (
    <nav
      ref={navRef}
      className="fixed top-0 left-0 right-0 z-50 h-14"
      style={{ background: 'rgba(5,5,8,0.9)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(0,245,255,0.1)' }}
    >
      <div className="max-w-7xl mx-auto h-full flex items-center justify-between px-6">
        {/* Logo */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('analyze')}>
          <div ref={logoRef} className="relative">
            <Shield size={22} className="text-cyan-DEFAULT" strokeWidth={1.5} />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-DEFAULT" />
            </div>
          </div>
          <div>
            <span className="font-display text-xl tracking-widest text-white">DEEP</span>
            <span className="font-display text-xl tracking-widest text-cyan-DEFAULT">DEFEND</span>
          </div>
          <div className="hidden sm:flex items-center gap-1 ml-2">
            <div className="w-1.5 h-1.5 rounded-full bg-green-DEFAULT animate-pulse" />
            <span className="font-mono text-[10px] text-green-DEFAULT tracking-widest">ONLINE</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={cn(
                'relative flex items-center gap-2 px-4 py-2 font-mono text-xs tracking-widest transition-all duration-300',
                activeTab === id
                  ? 'text-cyan-DEFAULT'
                  : 'text-gray-500 hover:text-gray-300'
              )}
            >
              <Icon size={13} />
              <span className="hidden sm:block">{label}</span>
              {activeTab === id && (
                <div
                  className="absolute bottom-0 left-0 right-0 h-px bg-cyan-DEFAULT"
                  style={{ boxShadow: '0 0 8px rgba(0,245,255,0.8)' }}
                />
              )}
            </button>
          ))}
        </div>

        {/* Status indicator */}
        <div className="hidden md:flex items-center gap-2 font-mono text-[10px] text-gray-600 tracking-widest">
          <Wifi size={11} />
          <span>API v1.0.0</span>
        </div>
      </div>
    </nav>
  )
}
