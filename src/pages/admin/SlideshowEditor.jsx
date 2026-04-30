import { useRef } from 'react'
import { ImageIcon, Upload } from 'lucide-react'
import AdminItemControls from '../../components/AdminItemControls'
import { useEditMode } from '../../contexts/EditModeContext'
import { useEditableTable } from '../../hooks/useEditableContent'

export default function SlideshowEditor() {
  const edit = useEditMode()
  const { data: slides, loading } = useEditableTable('hero_slideshow', { orderBy: 'order_index', ascending: true })
  const fileRef = useRef(null)

  const openSlideDrawer = (slide) => {
    edit.openDrawer({
      title: 'Hero slide',
      kicker: 'Image',
      mediaTable: 'hero_slideshow',
      itemId: slide.id,
      fields: [
        { name: 'alt_he', label: 'Alt text HE' },
        { name: 'alt_en', label: 'Alt text EN' },
      ],
    })
  }

  const addSlides = (event) => {
    const files = Array.from(event.target.files || [])
    let firstItem = null
    files.forEach((file) => {
      const item = edit.addMediaFile('hero_slideshow', file)
      if (!firstItem && item) firstItem = item
    })
    if (firstItem) openSlideDrawer(firstItem)
    event.target.value = ''
  }

  return (
    <div className="page-shell bg-brand-neutral-50" dir="ltr">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-brand-gold">Admin media</p>
            <h1 className="mt-1 text-3xl font-bold text-brand-primary">Hero Slides</h1>
            <p className="mt-2 max-w-2xl text-sm text-gray-600">
              Manage the images shown in the homepage hero slideshow. Use Save in the top toolbar to publish changes.
            </p>
          </div>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-primary px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-brand-primary-dark"
          >
            <Upload size={18} /> Add slides
          </button>
          <input ref={fileRef} type="file" accept="image/*" multiple onChange={addSlides} className="hidden" />
        </div>

        {loading && (
          <div className="flex justify-center py-20">
            <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-brand-primary" />
          </div>
        )}

        {!loading && slides.length === 0 && (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center text-gray-500">
            <ImageIcon size={48} className="mx-auto mb-3 opacity-40" />
            <p className="text-lg font-semibold text-gray-600">No hero slides yet</p>
            <p className="mt-1 text-sm">Add the first image to start the homepage slideshow.</p>
          </div>
        )}

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {slides.map((slide, index) => (
            <div key={slide.id} className="relative overflow-hidden rounded-2xl bg-white shadow-md ring-1 ring-gray-100">
              <AdminItemControls
                label={`Slide ${index + 1}`}
                onEdit={() => openSlideDrawer(slide)}
                onAdd={() => fileRef.current?.click()}
                onDelete={() => edit.removeMediaItem('hero_slideshow', slide.id)}
                onMoveUp={() => edit.moveMediaItem('hero_slideshow', slide.id, -1)}
                onMoveDown={() => edit.moveMediaItem('hero_slideshow', slide.id, 1)}
                canMoveUp={index > 0}
                canMoveDown={index < slides.length - 1}
              />
              <div className="aspect-video bg-black">
                <img src={slide.image_url} alt={slide.alt_en || ''} className="h-full w-full object-contain" />
              </div>
              <div className="space-y-1 px-4 py-3 text-sm">
                <p className="font-semibold text-brand-primary">Slide {index + 1}</p>
                <p className="truncate text-gray-500">HE alt: {slide.alt_he || 'Missing'}</p>
                <p className="truncate text-gray-500">EN alt: {slide.alt_en || 'Missing'}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
