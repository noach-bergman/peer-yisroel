import { useEffect, useState } from 'react'
import { Save } from 'lucide-react'
import { supabase, supabaseConfigured } from '../../supabase'
import { DEFAULT_GLOBAL_CONTENT, DEFAULT_SETTINGS, normalizeGlobalContent, normalizeSettings } from '../../content/defaultContent'

const SECTIONS = [
  {
    title: 'Branding',
    fields: [
      { key: 'brand_name_he',     label: 'Organisation name (Hebrew)',   scope: 'global' },
      { key: 'brand_name_en',     label: 'Organisation name (English)',  scope: 'global', dir: 'ltr' },
      { key: 'brand_subtitle_he', label: 'Tagline (Hebrew)',             scope: 'global', multiline: true },
      { key: 'brand_subtitle_en', label: 'Tagline (English)',            scope: 'global', multiline: true, dir: 'ltr' },
    ],
  },
  {
    title: 'Navigation labels',
    fields: [
      { key: 'nav_home_he',    label: 'Home (Hebrew)',    scope: 'global' },
      { key: 'nav_home_en',    label: 'Home (English)',   scope: 'global', dir: 'ltr' },
      { key: 'nav_about_he',   label: 'About (Hebrew)',   scope: 'global' },
      { key: 'nav_about_en',   label: 'About (English)',  scope: 'global', dir: 'ltr' },
      { key: 'nav_gallery_he', label: 'Gallery (Hebrew)', scope: 'global' },
      { key: 'nav_gallery_en', label: 'Gallery (English)',scope: 'global', dir: 'ltr' },
      { key: 'nav_donate_he',  label: 'Donate (Hebrew)',  scope: 'global' },
      { key: 'nav_donate_en',  label: 'Donate (English)', scope: 'global', dir: 'ltr' },
      { key: 'nav_contact_he', label: 'Contact (Hebrew)', scope: 'global' },
      { key: 'nav_contact_en', label: 'Contact (English)',scope: 'global', dir: 'ltr' },
    ],
  },
  {
    title: 'Contact details',
    fields: [
      { key: 'contact_email',      label: 'Email',            scope: 'settings', type: 'email', dir: 'ltr' },
      { key: 'contact_phone',      label: 'Phone',            scope: 'settings', dir: 'ltr' },
      { key: 'contact_address_he', label: 'Address (Hebrew)', scope: 'settings', multiline: true },
      { key: 'contact_address_en', label: 'Address (English)',scope: 'settings', multiline: true, dir: 'ltr' },
    ],
  },
  {
    title: 'Donations',
    fields: [
      { key: 'donation_url',         label: 'Online donation link',   scope: 'settings', type: 'url', dir: 'ltr' },
      { key: 'bank_account_name_he', label: 'Account name (Hebrew)',  scope: 'settings' },
      { key: 'bank_account_name_en', label: 'Account name (English)', scope: 'settings', dir: 'ltr' },
      { key: 'bank_name_he',         label: 'Bank name (Hebrew)',     scope: 'settings' },
      { key: 'bank_name_en',         label: 'Bank name (English)',    scope: 'settings', dir: 'ltr' },
      { key: 'bank_account',         label: 'Account number',         scope: 'settings', dir: 'ltr' },
      { key: 'bank_branch',          label: 'Branch number',          scope: 'settings', dir: 'ltr' },
    ],
  },
]

export default function GeneralSettings() {
  const [values, setValues]   = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving]   = useState(false)
  const [saved, setSaved]     = useState(false)
  const [error, setError]     = useState(null)

  useEffect(() => {
    async function load() {
      if (!supabaseConfigured || !supabase) {
        setValues({
          ...DEFAULT_GLOBAL_CONTENT,
          ...DEFAULT_SETTINGS,
        })
        setError('Supabase is not configured. Settings can be viewed but not saved.')
        setLoading(false)
        return
      }
      const [{ data: globalRow }, { data: settingsRow }] = await Promise.all([
        supabase.from('site_content').select('*').eq('key', 'global').maybeSingle(),
        supabase.from('site_content').select('*').eq('key', 'settings').maybeSingle(),
      ])
      setValues({
        ...normalizeGlobalContent(globalRow),
        ...normalizeSettings(settingsRow),
      })
      setLoading(false)
    }
    load()
  }, [])

  const set = (key, val) => setValues((v) => ({ ...v, [key]: val }))

  async function handleSave() {
    if (!supabaseConfigured || !supabase) {
      setError('Supabase is not configured. Changes cannot be saved.')
      return
    }
    setSaving(true)
    setError(null)

    const globalKeys   = SECTIONS.flatMap((s) => s.fields.filter((f) => f.scope === 'global').map((f) => f.key))
    const settingsKeys = SECTIONS.flatMap((s) => s.fields.filter((f) => f.scope === 'settings').map((f) => f.key))

    const globalContent   = Object.fromEntries(globalKeys.map((k) => [k, values[k] ?? '']))
    const settingsContent = Object.fromEntries(settingsKeys.map((k) => [k, values[k] ?? '']))

    const [r1, r2] = await Promise.all([
      supabase.from('site_content').upsert({ key: 'global', content: globalContent }, { onConflict: 'key' }),
      supabase.from('site_content').upsert({
        key: 'settings',
        content: settingsContent,
        contact_email: settingsContent.contact_email || '',
        contact_phone: settingsContent.contact_phone || '',
        contact_address: settingsContent.contact_address_he || '',
        donation_url: settingsContent.donation_url || '',
        bank_name: settingsContent.bank_account_name_he || '',
        bank_name_en: settingsContent.bank_account_name_en || '',
        bank_account: settingsContent.bank_account || '',
        bank_branch: settingsContent.bank_branch || '',
      }, { onConflict: 'key' }),
    ])

    setSaving(false)
    if (r1.error || r2.error) {
      setError('Save failed — ' + (r1.error?.message || r2.error?.message))
    } else {
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-32">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-brand-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="ltr">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-10">

        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-brand-gold">Admin</p>
            <h1 className="mt-1 text-3xl font-bold text-brand-primary">General Settings</h1>
            <p className="mt-1 text-sm text-gray-500">Changes here affect the whole site</p>
          </div>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || !supabaseConfigured || !supabase}
            className="inline-flex items-center gap-2 rounded-xl bg-brand-primary px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-primary-dark disabled:opacity-50 transition"
          >
            <Save size={16} /> {saving ? 'Saving…' : 'Save'}
          </button>
        </div>

        {error && (
          <div className="mb-6 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>
        )}
        {saved && (
          <div className="mb-6 rounded-xl bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700 font-semibold">✓ Settings saved</div>
        )}

        <div className="space-y-8">
          {SECTIONS.map((section) => (
            <div key={section.title} className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
              <div className="border-b border-gray-100 bg-gray-50 px-5 py-3">
                <h2 className="text-sm font-bold text-brand-primary uppercase tracking-wide">{section.title}</h2>
              </div>
              <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {section.fields.map((field) => (
                  <label key={field.key} className="flex flex-col gap-1">
                    <span className="text-xs font-semibold text-gray-500">{field.label}</span>
                    {field.multiline ? (
                      <textarea
                        value={values[field.key] ?? ''}
                        onChange={(e) => set(field.key, e.target.value)}
                        dir={field.dir || 'rtl'}
                        rows={2}
                        className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand-primary focus:outline-none resize-none"
                      />
                    ) : (
                      <input
                        type={field.type || 'text'}
                        value={values[field.key] ?? ''}
                        onChange={(e) => set(field.key, e.target.value)}
                        dir={field.dir || 'rtl'}
                        className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand-primary focus:outline-none"
                      />
                    )}
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 flex justify-end">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || !supabaseConfigured || !supabase}
            className="inline-flex items-center gap-2 rounded-xl bg-brand-primary px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-primary-dark disabled:opacity-50 transition"
          >
            <Save size={16} /> {saving ? 'Saving…' : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  )
}
