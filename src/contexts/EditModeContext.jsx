import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { supabase, supabaseConfigured } from '../supabase'
import {
  DEFAULT_GLOBAL_CONTENT,
  DEFAULT_PAGE_CONTENT,
  DEFAULT_SETTINGS,
  createId,
  normalizeGlobalContent,
  normalizePageContent,
  normalizeSettings,
} from '../content/defaultContent'

const MAX_IMAGE_SIZE = 8 * 1024 * 1024
const IMAGE_BUCKET = 'peeryisroel'

const EditModeContext = createContext({
  isEditMode: false,
  isPreviewMode: false,
  pageKey: null,
  editLanguage: 'he',
  pageContent: {},
  globalContent: DEFAULT_GLOBAL_CONTENT,
  settings: DEFAULT_SETTINGS,
  gallery: [],
  slides: [],
  categories: [],
  loading: false,
  saving: false,
  isDirty: false,
  drawer: null,
  toast: null,
  getField: (_scope, _field, fallback) => fallback,
  hasField: () => true,
  updateField: () => {},
  updateCollectionItem: () => {},
  addCollectionItem: () => {},
  removeCollectionItem: () => {},
  moveCollectionItem: () => {},
  openDrawer: () => {},
  closeDrawer: () => {},
  setEditLanguage: () => {},
  setPreviewMode: () => {},
  saveAll: async () => {},
  discard: () => {},
  undoDelete: () => {},
  addMediaFile: () => {},
  updateMediaItem: () => {},
  removeMediaItem: () => {},
  moveMediaItem: () => {},
  addCategory: () => {},
  updateCategory: () => {},
  removeCategory: () => {},
  moveCategory: () => {},
})

function stableJson(value) {
  return JSON.stringify(value)
}

function isPresent(value) {
  return value !== undefined && value !== null && (typeof value !== 'string' || value.trim() !== '')
}

function safeContent(row, pageKey) {
  return normalizePageContent(pageKey, row)
}

async function fetchContentRow(key) {
  if (!supabaseConfigured || !supabase) return null
  const { data, error } = await supabase.from('site_content').select('*').eq('key', key).maybeSingle()
  if (error && error.code !== 'PGRST116') throw error
  return data || null
}

async function fetchTable(table, orderBy, ascending = true) {
  if (!supabaseConfigured || !supabase) return []
  const { data, error } = await supabase.from(table).select('*').order(orderBy, { ascending })
  if (error) throw error
  return data || []
}

function normalizeMediaRows(rows, type) {
  return rows.map((row, index) => ({
    ...row,
    id: row.id || `${type}-${index}`,
    order_index: row.order_index ?? index,
    alt_he: row.alt_he || '',
    alt_en: row.alt_en || '',
    category_he: row.category_he || '',
    category_en: row.category_en || '',
    category_id: row.category_id || null,
    _state: 'clean',
  }))
}

function normalizeCategories(rows) {
  return rows.map((row, index) => ({
    id: row.id,
    name_he: row.name_he || '',
    name_en: row.name_en || '',
    order_index: row.order_index ?? index,
  }))
}

function withOrder(items) {
  return items.map((item, index) => ({ ...item, order_index: index }))
}

function validateImageFile(file) {
  if (!file.type.startsWith('image/')) return 'Please choose an image file.'
  if (file.size > MAX_IMAGE_SIZE) return 'Image files must be under 8MB.'
  return null
}

async function uploadMediaFile(file, folder, index) {
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
  const storagePath = `${folder}/${Date.now()}_${index}_${safeName}`
  const { error } = await supabase.storage.from(IMAGE_BUCKET).upload(storagePath, file)
  if (error) throw error
  const { data } = supabase.storage.from(IMAGE_BUCKET).getPublicUrl(storagePath)
  return { storagePath, publicUrl: data.publicUrl }
}

export function useEditMode() {
  return useContext(EditModeContext)
}

export function EditModeProvider({ children, pageKey, language = 'he', onLanguageChange }) {
  const [editLanguage, setEditLanguageState] = useState(language)
  const [isPreviewMode, setPreviewMode] = useState(false)
  const [pageContent, setPageContent] = useState(DEFAULT_PAGE_CONTENT[pageKey] || {})
  const [globalContent, setGlobalContent] = useState(DEFAULT_GLOBAL_CONTENT)
  const [settings, setSettings] = useState(DEFAULT_SETTINGS)
  const [gallery, setGallery] = useState([])
  const [slides, setSlides] = useState([])
  const [categories, setCategories] = useState([])
  const [savedSnapshot, setSavedSnapshot] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [drawer, setDrawer] = useState(null)
  const [toast, setToast] = useState(null)
  const [error, setError] = useState(null)

  const setEditLanguage = useCallback((next) => {
    setEditLanguageState(next)
    onLanguageChange?.(next)
  }, [onLanguageChange])

  useEffect(() => {
    setEditLanguageState(language)
  }, [language])

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const [pageRow, globalRow, settingsRow, galleryRows, slideRows, categoryRows] = await Promise.all([
          fetchContentRow(pageKey),
          fetchContentRow('global'),
          fetchContentRow('settings'),
          fetchTable('gallery', 'order_index', true),
          fetchTable('hero_slideshow', 'order_index', true).catch(() => fetchTable('hero_slideshow', 'created_at', false)),
          fetchTable('gallery_categories', 'order_index', true).catch(() => []),
        ])
        if (cancelled) return
        const nextPageContent = safeContent(pageRow, pageKey)
        const nextGlobalContent = normalizeGlobalContent(globalRow)
        const nextSettings = normalizeSettings(settingsRow)
        const nextGallery = normalizeMediaRows(galleryRows, 'gallery')
        const nextSlides = normalizeMediaRows(slideRows, 'slide')
        const nextCategories = normalizeCategories(categoryRows)
        setPageContent(nextPageContent)
        setGlobalContent(nextGlobalContent)
        setSettings(nextSettings)
        setGallery(nextGallery)
        setSlides(nextSlides)
        setCategories(nextCategories)
        setSavedSnapshot({
          pageContent: nextPageContent,
          globalContent: nextGlobalContent,
          settings: nextSettings,
          gallery: nextGallery,
          slides: nextSlides,
          categories: nextCategories,
        })
      } catch (err) {
        if (!cancelled) setError(err.message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [pageKey])

  const currentSnapshot = useMemo(() => ({
    pageContent,
    globalContent,
    settings,
    gallery,
    slides,
    categories,
  }), [pageContent, globalContent, settings, gallery, slides, categories])

  const isDirty = savedSnapshot ? stableJson(currentSnapshot) !== stableJson(savedSnapshot) : false

  useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (!isDirty) return
      event.preventDefault()
      event.returnValue = ''
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [isDirty])

  const getBucket = useCallback((scope) => {
    if (scope === 'global') return globalContent
    if (scope === 'settings') return settings
    return pageContent
  }, [globalContent, pageContent, settings])

  const hasField = useCallback((scope, field) => {
    const bucket = getBucket(scope)
    return isPresent(bucket[field])
  }, [getBucket])

  const getField = useCallback((scope, field, fallback = '') => {
    const bucket = getBucket(scope)
    const value = bucket[field]
    return isPresent(value) ? value : fallback
  }, [getBucket])

  const updateField = useCallback((scope, field, value) => {
    const setter = scope === 'global' ? setGlobalContent : scope === 'settings' ? setSettings : setPageContent
    setter((prev) => ({ ...prev, [field]: value }))
  }, [])

  const updateCollectionItem = useCallback((collectionKey, itemId, patch) => {
    setPageContent((prev) => ({
      ...prev,
      [collectionKey]: (prev[collectionKey] || []).map((item) => (
        item.id === itemId ? { ...item, ...patch } : item
      )),
    }))
  }, [])

  const addCollectionItem = useCallback((collectionKey, seed = {}) => {
    const item = {
      id: createId(collectionKey),
      ...seed,
    }
    setPageContent((prev) => ({
      ...prev,
      [collectionKey]: [...(prev[collectionKey] || []), item],
    }))
    return item
  }, [])

  const removeCollectionItem = useCallback((collectionKey, itemId) => {
    const item = (pageContent[collectionKey] || []).find((candidate) => candidate.id === itemId)
    if (!item || !window.confirm('Delete this item?')) return
    setPageContent((prev) => ({
      ...prev,
      [collectionKey]: (prev[collectionKey] || []).filter((candidate) => candidate.id !== itemId),
    }))
    setToast({
      message: 'Item deleted.',
      actionLabel: 'Undo',
      action: () => {
        setPageContent((prev) => ({
          ...prev,
          [collectionKey]: [...(prev[collectionKey] || []), item],
        }))
        setToast(null)
      },
    })
  }, [pageContent])

  const moveCollectionItem = useCallback((collectionKey, itemId, direction) => {
    setPageContent((prev) => {
      const items = [...(prev[collectionKey] || [])]
      const index = items.findIndex((item) => item.id === itemId)
      const swap = index + direction
      if (index < 0 || swap < 0 || swap >= items.length) return prev
      ;[items[index], items[swap]] = [items[swap], items[index]]
      return { ...prev, [collectionKey]: items }
    })
  }, [])

  const openDrawer = useCallback((config) => {
    setDrawer(config)
  }, [])

  const closeDrawer = useCallback(() => setDrawer(null), [])

  // Category CRUD
  const addCategory = useCallback(() => {
    const item = {
      id: `temp-${createId('category')}`,
      name_he: '',
      name_en: '',
      order_index: categories.length,
      _state: 'new',
    }
    setCategories((prev) => [...prev, item])
    return item
  }, [categories.length])

  const updateCategory = useCallback((id, patch) => {
    setCategories((prev) => prev.map((cat) => (
      cat.id === id ? { ...cat, ...patch, _state: cat._state === 'new' ? 'new' : 'dirty' } : cat
    )))
  }, [])

  const removeCategory = useCallback((id) => {
    if (!window.confirm('Delete this category? Images in this category will become uncategorized.')) return
    setCategories((prev) => withOrder(prev.filter((cat) => cat.id !== id)))
    // Clear category_id from gallery images that referenced this category
    setGallery((prev) => prev.map((img) => (
      img.category_id === id ? { ...img, category_id: null, _state: img._state === 'new' ? 'new' : 'dirty' } : img
    )))
  }, [])

  const moveCategory = useCallback((id, direction) => {
    setCategories((prev) => {
      const next = [...prev]
      const index = next.findIndex((cat) => cat.id === id)
      const swap = index + direction
      if (index < 0 || swap < 0 || swap >= next.length) return prev
      ;[next[index], next[swap]] = [next[swap], next[index]]
      return withOrder(next).map((cat) => ({ ...cat, _state: cat._state === 'new' ? 'new' : 'dirty' }))
    })
  }, [])

  const addMediaFile = useCallback((table, file) => {
    const message = validateImageFile(file)
    if (message) {
      setToast({ message })
      return null
    }
    const item = {
      id: `temp-${createId(table)}`,
      image_url: URL.createObjectURL(file),
      storage_path: null,
      file,
      alt_he: '',
      alt_en: '',
      category_he: '',
      category_en: '',
      category_id: null,
      order_index: table === 'gallery' ? gallery.length : slides.length,
      _state: 'new',
    }
    if (table === 'gallery') setGallery((items) => withOrder([...items, item]))
    else setSlides((items) => withOrder([...items, item]))
    return item
  }, [gallery.length, slides.length])

  const updateMediaItem = useCallback((table, itemId, patch) => {
    const setter = table === 'gallery' ? setGallery : setSlides
    setter((items) => items.map((item) => (
      item.id === itemId ? { ...item, ...patch, _state: item._state === 'new' ? 'new' : 'dirty' } : item
    )))
  }, [])

  const removeMediaItem = useCallback((table, itemId) => {
    if (!window.confirm('Delete this image?')) return
    const setter = table === 'gallery' ? setGallery : setSlides
    let deleted = null
    setter((items) => {
      deleted = items.find((item) => item.id === itemId)
      return withOrder(items.filter((item) => item.id !== itemId))
    })
    if (!deleted) return
    setToast({
      message: 'Image deleted.',
      actionLabel: 'Undo',
      action: () => {
        setter((items) => withOrder([...items, deleted]))
        setToast(null)
      },
    })
  }, [])

  const moveMediaItem = useCallback((table, itemId, direction) => {
    const setter = table === 'gallery' ? setGallery : setSlides
    setter((items) => {
      const next = [...items]
      const index = next.findIndex((item) => item.id === itemId)
      const swap = index + direction
      if (index < 0 || swap < 0 || swap >= next.length) return items
      ;[next[index], next[swap]] = [next[swap], next[index]]
      return withOrder(next).map((item) => ({ ...item, _state: item._state === 'new' ? 'new' : 'dirty' }))
    })
  }, [])

  const syncMediaTable = useCallback(async (table, currentItems, savedItems, folder) => {
    const savedById = new Map(savedItems.map((item) => [item.id, item]))
    const currentIds = new Set(currentItems.filter((item) => !String(item.id).startsWith('temp-')).map((item) => item.id))
    const deleted = savedItems.filter((item) => !currentIds.has(item.id))

    for (const item of deleted) {
      if (item.storage_path) await supabase.storage.from(IMAGE_BUCKET).remove([item.storage_path])
      await supabase.from(table).delete().eq('id', item.id)
    }

    for (let index = 0; index < currentItems.length; index += 1) {
      const item = currentItems[index]
      if (String(item.id).startsWith('temp-')) {
        const { storagePath, publicUrl } = await uploadMediaFile(item.file, folder, index)
        const { error } = await supabase.from(table).insert({
          image_url: publicUrl,
          storage_path: storagePath,
          order_index: index,
          alt_he: item.alt_he || '',
          alt_en: item.alt_en || '',
          category_he: item.category_he || '',
          category_en: item.category_en || '',
          category_id: item.category_id || null,
        })
        if (error) throw error
      } else if (item._state === 'dirty' || savedById.get(item.id)?.order_index !== index) {
        const { error } = await supabase.from(table).update({
          order_index: index,
          alt_he: item.alt_he || '',
          alt_en: item.alt_en || '',
          category_he: item.category_he || '',
          category_en: item.category_en || '',
          category_id: item.category_id || null,
        }).eq('id', item.id)
        if (error) throw error
      }
    }
  }, [])

  // Returns a map of tempId -> realId for newly inserted categories
  const syncCategories = useCallback(async (currentCategories, savedCategories) => {
    const idMap = {}
    const currentRealIds = new Set(
      currentCategories.filter((c) => !String(c.id).startsWith('temp-')).map((c) => c.id)
    )

    // Delete removed
    for (const cat of savedCategories) {
      if (!String(cat.id).startsWith('temp-') && !currentRealIds.has(cat.id)) {
        await supabase.from('gallery_categories').delete().eq('id', cat.id)
      }
    }

    // Insert new / update dirty
    for (let i = 0; i < currentCategories.length; i += 1) {
      const cat = currentCategories[i]
      if (String(cat.id).startsWith('temp-')) {
        const { data, error } = await supabase.from('gallery_categories').insert({
          name_he: cat.name_he,
          name_en: cat.name_en,
          order_index: i,
        }).select().single()
        if (error) throw error
        idMap[cat.id] = data.id
      } else {
        const savedCat = savedCategories.find((c) => c.id === cat.id)
        const orderChanged = savedCat?.order_index !== i
        if (cat._state === 'dirty' || orderChanged) {
          const { error } = await supabase.from('gallery_categories').update({
            name_he: cat.name_he,
            name_en: cat.name_en,
            order_index: i,
          }).eq('id', cat.id)
          if (error) throw error
        }
      }
    }

    return idMap
  }, [])

  const saveAll = useCallback(async () => {
    if (!supabaseConfigured || !supabase) {
      setToast({ message: 'Supabase is not configured. Changes cannot be saved.' })
      return
    }
    setSaving(true)
    setError(null)
    try {
      const pagePayload = { key: pageKey, content: pageContent }
      const globalPayload = { key: 'global', content: globalContent }
      const settingsPayload = {
        key: 'settings',
        content: settings,
        contact_email: settings.contact_email || '',
        contact_phone: settings.contact_phone || '',
        contact_address: settings[`contact_address_${editLanguage}`] || '',
        donation_url: settings.donation_url || '',
        bank_name: settings.bank_account_name_he || '',
        bank_name_en: settings.bank_account_name_en || '',
        bank_account: settings.bank_account || '',
        bank_branch: settings.bank_branch || '',
      }
      const { error: pageError } = await supabase.from('site_content').upsert(pagePayload, { onConflict: 'key' })
      if (pageError) throw pageError
      const { error: globalError } = await supabase.from('site_content').upsert(globalPayload, { onConflict: 'key' })
      if (globalError) throw globalError
      const { error: settingsError } = await supabase.from('site_content').upsert(settingsPayload, { onConflict: 'key' })
      if (settingsError) throw settingsError

      // Save categories first — returns tempId→realId map
      const categoryIdMap = await syncCategories(categories, savedSnapshot?.categories || [])

      // Resolve any temp category IDs in gallery items before syncing
      const resolvedGallery = Object.keys(categoryIdMap).length
        ? gallery.map((img) => ({
            ...img,
            category_id: categoryIdMap[img.category_id] ?? img.category_id,
          }))
        : gallery

      await syncMediaTable('gallery', resolvedGallery, savedSnapshot?.gallery || [], 'gallery')
      await syncMediaTable('hero_slideshow', slides, savedSnapshot?.slides || [], 'slideshow')

      const [pageRow, globalRow, settingsRow, galleryRows, slideRows, categoryRows] = await Promise.all([
        fetchContentRow(pageKey),
        fetchContentRow('global'),
        fetchContentRow('settings'),
        fetchTable('gallery', 'order_index', true),
        fetchTable('hero_slideshow', 'order_index', true).catch(() => fetchTable('hero_slideshow', 'created_at', false)),
        fetchTable('gallery_categories', 'order_index', true).catch(() => []),
      ])
      const nextPageContent = safeContent(pageRow, pageKey)
      const nextGlobalContent = normalizeGlobalContent(globalRow)
      const nextSettings = normalizeSettings(settingsRow)
      const nextGallery = normalizeMediaRows(galleryRows, 'gallery')
      const nextSlides = normalizeMediaRows(slideRows, 'slide')
      const nextCategories = normalizeCategories(categoryRows)
      setPageContent(nextPageContent)
      setGlobalContent(nextGlobalContent)
      setSettings(nextSettings)
      setGallery(nextGallery)
      setSlides(nextSlides)
      setCategories(nextCategories)
      setSavedSnapshot({
        pageContent: nextPageContent,
        globalContent: nextGlobalContent,
        settings: nextSettings,
        gallery: nextGallery,
        slides: nextSlides,
        categories: nextCategories,
      })
      setToast({ message: 'Changes saved.' })
    } catch (err) {
      setError(err.message)
      setToast({ message: `Save failed: ${err.message}` })
    } finally {
      setSaving(false)
    }
  }, [editLanguage, gallery, globalContent, pageContent, pageKey, savedSnapshot, settings, slides, categories, syncMediaTable, syncCategories])

  const discard = useCallback(() => {
    if (!savedSnapshot) return
    setPageContent(savedSnapshot.pageContent)
    setGlobalContent(savedSnapshot.globalContent)
    setSettings(savedSnapshot.settings)
    setGallery(savedSnapshot.gallery)
    setSlides(savedSnapshot.slides)
    setCategories(savedSnapshot.categories || [])
    setDrawer(null)
    setToast({ message: 'Changes discarded.' })
  }, [savedSnapshot])

  useEffect(() => {
    const onKeyDown = (event) => {
      const key = event.key.toLowerCase()
      if ((event.metaKey || event.ctrlKey) && key === 's') {
        event.preventDefault()
        saveAll()
      }
      if (event.key === 'Escape') {
        if (drawer) closeDrawer()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [closeDrawer, drawer, saveAll])

  const value = useMemo(() => ({
    isEditMode: true,
    isPreviewMode,
    pageKey,
    editLanguage,
    pageContent,
    globalContent,
    settings,
    gallery,
    slides,
    categories,
    loading,
    saving,
    isDirty,
    drawer,
    toast,
    error,
    getField,
    hasField,
    updateField,
    updateCollectionItem,
    addCollectionItem,
    removeCollectionItem,
    moveCollectionItem,
    openDrawer,
    closeDrawer,
    setEditLanguage,
    setPreviewMode,
    saveAll,
    discard,
    undoDelete: () => toast?.action?.(),
    addMediaFile,
    updateMediaItem,
    removeMediaItem,
    moveMediaItem,
    addCategory,
    updateCategory,
    removeCategory,
    moveCategory,
  }), [
    addCollectionItem,
    addMediaFile,
    addCategory,
    closeDrawer,
    discard,
    drawer,
    editLanguage,
    error,
    gallery,
    getField,
    globalContent,
    hasField,
    isDirty,
    isPreviewMode,
    loading,
    moveCollectionItem,
    moveMediaItem,
    moveCategory,
    openDrawer,
    pageContent,
    pageKey,
    removeCollectionItem,
    removeMediaItem,
    removeCategory,
    saveAll,
    saving,
    setEditLanguage,
    settings,
    slides,
    categories,
    toast,
    updateCollectionItem,
    updateField,
    updateMediaItem,
    updateCategory,
  ])

  return (
    <EditModeContext.Provider value={value}>
      {children}
    </EditModeContext.Provider>
  )
}
