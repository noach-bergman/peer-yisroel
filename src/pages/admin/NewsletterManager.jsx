import { useCallback, useEffect, useState } from 'react'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Mail, Send, Trash2, Users } from 'lucide-react'
import { supabase, supabaseConfigured } from '../../supabase'

/* ── Toast ───────────────────────────────────────────────── */
function Toast({ msg, type = 'info', onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3500)
    return () => clearTimeout(t)
  }, [onDone])
  const bg = type === 'error' ? 'bg-red-600' : 'bg-gray-950'
  return (
    <div
      className={`fixed bottom-6 left-1/2 z-[10002] -translate-x-1/2 rounded-full ${bg} px-5 py-3 text-sm font-medium text-white shadow-2xl`}
      dir="ltr"
    >
      {msg}
    </div>
  )
}

/* ── Confirm Dialog ──────────────────────────────────────── */
function ConfirmDialog({ title, message, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-[10003] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-80 mx-4 text-center" dir="ltr">
        <p className="text-gray-900 font-bold text-base mb-1">{title}</p>
        <p className="text-gray-500 text-sm mb-6">{message}</p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 rounded-xl bg-brand-gold py-2.5 text-sm font-semibold text-white hover:bg-brand-gold-hover transition"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── Toolbar for TipTap editor ───────────────────────────── */
function EditorToolbar({ editor }) {
  if (!editor) return null

  const btn = (active, action, label) => (
    <button
      type="button"
      onClick={action}
      title={label}
      className={`px-2.5 py-1 rounded text-sm font-medium transition ${
        active
          ? 'bg-brand-primary text-white'
          : 'text-gray-600 hover:bg-gray-100'
      }`}
    >
      {label}
    </button>
  )

  return (
    <div className="flex flex-wrap gap-1 border-b border-gray-200 pb-2 mb-2">
      {btn(editor.isActive('bold'), () => editor.chain().focus().toggleBold().run(), 'B')}
      {btn(editor.isActive('italic'), () => editor.chain().focus().toggleItalic().run(), 'I')}
      {btn(
        editor.isActive('heading', { level: 2 }),
        () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
        'H2'
      )}
      {btn(
        editor.isActive('heading', { level: 3 }),
        () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
        'H3'
      )}
      {btn(
        editor.isActive('bulletList'),
        () => editor.chain().focus().toggleBulletList().run(),
        '• List'
      )}
      {btn(
        editor.isActive('orderedList'),
        () => editor.chain().focus().toggleOrderedList().run(),
        '1. List'
      )}
      <button
        type="button"
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        className="px-2.5 py-1 rounded text-sm font-medium text-gray-600 hover:bg-gray-100 transition"
        title="Divider"
      >
        ―
      </button>
    </div>
  )
}

/* ── Main ────────────────────────────────────────────────── */
export default function NewsletterManager() {
  const [subscribers, setSubscribers] = useState([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState(null)
  const [confirmDialog, setConfirmDialog] = useState(null)
  const [sending, setSending] = useState(false)
  const [panel, setPanel] = useState('list') // 'list' | 'compose'

  const [subject, setSubject] = useState('')
  const [senderName, setSenderName] = useState("Pe'er Yisroel")
  const [senderEmail, setSenderEmail] = useState('')

  const notify = useCallback((msg, type = 'info') => setToast({ msg, type }), [])

  const editor = useEditor({
    extensions: [StarterKit],
    content: '',
    editorProps: {
      attributes: {
        class: 'min-h-[180px] focus:outline-none text-sm text-gray-800',
      },
    },
  })

  const load = useCallback(async () => {
    if (!supabaseConfigured || !supabase) {
      setLoading(false)
      return
    }
    const { data, error } = await supabase
      .from('newsletter_subscribers')
      .select('*')
      .order('subscribed_at', { ascending: false })

    if (!error) setSubscribers(data ?? [])
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  async function handleDeactivate(id) {
    const { error } = await supabase
      .from('newsletter_subscribers')
      .update({ active: false })
      .eq('id', id)

    if (error) {
      notify('Failed to deactivate subscriber', 'error')
    } else {
      setSubscribers((prev) =>
        prev.map((s) => (s.id === id ? { ...s, active: false } : s))
      )
      notify('Subscriber deactivated')
    }
  }

  async function handleReactivate(id) {
    const { error } = await supabase
      .from('newsletter_subscribers')
      .update({ active: true })
      .eq('id', id)

    if (error) {
      notify('Failed to reactivate subscriber', 'error')
    } else {
      setSubscribers((prev) =>
        prev.map((s) => (s.id === id ? { ...s, active: true } : s))
      )
      notify('Subscriber reactivated')
    }
  }

  function handleSendClick() {
    if (!subject.trim()) {
      notify('Please enter a subject line', 'error')
      return
    }
    if (!senderEmail.trim()) {
      notify('Please enter a sender email', 'error')
      return
    }
    const html = editor?.getHTML() ?? ''
    if (!html || html === '<p></p>') {
      notify('Please write an email body', 'error')
      return
    }

    const activeCount = subscribers.filter((s) => s.active).length
    setConfirmDialog({
      title: 'Send Newsletter',
      message: `Send to ${activeCount} active subscriber${activeCount !== 1 ? 's' : ''}?`,
      onConfirm: () => {
        setConfirmDialog(null)
        doSend(html)
      },
    })
  }

  async function doSend(htmlContent) {
    setSending(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token

      const resp = await fetch('/api/send-newsletter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ subject, htmlContent, senderName, senderEmail }),
      })

      const result = await resp.json()
      if (resp.ok) {
        notify(`Sent to ${result.sent} subscriber${result.sent !== 1 ? 's' : ''}${result.failed ? ` (${result.failed} failed)` : ''}`)
        setSubject('')
        editor?.commands.clearContent()
        setPanel('list')
      } else {
        notify(result.error || 'Failed to send', 'error')
      }
    } catch {
      notify('Network error — please try again', 'error')
    } finally {
      setSending(false)
    }
  }

  // Computed stats
  const total = subscribers.length
  const active = subscribers.filter((s) => s.active).length
  const now = new Date()
  const thisMonth = subscribers.filter((s) => {
    const d = new Date(s.subscribed_at)
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  }).length

  const inputClass =
    'w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-brand-gold focus:outline-none focus:ring-2 focus:ring-brand-gold/20 transition-colors'

  return (
    <div className="p-8 max-w-5xl" dir="ltr">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Newsletter</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage subscribers and send emails</p>
        </div>
        <button
          onClick={() => setPanel(panel === 'compose' ? 'list' : 'compose')}
          className="flex items-center gap-2 rounded-xl bg-brand-gold px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-gold-hover transition-colors shadow-sm"
        >
          {panel === 'compose' ? (
            <><Users size={15} /> View Subscribers</>
          ) : (
            <><Mail size={15} /> Compose Email</>
          )}
        </button>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Total Subscribers', value: total },
          { label: 'Active', value: active },
          { label: 'This Month', value: thisMonth },
        ].map(({ label, value }) => (
          <div
            key={label}
            className="rounded-2xl border border-gray-100 bg-white px-6 py-4 shadow-sm"
          >
            <p className="text-3xl font-bold text-brand-primary">{loading ? '—' : value}</p>
            <p className="text-xs text-gray-500 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Subscriber list */}
      {panel === 'list' && (
        <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16 text-gray-400 text-sm">
              Loading subscribers...
            </div>
          ) : subscribers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <Users size={32} className="mb-3 opacity-30" />
              <p className="text-sm">No subscribers yet</p>
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
                {subscribers.map((sub) => (
                  <tr key={sub.id} className={`hover:bg-gray-50/60 transition-colors ${!sub.active ? 'opacity-50' : ''}`}>
                    <td className="px-5 py-3 font-medium text-gray-800">
                      {[sub.first_name, sub.last_name].filter(Boolean).join(' ') || '—'}
                    </td>
                    <td className="px-5 py-3 text-gray-600">{sub.email}</td>
                    <td className="px-5 py-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                          sub.language === 'he'
                            ? 'bg-blue-50 text-blue-700'
                            : 'bg-amber-50 text-amber-700'
                        }`}
                      >
                        {sub.language === 'he' ? 'עברית' : 'EN'}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-500">
                      {new Date(sub.subscribed_at).toLocaleDateString('en-GB')}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                          sub.active
                            ? 'bg-green-50 text-green-700'
                            : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {sub.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      {sub.active ? (
                        <button
                          onClick={() => handleDeactivate(sub.id)}
                          title="Deactivate"
                          className="text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={15} />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleReactivate(sub.id)}
                          title="Reactivate"
                          className="text-xs text-brand-gold hover:text-brand-gold-hover transition-colors font-medium"
                        >
                          Reactivate
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Email composer */}
      {panel === 'compose' && (
        <div className="rounded-2xl border border-gray-100 bg-white shadow-sm p-6 space-y-4">
          <h2 className="text-base font-semibold text-gray-800 mb-4">Compose Email</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Sender Name</label>
              <input
                type="text"
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                placeholder="Pe'er Yisroel"
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Sender Email</label>
              <input
                type="email"
                value={senderEmail}
                onChange={(e) => setSenderEmail(e.target.value)}
                placeholder="newsletter@peeryisroel.org"
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Subject Line</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Monthly update from Pe'er Yisroel"
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Email Body</label>
            <div className="rounded-xl border border-gray-200 bg-white px-4 pt-3 pb-4 focus-within:border-brand-gold focus-within:ring-2 focus-within:ring-brand-gold/20 transition-colors">
              <EditorToolbar editor={editor} />
              <div className="prose prose-sm max-w-none">
                <EditorContent editor={editor} />
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              This content will be sent as HTML email to all active subscribers.
            </p>
          </div>

          <div className="flex items-center justify-between pt-2">
            <p className="text-sm text-gray-500">
              Will send to <span className="font-semibold text-brand-primary">{active}</span> active subscriber{active !== 1 ? 's' : ''}
            </p>
            <button
              onClick={handleSendClick}
              disabled={sending || active === 0}
              className="flex items-center gap-2 rounded-xl bg-brand-gold px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-gold-hover disabled:opacity-50 transition-colors"
            >
              <Send size={15} />
              {sending ? 'Sending...' : 'Send to All'}
            </button>
          </div>
        </div>
      )}

      {/* Confirm dialog */}
      {confirmDialog && (
        <ConfirmDialog
          title={confirmDialog.title}
          message={confirmDialog.message}
          onConfirm={confirmDialog.onConfirm}
          onCancel={() => setConfirmDialog(null)}
        />
      )}

      {/* Toast */}
      {toast && (
        <Toast msg={toast.msg} type={toast.type} onDone={() => setToast(null)} />
      )}
    </div>
  )
}
