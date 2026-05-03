import { useLocation, useNavigate } from 'react-router-dom'
import { LayoutPanelLeft, Images, Settings, Film } from 'lucide-react'

const TABS = [
  {
    key:   'pages',
    label: 'עריכת דפים',
    icon:  LayoutPanelLeft,
    route: '/admin/home',
    match: (seg) => ['home', 'about', 'gallery', 'donate', 'contact'].includes(seg),
  },
  {
    key:   'gallery-manager',
    label: 'ניהול גלריה',
    icon:  Images,
    route: '/admin/gallery-manager',
    match: (seg) => seg === 'gallery-manager',
  },
  {
    key:   'settings',
    label: 'הגדרות כלליות',
    icon:  Settings,
    route: '/admin/settings',
    match: (seg) => seg === 'settings',
  },
  {
    key:   'slideshow',
    label: 'סליידשו',
    icon:  Film,
    route: '/admin/slideshow',
    match: (seg) => seg === 'slideshow',
  },
]

export default function AdminTabBar() {
  const location = useLocation()
  const navigate  = useNavigate()
  const seg = location.pathname.replace(/^\/admin\/?/, '').split('/')[0] || 'home'

  return (
    <div className="flex justify-center pt-20 pb-2 bg-white border-b border-gray-100" dir="rtl">
      <div className="flex gap-1 rounded-xl bg-gray-100 p-1">
        {TABS.map(({ key, label, icon: Icon, route, match }) => {
          const active = match(seg)
          return (
            <button
              key={key}
              type="button"
              onClick={() => navigate(route)}
              className={[
                'flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all',
                active
                  ? 'bg-white text-brand-primary shadow-sm ring-1 ring-black/5'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-white/60',
              ].join(' ')}
            >
              <Icon size={15} />
              {label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
