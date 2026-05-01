import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { BookOpen, Star, Users } from 'lucide-react'
import AnimatedSection from '../components/AnimatedSection'
import Card from '../components/Card'
import CountUp from '../components/CountUp'
import EditableText from '../components/EditableText'
import GoldParticles from '../components/GoldParticles'
import HeroSlideshow from '../components/HeroSlideshow'
import PageLoading from '../components/PageLoading'
import { buildAdminPathFromPublicPath } from '../content/defaultContent'
import { useEditMode } from '../contexts/EditModeContext'
import { useEditableTable, usePageContent, usePageSeo } from '../hooks/useEditableContent'

const ICONS = { BookOpen, Users, Star }
const CARD_VARIANTS = ['slideRight', 'scaleIn', 'slideLeft']

function smartPath(path, edit) {
  return edit.isEditMode ? buildAdminPathFromPublicPath(path) : path
}

function EditableCollectionText({
  collectionKey,
  item,
  field,
  tag: Tag = 'span',
  className = '',
  multiline = false,
  children,
}) {
  const edit = useEditMode()
  const [editing, setEditing] = useState(false)
  const inputRef = useRef(null)
  const value = item[field] ?? children

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus()
      if (inputRef.current.select) inputRef.current.select()
    }
  }, [editing])

  if (!edit.isEditMode || edit.isPreviewMode) {
    return <Tag className={className}>{value}</Tag>
  }

  if (editing) {
    const sharedClass = `w-full min-w-[4rem] bg-white/95 text-current border border-brand-gold outline-none resize-none rounded-md px-2 py-1 ${className}`
    return multiline ? (
      <textarea
        ref={inputRef}
        className={sharedClass}
        value={value}
        rows={4}
        onChange={(event) => edit.updateCollectionItem(collectionKey, item.id, { [field]: event.target.value })}
        onBlur={() => setEditing(false)}
      />
    ) : (
      <input
        ref={inputRef}
        className={sharedClass}
        value={value}
        onChange={(event) => edit.updateCollectionItem(collectionKey, item.id, { [field]: event.target.value })}
        onBlur={() => setEditing(false)}
      />
    )
  }

  const isInline = Tag === 'span' || Tag === 'strong' || Tag === 'em' || Tag === 'a'
  const Wrapper = isInline ? 'span' : 'div'

  return (
    <Wrapper className={`relative max-w-full ${isInline ? 'inline-block' : 'block'}`}>
      <Tag
        className={`${className} cursor-text rounded transition-all duration-200 hover:outline hover:outline-2 hover:outline-brand-gold hover:outline-offset-2 hover:shadow-[0_0_8px_rgba(184,148,63,0.4)]`}
        title="Click to edit"
        onClick={(event) => {
          event.preventDefault()
          event.stopPropagation()
          setEditing(true)
        }}
      >
        {value}
      </Tag>
      {(value === undefined || value === '') && (
        <span className="absolute -top-3 end-0 z-[70] rounded-full bg-red-600 px-1.5 py-0.5 text-[10px] font-semibold leading-none text-white shadow">
          Missing
        </span>
      )}
    </Wrapper>
  )
}

function StatItem({ stat, index, lang }) {
  const edit = useEditMode()
  const rawValue = stat.value || '0'
  const numericPart = parseFloat(String(rawValue).replace(/[^0-9.]/g, '')) || 0
  const suffix = String(rawValue).replace(/[0-9.]/g, '')

  return (
    <AnimatedSection delay={index * 0.1} variant="scaleIn" className="relative text-center">
      <div className="text-5xl md:text-6xl font-bold text-brand-gold mb-2">
        {edit.isEditMode && !edit.isPreviewMode
          ? (
            <EditableCollectionText collectionKey="stats" item={stat} field="value" tag="span">
              {rawValue}
            </EditableCollectionText>
          )
          : <CountUp to={numericPart} suffix={suffix} />}
      </div>
      <EditableCollectionText collectionKey="stats" item={stat} field={`label_${lang}`} tag="div" className="text-sm uppercase tracking-widest text-white/70 font-medium">
        {stat[`label_${lang}`]}
      </EditableCollectionText>
    </AnimatedSection>
  )
}

export default function Home() {
  const { i18n } = useTranslation()
  const lang = i18n.language
  const edit = useEditMode()
  const { content, loading } = usePageContent('home')
  const { data: galleryItems } = useEditableTable('gallery', { orderBy: 'order_index', ascending: true })
  const featured = galleryItems.slice(0, 3)
  const heroRef = useRef(null)
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
  const heroTextY = useTransform(scrollYProgress, [0, 1], ['0%', '25%'])
  usePageSeo('home', content, lang)

  if (loading || !content) return <PageLoading />

  return (
    <div>
      <div ref={heroRef} className="relative overflow-hidden">
        <HeroSlideshow logo="/English.png">
          <motion.div
            style={{ y: heroTextY }}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          >
            <EditableText field={`hero_subtitle_${lang}`} tag="p" className="text-lg md:text-2xl mb-8 text-white/90 leading-relaxed block">
              {content[`hero_subtitle_${lang}`]}
            </EditableText>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to={smartPath('/donate', edit)} className="btn-primary text-lg px-8 py-3">
                <EditableText field={`hero_cta_donate_${lang}`}>{content[`hero_cta_donate_${lang}`]}</EditableText>
              </Link>
              <Link to={smartPath('/about', edit)} className="btn-outline-inverse text-lg px-8 py-3">
                <EditableText field={`hero_cta_about_${lang}`}>{content[`hero_cta_about_${lang}`]}</EditableText>
              </Link>
            </div>
          </motion.div>
        </HeroSlideshow>
      </div>

      <section className="relative bg-brand-primary section-y-tight overflow-hidden">
        <GoldParticles />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-3 gap-8">
            {(content.stats || []).map((stat, index) => (
              <StatItem key={stat.id} stat={stat} index={index} lang={lang} />
            ))}
          </div>
        </div>
      </section>

      <section className="section-y bg-brand-neutral-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <AnimatedSection variant="fadeUp">
            <EditableText field={`mission_title_${lang}`} tag="h2" className="heading-section mb-3 block">
              {content[`mission_title_${lang}`]}
            </EditableText>
            <EditableText field={`mission_subtitle_${lang}`} tag="h3" className="text-xl md:text-2xl font-semibold text-brand-primary-light mb-6 block">
              {content[`mission_subtitle_${lang}`]}
            </EditableText>
            <EditableText field={`mission_text_${lang}`} tag="p" className="text-lg text-gray-700 leading-relaxed block" multiline>
              {content[`mission_text_${lang}`]}
            </EditableText>
          </AnimatedSection>

          <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6">
            {(content.featureCards || []).map((card, index) => {
              const Icon = ICONS[card.icon] || BookOpen
              return (
                <AnimatedSection key={card.id} delay={index * 0.12} variant={CARD_VARIANTS[index % CARD_VARIANTS.length]}>
                  <Card hover className="relative text-center h-full">
                    <Icon size={36} className="text-brand-gold mx-auto mb-3" />
                    <EditableCollectionText collectionKey="featureCards" item={card} field={`title_${lang}`} tag="h4" className="font-bold text-brand-primary mb-2">
                      {card[`title_${lang}`]}
                    </EditableCollectionText>
                    <EditableCollectionText collectionKey="featureCards" item={card} field={`text_${lang}`} tag="p" className="text-gray-600 text-sm" multiline>
                      {card[`text_${lang}`]}
                    </EditableCollectionText>
                  </Card>
                </AnimatedSection>
              )
            })}
          </div>
        </div>
      </section>

      {featured.length > 0 && (
        <section className="section-y bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <AnimatedSection className="text-center mb-10" variant="fadeIn">
              <EditableText field={`gallery_title_${lang}`} tag="h2" className="heading-section block">
                {content[`gallery_title_${lang}`]}
              </EditableText>
              <EditableText field={`gallery_subtitle_${lang}`} tag="p" className="text-gray-600 mt-2 block">
                {content[`gallery_subtitle_${lang}`]}
              </EditableText>
            </AnimatedSection>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {featured.map((item, index) => (
                <AnimatedSection key={item.id} delay={index * 0.12} variant="scaleIn">
                  <div className="rounded-xl overflow-hidden aspect-video shadow-md">
                    <img src={item.image_url} alt={item[`alt_${lang}`] || ''} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                  </div>
                </AnimatedSection>
              ))}
            </div>
            <div className="text-center mt-8">
              <Link to={smartPath('/gallery', edit)} className="btn-outline">
                <EditableText field={`gallery_button_${lang}`}>{content[`gallery_button_${lang}`]}</EditableText> ←
              </Link>
            </div>
          </div>
        </section>
      )}

      <section className="relative section-y bg-brand-primary overflow-hidden">
        <GoldParticles />
        <div className="relative z-10 max-w-2xl mx-auto px-4 text-center">
          <AnimatedSection variant="fadeUp">
            <EditableText field={`cta_title_${lang}`} tag="h2" className="heading-section text-white mb-4 block">
              {content[`cta_title_${lang}`]}
            </EditableText>
            <EditableText field={`cta_text_${lang}`} tag="p" className="text-white/80 text-lg mb-8 block" multiline>
              {content[`cta_text_${lang}`]}
            </EditableText>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to={smartPath('/donate', edit)} className="btn-primary text-lg px-8 py-3">
                <EditableText field={`cta_donate_${lang}`}>{content[`cta_donate_${lang}`]}</EditableText>
              </Link>
              <Link to={smartPath('/contact', edit)} className="btn-outline-inverse text-lg px-8 py-3">
                <EditableText field={`cta_contact_${lang}`}>{content[`cta_contact_${lang}`]}</EditableText>
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </div>
  )
}
