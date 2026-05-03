import { useEffect, useRef, useState } from 'react'
import { ArrowDown, ArrowUp, FolderPlus, Pencil, Plus, Trash2, Upload, X } from 'lucide-react'
import { supabase } from '../../supabase'

const BUCKET = 'peeryisroel'

/* ── Toast ───────────────────────────────────────────────── */
function Toast({ msg, type = 'info', onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3500)
    return () => clearTimeout(t)
  }, [onDone])
  const bg = type === 'error' ? 'bg-red-600' : 'bg-gray-950'
  return (
    <div className={`fixed bottom-6 left-1/2 z-[10002] -translate-x-1/2 rounded-full ${bg} px-5 py-3 text-sm font-medium text-white shadow-2xl`} dir="ltr">
      {msg}
    </div>
  )
}

function getStoragePath(publicUrl) {
  const match = publicUrl.match(/\/object\/public\/[^/]+\/(.+)$/)
  return match ? match[1] : null
}

/* ── Main ────────────────────────────────────────────────── */
export default function GalleryManager() {
  const fileRef = useRef(null)

  const [categories, setCategories]   = useState([])
  const [images, setImages]           = useState([])
  const [selectedCat, setSelectedCat] = useState(null)
  const [loading, setLoading]         = useState(true)
  const [uploading, setUploading]     = useState(false)
  const [toast, setToast]             = useState(null)

  const [newCatHe, setNewCatHe]       = useState('')
  const [newCatEn, setNewCatEn]       = useState('')
  const [editingCat, setEditingCat]   = useState(null)

  useEffect(() => { loadCategories() }, [])
  useEffect(() => { if (selectedCat) loadImages(selectedCat.id) }, [selectedCat])

  async function loadCategories() {
    setLoading(true)
    const { data, error } = await supabase
      .from('gallery_categories')
      .select('*')
      .order('order_index', { ascending: true })
    if (!error) setCategories(data || [])
    setLoading(false)
  }

  async function loadImages(catId) {
    const { data, error } = await supabase
      .from('gallery')
      .select('*')
      .eq('category_id', catId)
      .order('order_index', { ascending: true })
    if (!error) setImages(data || [])
  }

  const notify = (msg, type = 'info') => setToast({ msg, type })

  /* ── Category CRUD ── */
  async function addCategory() {
    if (!newCatHe.trim() && !newCatEn.trim()) return
    const { data, error } = await supabase
      .from('gallery_categories')
      .insert({ name_he: newCatHe.trim(), name_en: newCatEn.trim(), order_index: categories.length })
      .select()
      .single()
    if (error) { notify('Error adding category — ' + error.message, 'error'); return }
    setCategories((prev) => [...prev, data])
    setNewCatHe('')
    setNewCatEn('')
    notify('Category added')
  }

  async function saveEditCat() {
    if (!editingCat) return
    const { error } = await supabase
      .from('gallery_categories')
      .update({ name_he: editingCat.name_he, name_en: editingCat.name_en })
      .eq('id', editingCat.id)
    if (error) { notify('Error saving — ' + error.message, 'error'); return }
    setCategories((prev) => prev.map((c) => c.id === editingCat.id ? { ...c, ...editingCat } : c))
    if (selectedCat?.id === editingCat.id) setSelectedCat((s) => ({ ...s, ...editingCat }))
    setEditingCat(null)
    notify('Saved')
  }

  async function deleteCategory(cat) {
    if (!confirm(`Delete folder "${cat.name_en || cat.name_he}"? Images inside will be unlinked.`)) return
    const { error } = await supabase.from('gallery_categories').delete().eq('id', cat.id)
    if (error) { notify('Error deleting — ' + error.message, 'error'); return }
    setCategories((prev) => prev.filter((c) => c.id !== cat.id))
    if (selectedCat?.id === cat.id) { setSelectedCat(null); setImages([]) }
    notify('Folder deleted')
  }

  async function moveCat(cat, dir) {
    const idx = categories.findIndex((c) => c.id === cat.id)
    const nextIdx = idx + dir
    if (nextIdx < 0 || nextIdx >= categories.length) return
    const reordered = [...categories]
    ;[reordered[idx], reordered[nextIdx]] = [reordered[nextIdx], reordered[idx]]
    setCategories(reordered)
    await Promise.all(reordered.map((c, i) => supabase.from('gallery_categories').update({ order_index: i }).eq('id', c.id)))
  }

  /* ── Image CRUD ── */
  async function uploadImages(event) {
    if (!selectedCat) return
    const files = Array.from(event.target.files || [])
    if (!files.length) return
    setUploading(true)
    let added = 0
    let failed = 0
    for (const file of files) {
      const ext  = file.name.split('.').pop().toLowerCase()
      const path = `gallery/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const { error: upErr } = await supabase.storage.from(BUCKET).upload(path, file)
      if (upErr) { failed++; continue }
      const { data: { publicUrl } } = supabase.storage.from(BUCKET).getPublicUrl(path)
      const { data: row, error: dbErr } = await supabase
        .from('gallery')
        .insert({
          image_url: publicUrl,
          storage_path: path,
          category_id: selectedCat.id,
          category_he: selectedCat.name_he || '',
          category_en: selectedCat.name_en || '',
          order_index: images.length + added,
          alt_he: '',
          alt_en: '',
        })
        .select()
        .single()
      if (!dbErr && row) { setImages((prev) => [...prev, row]); added++ }
      else failed++
    }
    setUploading(false)
    event.target.value = ''
    if (failed > 0) notify(`${added} uploaded, ${failed} failed`, failed > 0 && added === 0 ? 'error' : 'info')
    else notify(`${added} image${added !== 1 ? 's' : ''} uploaded`)
  }

  async function deleteImage(img) {
    const storagePath = img.storage_path || getStoragePath(img.image_url)
    const { error } = await supabase.from('gallery').delete().eq('id', img.id)
    if (error) { notify('Error deleting — ' + error.message, 'error'); return }
    if (storagePath) await supabase.storage.from(BUCKET).remove([storagePath])
    setImages((prev) => prev.filter((i) => i.id !== img.id))
    notify('Image deleted')
  }

  async function moveImage(img, dir) {
    const idx = images.findIndex((i) => i.id === img.id)
    const nextIdx = idx + dir
    if (nextIdx < 0 || nextIdx >= images.length) return
    const reordered = [...images]
    ;[reordered[idx], reordered[nextIdx]] = [reordered[nextIdx], reordered[idx]]
    setImages(reordered)
    await Promise.all(reordered.map((im, i) => supabase.from('gallery').update({ order_index: i }).eq('id', im.id)))
  }

  /* ── Render ── */
  return (
    <div className="min-h-screen bg-gray-50" dir="ltr">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">

        <div className="mb-8">
          <p className="text-xs font-bold uppercase tracking-widest text-brand-gold">Content</p>
          <h1 className="mt-1 text-3xl font-bold text-brand-primary">Gallery Manager</h1>
          <p className="mt-1 text-sm text-gray-500">Add folders, upload photos, and organise by category</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-brand-primary" />
          </div>
        ) : (
          <div className="flex gap-6 items-start">

            {/* Left: categories */}
            <div className="w-64 shrink-0 rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
              <div className="border-b border-gray-100 px-4 py-3 flex items-center gap-2">
                <FolderPlus size={15} className="text-brand-primary" />
                <p className="text-sm font-bold text-brand-primary">Folders</p>
              </div>

              <ul className="divide-y divide-gray-50">
                {categories.length === 0 && (
                  <li className="px-4 py-6 text-center text-xs text-gray-400">No folders yet — add one below</li>
                )}
                {categories.map((cat, idx) => (
                  <li key={cat.id}>
                    {editingCat?.id === cat.id ? (
                      <div className="p-3 space-y-2 bg-brand-primary/5">
                        <input
                          value={editingCat.name_he}
                          onChange={(e) => setEditingCat((s) => ({ ...s, name_he: e.target.value }))}
                          placeholder="Hebrew name"
                          dir="rtl"
                          className="w-full rounded-lg border border-gray-200 px-2 py-1 text-sm focus:border-brand-primary focus:outline-none"
                        />
                        <input
                          value={editingCat.name_en}
                          onChange={(e) => setEditingCat((s) => ({ ...s, name_en: e.target.value }))}
                          placeholder="English name"
                          dir="ltr"
                          className="w-full rounded-lg border border-gray-200 px-2 py-1 text-sm focus:border-brand-primary focus:outline-none"
                        />
                        <div className="flex gap-2">
                          <button type="button" onClick={saveEditCat} className="flex-1 rounded-lg bg-brand-primary px-2 py-1 text-xs font-semibold text-white hover:bg-brand-primary-dark">Save</button>
                          <button type="button" onClick={() => setEditingCat(null)} className="flex-1 rounded-lg border border-gray-200 px-2 py-1 text-xs text-gray-500 hover:bg-gray-50">Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setSelectedCat(cat)}
                        className={[
                          'w-full flex items-center justify-between px-4 py-3 text-sm text-start transition hover:bg-gray-50 group',
                          selectedCat?.id === cat.id ? 'bg-brand-primary/[0.07] font-semibold text-brand-primary' : 'text-gray-700',
                        ].join(' ')}
                      >
                        <span className="truncate">{cat.name_en || cat.name_he}</span>
                        <span className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition shrink-0 ms-2">
                          <span role="button" tabIndex={0} onClick={(e) => { e.stopPropagation(); setEditingCat({ ...cat }) }} className="p-1 rounded hover:bg-gray-200"><Pencil size={11} /></span>
                          <span role="button" tabIndex={0} onClick={(e) => { e.stopPropagation(); moveCat(cat, -1) }} className={`p-1 rounded hover:bg-gray-200 ${idx === 0 ? 'opacity-30 pointer-events-none' : ''}`}><ArrowUp size={11} /></span>
                          <span role="button" tabIndex={0} onClick={(e) => { e.stopPropagation(); moveCat(cat, 1) }} className={`p-1 rounded hover:bg-gray-200 ${idx === categories.length - 1 ? 'opacity-30 pointer-events-none' : ''}`}><ArrowDown size={11} /></span>
                          <span role="button" tabIndex={0} onClick={(e) => { e.stopPropagation(); deleteCategory(cat) }} className="p-1 rounded hover:bg-red-100 text-red-500"><Trash2 size={11} /></span>
                        </span>
                      </button>
                    )}
                  </li>
                ))}
              </ul>

              {/* Add folder */}
              <div className="border-t border-gray-100 p-3 space-y-2">
                <input
                  value={newCatHe}
                  onChange={(e) => setNewCatHe(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addCategory()}
                  placeholder="Hebrew name"
                  dir="rtl"
                  className="w-full rounded-lg border border-gray-200 px-2 py-1.5 text-sm focus:border-brand-primary focus:outline-none"
                />
                <input
                  value={newCatEn}
                  onChange={(e) => setNewCatEn(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addCategory()}
                  placeholder="English name"
                  dir="ltr"
                  className="w-full rounded-lg border border-gray-200 px-2 py-1.5 text-sm focus:border-brand-primary focus:outline-none"
                />
                <button
                  type="button"
                  onClick={addCategory}
                  className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-brand-primary px-3 py-1.5 text-sm font-semibold text-white hover:bg-brand-primary-dark transition"
                >
                  <Plus size={14} /> Add Folder
                </button>
              </div>
            </div>

            {/* Right: images */}
            <div className="flex-1 min-w-0">
              {!selectedCat ? (
                <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-8 py-20 text-center text-gray-400">
                  <FolderPlus size={40} className="mx-auto mb-3 opacity-40" />
                  <p className="text-lg font-semibold">Select a folder on the left</p>
                  <p className="text-sm mt-1">Then upload and manage photos here</p>
                </div>
              ) : (
                <>
                  <div className="mb-5 flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-brand-primary">{selectedCat.name_en || selectedCat.name_he}</h2>
                      <p className="text-sm text-gray-400">{images.length} photo{images.length !== 1 ? 's' : ''}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => fileRef.current?.click()}
                      disabled={uploading}
                      className="inline-flex items-center gap-2 rounded-xl bg-brand-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-primary-dark disabled:opacity-50 transition"
                    >
                      <Upload size={16} /> {uploading ? 'Uploading…' : 'Upload Photos'}
                    </button>
                    <input ref={fileRef} type="file" accept="image/*" multiple onChange={uploadImages} className="hidden" />
                  </div>

                  {images.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-8 py-16 text-center text-gray-400">
                      <p className="font-semibold">No photos in this folder yet</p>
                      <p className="text-sm mt-1">Click "Upload Photos" to get started</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                      {images.map((img, idx) => (
                        <div key={img.id} className="group relative rounded-2xl overflow-hidden bg-gray-100 aspect-square shadow-sm ring-1 ring-gray-200">
                          <img src={img.image_url} alt={img.alt_en || img.alt_he || ''} className="w-full h-full object-cover" loading="lazy" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                            <div className="flex justify-end">
                              <button type="button" onClick={() => deleteImage(img)} className="rounded-full bg-red-600 p-1.5 text-white hover:bg-red-700 shadow">
                                <X size={13} />
                              </button>
                            </div>
                            <div className="flex justify-center gap-2">
                              <button type="button" onClick={() => moveImage(img, -1)} disabled={idx === 0} className="rounded-full bg-white/80 p-1.5 text-gray-700 hover:bg-white disabled:opacity-30 shadow">
                                <ArrowUp size={13} />
                              </button>
                              <button type="button" onClick={() => moveImage(img, 1)} disabled={idx === images.length - 1} className="rounded-full bg-white/80 p-1.5 text-gray-700 hover:bg-white disabled:opacity-30 shadow">
                                <ArrowDown size={13} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {toast && <Toast msg={toast.msg} type={toast.type} onDone={() => setToast(null)} />}
    </div>
  )
}
