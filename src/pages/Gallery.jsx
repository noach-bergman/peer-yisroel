import { useRef, useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import EditableText from '../components/EditableText'
import PageLoading from '../components/PageLoading'
import { PhotoGallery } from '../components/PhotoGallery'
import { useEditMode } from '../contexts/EditModeContext'
import { useEditableTable, useGalleryCategories, usePageContent, usePageSeo } from '../hooks/useEditableContent'

/* ── Film strip row ─────────────────────────────────────────── */
function FilmStrip({ images, direction, speed = 30 }) {
  const [reducedMotion, setReducedMotion] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReducedMotion(mq.matches)
    const handler = (e) => setReducedMotion(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  const strip = [...images, ...images, ...images]
  const anim  = direction === 'left' ? 'scroll-left' : 'scroll-right'

  return (
    <div
      className="overflow-hidden group"
      dir="ltr"
      style={{ maskImage: 'linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)' }}
    >
      <div
        className="flex gap-3 w-max"
        style={{
          animation: reducedMotion ? 'none' : `${anim} ${speed}s linear infinite`,
          animationPlayState: 'running',
        }}
        onMouseEnter={(e) => { if (!reducedMotion) e.currentTarget.style.animationPlayState = 'paused' }}
        onMouseLeave={(e) => { if (!reducedMotion) e.currentTarget.style.animationPlayState = 'running' }}
      >
        {strip.map((img, i) => (
          <div
            key={`${img.id}-${i}`}
            className="flex-shrink-0 h-28 md:h-36 w-48 md:w-60 rounded-xl overflow-hidden shadow-md"
          >
            <img
              src={img.image_url}
              alt={img.alt_he || ''}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── Inside a category ──────────────────────────────────────── */
function CategoryView({ cat, allImages, lang, onBack, onLightbox }) {
  const catImages = allImages.filter((img) => img.category_id === cat.id)
  const cover     = catImages[0]?.image_url

  return (
    <div style={{ animation: 'cinema-fade 0.4s ease forwards' }}>
      <div className="relative h-52 md:h-72 rounded-2xl overflow-hidden mb-10 shadow-xl">
        {cover && (
          <img
            src={cover}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
            style={{ filter: 'blur(10px) brightness(0.45)', transform: 'scale(1.12)' }}
          />
        )}
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white px-4 text-center">
          <h2 className="text-4xl md:text-6xl font-bold drop-shadow-2xl" style={{ animation: 'chapter-title 0.8s ease forwards' }}>
            {cat[`name_${lang}`] || cat.name_he}
          </h2>
          <p className="mt-2 text-white/60 text-sm" style={{ animation: 'cinema-fade 0.6s ease 0.4s forwards', opacity: 0 }}>
            {catImages.length} {lang === 'he' ? 'תמונות' : 'photos'}
          </p>
        </div>
        <button
          type="button"
          onClick={onBack}
          className="absolute top-4 start-4 flex items-center gap-1.5 text-white bg-white/15 hover:bg-white/25 backdrop-blur-sm transition px-4 py-2 rounded-full text-sm font-medium"
        >
          {lang === 'he' ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
          {lang === 'he' ? 'כל הקטגוריות' : 'All Categories'}
        </button>
      </div>

      {catImages.length === 0 ? (
        <p className="text-center py-16 text-gray-400">
          {lang === 'he' ? 'אין תמונות בקטגוריה זו עדיין.' : 'No photos in this category yet.'}
        </p>
      ) : (
        <div className="columns-2 sm:columns-3 lg:columns-4 gap-3">
          {catImages.map((img, i) => (
            <div
              key={img.id}
              className="break-inside-avoid mb-3"
              style={{ animation: 'cinema-in 0.6s ease forwards', animationDelay: `${Math.min(i * 0.06, 0.55)}s`, opacity: 0 }}
            >
              <button
                type="button"
                onClick={() => onLightbox(i, catImages)}
                className="w-full rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 block group"
              >
                <img
                  src={img.image_url}
                  alt={img[`alt_${lang}`] || ''}
                  className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ── Main ───────────────────────────────────────────────────── */
export default function Gallery() {
  const { i18n } = useTranslation()
  const lang = i18n.language
  const { isEditMode } = useEditMode()
  const { content, loading: contentLoading } = usePageContent('gallery')
  const { data: images, loading: imagesLoading } = useEditableTable('gallery', { orderBy: 'order_index', ascending: true })
  const { categories, loading: categoriesLoading } = useGalleryCategories()
  const [activeCat, setActiveCat] = useState(null)
  const [fading, setFading] = useState(false)
  const [lightbox, setLightbox] = useState(null)
  const [lbTouchStart, setLbTouchStart] = useState(null)
  const contentRef = useRef(null)
  usePageSeo('gallery', content, lang)

  const openLightbox = (index, imgs) => setLightbox({ images: imgs, index })
  const closeLightbox = () => setLightbox(null)
  const lbPrev = () => setLightbox((lb) => ({ ...lb, index: (lb.index - 1 + lb.images.length) % lb.images.length }))
  const lbNext = () => setLightbox((lb) => ({ ...lb, index: (lb.index + 1) % lb.images.length }))

  useEffect(() => {
    if (!lightbox) return
    const onKey = (e) => {
      if (e.key === 'ArrowLeft') lbPrev()
      else if (e.key === 'ArrowRight') lbNext()
      else if (e.key === 'Escape') closeLightbox()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [lightbox])

  const loading = imagesLoading || categoriesLoading
  if (contentLoading || !content) return <PageLoading />

  const navigate = (cat) => {
    setFading(true)
    setLightbox(null)
    setTimeout(() => {
      setActiveCat(cat)
      setFading(false)
      if (cat !== null && contentRef.current) {
        contentRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    }, 280)
  }

  // Two interleaved strips for visual interest
  const strip1 = images.filter((_, i) => i % 2 === 0)
  const strip2 = images.filter((_, i) => i % 2 === 1)
  const categorizedCategories = categories.filter((cat) => images.some((img) => img.category_id === cat.id))
  const hasCategorizedImages = categorizedCategories.length > 0

  return (
    <div className="overflow-x-hidden">
      <div className="h-20 md:h-24 bg-brand-primary" />

      {/* ── Top film strip ── */}
      {!loading && images.length >= 2 && strip1.length > 0 && (
        <div className="pt-3 pb-1 bg-[#0e1825] overflow-hidden">
          <FilmStrip images={strip1.length < 4 ? images : strip1} direction="left" speed={35} />
        </div>
      )}

      <div ref={contentRef} className="py-2 bg-[#0e1825]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading && (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary" />
            </div>
          )}

          {/* Public + admin preview — same view */}
          {!loading && (
            <div
              style={{
                opacity: fading ? 0 : 1,
                transform: fading ? 'translateY(10px)' : 'translateY(0)',
                transition: 'opacity 0.28s ease, transform 0.28s ease',
              }}
            >
              {/* Showcase */}
              {activeCat === null && (
                <>
                  {categories.length > 0 ? (
                    hasCategorizedImages ? (
                      <PhotoGallery
                        categories={categorizedCategories}
                        images={images}
                        animationDelay={0}
                        lang={lang}
                        onNavigate={navigate}
                        kicker={(
                          <EditableText field={`story_kicker_${lang}`}>
                            {content[`story_kicker_${lang}`]}
                          </EditableText>
                        )}
                        headingPrefix={(
                          <EditableText field={`story_heading_prefix_${lang}`} className="text-white">
                            {content[`story_heading_prefix_${lang}`]}
                          </EditableText>
                        )}
                        headingHighlight={(
                          <EditableText field={`story_heading_highlight_${lang}`}>
                            {content[`story_heading_highlight_${lang}`]}
                          </EditableText>
                        )}
                      />
                    ) : (
                      <p className="text-center py-16 text-gray-400">
                        <EditableText field={`empty_${lang}`}>
                          {content[`empty_${lang}`]}
                        </EditableText>
                      </p>
                    )
                  ) : (
                    <p className="text-center py-16 text-gray-400">
                      <EditableText field={`empty_${lang}`}>
                        {content[`empty_${lang}`]}
                      </EditableText>
                    </p>
                  )}
                </>
              )}

              {/* Inside category */}
              {activeCat !== null && (
                <CategoryView cat={activeCat} allImages={images} lang={lang} onBack={() => navigate(null)} onLightbox={openLightbox} />
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Bottom film strip ── */}
      {!loading && images.length >= 2 && strip2.length > 0 && activeCat === null && (
        <div className="pt-2 pb-6 bg-[#0e1825] overflow-hidden">
          <FilmStrip images={strip2.length < 4 ? images : strip2} direction="right" speed={28} />
        </div>
      )}

      {/* Lightbox */}
      {lightbox !== null && (
        <div
          className="fixed inset-0 z-[100] bg-black/93 flex items-center justify-center"
          onClick={closeLightbox}
          onTouchStart={(e) => setLbTouchStart(e.touches[0].clientX)}
          onTouchEnd={(e) => {
            if (lbTouchStart === null) return
            const delta = lbTouchStart - e.changedTouches[0].clientX
            if (Math.abs(delta) > 50) delta > 0 ? lbNext() : lbPrev()
            setLbTouchStart(null)
          }}
        >
          <button className="absolute top-4 end-4 text-white p-3 rounded-full bg-white/10 hover:bg-white/20 transition" onClick={closeLightbox}><X size={28} /></button>
          <button className="absolute start-4 top-1/2 -translate-y-1/2 text-white p-4 sm:p-3 rounded-full bg-white/10 hover:bg-white/20 transition" onClick={(e) => { e.stopPropagation(); lbPrev() }}><ChevronLeft size={28} /></button>
          <img
            src={lightbox.images[lightbox.index]?.image_url}
            alt={lightbox.images[lightbox.index]?.[`alt_${lang}`] || ''}
            className="max-h-[90vh] max-w-[90vw] rounded-xl shadow-2xl"
            style={{ animation: 'cinema-fade 0.3s ease' }}
            onClick={(e) => e.stopPropagation()}
          />
          <button className="absolute end-4 top-1/2 -translate-y-1/2 text-white p-4 sm:p-3 rounded-full bg-white/10 hover:bg-white/20 transition" onClick={(e) => { e.stopPropagation(); lbNext() }}><ChevronRight size={28} /></button>
          <div className="absolute bottom-4 text-white/50 text-sm">{lightbox.index + 1} / {lightbox.images.length}</div>
        </div>
      )}
    </div>
  )
}
