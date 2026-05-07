import { useCallback, useEffect, useRef, useState } from 'react'
import { Pencil, Plus, Trash2, Upload, X } from 'lucide-react'
import { supabase, supabaseConfigured } from '../../supabase'
import { uploadToCloudinary } from '../../lib/cloudinary'

/* ── Confirm Dialog ─────────────────────────────────────── */
function ConfirmDialog({ title, message, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-[10003] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-80 mx-4 text-center">
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mx-auto mb-4">
          <Trash2 size={22} className="text-red-600" />
        </div>
        <p className="text-gray-900 font-bold text-base mb-1">{title}</p>
        <p className="text-gray-500 text-sm mb-6">{message}</p>
        <div className="flex gap-3">
          <button type="button" onClick={onCancel} className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition">Cancel</button>
          <button type="button" onClick={onConfirm} className="flex-1 rounded-xl bg-red-600 py-2.5 text-sm font-semibold text-white hover:bg-red-700 transition">Delete</button>
        </div>
      </div>
    </div>
  )
}

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

/* ── Empty form state ─────────────────────────────────────── */
const EMPTY_FORM = { title_he: '', title_en: '', body_he: '', body_en: '', date: '', image_url: '', cloudinary_public_id: '', published: true }

/* ── Main ────────────────────────────────────────────────── */
export default function UpdatesManager() {
  const fileRef = useRef(null)

  const [updates, setUpdates]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving]     = useState(false)
  const [toast, setToast]       = useState(null)
  const [confirmDialog, setConfirmDialog] = useState(null)
  const [form, setForm]         = useState(null) // null = closed, object = editing
  const [editingId, setEditingId] = useState(null)

  const notify = useCallback((msg, type = 'info') => setToast({ msg, type }), [])
  const askConfirm = useCallback((title, message, onConfirm) => setConfirmDialog({ title, message, onConfirm }), [])

  const load = useCallback(async () => {
    if (!supabaseConfigured || !supabase) {
      setLoading(false)
      notify('Supabase is not configured.', 'error')
      return
    }
    setLoading(true)
    const { data, error } = await supabase.from('updates').select('*').order('date', { ascending: false })
    if (error) notify('Error loading updates — ' + error.message, 'error')
    else setUpdates(data || [])
    setLoading(false)
  }, [notify])

  useEffect(() => { load() }, [load])

  /* ── Form helpers ── */
  function openNew() {
    setEditingId(null)
    setForm({ ...EMPTY_FORM })
  }

  function openEdit(update) {
    setEditingId(update.id)
    setForm({
      title_he: update.title_he || '',
      title_en: update.title_en || '',
      body_he:  update.body_he  || '',
      body_en:  update.body_en  || '',
      date:     update.date     || '',
      image_url: update.image_url || '',
      cloudinary_public_id: update.cloudinary_public_id || '',
      published: update.published ?? true,
    })
  }

  function closeForm() {
    setForm(null)
    setEditingId(null)
  }

  function setField(key, value) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  async function uploadImage(event) {
    const file = event.target.files?.[0]
    if (!file) return
    const maxMB = 10
    if (file.size > maxMB * 1024 * 1024) { notify(`Image must be under ${maxMB} MB`, 'error'); return }
    setUploading(true)
    try {
      const { secure_url, public_id } = await uploadToCloudinary(file, 'updates')
      setForm((f) => ({ ...f, image_url: secure_url, cloudinary_public_id: public_id }))
      notify('Image uploaded')
    } catch (err) {
      notify('Upload failed — ' + (err?.message || 'unknown error'), 'error')
    } finally {
      setUploading(false)
      event.target.value = ''
    }
  }

  async function saveForm() {
    if (!supabaseConfigured || !supabase) { notify('Supabase is not configured.', 'error'); return }
    if (!form.title_he.trim() && !form.title_en.trim()) { notify('Please add a title.', 'error'); return }
    setSaving(true)
    const payload = {
      title_he: form.title_he.trim(),
      title_en: form.title_en.trim(),
      body_he:  form.body_he.trim(),
      body_en:  form.body_en.trim(),
      date:     form.date || null,
      image_url: form.image_url || '',
      cloudinary_public_id: form.cloudinary_public_id || '',
      published: form.published,
    }

    if (editingId) {
      const { error } = await supabase.from('updates').update(payload).eq('id', editingId)
      if (error) { notify('Error saving — ' + error.message, 'error'); setSaving(false); return }
      setUpdates((prev) => prev.map((u) => u.id === editingId ? { ...u, ...payload } : u))
      notify('Saved')
    } else {
      const { data, error } = await supabase.from('updates').insert(payload).select().single()
      if (error) { notify('Error adding — ' + error.message, 'error'); setSaving(false); return }
      setUpdates((prev) => [data, ...prev])
      notify('Update added')
    }
    setSaving(false)
    closeForm()
  }

  function deleteUpdate(update) {
    askConfirm(
      `Delete "${update.title_en || update.title_he || 'this update'}"?`,
      'This action cannot be undone.',
      async () => {
        setConfirmDialog(null)
        const { error } = await supabase.from('updates').delete().eq('id', update.id)
        if (error) { notify('Error deleting — ' + error.message, 'error'); return }
        setUpdates((prev) => prev.filter((u) => u.id !== update.id))
        notify('Deleted')
      }
    )
  }

  /* ── Render ── */
  return (
    <div className="min-h-screen bg-gray-50 p-6" dir="ltr">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Updates Manager</h1>
            <p className="text-sm text-gray-500 mt-0.5">Manage news and updates shown on the public updates page</p>
          </div>
          <button
            type="button"
            onClick={openNew}
            className="flex items-center gap-2 rounded-xl bg-brand-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-primary-dark transition"
          >
            <Plus size={16} />
            New Update
          </button>
        </div>

        {/* List */}
        {loading && (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-primary" />
          </div>
        )}

        {!loading && updates.length === 0 && (
          <div className="text-center py-20 text-gray-400">
            <p className="text-lg font-medium">No updates yet</p>
            <p className="text-sm mt-1">Click "New Update" to add the first one.</p>
          </div>
        )}

        {!loading && updates.length > 0 && (
          <div className="space-y-3">
            {updates.map((update) => (
              <div key={update.id} className="flex items-start gap-4 bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
                {update.image_url && (
                  <img src={update.image_url} alt="" className="w-20 h-16 object-cover rounded-xl flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className={`inline-block w-2 h-2 rounded-full flex-shrink-0 ${update.published ? 'bg-green-500' : 'bg-gray-300'}`} />
                    <p className="font-semibold text-gray-900 text-sm truncate">{update.title_en || update.title_he}</p>
                  </div>
                  {update.date && <p className="text-xs text-gray-400">{update.date}</p>}
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">{update.body_en || update.body_he}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button type="button" onClick={() => openEdit(update)} className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 transition" title="Edit">
                    <Pencil size={15} />
                  </button>
                  <button type="button" onClick={() => deleteUpdate(update)} className="rounded-lg p-2 text-red-500 hover:bg-red-50 transition" title="Delete">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Form panel */}
      {form !== null && (
        <div className="fixed inset-0 z-[10001] flex items-start justify-end bg-black/40 backdrop-blur-sm" onClick={closeForm}>
          <div
            className="relative h-full w-full max-w-lg bg-white shadow-2xl overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10">
              <h2 className="font-bold text-gray-900">{editingId ? 'Edit Update' : 'New Update'}</h2>
              <button type="button" onClick={closeForm} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 transition">
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Image */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Image (optional)</label>
                {form.image_url ? (
                  <div className="relative group w-full aspect-video rounded-xl overflow-hidden border border-gray-200">
                    <img src={form.image_url} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, image_url: '', cloudinary_public_id: '' }))}
                      className="absolute top-2 end-2 rounded-full bg-black/60 p-1 text-white opacity-0 group-hover:opacity-100 transition"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    disabled={uploading}
                    className="flex items-center gap-2 w-full justify-center rounded-xl border-2 border-dashed border-gray-200 py-6 text-sm text-gray-400 hover:border-brand-primary hover:text-brand-primary transition disabled:opacity-50"
                  >
                    <Upload size={16} />
                    {uploading ? 'Uploading…' : 'Upload image'}
                  </button>
                )}
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={uploadImage} />
              </div>

              {/* Date */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Date</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => setField('date', e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
                />
              </div>

              {/* Title */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Title (Hebrew)</label>
                  <input
                    type="text"
                    dir="rtl"
                    value={form.title_he}
                    onChange={(e) => setField('title_he', e.target.value)}
                    placeholder="כותרת בעברית"
                    className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Title (English)</label>
                  <input
                    type="text"
                    value={form.title_en}
                    onChange={(e) => setField('title_en', e.target.value)}
                    placeholder="Title in English"
                    className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
                  />
                </div>
              </div>

              {/* Body */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Content (Hebrew)</label>
                <textarea
                  dir="rtl"
                  rows={5}
                  value={form.body_he}
                  onChange={(e) => setField('body_he', e.target.value)}
                  placeholder="תוכן בעברית..."
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Content (English)</label>
                <textarea
                  rows={5}
                  value={form.body_en}
                  onChange={(e) => setField('body_en', e.target.value)}
                  placeholder="Content in English..."
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
                />
              </div>

              {/* Published */}
              <label className="flex items-center gap-3 cursor-pointer">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={form.published}
                    onChange={(e) => setField('published', e.target.checked)}
                    className="sr-only"
                  />
                  <div className={`w-10 h-6 rounded-full transition ${form.published ? 'bg-brand-primary' : 'bg-gray-200'}`} />
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${form.published ? 'left-5' : 'left-1'}`} />
                </div>
                <span className="text-sm font-medium text-gray-700">Published (visible to public)</span>
              </label>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={closeForm} className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition">
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={saveForm}
                  disabled={saving || uploading}
                  className="flex-1 rounded-xl bg-brand-primary py-2.5 text-sm font-semibold text-white hover:bg-brand-primary-dark transition disabled:opacity-50"
                >
                  {saving ? 'Saving…' : editingId ? 'Save Changes' : 'Add Update'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {confirmDialog && (
        <ConfirmDialog
          title={confirmDialog.title}
          message={confirmDialog.message}
          onConfirm={confirmDialog.onConfirm}
          onCancel={() => setConfirmDialog(null)}
        />
      )}
      {toast && <Toast msg={toast.msg} type={toast.type} onDone={() => setToast(null)} />}
    </div>
  )
}
