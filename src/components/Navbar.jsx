import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Menu, X } from 'lucide-react'
import { buildAdminPathFromPublicPath } from '../content/defaultContent'
import { useEditMode } from '../contexts/EditModeContext'
import { useGlobalContent } from '../hooks/useEditableContent'
import EditableText from './EditableText'

export default function Navbar() {
  const { i18n } = useTranslation()
  const edit = useEditMode()
  const { content } = useGlobalContent()
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const location = useLocation()
  const lang = i18n.language

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setOpen(false)
  }, [location.pathname])

  if (!content) {
    return <header className="fixed top-0 inset-x-0 z-50 h-20 bg-transparent md:h-36" />
  }

  const toggleLang = () => {
    const next = lang === 'he' ? 'en' : 'he'
    if (edit.isEditMode) edit.setEditLanguage(next)
    else {
      i18n.changeLanguage(next)
      document.documentElement.dir = next === 'he' ? 'rtl' : 'ltr'
      document.documentElement.lang = next
    }
  }

  const toPath = (publicPath) => edit.isEditMode ? buildAdminPathFromPublicPath(publicPath) : publicPath
  const links = [
    { to: '/', field: `nav_home_${lang}`, fallback: content[`nav_home_${lang}`] },
    { to: '/about', field: `nav_about_${lang}`, fallback: content[`nav_about_${lang}`] },
    { to: '/gallery', field: `nav_gallery_${lang}`, fallback: content[`nav_gallery_${lang}`] },
    { to: '/updates', field: `nav_updates_${lang}`, fallback: content[`nav_updates_${lang}`] || (lang === 'he' ? 'עדכונים' : 'Updates') },
    { to: '/donate', field: `nav_donate_${lang}`, fallback: content[`nav_donate_${lang}`] },
    { to: '/contact', field: `nav_contact_${lang}`, fallback: content[`nav_contact_${lang}`] },
  ]

  const isActive = (to) => {
    if (edit.isEditMode) return location.pathname === toPath(to)
    return to === '/' ? location.pathname === '/' : location.pathname.startsWith(to)
  }

  const pageKey = edit.isEditMode
    ? location.pathname.replace(/^\/admin\/?/, '').split('/')[0] || 'home'
    : location.pathname === '/'
      ? 'home'
      : location.pathname.split('/')[1]
  const hasDarkHero = ['home', 'about', 'gallery', 'updates', 'donate', 'contact'].includes(pageKey)
  const darkNav = scrolled || open
  const heroTop = !darkNav && hasDarkHero
  const onDarkSurface = darkNav || heroTop
  const headerClass = darkNav
    ? 'bg-brand-primary shadow-lg'
    : heroTop
      ? 'bg-brand-primary/80 backdrop-blur-sm shadow-md'
      : 'bg-white/95 shadow-md backdrop-blur'
  const activeLinkClass = onDarkSurface ? 'bg-white/20 text-white' : 'bg-brand-primary/10 text-brand-primary'
  const inactiveLinkClass = onDarkSurface ? 'text-white/80 hover:bg-white/10 hover:text-white' : 'text-brand-primary/80 hover:bg-brand-primary/10 hover:text-brand-primary'
  const languageButtonClass = onDarkSurface
    ? 'border-white/40 text-white/80 hover:bg-white/10 hover:text-white'
    : 'border-brand-primary/30 text-brand-primary/80 hover:bg-brand-primary/10 hover:text-brand-primary'
  const mobileMenuClass = onDarkSurface ? 'text-white' : 'text-brand-primary'

  return (
    <header className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${headerClass}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between md:h-36">
          <Link to={toPath('/')} className="flex items-center">
            <img
              key={lang}
              src={lang === 'he' ? '/עברית.jpeg' : '/English.png'}
              alt={lang === 'he' ? 'פאר ישראל' : "Pe'er Yisroel"}
              className="h-16 md:h-28 w-auto object-contain"
            />
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {links.map((link) => (
              <Link
                key={link.to}
                to={toPath(link.to)}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors duration-200 ${isActive(link.to) ? activeLinkClass : inactiveLinkClass}`}
              >
                <EditableText scope="global" field={link.field} inlineEditable={false}>{link.fallback}</EditableText>
              </Link>
            ))}
            <button
              onClick={toggleLang}
              className={`ms-4 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${languageButtonClass}`}
            >
              {lang === 'he' ? 'EN' : 'עב'}
            </button>
          </nav>

          <div className="flex items-center gap-2 md:hidden">
            <button onClick={toggleLang} className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${languageButtonClass}`}>
              {lang === 'he' ? 'EN' : 'עב'}
            </button>
            <button onClick={() => setOpen((value) => !value)} className={`p-2 ${mobileMenuClass}`} aria-label="Toggle menu">
              {open ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden border-t border-white/10 bg-brand-primary md:hidden"
          >
            <div className="px-4 pb-4">
              {links.map((link) => (
                <Link
                  key={link.to}
                  to={toPath(link.to)}
                  className={`my-1 block rounded-lg px-4 py-3 text-sm font-medium transition-colors ${isActive(link.to) ? 'bg-white/20 text-white' : 'text-white/80 hover:bg-white/10 hover:text-white'}`}
                >
                  <EditableText scope="global" field={link.field} inlineEditable={false}>{link.fallback}</EditableText>
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
