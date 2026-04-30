import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import AdminItemControls from '../components/AdminItemControls'
import AnimatedSection from '../components/AnimatedSection'
import EditableText from '../components/EditableText'
import PageLoading from '../components/PageLoading'
import { useEditMode } from '../contexts/EditModeContext'
import { useEditableTable, usePageContent, usePageSeo } from '../hooks/useEditableContent'

export default function Gallery() {
  const { i18n } = useTranslation()
  const lang = i18n.language
  const edit = useEditMode()
  const { content, loading: contentLoading } = usePageContent('gallery')
  const { data: images, loading } = useEditableTable('gallery', { orderBy: 'order_index', ascending: true })
  const [lightbox, setLightbox] = useState(null)
  const fileRef = useRef(null)
  usePageSeo('gallery', content, lang)

  if (contentLoading || !content) return <PageLoading />

  const open = (index) => setLightbox(index)
  const close = () => setLightbox(null)
  const prev = () => setLightbox((index) => (index - 1 + images.length) % images.length)
  const next = () => setLightbox((index) => (index + 1) % images.length)
  const addImages = (event) => {
    const files = Array.from(event.target.files || [])
    let firstItem = null
    files.forEach((file) => {
      const item = edit.addMediaFile('gallery', file)
      if (!firstItem && item) firstItem = item
    })
    if (firstItem) {
      edit.openDrawer({
        title: 'Gallery image',
        kicker: 'Image',
        mediaTable: 'gallery',
        itemId: firstItem.id,
        fields: [
          { name: 'alt_he', label: 'Alt text HE' },
          { name: 'alt_en', label: 'Alt text EN' },
        ],
      })
    }
    event.target.value = ''
  }

  return (
    <div className="page-shell">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedSection className="text-center mb-10">
          <EditableText field={`title_${lang}`} tag="h1" className="heading-page mb-3 block">
            {content[`title_${lang}`]}
          </EditableText>
          <EditableText field={`subtitle_${lang}`} tag="p" className="text-gray-600 text-lg block">
            {content[`subtitle_${lang}`]}
          </EditableText>
        </AnimatedSection>

        {edit.isEditMode && !edit.isPreviewMode && (
          <div className="mb-6 text-center">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="rounded-full bg-brand-primary px-5 py-2 text-sm font-semibold text-white shadow-lg hover:bg-brand-primary-dark"
            >
              Add images
            </button>
            <input ref={fileRef} type="file" accept="image/*" multiple onChange={addImages} className="hidden" />
          </div>
        )}

        {loading && (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary" />
          </div>
        )}

        {!loading && images.length === 0 && (
          <div className="text-center py-20 text-gray-500">
            <EditableText field={`empty_${lang}`} tag="p" className="text-xl block">
              {content[`empty_${lang}`]}
            </EditableText>
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {images.map((img, index) => (
            <AnimatedSection key={img.id} delay={Math.min(index * 0.05, 0.4)} variant="scaleIn">
              <div className="relative">
                <AdminItemControls
                  label="Image"
                  onEdit={() => edit.openDrawer({
                    title: 'Gallery image',
                    kicker: 'Image',
                    mediaTable: 'gallery',
                    itemId: img.id,
                    fields: [
                      { name: 'alt_he', label: 'Alt text HE' },
                      { name: 'alt_en', label: 'Alt text EN' },
                    ],
                  })}
                  onAdd={() => fileRef.current?.click()}
                  onDelete={() => edit.removeMediaItem('gallery', img.id)}
                  onMoveUp={() => edit.moveMediaItem('gallery', img.id, -1)}
                  onMoveDown={() => edit.moveMediaItem('gallery', img.id, 1)}
                  canMoveUp={index > 0}
                  canMoveDown={index < images.length - 1}
                />
                <button
                  onClick={() => open(index)}
                  className="w-full aspect-square rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 group"
                >
                  <img src={img.image_url} alt={img[`alt_${lang}`] || ''} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </button>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>

      {lightbox !== null && (
        <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center" onClick={close}>
          <button className="absolute top-4 end-4 text-white p-2 rounded-full bg-white/10 hover:bg-white/20" onClick={close}>
            <X size={28} />
          </button>
          <button className="absolute start-4 top-1/2 -translate-y-1/2 text-white p-3 rounded-full bg-white/10 hover:bg-white/20" onClick={(event) => { event.stopPropagation(); prev() }}>
            <ChevronLeft size={28} />
          </button>
          <img src={images[lightbox]?.image_url} alt={images[lightbox]?.[`alt_${lang}`] || ''} className="max-h-[90vh] max-w-[90vw] rounded-lg shadow-2xl" onClick={(event) => event.stopPropagation()} />
          <button className="absolute end-4 top-1/2 -translate-y-1/2 text-white p-3 rounded-full bg-white/10 hover:bg-white/20" onClick={(event) => { event.stopPropagation(); next() }}>
            <ChevronRight size={28} />
          </button>
          <div className="absolute bottom-4 text-white/60 text-sm">
            {lightbox + 1} / {images.length}
          </div>
        </div>
      )}
    </div>
  )
}
