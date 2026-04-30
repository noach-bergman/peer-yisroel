import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useEditMode } from '../contexts/EditModeContext'
import { useEditableTable } from '../hooks/useEditableContent'
import AdminItemControls from './AdminItemControls'

export default function HeroSlideshow({ children }) {
  const { i18n } = useTranslation()
  const { data: slides, loading } = useEditableTable('hero_slideshow', { orderBy: 'created_at', ascending: false })
  const edit = useEditMode()
  const [current, setCurrent] = useState(0)
  const fileRef = useRef(null)
  const lang = i18n.language

  useEffect(() => {
    if (slides.length <= 1) return undefined
    const timer = setInterval(() => setCurrent((index) => (index + 1) % slides.length), 5000)
    return () => clearInterval(timer)
  }, [slides.length])

  const addSlide = (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    const item = edit.addMediaFile('hero_slideshow', file)
    if (item) {
      edit.openDrawer({
        title: 'Hero slide',
        kicker: 'Image',
        mediaTable: 'hero_slideshow',
        itemId: item.id,
        fields: [
          { name: 'alt_he', label: 'Alt text HE' },
          { name: 'alt_en', label: 'Alt text EN' },
        ],
      })
    }
    event.target.value = ''
  }

  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      {loading ? (
        <div className="absolute inset-0 bg-brand-primary" />
      ) : slides.length > 0
        ? (
          <div dir="ltr" className="absolute inset-0 overflow-hidden">
            <div
              className="flex h-full transition-transform duration-1000 ease-in-out"
              style={{
                width: `${slides.length * 100}%`,
                transform: `translateX(-${current * (100 / slides.length)}%)`,
              }}
            >
              {slides.map((slide, index) => (
                <div
                  key={slide.id}
                  className="relative h-full flex-shrink-0 flex items-center justify-center bg-black"
                  style={{ width: `${100 / slides.length}%` }}
                >
                  <img src={slide.image_url} alt={slide[`alt_${lang}`] || ''} className="w-full h-full object-contain" />
                  <AdminItemControls
                    label="Slide"
                    onEdit={() => edit.openDrawer({
                      title: 'Hero slide',
                      kicker: 'Image',
                      mediaTable: 'hero_slideshow',
                      itemId: slide.id,
                      fields: [
                        { name: 'alt_he', label: 'Alt text HE' },
                        { name: 'alt_en', label: 'Alt text EN' },
                      ],
                    })}
                    onAdd={() => fileRef.current?.click()}
                    onDelete={() => edit.removeMediaItem('hero_slideshow', slide.id)}
                    onMoveUp={() => edit.moveMediaItem('hero_slideshow', slide.id, -1)}
                    onMoveDown={() => edit.moveMediaItem('hero_slideshow', slide.id, 1)}
                    canMoveUp={index > 0}
                    canMoveDown={index < slides.length - 1}
                  />
                </div>
              ))}
            </div>
          </div>
        )
        : (
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ background: 'linear-gradient(135deg, #2c5f7a 0%, #3d7a9a 50%, #1e4257 100%)' }}
          />
        )}

      {edit.isEditMode && !edit.isPreviewMode && slides.length === 0 && (
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="absolute top-24 end-4 z-[80] rounded-full bg-white px-4 py-2 text-sm font-semibold text-brand-primary shadow-lg"
        >
          Add hero image
        </button>
      )}
      <input ref={fileRef} type="file" accept="image/*" onChange={addSlide} className="hidden" />

      <div className="absolute inset-0 z-[1] bg-black/45 pointer-events-none" />
      <div className="absolute inset-0 z-[1] bg-brand-primary/20 pointer-events-none" />

      {slides.length > 1 && (
        <div className="absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrent(index)}
              className={`h-3 rounded-full transition-all duration-300 ${index === current ? 'bg-brand-gold w-8' : 'bg-white/50 hover:bg-white/75 w-3'}`}
              aria-label={`Slide ${index + 1}`}
            />
          ))}
        </div>
      )}

      <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto">
        {children}
      </div>
    </section>
  )
}
