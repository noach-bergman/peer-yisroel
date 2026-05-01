import { motion } from 'framer-motion'
import GoldParticles from './GoldParticles'

export default function PageHero({ children }) {
  return (
    <section className="relative bg-brand-primary overflow-hidden" style={{ paddingTop: '7rem', paddingBottom: '5rem' }}>
      <GoldParticles />
      <div className="relative z-10 max-w-3xl mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 36 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        >
          {children}
        </motion.div>
      </div>
    </section>
  )
}
