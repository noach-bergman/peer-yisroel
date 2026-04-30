import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { Award, BookOpen, Globe, Heart, Star, Users } from 'lucide-react'
import AdminItemControls from '../components/AdminItemControls'
import AnimatedSection from '../components/AnimatedSection'
import EditableText from '../components/EditableText'
import FlipCard from '../components/FlipCard'
import GoldParticles from '../components/GoldParticles'
import PageLoading from '../components/PageLoading'
import { createId } from '../content/defaultContent'
import { useEditMode } from '../contexts/EditModeContext'
import { usePageContent, usePageSeo } from '../hooks/useEditableContent'

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
          <motion.div initial={{ opacity: 0, y: 36 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}>
            <EditableText field={`title_${lang}`} tag="h1" className="text-4xl md:text-6xl font-bold text-white font-hebrew leading-tight mb-4 drop-shadow-lg block">
              {content[`title_${lang}`]}
            </EditableText>
            <div className="w-20 h-1 bg-brand-gold mx-auto rounded-full mb-4" />
            <EditableText field={`subtitle_${lang}`} tag="p" className="text-white/80 text-lg md:text-xl block">
              {content[`subtitle_${lang}`]}
            </EditableText>
          </motion.div>
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
                <AnimatedSection key={card.id} delay={index * 0.1} variant={index % 2 === 0 ? 'slideRight' : 'slideLeft'}>
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
                      title={card[`title_${lang}`] || card.title_he}
                      text={card[`text_${lang}`] || card.text_he}
                      icon={Icon}
                      frontColor={card.frontColor || FRONT_COLORS[index % FRONT_COLORS.length].value}
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
