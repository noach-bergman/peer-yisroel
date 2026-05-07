import { useCallback, useEffect, useRef, useState } from 'react'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import TextAlign from '@tiptap/extension-text-align'
import { TextStyle } from '@tiptap/extension-text-style'
import { Color } from '@tiptap/extension-color'
import { Extension, Node } from '@tiptap/core'
import { AlignCenter, AlignLeft, AlignRight, CheckCircle, Eye, EyeOff, ImageIcon, Mail, Send, Trash2, Upload, Users, X } from 'lucide-react'
import { supabase, supabaseConfigured } from '../../supabase'
import { uploadToCloudinary } from '../../lib/cloudinary'

/* ── Custom FontSize extension ─────────────────────────── */
const FontSize = Extension.create({
  name: 'fontSize',
  addOptions() { return { types: ['textStyle'] } },
  addGlobalAttributes() {
    return [{
      types: this.options.types,
      attributes: {
        fontSize: {
          default: null,
          parseHTML: el => el.style.fontSize || null,
          renderHTML: ({ fontSize }) => fontSize ? { style: `font-size:${fontSize}` } : {},
        },
      },
    }]
  },
  addCommands() {
    return {
      setFontSize: size => ({ chain }) => chain().setMark('textStyle', { fontSize: size }).run(),
      unsetFontSize: () => ({ chain }) => chain().setMark('textStyle', { fontSize: null }).run(),
    }
  },
})

/* ── Custom ImageLink node (image + href) ──────────────── */
const ImageLink = Node.create({
  name: 'imageLink',
  group: 'block',
  atom: true,
  addAttributes() {
    return {
      src:   { default: null },
      href:  { default: '' },
      alt:   { default: '' },
      width: { default: '100%' },
    }
  },
  parseHTML() { return [{ tag: 'div[data-image-link]' }] },
  renderHTML({ HTMLAttributes: { src, href, alt, width } }) {
    const img = ['img', { src, alt, style: `width:${width};max-width:100%;border-radius:8px;display:block;margin:0 auto;` }]
    if (href) {
      return ['div', { 'data-image-link': '', style: 'text-align:center;margin:16px 0;' },
        ['a', { href, target: '_blank', style: 'display:inline-block;' }, img]
      ]
    }
    return ['div', { 'data-image-link': '', style: 'text-align:center;margin:16px 0;' }, img]
  },
  addCommands() {
    return {
      insertImageLink: attrs => ({ commands }) =>
        commands.insertContent({ type: this.name, attrs }),
    }
  },
})

/* ── Toast ───────────────────────────────────────────────── */
function Toast({ msg, type = 'info', onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 4000); return () => clearTimeout(t) }, [onDone])
  return (
    <div className={`fixed bottom-6 left-1/2 z-[10002] -translate-x-1/2 rounded-full ${type === 'error' ? 'bg-red-600' : type === 'success' ? 'bg-green-700' : 'bg-gray-950'} px-5 py-3 text-sm font-medium text-white shadow-2xl whitespace-nowrap`} dir="ltr">
      {msg}
    </div>
  )
}

/* ── Build HTML email ───────────────────────────────────── */
function buildEmailHtml({ bgColor, headerBg, titleHe, titleEn, senderName, bodyHtml, lang }) {
  const isHe = lang === 'he'
  const dir = isHe ? 'rtl' : 'ltr'
  const align = isHe ? 'right' : 'left'
  const title = isHe ? (titleHe || 'פאר ישראל') : (titleEn || "Pe'er Yisroel")
  const orgLabel = isHe ? 'ישיבת פאר ישראל' : "Pe'er Yisroel Yeshiva"
  const footerText = isHe
    ? `שלחנו אליך אימייל זה כי נרשמת לרשימת התפוצה של ${senderName || 'ישיבת פאר ישראל'}`
    : `You received this because you subscribed to ${senderName || "Pe'er Yisroel"}'s newsletter.`

  return `<!DOCTYPE html>
<html lang="${lang}" dir="${dir}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title}</title>
<style>
  a img { border: none; }
  img { max-width: 100%; height: auto; }
</style>
</head>
<body style="margin:0;padding:0;background:${bgColor || '#f4f0e8'};font-family:Georgia,serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:${bgColor || '#f4f0e8'};">
  <tr><td align="center" style="padding:32px 16px;">
    <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
      <tr><td>
        <div style="background:${headerBg || '#162A55'};padding:40px 32px;text-align:center;">
          <p style="color:#C48918;font-size:13px;letter-spacing:3px;text-transform:uppercase;margin:0 0 8px;">${orgLabel}</p>
          <h1 style="color:#fff;font-size:26px;font-weight:700;margin:0;font-family:Georgia,serif;">${title}</h1>
        </div>
      </td></tr>
      <tr><td style="padding:40px 40px 32px;direction:${dir};text-align:${align};">
        <div style="color:#1a1a1a;font-size:16px;line-height:1.8;">${bodyHtml}</div>
      </td></tr>
      <tr><td style="padding:0 40px;"><div style="height:1px;background:#e8dfc8;"></div></td></tr>
      <tr><td style="padding:24px 40px;text-align:center;">
        <p style="color:#888;font-size:12px;margin:0 0 4px;">${footerText}</p>
        <p style="color:#888;font-size:12px;margin:0;">© ${new Date().getFullYear()} Pe'er Yisroel</p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>`
}

/* ── Color swatch picker ────────────────────────────────── */
const PRESETS = ['#162A55', '#C48918', '#F5EDD8', '#f4f0e8', '#1a3a1a', '#2d1b4e', '#0B1732', '#ffffff']
function ColorPicker({ value, onChange, label }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 mb-2">{label}</label>
      <div className="flex items-center gap-2 flex-wrap">
        {PRESETS.map(c => (
          <button key={c} type="button" onClick={() => onChange(c)}
            style={{ background: c }}
            className={`w-7 h-7 rounded-full border-2 transition ${value === c ? 'border-brand-gold scale-110' : 'border-transparent hover:scale-105'} ${c === '#ffffff' ? '!border-gray-200' : ''}`}
          />
        ))}
        <input type="color" value={value} onChange={e => onChange(e.target.value)}
          className="w-7 h-7 rounded-full border border-gray-300 cursor-pointer" />
      </div>
    </div>
  )
}

/* ── Image insert modal ─────────────────────────────────── */
function ImageModal({ onInsert, onClose }) {
  const fileRef = useRef(null)
  const [src, setSrc] = useState('')
  const [href, setHref] = useState('https://peeryisroel.org/gallery')
  const [width, setWidth] = useState('100%')
  const [uploading, setUploading] = useState(false)

  async function handleUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try { setSrc(await uploadToCloudinary(file)) }
    catch {}
    finally { setUploading(false) }
  }

  const inp = 'w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 focus:border-brand-gold focus:outline-none focus:ring-2 focus:ring-brand-gold/20 transition-colors'

  return (
    <div className="fixed inset-0 z-[10010] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-96 mx-4 space-y-4" dir="ltr">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-gray-900">Insert Image</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition"><X size={16} /></button>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-500">Image</label>
          <div className="flex gap-2">
            <input value={src} onChange={e => setSrc(e.target.value)} placeholder="https://..." className={inp} />
            <button onClick={() => fileRef.current?.click()} disabled={uploading}
              className="flex items-center gap-1.5 rounded-xl border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition whitespace-nowrap">
              <Upload size={13} />
              {uploading ? '...' : 'Upload'}
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
          </div>
          {src && <img src={src} alt="" className="mt-2 h-24 w-full object-cover rounded-lg border border-gray-200" />}
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-500">Link to (click goes to...)</label>
          <input value={href} onChange={e => setHref(e.target.value)} placeholder="https://peeryisroel.org/gallery" className={inp} />
          <p className="text-xs text-gray-400">Leave blank for no link</p>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-500">Size</label>
          <select value={width} onChange={e => setWidth(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:border-brand-gold focus:outline-none transition-colors">
            <option value="30%">Small (30%)</option>
            <option value="50%">Medium (50%)</option>
            <option value="80%">Large (80%)</option>
            <option value="100%">Full Width</option>
          </select>
        </div>

        <div className="flex gap-3 pt-1">
          <button onClick={onClose} className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition">Cancel</button>
          <button onClick={() => { if (src) { onInsert({ src, href, width }); onClose() } }}
            disabled={!src}
            className="flex-1 rounded-xl bg-brand-gold py-2.5 text-sm font-semibold text-white hover:bg-brand-gold-hover disabled:opacity-40 transition">
            Insert
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── Editor Toolbar ─────────────────────────────────────── */
const FONT_SIZES = [
  { label: 'Small', value: '13px' },
  { label: 'Normal', value: '16px' },
  { label: 'Large', value: '20px' },
  { label: 'XLarge', value: '26px' },
]

function Toolbar({ editor, onImageClick }) {
  if (!editor) return null

  const btn = (active, fn, content, title) => (
    <button type="button" onClick={fn} title={title}
      className={`px-2.5 py-1 rounded text-sm font-medium transition ${active ? 'bg-brand-primary text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
      {content}
    </button>
  )

  const iconBtn = (active, fn, Icon, title) => (
    <button type="button" onClick={fn} title={title}
      className={`p-1.5 rounded transition ${active ? 'bg-brand-primary text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
      <Icon size={14} />
    </button>
  )

  return (
    <div className="flex flex-wrap items-center gap-0.5 p-2 border-b border-gray-200 bg-gray-50">
      {/* Text style */}
      {btn(editor.isActive('bold'), () => editor.chain().focus().toggleBold().run(), <b>B</b>)}
      {btn(editor.isActive('italic'), () => editor.chain().focus().toggleItalic().run(), <i>I</i>)}
      <div className="w-px h-4 bg-gray-300 mx-1" />

      {/* Headings */}
      {btn(editor.isActive('heading', { level: 2 }), () => editor.chain().focus().toggleHeading({ level: 2 }).run(), 'H2')}
      {btn(editor.isActive('heading', { level: 3 }), () => editor.chain().focus().toggleHeading({ level: 3 }).run(), 'H3')}
      <div className="w-px h-4 bg-gray-300 mx-1" />

      {/* Font size */}
      <select
        onChange={e => {
          if (e.target.value) editor.chain().focus().setFontSize(e.target.value).run()
          else editor.chain().focus().unsetFontSize().run()
        }}
        className="rounded border border-gray-200 bg-white text-xs text-gray-600 px-1.5 py-1 focus:outline-none focus:border-brand-gold"
        title="Font size">
        <option value="">Size</option>
        {FONT_SIZES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
      </select>
      <div className="w-px h-4 bg-gray-300 mx-1" />

      {/* Alignment */}
      {iconBtn(editor.isActive({ textAlign: 'left' }), () => editor.chain().focus().setTextAlign('left').run(), AlignLeft, 'Align left')}
      {iconBtn(editor.isActive({ textAlign: 'center' }), () => editor.chain().focus().setTextAlign('center').run(), AlignCenter, 'Center')}
      {iconBtn(editor.isActive({ textAlign: 'right' }), () => editor.chain().focus().setTextAlign('right').run(), AlignRight, 'Align right')}
      <div className="w-px h-4 bg-gray-300 mx-1" />

      {/* Lists */}
      {btn(editor.isActive('bulletList'), () => editor.chain().focus().toggleBulletList().run(), '• List')}
      {btn(editor.isActive('orderedList'), () => editor.chain().focus().toggleOrderedList().run(), '1. List')}
      <button type="button" onClick={() => editor.chain().focus().setHorizontalRule().run()}
        className="px-2.5 py-1 rounded text-sm text-gray-600 hover:bg-gray-100 transition">—</button>
      <div className="w-px h-4 bg-gray-300 mx-1" />

      {/* Image */}
      <button type="button" onClick={onImageClick}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded text-sm font-medium text-gray-600 hover:bg-gray-100 transition">
        <ImageIcon size={13} /> Image
      </button>
      <div className="w-px h-4 bg-gray-300 mx-1" />

      {/* Text color */}
      <label className="flex items-center gap-1.5 px-2 py-1 rounded text-sm font-medium text-gray-600 hover:bg-gray-100 transition cursor-pointer" title="Text color">
        <span className="font-bold" style={{ color: editor.getAttributes('textStyle').color || '#1a1a1a' }}>A</span>
        <input
          type="color"
          defaultValue="#1a1a1a"
          onChange={e => editor.chain().focus().setColor(e.target.value).run()}
          className="w-4 h-4 rounded cursor-pointer border-0 p-0 bg-transparent"
          title="Text color"
        />
      </label>
      <button type="button" onClick={() => editor.chain().focus().unsetColor().run()}
        className="px-2 py-1 rounded text-xs text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition" title="Reset color">
        ✕
      </button>
    </div>
  )
}

/* ── Email Preview ──────────────────────────────────────── */
function EmailPreview({ config, htmlHe, htmlEn, lang }) {
  const html = buildEmailHtml({ ...config, bodyHtml: lang === 'he' ? htmlHe : htmlEn, lang })
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden shadow-inner">
      <div className="bg-gray-100 px-4 py-2 text-xs text-gray-500 font-medium border-b border-gray-200">
        Preview — {lang === 'he' ? 'Hebrew version' : 'English version'}
      </div>
      <iframe srcDoc={html} title="Email Preview" className="w-full" style={{ height: '500px', border: 'none' }} />
    </div>
  )
}

/* ── Lang tab ───────────────────────────────────────────── */
function LangTabs({ value, onChange }) {
  return (
    <div className="inline-flex rounded-lg border border-gray-200 overflow-hidden text-sm font-semibold">
      {['he', 'en'].map(l => (
        <button key={l} type="button" onClick={() => onChange(l)}
          className={`px-4 py-1.5 transition ${value === l ? 'bg-brand-primary text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}>
          {l === 'he' ? 'עברית' : 'English'}
        </button>
      ))}
    </div>
  )
}

/* ── TipTap extensions ──────────────────────────────────── */
const EXTENSIONS = [
  StarterKit,
  TextAlign.configure({ types: ['heading', 'paragraph'] }),
  TextStyle,
  FontSize,
  Color,
  ImageLink,
]

/* ── Main ────────────────────────────────────────────────── */
export default function NewsletterManager() {
  const [subscribers, setSubscribers] = useState([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState(null)
  const [sending, setSending] = useState(false)
  const [testing, setTesting] = useState(false)
  const [panel, setPanel] = useState('list')
  const [showPreview, setShowPreview] = useState(false)
  const [showImageModal, setShowImageModal] = useState(false)
  const [activeLangForImage, setActiveLangForImage] = useState('he')
  const [langTab, setLangTab] = useState('he')
  const [testSent, setTestSent] = useState(false)
  const [testEmail, setTestEmail] = useState('')
  const [showConfirm, setShowConfirm] = useState(false)

  const [bgColor, setBgColor] = useState('#f4f0e8')
  const [headerBg, setHeaderBg] = useState('#162A55')
  const [senderName, setSenderName] = useState("Pe'er Yisroel")
  const [senderEmail, setSenderEmail] = useState('')
  const [subjectHe, setSubjectHe] = useState('')
  const [subjectEn, setSubjectEn] = useState('')
  const [titleHe, setTitleHe] = useState('')
  const [titleEn, setTitleEn] = useState('')

  const notify = useCallback((msg, type = 'info') => setToast({ msg, type }), [])

  const editorHe = useEditor({
    extensions: EXTENSIONS,
    content: '',
    editorProps: { attributes: { class: 'min-h-[180px] focus:outline-none text-sm text-gray-800 p-4', dir: 'rtl' } },
  })
  const editorEn = useEditor({
    extensions: EXTENSIONS,
    content: '',
    editorProps: { attributes: { class: 'min-h-[180px] focus:outline-none text-sm text-gray-800 p-4', dir: 'ltr' } },
  })

  const activeEditor = langTab === 'he' ? editorHe : editorEn

  const load = useCallback(async () => {
    if (!supabaseConfigured || !supabase) { setLoading(false); return }
    const { data, error } = await supabase
      .from('newsletter_subscribers').select('*').order('subscribed_at', { ascending: false })
    if (!error) setSubscribers(data ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    supabase?.auth.getSession().then(({ data: { session } }) => {
      if (session?.user?.email) setTestEmail(session.user.email)
    })
  }, [])

  async function handleDeactivate(id) {
    const { error } = await supabase.from('newsletter_subscribers').update({ active: false }).eq('id', id)
    if (error) notify('Failed', 'error')
    else { setSubscribers(p => p.map(s => s.id === id ? { ...s, active: false } : s)); notify('Deactivated') }
  }

  async function handleReactivate(id) {
    const { error } = await supabase.from('newsletter_subscribers').update({ active: true }).eq('id', id)
    if (error) notify('Failed', 'error')
    else { setSubscribers(p => p.map(s => s.id === id ? { ...s, active: true } : s)); notify('Reactivated') }
  }

  function validate() {
    if (!subjectHe.trim()) { notify('Please enter a Hebrew subject line', 'error'); return false }
    if (!subjectEn.trim()) { notify('Please enter an English subject line', 'error'); return false }
    if (!senderEmail.trim()) { notify('Please enter a sender email', 'error'); return false }
    const heHtml = editorHe?.getHTML() ?? ''
    const enHtml = editorEn?.getHTML() ?? ''
    if (!heHtml || heHtml === '<p></p>') { notify('Please write the Hebrew email body', 'error'); return false }
    if (!enHtml || enHtml === '<p></p>') { notify('Please write the English email body', 'error'); return false }
    return true
  }

  async function getPayload() {
    const { data: { session } } = await supabase.auth.getSession()
    return {
      token: session?.access_token,
      body: {
        subjectHe, subjectEn,
        htmlContentHe: buildEmailHtml({ bgColor, headerBg, titleHe, titleEn, senderName, bodyHtml: editorHe?.getHTML() ?? '', lang: 'he' }),
        htmlContentEn: buildEmailHtml({ bgColor, headerBg, titleHe, titleEn, senderName, bodyHtml: editorEn?.getHTML() ?? '', lang: 'en' }),
        senderName, senderEmail,
      },
    }
  }

  async function handleSendTest() {
    if (!validate()) return
    setTesting(true)
    try {
      const { token, body } = await getPayload()
      const resp = await fetch('/api/send-newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...body, test: true, testEmail }),
      })
      const result = await resp.json()
      if (resp.ok) {
        setTestSent(true)
        notify(`Test sent to ${result.sentTo}`, 'success')
      } else notify(result.error || 'Test failed', 'error')
    } catch { notify('Network error', 'error') }
    finally { setTesting(false) }
  }

  async function doSendAll() {
    setShowConfirm(false)
    setSending(true)
    try {
      const { token, body } = await getPayload()
      const resp = await fetch('/api/send-newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      })
      const result = await resp.json()
      if (resp.ok) {
        notify(`Sent to ${result.sent} subscriber${result.sent !== 1 ? 's' : ''}${result.failed ? ` (${result.failed} failed)` : ''}`, 'success')
        setSubjectHe(''); setSubjectEn(''); setTitleHe(''); setTitleEn('')
        editorHe?.commands.clearContent(); editorEn?.commands.clearContent()
        setTestSent(false); setPanel('list')
      } else notify(result.error || 'Failed to send', 'error')
    } catch { notify('Network error', 'error') }
    finally { setSending(false) }
  }

  const total = subscribers.length
  const active = subscribers.filter(s => s.active).length
  const activeHe = subscribers.filter(s => s.active && s.language === 'he').length
  const activeEn = subscribers.filter(s => s.active && s.language !== 'he').length
  const now = new Date()
  const thisMonth = subscribers.filter(s => {
    const d = new Date(s.subscribed_at)
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  }).length

  const inputClass = 'w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-brand-gold focus:outline-none focus:ring-2 focus:ring-brand-gold/20 transition-colors'

  return (
    <div className="p-8 max-w-5xl" dir="ltr">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Newsletter</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage subscribers and send bilingual emails</p>
        </div>
        <button onClick={() => { setPanel(panel === 'compose' ? 'list' : 'compose'); setTestSent(false) }}
          className="flex items-center gap-2 rounded-xl bg-brand-gold px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-gold-hover transition-colors shadow-sm">
          {panel === 'compose' ? <><Users size={15} /> View Subscribers</> : <><Mail size={15} /> Compose Email</>}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Total Subscribers', value: total },
          { label: 'Active', value: active, sub: `${activeHe} עברית · ${activeEn} EN` },
          { label: 'This Month', value: thisMonth },
        ].map(({ label, value, sub }) => (
          <div key={label} className="rounded-2xl border border-gray-100 bg-white px-6 py-4 shadow-sm">
            <p className="text-3xl font-bold text-brand-primary">{loading ? '—' : value}</p>
            <p className="text-xs text-gray-500 mt-1">{label}</p>
            {sub && !loading && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
          </div>
        ))}
      </div>

      {/* Subscriber List */}
      {panel === 'list' && (
        <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16 text-gray-400 text-sm">Loading...</div>
          ) : subscribers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <Users size={32} className="mb-3 opacity-30" /><p className="text-sm">No subscribers yet</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  <th className="px-5 py-3 text-left">Name</th>
                  <th className="px-5 py-3 text-left">Email</th>
                  <th className="px-5 py-3 text-left">Language</th>
                  <th className="px-5 py-3 text-left">Subscribed</th>
                  <th className="px-5 py-3 text-left">Status</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {subscribers.map(sub => (
                  <tr key={sub.id} className={`hover:bg-gray-50/60 transition-colors ${!sub.active ? 'opacity-50' : ''}`}>
                    <td className="px-5 py-3 font-medium text-gray-800">{[sub.first_name, sub.last_name].filter(Boolean).join(' ') || '—'}</td>
                    <td className="px-5 py-3 text-gray-600">{sub.email}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${sub.language === 'he' ? 'bg-blue-50 text-blue-700' : 'bg-amber-50 text-amber-700'}`}>
                        {sub.language === 'he' ? 'עברית' : 'EN'}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-500">{new Date(sub.subscribed_at).toLocaleDateString('en-GB')}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${sub.active ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {sub.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      {sub.active
                        ? <button onClick={() => handleDeactivate(sub.id)} className="text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={15} /></button>
                        : <button onClick={() => handleReactivate(sub.id)} className="text-xs text-brand-gold hover:text-brand-gold-hover font-medium">Reactivate</button>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Compose */}
      {panel === 'compose' && (
        <div className="space-y-5">
          {/* Sender */}
          <div className="rounded-2xl border border-gray-100 bg-white shadow-sm p-6 space-y-4">
            <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide">Sender</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Sender Name</label>
                <input type="text" value={senderName} onChange={e => setSenderName(e.target.value)} placeholder="Pe'er Yisroel" className={inputClass} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Sender Email</label>
                <input type="email" value={senderEmail} onChange={e => setSenderEmail(e.target.value)} placeholder="newsletter@peeryisroel.org" className={inputClass} />
              </div>
            </div>
          </div>

          {/* Subject & Title */}
          <div className="rounded-2xl border border-gray-100 bg-white shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide">Subject & Title</h2>
              <LangTabs value={langTab} onChange={setLangTab} />
            </div>
            {langTab === 'he' ? (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">Subject Line (Hebrew)</label>
                  <input type="text" value={subjectHe} onChange={e => setSubjectHe(e.target.value)} placeholder="עדכון חודשי מישיבת פאר ישראל" className={inputClass} dir="rtl" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">Email Title in Header (Hebrew)</label>
                  <input type="text" value={titleHe} onChange={e => setTitleHe(e.target.value)} placeholder="עדכון חודשי" className={inputClass} dir="rtl" />
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">Subject Line (English)</label>
                  <input type="text" value={subjectEn} onChange={e => setSubjectEn(e.target.value)} placeholder="Monthly update from Pe'er Yisroel" className={inputClass} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">Email Title in Header (English)</label>
                  <input type="text" value={titleEn} onChange={e => setTitleEn(e.target.value)} placeholder="Monthly Update" className={inputClass} />
                </div>
              </div>
            )}
          </div>

          {/* Design */}
          <div className="rounded-2xl border border-gray-100 bg-white shadow-sm p-6 space-y-5">
            <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide">Email Design</h2>
            <div className="grid grid-cols-2 gap-5">
              <ColorPicker value={bgColor} onChange={setBgColor} label="Background Color" />
              <ColorPicker value={headerBg} onChange={setHeaderBg} label="Header Color" />
            </div>
          </div>

          {/* Body editors */}
          <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide">Email Body</h2>
                <LangTabs value={langTab} onChange={setLangTab} />
              </div>
              <button type="button" onClick={() => setShowPreview(!showPreview)}
                className="flex items-center gap-1.5 text-xs font-medium text-brand-gold hover:text-brand-gold-hover transition">
                {showPreview ? <><EyeOff size={13} /> Hide Preview</> : <><Eye size={13} /> Show Preview</>}
              </button>
            </div>
            <Toolbar
              editor={activeEditor}
              onImageClick={() => { setActiveLangForImage(langTab); setShowImageModal(true) }}
            />
            <div className={langTab === 'en' ? 'hidden' : ''}>
              <EditorContent editor={editorHe} className="prose prose-sm max-w-none" />
            </div>
            <div className={langTab === 'he' ? 'hidden' : ''}>
              <EditorContent editor={editorEn} className="prose prose-sm max-w-none" />
            </div>
          </div>

          {/* Preview */}
          {showPreview && (
            <EmailPreview
              config={{ bgColor, headerBg, titleHe, titleEn, senderName }}
              htmlHe={editorHe?.getHTML() ?? ''}
              htmlEn={editorEn?.getHTML() ?? ''}
              lang={langTab}
            />
          )}

          {/* Test sent banner */}
          {testSent && (
            <div className="flex items-center gap-3 rounded-2xl border border-green-200 bg-green-50 px-6 py-4">
              <CheckCircle size={18} className="text-green-600 shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-green-800">Test emails sent to {testEmail}</p>
                <p className="text-xs text-green-700 mt-0.5">Check both Hebrew and English versions in your inbox, then send to all subscribers below.</p>
              </div>
            </div>
          )}

          {/* Action bar */}
          <div className="rounded-2xl border border-gray-100 bg-white shadow-sm px-6 py-4 space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <label className="block text-xs font-semibold text-gray-500 mb-1">Test email address</label>
                <input type="email" value={testEmail} onChange={e => setTestEmail(e.target.value)}
                  placeholder="your@email.com" className={inputClass} />
              </div>
              <div className="pt-5">
                <button onClick={handleSendTest} disabled={testing}
                  className="flex items-center gap-2 rounded-xl border border-brand-gold px-4 py-2.5 text-sm font-semibold text-brand-gold hover:bg-brand-gold/5 disabled:opacity-50 transition whitespace-nowrap">
                  <Send size={14} />
                  {testing ? 'Sending test...' : testSent ? 'Re-send Test' : 'Send Test'}
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
              <p className="text-sm text-gray-500">
                Will send to <span className="font-semibold text-brand-primary">{active}</span> subscribers
                {active > 0 && <span className="text-gray-400"> ({activeHe} Hebrew · {activeEn} English)</span>}
              </p>
              <button onClick={() => setShowConfirm(true)} disabled={sending || active === 0 || !testSent}
                title={!testSent ? 'Send a test first' : ''}
                className="flex items-center gap-2 rounded-xl bg-brand-gold px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-gold-hover disabled:opacity-40 transition-colors">
                <Send size={15} />
                {sending ? 'Sending...' : 'Send to All'}
              </button>
            </div>
            {!testSent && <p className="text-xs text-gray-400 text-right">Send a test first to enable this button</p>}
          </div>
        </div>
      )}

      {/* Image modal */}
      {showImageModal && (
        <ImageModal
          onInsert={attrs => {
            const editor = activeLangForImage === 'he' ? editorHe : editorEn
            editor?.chain().focus().insertImageLink(attrs).run()
          }}
          onClose={() => setShowImageModal(false)}
        />
      )}

      {/* Confirm dialog */}
      {showConfirm && (
        <div className="fixed inset-0 z-[10003] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-80 mx-4 text-center" dir="ltr">
            <p className="text-gray-900 font-bold text-base mb-1">Send to All Subscribers?</p>
            <p className="text-gray-500 text-sm mb-1">{activeHe} Hebrew · {activeEn} English</p>
            <p className="text-gray-400 text-xs mb-6">Each subscriber receives their language version.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowConfirm(false)} className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition">Cancel</button>
              <button onClick={doSendAll} className="flex-1 rounded-xl bg-brand-gold py-2.5 text-sm font-semibold text-white hover:bg-brand-gold-hover transition">Send</button>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast msg={toast.msg} type={toast.type} onDone={() => setToast(null)} />}
    </div>
  )
}
