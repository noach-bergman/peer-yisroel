import { useEffect } from 'react'
import { supabaseConfigured } from '../supabase'
import { useEditMode } from '../contexts/EditModeContext'
import { useSupabaseRow, useSupabaseTable } from './useSupabaseTable'
import {
  normalizeGlobalContent,
  normalizePageContent,
  normalizeSettings,
} from '../content/defaultContent'

export function usePageContent(pageKey) {
  const edit = useEditMode()
  const { data, loading } = useSupabaseRow('site_content', 'key', pageKey)
  if (edit.isEditMode && edit.pageKey === pageKey) {
    return { content: edit.pageContent, loading: edit.loading }
  }
  return { content: loading && supabaseConfigured ? null : normalizePageContent(pageKey, data), loading }
}

export function useGlobalContent() {
  const edit = useEditMode()
  const { data, loading } = useSupabaseRow('site_content', 'key', 'global')
  if (edit.isEditMode) {
    return { content: edit.globalContent, loading: edit.loading }
  }
  return { content: loading && supabaseConfigured ? null : normalizeGlobalContent(data), loading }
}

export function useSettingsContent() {
  const edit = useEditMode()
  const { data, loading } = useSupabaseRow('site_content', 'key', 'settings')
  if (edit.isEditMode) {
    return { settings: edit.settings, loading: edit.loading }
  }
  return { settings: loading && supabaseConfigured ? null : normalizeSettings(data), loading }
}

export function useEditableTable(table, options) {
  const edit = useEditMode()
  const result = useSupabaseTable(table, options)
  if (edit.isEditMode && table === 'gallery') return { data: edit.gallery, loading: edit.loading }
  if (edit.isEditMode && table === 'hero_slideshow') return { data: edit.slides, loading: edit.loading }
  return result
}

export function usePageSeo(pageKey, content, lang) {
  useEffect(() => {
    const title = content?.[`seo_title_${lang}`] || content?.[`title_${lang}`]
    const description = content?.[`seo_description_${lang}`] || content?.[`subtitle_${lang}`]
    if (title) document.title = title
    if (description) {
      let meta = document.querySelector('meta[name="description"]')
      if (!meta) {
        meta = document.createElement('meta')
        meta.setAttribute('name', 'description')
        document.head.appendChild(meta)
      }
      meta.setAttribute('content', description)
    }
  }, [content, lang, pageKey])
}
