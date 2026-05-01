import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ArrowDown, ArrowUp, ChevronLeft, ChevronRight, Plus, Trash2, X } from 'lucide-react'
import AdminItemControls from '../components/AdminItemControls'
import EditableText from '../components/EditableText'
import PageHero from '../components/PageHero'
import PageLoading from '../components/PageLoading'
import { useEditMode } from '../contexts/EditModeContext'
import { useEditableTable, useGalleryCategories, usePageContent, usePageSeo } from '../hooks/useEditableContent'

const btnBase = 'grid h-8 w-8 place-items-center rounded-full bg-brand-primary text-white shadow ring-1 ring-white/40 transition hover:bg-brand-primary-dark disabled:opacity-30'
const btnRed  = 'grid h-8 w-8 place-items-center rounded-full bg-red-500 text-white shadow ring-1 ring-white/40 transition hover:bg-red-600'

/* ── Film strip row ─────────────────────────────────────────── */
function FilmStrip({ images, direction, speed = 30 }) {
  // triple the array so the loop never shows a gap even on wide screens
  const strip = [...images, ...images, ...images]
  const anim  = direction === 'left' ? 'scroll-left' : 'scroll-right'

  return (
    <div
      className="overflow-hidden group"
      style={{ maskImage: 'linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)' }}
    >
      <div
        className="flex gap-3 w-max"
        style={{
          animation: `${anim} ${speed}s linear infinite`,
          animationPlayState: 'running',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.animationPlayState = 'paused')}
        onMouseLeave={(e) => (e.currentTarget.style.animationPlayState = 'running')}
      >
        {strip.map((img, i) => (
          <div
            key={`${img.id}-${i}`}
            className="flex-shrink-0 h-36 md:h-44 w-56 md:w-72 rounded-xl overflow-hidden shadow-md"
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

/* ── Category showcase card ─────────────────────────────────── */
function ShowcaseCard({ cat, images, lang, onClick, delay }) {
  const catImages = images.filter((img) => img.category_id === cat.id)
  const cover     = catImages[0]?.image_url

  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative w-full overflow-hidden rounded-2xl shadow-xl focus:outline-none"
      style={{ aspectRatio: '4/3', animation: `cinema-in 0.7s ease forwards`, animationDelay: `${delay}s`, opacity: 0 }}
    >
      {cover
        ? <img src={cover} alt="" className="absolute inset-0 w-full h-full object-cover scale-105 group-hover:scale-110 transition-transform duration-700" />
        : <div className="absolute inset-0 bg-gradient-to-br from-brand-primary to-[#0e2540]" />
      }
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent group-hover:from-black/55 transition-all duration-500" />
      <div className="absolute bottom-0 inset-x-0 p-5 text-start text-white">
        <p className="text-2xl md:text-3xl font-bold leading-tight drop-shadow-lg">{cat[`name_${lang}`] || cat.name_he}</p>
        {cat.name_en && lang === 'he' && <p className="text-sm text-white/50 mt-0.5 font-light">{cat.name_en}</p>}
        <p className="text-sm text-white/60 mt-1">{catImages.length} {lang === 'he' ? 'תמונות' : 'photos'}</p>
      </div>
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <span className="bg-brand-gold text-white font-bold text-sm px-5 py-2.5 rounded-full shadow-xl">
          {lang === 'he' ? '← כנס לצפייה' : 'View Gallery →'}
        </span>
      </div>
      <div className="absolute top-3 end-3 bg-black/50 backdrop-blur-sm text-white text-xs font-semibold px-2.5 py-1 rounded-full">
        {catImages.length}
      </div>
    </button>
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

/* ── Admin category manager ─────────────────────────────────── */
function CategoryManager({ categories, lang }) {
  const edit = useEditMode()
  const [newHe, setNewHe] = useState('')
  const [newEn, setNewEn] = useState('')

  const handleAdd = () => {
    if (!newHe.trim() && !newEn.trim()) return
    const item = edit.addCategory()
    edit.updateCategory(item.id, { name_he: newHe.trim(), name_en: newEn.trim() })
    setNewHe(''); setNewEn('')
  }

  return (
    <div className="mb-8 rounded-2xl border border-brand-gold/30 bg-white p-5 shadow-sm">
      <h3 className="text-sm font-bold text-brand-primary mb-4 uppercase tracking-wide">
        {lang === 'he' ? 'ניהול קטגוריות' : 'Manage Categories'}
      </h3>
      {categories.length === 0 && <p className="text-sm text-gray-400 mb-4">{lang === 'he' ? 'אין קטגוריות עדיין.' : 'No categories yet.'}</p>}
      <div className="space-y-2 mb-4">
        {categories.map((cat, index) => (
          <div key={cat.id} className="flex items-center gap-2">
            <input value={cat.name_he} onChange={(e) => edit.updateCategory(cat.id, { name_he: e.target.value })} placeholder="שם בעברית" dir="rtl" className="flex-1 rounded-lg border border-gray-200 px-3 py-1.5 text-sm focus:border-brand-primary focus:outline-none" />
            <input value={cat.name_en} onChange={(e) => edit.updateCategory(cat.id, { name_en: e.target.value })} placeholder="English name" className="flex-1 rounded-lg border border-gray-200 px-3 py-1.5 text-sm focus:border-brand-primary focus:outline-none" />
            <button type="button" onClick={() => edit.moveCategory(cat.id, -1)} disabled={index === 0} className={btnBase}><ArrowUp size={13} /></button>
            <button type="button" onClick={() => edit.moveCategory(cat.id, 1)} disabled={index === categories.length - 1} className={btnBase}><ArrowDown size={13} /></button>
            <button type="button" onClick={() => edit.removeCategory(cat.id)} className={btnRed}><Trash2 size={13} /></button>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2 border-t border-gray-100 pt-4">
        <input value={newHe} onChange={(e) => setNewHe(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAdd()} placeholder="שם חדש בעברית" dir="rtl" className="flex-1 rounded-lg border border-gray-200 px-3 py-1.5 text-sm focus:border-brand-primary focus:outline-none" />
        <input value={newEn} onChange={(e) => setNewEn(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAdd()} placeholder="New English name" className="flex-1 rounded-lg border border-gray-200 px-3 py-1.5 text-sm focus:border-brand-primary focus:outline-none" />
        <button type="button" onClick={handleAdd} className="flex items-center gap-1.5 rounded-full bg-brand-gold px-4 py-1.5 text-sm font-semibold text-white shadow hover:bg-brand-gold/80 transition whitespace-nowrap">
          <Plus size={14} />{lang === 'he' ? 'הוסף' : 'Add'}
        </button>
      </div>
    </div>
  )
}

/* ── Main ───────────────────────────────────────────────────── */
export default function Gallery() {
  const { i18n } = useTranslation()
  const lang = i18n.language
  const edit = useEditMode()
  const { content, loading: contentLoading } = usePageContent('gallery')
  const { data: images, loading: imagesLoading } = useEditableTable('gallery', { orderBy: 'order_index', ascending: true })
  const { categories, loading: categoriesLoading } = useGalleryCategories()
  const [activeCat, setActiveCat] = useState(null)
  const [fading, setFading] = useState(false)
  const [lightbox, setLightbox] = useState(null)
  const fileRef = useRef(null)
  usePageSeo('gallery', content, lang)

  const loading = imagesLoading || categoriesLoading
  if (contentLoading || !content) return <PageLoading />

  const navigate = (cat) => {
    setFading(true)
    setLightbox(null)
    setTimeout(() => { setActiveCat(cat); setFading(false) }, 280)
  }

  const openLightbox = (index, imgs) => setLightbox({ images: imgs, index })
  const closeLightbox = () => setLightbox(null)
  const lbPrev = () => setLightbox((lb) => ({ ...lb, index: (lb.index - 1 + lb.images.length) % lb.images.length }))
  const lbNext = () => setLightbox((lb) => ({ ...lb, index: (lb.index + 1) % lb.images.length }))

  const categoryOptions = [
    { value: '', label: lang === 'he' ? '— ללא קטגוריה —' : '— No category —' },
    ...categories.map((c) => ({ value: c.id, label: c.name_he && c.name_en ? `${c.name_he} / ${c.name_en}` : c.name_he || c.name_en })),
  ]
  const drawerFields = [
    { name: 'alt_he', label: 'Alt text HE' },
    { name: 'alt_en', label: 'Alt text EN' },
    { name: 'category_id', label: lang === 'he' ? 'קטגוריה' : 'Category', type: 'select', options: categoryOptions },
  ]

  const addImages = (event) => {
    const files = Array.from(event.target.files || [])
    let first = null
    files.forEach((file) => { const item = edit.addMediaFile('gallery', file); if (!first && item) first = item })
    if (first) edit.openDrawer({ title: 'Gallery image', kicker: 'Image', mediaTable: 'gallery', itemId: first.id, fields: drawerFields })
    event.target.value = ''
  }

  // Two interleaved strips for visual interest
  const strip1 = images.filter((_, i) => i % 2 === 0)
  const strip2 = images.filter((_, i) => i % 2 === 1)

  return (
    <div>
      <PageHero>
        <EditableText field={`title_${lang}`} tag="h1" className="text-4xl md:text-6xl font-bold text-white font-hebrew leading-tight mb-4 drop-shadow-lg block">
          {content[`title_${lang}`]}
        </EditableText>
        <div className="w-20 h-1 bg-brand-gold mx-auto rounded-full mb-4" />
        <EditableText field={`subtitle_${lang}`} tag="p" className="text-white/80 text-lg md:text-xl block">
          {content[`subtitle_${lang}`]}
        </EditableText>
      </PageHero>

      {/* ── Scrolling film strips (always visible, full-bleed) ── */}
      {!loading && images.length >= 2 && (
        <div className="py-8 space-y-3 bg-[#0e1825] overflow-hidden">
          {strip1.length > 0 && <FilmStrip images={strip1.length < 4 ? images : strip1} direction="left"  speed={35} />}
          {strip2.length > 0 && <FilmStrip images={strip2.length < 4 ? images : strip2} direction="right" speed={28} />}
        </div>
      )}

      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Admin tools */}
          {edit.isEditMode && !edit.isPreviewMode && <CategoryManager categories={categories} lang={lang} />}
          {edit.isEditMode && !edit.isPreviewMode && (
            <div className="mb-6 text-center">
              <button type="button" onClick={() => fileRef.current?.click()} className="rounded-full bg-brand-primary px-5 py-2 text-sm font-semibold text-white shadow-lg hover:bg-brand-primary-dark">
                {lang === 'he' ? 'הוסף תמונות' : 'Add images'}
              </button>
              <input ref={fileRef} type="file" accept="image/*" multiple onChange={addImages} className="hidden" />
            </div>
          )}

          {loading && (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary" />
            </div>
          )}

          {/* Admin flat view */}
          {!loading && edit.isEditMode && images.length > 0 && (
            <div className="columns-2 sm:columns-3 lg:columns-4 gap-3">
              {images.map((img, index) => (
                <div key={img.id} className="break-inside-avoid mb-3">
                  <div className="relative">
                    <AdminItemControls
                      label="Image"
                      onEdit={() => edit.openDrawer({ title: 'Gallery image', kicker: 'Image', mediaTable: 'gallery', itemId: img.id, fields: drawerFields })}
                      onAdd={() => fileRef.current?.click()}
                      onDelete={() => edit.removeMediaItem('gallery', img.id)}
                      onMoveUp={() => edit.moveMediaItem('gallery', img.id, -1)}
                      onMoveDown={() => edit.moveMediaItem('gallery', img.id, 1)}
                      canMoveUp={index > 0}
                      canMoveDown={index < images.length - 1}
                    />
                    <img src={img.image_url} alt={img[`alt_${lang}`] || ''} className="w-full h-auto rounded-xl shadow-md" loading="lazy" />
                    {img.category_id && (
                      <div className="absolute bottom-2 start-2 bg-brand-gold/90 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
                        {categories.find((c) => c.id === img.category_id)?.[`name_${lang}`] || '—'}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Public view */}
          {!loading && !edit.isEditMode && (
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
                  {/* Section title */}
                  {categories.length > 0 && (
                    <div className="text-center mb-10" style={{ animation: 'cinema-fade 0.8s ease forwards' }}>
                      <p className="text-sm font-semibold text-brand-gold uppercase tracking-widest mb-2">
                        {lang === 'he' ? 'בחר נושא' : 'Explore by topic'}
                      </p>
                      <h2 className="text-3xl md:text-4xl font-bold text-brand-primary">
                        {lang === 'he' ? 'מה אנחנו עושים' : 'What We Do'}
                      </h2>
                    </div>
                  )}

                  {categories.length === 0 ? (
                    <div className="columns-2 sm:columns-3 lg:columns-4 gap-3">
                      {images.map((img, i) => (
                        <div key={img.id} className="break-inside-avoid mb-3" style={{ animation: 'cinema-in 0.6s ease forwards', animationDelay: `${Math.min(i * 0.05, 0.4)}s`, opacity: 0 }}>
                          <button type="button" onClick={() => openLightbox(i, images)} className="w-full rounded-xl overflow-hidden shadow-md hover:shadow-xl group block">
                            <img src={img.image_url} alt={img[`alt_${lang}`] || ''} className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                      {categories.map((cat, i) => (
                        <ShowcaseCard key={cat.id} cat={cat} images={images} lang={lang} onClick={() => navigate(cat)} delay={i * 0.1} />
                      ))}
                    </div>
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

      {/* Lightbox */}
      {lightbox !== null && (
        <div className="fixed inset-0 z-[100] bg-black/93 flex items-center justify-center" onClick={closeLightbox}>
          <button className="absolute top-4 end-4 text-white p-2 rounded-full bg-white/10 hover:bg-white/20 transition" onClick={closeLightbox}><X size={28} /></button>
          <button className="absolute start-4 top-1/2 -translate-y-1/2 text-white p-3 rounded-full bg-white/10 hover:bg-white/20 transition" onClick={(e) => { e.stopPropagation(); lbPrev() }}><ChevronLeft size={28} /></button>
          <img
            src={lightbox.images[lightbox.index]?.image_url}
            alt={lightbox.images[lightbox.index]?.[`alt_${lang}`] || ''}
            className="max-h-[90vh] max-w-[90vw] rounded-xl shadow-2xl"
            style={{ animation: 'cinema-fade 0.3s ease' }}
            onClick={(e) => e.stopPropagation()}
          />
          <button className="absolute end-4 top-1/2 -translate-y-1/2 text-white p-3 rounded-full bg-white/10 hover:bg-white/20 transition" onClick={(e) => { e.stopPropagation(); lbNext() }}><ChevronRight size={28} /></button>
          <div className="absolute bottom-4 text-white/50 text-sm">{lightbox.index + 1} / {lightbox.images.length}</div>
        </div>
      )}
    </div>
  )
}
