import { useState } from 'react'

export default function FlipCard({ title, text, icon: Icon, frontColor = 'bg-brand-primary', hint }) {
  const [flipped, setFlipped] = useState(false)

  return (
    <div
      className="cursor-pointer"
      style={{ perspective: '1200px', height: '220px' }}
      onMouseEnter={() => setFlipped(true)}
      onMouseLeave={() => setFlipped(false)}
      onClick={() => setFlipped(f => !f)}
    >
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          transformStyle: 'preserve-3d',
          transition: `transform 0.65s cubic-bezier(0.22, 1, 0.36, 1)`,
          transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
      >
        {/* Front */}
        <div
          style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
          className={`absolute inset-0 rounded-2xl ${frontColor} flex flex-col items-center justify-center p-6 text-white shadow-lg`}
        >
          {Icon && (
            <div className="mb-3 p-3 rounded-full bg-white/15">
              <Icon size={32} className="text-brand-gold" />
            </div>
          )}
          <h3 className="text-xl font-bold text-center leading-tight">{title}</h3>
          {hint && <p className="text-white/50 text-xs mt-2">{hint}</p>}
        </div>

        {/* Back */}
        <div
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
          className="absolute inset-0 rounded-2xl bg-white border border-brand-gold/20 shadow-lg flex items-center justify-center p-6"
        >
          <div className="text-center">
            <div className="w-8 h-0.5 bg-brand-gold mx-auto mb-3 rounded-full" />
            <p className="text-gray-700 text-sm leading-relaxed">{text}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
