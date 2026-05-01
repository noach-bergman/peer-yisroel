import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { buildAdminPathFromPublicPath } from '../content/defaultContent'
import { useEditMode } from '../contexts/EditModeContext'
import { useGlobalContent, useSettingsContent } from '../hooks/useEditableContent'
import EditableText from './EditableText'

export default function Footer() {
  const { i18n } = useTranslation()
  const edit = useEditMode()
  const { content } = useGlobalContent()
  const { settings } = useSettingsContent()
  const year = new Date().getFullYear()
  const lang = i18n.language
  const toPath = (publicPath) => edit.isEditMode ? buildAdminPathFromPublicPath(publicPath) : publicPath

  if (!content || !settings) {
    return <footer className="mt-auto bg-brand-primary-dark py-12" />
  }

  const links = [
    { to: '/', field: `nav_home_${lang}`, fallback: content[`nav_home_${lang}`] },
    { to: '/about', field: `nav_about_${lang}`, fallback: content[`nav_about_${lang}`] },
    { to: '/gallery', field: `nav_gallery_${lang}`, fallback: content[`nav_gallery_${lang}`] },
    { to: '/donate', field: `nav_donate_${lang}`, fallback: content[`nav_donate_${lang}`] },
    { to: '/contact', field: `nav_contact_${lang}`, fallback: content[`nav_contact_${lang}`] },
  ]

  return (
    <footer className="mt-auto bg-brand-primary-dark text-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8 grid grid-cols-1 gap-8 md:grid-cols-3">
          <div>
            <div className="mb-4 inline-block bg-white rounded-xl shadow-sm p-2">
              <img
                src={lang === 'he' ? '/עברית.jpeg' : '/English.png'}
                alt={lang === 'he' ? 'פאר ישראל' : "Pe'er Yisroel"}
                className="h-20 w-auto object-contain"
              />
            </div>
            <EditableText scope="global" field={`brand_subtitle_${lang}`} tag="p" className="text-sm leading-relaxed text-white/70" multiline>
              {content[`brand_subtitle_${lang}`]}
            </EditableText>
          </div>

          <div>
            <EditableText scope="global" field={`footer_links_${lang}`} tag="h3" className="mb-3 font-semibold text-white/90">
              {content[`footer_links_${lang}`]}
            </EditableText>
            <ul className="space-y-2 text-sm">
              {links.map((link) => (
                <li key={link.to}>
                  <Link to={toPath(link.to)} className="text-white/70 transition-colors hover:text-brand-gold">
                    <EditableText scope="global" field={link.field} inlineEditable={false}>{link.fallback}</EditableText>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <EditableText scope="global" field={`footer_email_title_${lang}`} tag="h3" className="mb-3 font-semibold text-white/90">
              {content[`footer_email_title_${lang}`]}
            </EditableText>
            <EditableText scope="settings" field="contact_email" tag="p" className="text-sm text-white/70">
              {settings.contact_email}
            </EditableText>
          </div>
        </div>

        <div className="border-t border-white/10 pt-6 text-center text-sm text-white/50">
          © {year}{' '}
          <EditableText scope="global" field={`brand_name_${lang}`}>
            {content[`brand_name_${lang}`]}
          </EditableText>
          .{' '}
          <EditableText scope="global" field={`footer_rights_${lang}`}>
            {content[`footer_rights_${lang}`]}
          </EditableText>
          .
        </div>
      </div>
    </footer>
  )
}
