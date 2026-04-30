import { useEffect, useState } from 'react'
import { supabase, supabaseConfigured } from '../supabase'

export function useSupabaseTable(table, options = {}) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(Boolean(supabaseConfigured && supabase))
  const { orderBy = 'created_at', ascending = true } = options

  useEffect(() => {
    if (!supabaseConfigured || !supabase) return
    let cancelled = false
    setLoading(true)
    supabase.from(table).select('*').order(orderBy, { ascending })
      .then(({ data: rows }) => {
        if (!cancelled) { setData(rows || []); setLoading(false) }
      })
      .catch(() => { if (!cancelled) setLoading(false) })

    const sub = supabase.channel(`${table}_changes`)
      .on('postgres_changes', { event: '*', schema: 'public', table }, () => {
        supabase.from(table).select('*').order(orderBy, { ascending })
          .then(({ data: rows }) => { if (!cancelled) setData(rows || []) })
      })
      .subscribe()

    return () => {
      cancelled = true
      supabase.removeChannel(sub)
    }
  }, [table, orderBy, ascending])

  return { data, loading }
}

export function useSupabaseRow(table, column, value) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(Boolean(value && supabaseConfigured && supabase))

  useEffect(() => {
    if (!value || !supabaseConfigured || !supabase) return
    let cancelled = false
    setLoading(true)
    supabase.from(table).select('*').eq(column, value).single()
      .then(({ data: row }) => { if (!cancelled) { setData(row); setLoading(false) } })
      .catch(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [table, column, value])

  return { data, loading }
}
