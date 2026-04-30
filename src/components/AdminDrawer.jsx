import { X } from 'lucide-react'
import { ICON_OPTIONS } from '../content/defaultContent'
import { useEditMode } from '../contexts/EditModeContext'

function Field({ field, value, onChange }) {
  const dir = field.name.endsWith('_he') ? 'rtl' : field.name.endsWith('_en') ? 'ltr' : undefined

  if (field.type === 'select') {
    return (
      <select
        value={value || ''}
        onChange={(event) => onChange(field.name, event.target.value)}
        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand-primary focus:outline-none"
      >
        {(field.options || ICON_OPTIONS).map((option) => {
          const value = typeof option === 'string' ? option : option.value
          const label = typeof option === 'string' ? option : option.label
          return <option key={value} value={value}>{label}</option>
        })}
      </select>
    )
  }

  if (field.multiline) {
    return (
      <textarea
        dir={dir}
        value={value || ''}
        rows={4}
        onChange={(event) => onChange(field.name, event.target.value)}
        className="w-full resize-y rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand-primary focus:outline-none"
      />
    )
  }

  return (
    <input
      dir={dir}
      type={field.type || 'text'}
      value={value || ''}
      onChange={(event) => onChange(field.name, event.target.value)}
      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand-primary focus:outline-none"
    />
  )
}

export default function AdminDrawer() {
  const {
    drawer,
    closeDrawer,
    pageContent,
    globalContent,
    settings,
    gallery,
    slides,
    updateField,
    updateCollectionItem,
    updateMediaItem,
    isPreviewMode,
  } = useEditMode()

  if (!drawer || isPreviewMode) return null

  const scopeContent = drawer.scope === 'global' ? globalContent : drawer.scope === 'settings' ? settings : pageContent
  const collectionItems = drawer.collectionKey ? pageContent[drawer.collectionKey] || [] : []
  const mediaItems = drawer.mediaTable === 'gallery' ? gallery : slides
  const item = drawer.collectionKey
    ? collectionItems.find((candidate) => candidate.id === drawer.itemId)
    : drawer.mediaTable
      ? mediaItems.find((candidate) => candidate.id === drawer.itemId)
      : scopeContent

  const valueForField = (field) => {
    if (field.scope === 'global') return globalContent[field.name]
    if (field.scope === 'settings') return settings[field.name]
    if (field.scope === 'page') return pageContent[field.name]
    return item?.[field.name]
  }

  const handleChange = (field, value) => {
    const name = field.name
    if (field.scope) {
      updateField(field.scope, name, value)
      return
    }
    if (drawer.collectionKey) {
      updateCollectionItem(drawer.collectionKey, drawer.itemId, { [name]: value })
      return
    }
    if (drawer.mediaTable) {
      updateMediaItem(drawer.mediaTable, drawer.itemId, { [name]: value })
      return
    }
    updateField(drawer.scope || 'page', name, value)
  }

  return (
    <aside className="fixed end-4 top-24 z-[10000] max-h-[calc(100vh-7rem)] w-[min(26rem,calc(100vw-2rem))] overflow-y-auto rounded-2xl bg-white shadow-2xl ring-1 ring-black/10" dir="ltr">
      <div className="sticky top-0 flex items-center justify-between border-b border-gray-100 bg-white px-5 py-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-gold">{drawer.kicker || 'Editor'}</p>
          <h2 className="text-lg font-bold text-brand-primary">{drawer.title}</h2>
        </div>
        <button type="button" onClick={closeDrawer} className="rounded-full p-2 text-gray-500 hover:bg-gray-100">
          <X size={18} />
        </button>
      </div>

      <div className="space-y-6 p-5">
        {drawer.description && <p className="text-sm text-gray-500">{drawer.description}</p>}
        {(drawer.sections || [{ title: null, fields: drawer.fields || [] }]).map((section, index) => (
          <section key={section.title || index} className="space-y-3">
            {section.title && (
              <div className="border-b border-gray-100 pb-2">
                <h3 className="text-sm font-bold text-brand-primary">{section.title}</h3>
                {section.description && <p className="mt-1 text-xs text-gray-500">{section.description}</p>}
              </div>
            )}
            {section.fields.map((field) => (
              <label key={field.name} className="block">
                <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">{field.label}</span>
                <Field field={field} value={valueForField(field)} onChange={(_name, value) => handleChange(field, value)} />
              </label>
            ))}
          </section>
        ))}
      </div>
    </aside>
  )
}
