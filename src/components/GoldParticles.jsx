import { useMemo } from 'react'

const PARTICLE_COUNT = 28

function seededRandom(seed) {
  let s = seed
  return () => {
    s = (s * 9301 + 49297) % 233280
    return s / 233280
  }
}

export default function GoldParticles({ className = '' }) {
  const particles = useMemo(() => {
    const rand = seededRandom(42)
    return Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
      id: i,
      left: rand() * 100,
      size: 1.5 + rand() * 2.5,
      delay: rand() * 8,
      duration: 6 + rand() * 8,
      opacity: 0.15 + rand() * 0.3,
      color: rand() > 0.5 ? '#b8943f' : '#f0c060',
    }))
  }, [])

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`} aria-hidden="true">
      <style>{`
        @keyframes gold-float {
          0%   { transform: translateY(100%) scale(0.8); opacity: 0; }
          10%  { opacity: 1; }
          90%  { opacity: 0.8; }
          100% { transform: translateY(-20vh) scale(1.1); opacity: 0; }
        }
      `}</style>
      {particles.map(p => (
        <div
          key={p.id}
          style={{
            position: 'absolute',
            bottom: 0,
            left: `${p.left}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            borderRadius: '50%',
            background: p.color,
            boxShadow: `0 0 ${p.size * 2}px ${p.color}`,
            opacity: p.opacity,
            animation: `gold-float ${p.duration}s ${p.delay}s infinite ease-in-out`,
          }}
        />
      ))}
    </div>
  )
}
