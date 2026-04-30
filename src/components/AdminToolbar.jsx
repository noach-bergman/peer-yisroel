import { Eye, EyeOff, ExternalLink, LogOut, RotateCcw, Save, Settings } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { ADMIN_PAGES, buildPublicPath } from '../content/defaultContent'
import { useAuth } from '../contexts/AuthContext'
import { useEditMode } from '../contexts/EditModeContext'

const seoFields = [
  { name: 'seo_title_he', label: 'SEO title HE' },
  { name: 'seo_title_en', label: 'SEO title EN' },
  { name: 'seo_description_he', label: 'Meta description HE', multiline: true },
  { name: 'seo_description_en', label: 'Meta description EN', multiline: true },
]

const settingsSectionsByPage = {
  donate: [
    {
      title: 'Donation link',
      description: 'Controls the online donation button.',
      fields: [{ name: 'donation_url', label: 'Donation URL', type: 'url', scope: 'settings' }],
    },
    {
      title: 'Bank transfer',
      fields: [
        { name: 'bank_account_name_he', label: 'Account name HE', scope: 'settings' },
        { name: 'bank_account_name_en', label: 'Account name EN', scope: 'settings' },
        { name: 'bank_name_he', label: 'Bank HE', scope: 'settings' },
        { name: 'bank_name_en', label: 'Bank EN', scope: 'settings' },
        { name: 'bank_account', label: 'Account number', scope: 'settings' },
        { name: 'bank_branch', label: 'Branch', scope: 'settings' },
      ],
    },
  ],
  contact: [
    {
      title: 'Contact details',
      fields: [
        { name: 'contact_email', label: 'Contact email', type: 'email', scope: 'settings' },
        { name: 'contact_phone', label: 'Phone', scope: 'settings' },
        { name: 'contact_address_he', label: 'Address HE', multiline: true, scope: 'settings' },
        { name: 'contact_address_en', label: 'Address EN', multiline: true, scope: 'settings' },
      ],
    },
    {
      title: 'Form email',
      fields: [
        { name: 'contact_form_subject_he', label: 'Form subject HE', scope: 'settings' },
        { name: 'contact_form_subject_en', label: 'Form subject EN', scope: 'settings' },
      ],
    },
  ],
}

const globalSections = [
  {
    title: 'Brand',
    fields: [
      { name: 'brand_short_he', label: 'Brand short HE', scope: 'global' },
      { name: 'brand_short_en', label: 'Brand short EN', scope: 'global' },
      { name: 'brand_name_he', label: 'Brand name HE', scope: 'global' },
      { name: 'brand_name_en', label: 'Brand name EN', scope: 'global' },
      { name: 'brand_subtitle_he', label: 'Brand subtitle HE', multiline: true, scope: 'global' },
      { name: 'brand_subtitle_en', label: 'Brand subtitle EN', multiline: true, scope: 'global' },
    ],
  },
  {
    title: 'Navigation',
    fields: [
      { name: 'nav_home_he', label: 'Home HE', scope: 'global' },
      { name: 'nav_home_en', label: 'Home EN', scope: 'global' },
      { name: 'nav_about_he', label: 'About HE', scope: 'global' },
      { name: 'nav_about_en', label: 'About EN', scope: 'global' },
      { name: 'nav_gallery_he', label: 'Gallery HE', scope: 'global' },
      { name: 'nav_gallery_en', label: 'Gallery EN', scope: 'global' },
      { name: 'nav_donate_he', label: 'Donate HE', scope: 'global' },
      { name: 'nav_donate_en', label: 'Donate EN', scope: 'global' },
      { name: 'nav_contact_he', label: 'Contact HE', scope: 'global' },
      { name: 'nav_contact_en', label: 'Contact EN', scope: 'global' },
    ],
  },
  {
    title: 'Footer',
    fields: [
      { name: 'footer_links_he', label: 'Footer links HE', scope: 'global' },
      { name: 'footer_links_en', label: 'Footer links EN', scope: 'global' },
      { name: 'footer_rights_he', label: 'Footer rights HE', scope: 'global' },
      { name: 'footer_rights_en', label: 'Footer rights EN', scope: 'global' },
    ],
  },
]

export default function AdminToolbar() {
  const navigate = useNavigate()
  const { logout } = useAuth()
  const {
    pageKey,
    editLanguage,
    setEditLanguage,
    isPreviewMode,
    setPreviewMode,
    isDirty,
    saving,
    saveAll,
    discard,
    openDrawer,
    toast,
    undoDelete,
  } = useEditMode()

  const openSettings = () => {
    const pageSettings = settingsSectionsByPage[pageKey] || []
    openDrawer({
      title: pageKey === 'home' ? 'Site settings' : 'Page settings',
      kicker: 'Settings',
      scope: 'page',
      sections: [
        { title: 'SEO', fields: seoFields },
        ...(pageKey === 'home' ? globalSections : pageSettings),
      ],
    })
  }

  return (
    <>
      <div className="fixed left-1/2 top-4 z-[10000] w-[min(68rem,calc(100vw-2rem))] -translate-x-1/2 rounded-2xl bg-white/95 px-4 py-3 shadow-2xl ring-1 ring-black/10 backdrop-blur" dir="ltr">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 border-e border-gray-200 pe-3">
            <span className="text-sm font-bold text-brand-primary">Admin Editor</span>
            {isDirty && <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">Unsaved</span>}
          </div>

          <select
            value={pageKey}
            onChange={(event) => navigate(`/admin/${event.target.value}`)}
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700"
          >
            {ADMIN_PAGES.map((page) => (
              <option key={page.key} value={page.key}>{page.label}</option>
            ))}
          </select>

          <div className="flex rounded-lg border border-gray-200 p-0.5">
            {['he', 'en'].map((lang) => (
              <button
                key={lang}
                type="button"
                onClick={() => setEditLanguage(lang)}
                className={`rounded-md px-3 py-1.5 text-xs font-bold uppercase ${editLanguage === lang ? 'bg-brand-primary text-white' : 'text-gray-500 hover:bg-gray-100'}`}
              >
                {lang}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setPreviewMode(!isPreviewMode)}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            {isPreviewMode ? <EyeOff size={16} /> : <Eye size={16} />}
            {isPreviewMode ? 'Edit' : 'Preview'}
          </button>

          {pageKey !== 'slideshow' && (
            <button
              type="button"
              onClick={openSettings}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <Settings size={16} /> Settings
            </button>
          )}

          <div className="ms-auto flex items-center gap-2">
            <a
              href={buildPublicPath(pageKey)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <ExternalLink size={16} /> Public
            </a>
            <button
              type="button"
              onClick={discard}
              disabled={!isDirty || saving}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40"
            >
              <RotateCcw size={16} /> Cancel
            </button>
            <button
              type="button"
              onClick={saveAll}
              disabled={!isDirty || saving}
              className="inline-flex items-center gap-2 rounded-lg bg-brand-primary px-4 py-2 text-sm font-semibold text-white hover:bg-brand-primary-dark disabled:opacity-40"
            >
              <Save size={16} /> {saving ? 'Saving...' : 'Save'}
            </button>
            <button
              type="button"
              onClick={logout}
              className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
            >
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>
      </div>

      {toast && (
        <div className="fixed bottom-5 left-1/2 z-[10001] flex -translate-x-1/2 items-center gap-3 rounded-full bg-gray-950 px-5 py-3 text-sm font-medium text-white shadow-2xl" dir="ltr">
          <span>{toast.message}</span>
          {toast.actionLabel && (
            <button type="button" onClick={undoDelete} className="font-bold text-brand-gold hover:text-white">
              {toast.actionLabel}
            </button>
          )}
        </div>
      )}
    </>
  )
}
