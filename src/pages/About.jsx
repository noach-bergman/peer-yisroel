import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { Award, BookOpen, Globe, Heart, Star, Users } from 'lucide-react'
import AdminItemControls from '../components/AdminItemControls'
import AnimatedSection from '../components/AnimatedSection'
import EditableText from '../components/EditableText'
import GoldParticles from '../components/GoldParticles'
import PageLoading from '../components/PageLoading'
import { createId } from '../content/defaultContent'
import { useEditMode } from '../contexts/EditModeContext'
import { usePageContent, usePageSeo } from '../hooks/useEditableContent'

function FlipCard({ frontColor, icon: Icon, title, text }) {
  const [flipped, setFlipped] = useState(false)
  const [textVisible, setTextVisible] = useState(false)

  const handleEnter = () => {
    setFlipped(true)
    setTimeout(() => setTextVisible(true), 320)
  }
  const handleLeave = () => {
    setFlipped(false)
    setTextVisible(false)
  }

  return (
    <div
      style={{ perspective: '900px', height: '280px' }}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      className="w-full"
    >
      <motion.div
        style={{ width: '100%', height: '100%', transformStyle: 'preserve-3d', position: 'relative' }}
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Front — colored, icon centered, title at bottom */}
        <div
          style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
          className={`absolute inset-0 rounded-2xl shadow-lg ${frontColor} p-8 flex flex-col items-center justify-between`}
        >
          <div className="w-6 h-px bg-white/25" />
          <div className="flex flex-col items-center gap-3">
            <Icon size={44} className="text-white/65" />
            <div className="w-6 h-px bg-brand-gold/50" />
          </div>
          <h3 className="text-lg font-bold text-white text-center leading-snug">{title}</h3>
        </div>

        {/* Back — parchment, distinct visual language */}
        <div
          style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
          className="absolute inset-0 rounded-2xl shadow-lg bg-brand-neutral-50 flex flex-col overflow-hidden"
        >
          <div className={`h-1.5 w-full rounded-t-2xl ${frontColor}`} />
          <div className="flex-1 px-7 py-6 flex flex-col justify-center overflow-y-auto">
            <motion.div
              animate={{ opacity: textVisible ? 1 : 0, y: textVisible ? 0 : 10 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            >
              <p className="text-[11px] font-bold text-brand-primary/40 uppercase tracking-widest mb-3">{title}</p>
              <p className="text-brand-primary/75 text-sm leading-relaxed">{text}</p>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

const ICON_MAP = { BookOpen, Star, Heart, Globe, Users, Award }
const FRONT_COLORS = [
  { value: 'bg-brand-primary', label: 'Blue' },
  { value: 'bg-brand-primary-dark', label: 'Dark blue' },
  { value: 'bg-[#1e4a3a]', label: 'Green' },
  { value: 'bg-[#3a2a5e]', label: 'Purple' },
  { value: 'bg-[#4a2020]', label: 'Burgundy' },
  { value: 'bg-[#7a5a2c]', label: 'Bronze' },
]

export default function About() {
  const { i18n } = useTranslation()
  const lang = i18n.language
  const edit = useEditMode()
  const { content, loading } = usePageContent('about')
  usePageSeo('about', content, lang)

  if (loading || !content) return <PageLoading />

  const cards = content.cards || []
  const cardFields = [
    { name: 'icon', label: 'Icon', type: 'select', options: Object.keys(ICON_MAP) },
    { name: 'frontColor', label: 'Front color', type: 'select', options: FRONT_COLORS },
    { name: 'title_he', label: 'Title HE' },
    { name: 'title_en', label: 'Title EN' },
    { name: 'text_he', label: 'Text HE', multiline: true },
    { name: 'text_en', label: 'Text EN', multiline: true },
  ]
  const openCardEditor = (card) => {
    edit.openDrawer({
      title: 'About card',
      kicker: 'Repeatable',
      collectionKey: 'cards',
      itemId: card.id,
      fields: cardFields,
    })
  }
  const addCard = () => {
    const card = edit.addCollectionItem('cards', {
      id: createId('about-card'),
      icon: 'BookOpen',
      frontColor: 'bg-brand-primary',
      title_he: 'כרטיס חדש',
      title_en: 'New card',
      text_he: '',
      text_en: '',
    })
    openCardEditor(card)
  }

  return (
    <div>
      <section className="relative bg-brand-primary overflow-hidden" style={{ paddingTop: '7rem', paddingBottom: '5rem' }}>
        <GoldParticles />
        <div className="relative z-10 max-w-3xl mx-auto px-4 text-center">
          <div style={{ overflow: 'hidden', marginBottom: '1.25rem' }}>
            <motion.div
              initial={{ y: '115%' }}
              animate={{ y: 0 }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            >
              <EditableText field={`title_${lang}`} tag="h1" className="text-4xl md:text-6xl font-bold text-white font-hebrew leading-tight drop-shadow-lg block">
                {content[`title_${lang}`]}
              </EditableText>
            </motion.div>
          </div>
          <motion.div
            className="h-px bg-brand-gold mx-auto mb-5"
            initial={{ width: 0 }}
            animate={{ width: '5rem' }}
            transition={{ duration: 0.9, delay: 0.55, ease: [0.22, 1, 0.36, 1] }}
          />
          <div style={{ overflow: 'hidden' }}>
            <motion.div
              initial={{ y: '110%' }}
              animate={{ y: 0 }}
              transition={{ duration: 0.9, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            >
              <EditableText field={`subtitle_${lang}`} tag="p" className="text-white/80 text-lg md:text-xl block">
                {content[`subtitle_${lang}`]}
              </EditableText>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="section-y bg-brand-neutral-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection variant="fadeUp" className="text-center mb-10">
            <EditableText field={`cards_title_${lang}`} tag="h2" className="heading-section block">
              {content[`cards_title_${lang}`]}
            </EditableText>
            {edit.isEditMode && !edit.isPreviewMode && (
              <button
                type="button"
                onClick={addCard}
                className="mt-5 inline-flex items-center justify-center rounded-full bg-brand-primary px-5 py-2 text-sm font-semibold text-white shadow-lg hover:bg-brand-primary-dark"
              >
                Add card
              </button>
            )}
          </AnimatedSection>

          <div className={`grid gap-6 ${cards.length <= 2 ? 'grid-cols-1 sm:grid-cols-2' : cards.length === 3 ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'}`}>
            {cards.map((card, index) => {
              const Icon = ICON_MAP[card.icon] || BookOpen
              return (
                <AnimatedSection key={card.id} delay={index * 0.15} variant="fadeUp">
                  <div className="relative">
                    <AdminItemControls
                      label="Card"
                      onEdit={() => openCardEditor(card)}
                      onAdd={addCard}
                      onDelete={() => edit.removeCollectionItem('cards', card.id)}
                      onMoveUp={() => edit.moveCollectionItem('cards', card.id, -1)}
                      onMoveDown={() => edit.moveCollectionItem('cards', card.id, 1)}
                      canMoveUp={index > 0}
                      canMoveDown={index < cards.length - 1}
                    />
                    <FlipCard
                      frontColor={card.frontColor || FRONT_COLORS[index % FRONT_COLORS.length].value}
                      icon={Icon}
                      title={card[`title_${lang}`] || card.title_he}
                      text={card[`text_${lang}`] || card.text_he}
                    />
                  </div>
                </AnimatedSection>
              )
            })}
          </div>
        </div>
      </section>

    </div>
  )
}
