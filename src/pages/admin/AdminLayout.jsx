import { useEffect } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import AdminDrawer from '../../components/AdminDrawer'
import AdminToolbar from '../../components/AdminToolbar'
import Footer from '../../components/Footer'
import Navbar from '../../components/Navbar'
import { ADMIN_PAGES } from '../../content/defaultContent'
import { useAuth } from '../../contexts/AuthContext'
import { EditModeProvider, useEditMode } from '../../contexts/EditModeContext'
import About from '../About'
import Contact from '../Contact'
import Donate from '../Donate'
import Gallery from '../Gallery'
import Home from '../Home'
import Login from './Login'
import SlideshowEditor from './SlideshowEditor'

const pageComponents = {
  home: Home,
  slideshow: SlideshowEditor,
  about: About,
  gallery: Gallery,
  donate: Donate,
  contact: Contact,
}

function pageFromPath(pathname) {
  const key = pathname.replace(/^\/admin\/?/, '').split('/')[0] || 'home'
  return ADMIN_PAGES.some((page) => page.key === key) ? key : null
}

function AdminChrome({ children }) {
  const { loading, error } = useEditMode()

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <AdminToolbar />
      <AdminDrawer />
      {loading && (
        <div className="fixed inset-0 z-[9999] grid place-items-center bg-white/70 backdrop-blur-sm" dir="ltr">
          <div className="rounded-2xl bg-white px-6 py-4 text-sm font-semibold text-brand-primary shadow-xl">Loading editor...</div>
        </div>
      )}
      {error && (
        <div className="fixed bottom-5 end-5 z-[10001] max-w-sm rounded-xl bg-red-600 px-4 py-3 text-sm font-medium text-white shadow-xl" dir="ltr">
          {error}
        </div>
      )}
    </div>
  )
}

export default function AdminLayout() {
  const { user, loading } = useAuth()
  const { i18n } = useTranslation()
  const location = useLocation()
  const pageKey = pageFromPath(location.pathname)

  useEffect(() => {
    document.documentElement.lang = i18n.language
    document.documentElement.dir = i18n.language === 'he' ? 'rtl' : 'ltr'
  }, [i18n.language])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-primary" />
      </div>
    )
  }

  if (!user) return <Login />
  if (!pageKey) return <Navigate to="/admin/home" replace />

  const Page = pageComponents[pageKey]

  const handleLanguageChange = (next) => {
    i18n.changeLanguage(next)
    document.documentElement.lang = next
    document.documentElement.dir = next === 'he' ? 'rtl' : 'ltr'
  }

  return (
    <EditModeProvider pageKey={pageKey} language={i18n.language} onLanguageChange={handleLanguageChange}>
      <AdminChrome>
        <Page />
      </AdminChrome>
    </EditModeProvider>
  )
}
