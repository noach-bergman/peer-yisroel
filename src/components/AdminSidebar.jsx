import { useLocation, useNavigate } from 'react-router-dom'
import { DollarSign, Film, FolderOpen, Home, Info, Image, LogOut, Mail, Settings } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

const NAV = [
  {
    group: 'Pages',
    items: [
      { key: 'home',    label: 'Home',    icon: Home,        path: '/admin/home' },
      { key: 'about',   label: 'About',   icon: Info,        path: '/admin/about' },
      { key: 'gallery', label: 'Gallery', icon: Image,       path: '/admin/gallery' },
      { key: 'donate',  label: 'Donate',  icon: DollarSign,  path: '/admin/donate' },
      { key: 'contact', label: 'Contact', icon: Mail,        path: '/admin/contact' },
    ],
  },
  {
    group: 'Media',
    items: [
      { key: 'gallery-manager', label: 'Gallery Manager', icon: FolderOpen, path: '/admin/gallery-manager' },
    ],
  },
  {
    group: 'Settings',
    items: [
      { key: 'settings',  label: 'General Settings', icon: Settings, path: '/admin/settings' },
      { key: 'slideshow', label: 'Slideshow',         icon: Film,     path: '/admin/slideshow' },
    ],
  },
]

export default function AdminSidebar() {
  const location = useLocation()
  const navigate  = useNavigate()
  const { logout } = useAuth()
  const seg = location.pathname.replace(/^\/admin\/?/, '').split('/')[0] || 'home'

  return (
    <aside className="fixed inset-y-0 left-0 z-[9998] flex w-60 flex-col bg-[#0e1825] text-white shadow-2xl">
      <div className="flex h-16 shrink-0 items-center gap-3 border-b border-white/10 px-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-gold text-white text-sm font-bold select-none">A</div>
        <span className="text-sm font-bold tracking-wide">Admin Panel</span>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-5">
        {NAV.map(({ group, items }) => (
          <div key={group}>
            <p className="px-2 mb-1.5 text-[10px] font-bold uppercase tracking-widest text-white/30">{group}</p>
            <ul className="space-y-0.5">
              {items.map(({ key, label, icon: Icon, path }) => {
                const active = seg === key
                return (
                  <li key={key}>
                    <button
                      type="button"
                      onClick={() => navigate(path)}
                      className={[
                        'w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all',
                        active
                          ? 'bg-brand-gold/20 text-brand-gold ring-1 ring-brand-gold/30'
                          : 'text-white/60 hover:bg-white/[0.07] hover:text-white',
                      ].join(' ')}
                    >
                      <Icon size={16} />
                      {label}
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="shrink-0 border-t border-white/10 px-3 py-3">
        <button
          type="button"
          onClick={logout}
          className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </aside>
  )
}
