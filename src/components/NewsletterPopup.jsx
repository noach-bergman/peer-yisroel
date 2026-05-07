import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation } from 'react-router-dom'

const LS_KEY = 'newsletter_shown'
const COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000
const DELAY_MS = 15_000

function shouldShow() {
  try {
    const stored = localStorage.getItem(LS_KEY)
    if (!stored) return true
    return Date.now() - Number(stored) > COOLDOWN_MS
  } catch {
    return true
  }
}

function markShown() {
  try {
    localStorage.setItem(LS_KEY, String(Date.now()))
  } catch {}
}

export default function NewsletterPopup() {
  const { t, i18n } = useTranslation()
  const { pathname } = useLocation()
  const [visible, setVisible] = useState(false)
  const [step, setStep] = useState('form') // 'form' | 'success'
  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '' })
  const timerRef = useRef(null)

  const isHebrew = i18n.language === 'he'

  useEffect(() => {
    if (pathname.startsWith('/admin')) return
    if (!shouldShow()) return

    timerRef.current = setTimeout(() => setVisible(true), DELAY_MS)
    return () => clearTimeout(timerRef.current)
  }, [pathname])

  function handleClose() {
    markShown()
    setVisible(false)
  }

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    setErrorMsg('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    setErrorMsg('')

    try {
      const resp = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.email,
          firstName: form.firstName,
          lastName: form.lastName,
          language: i18n.language,
        }),
      })

      if (resp.ok) {
        markShown()
        setStep('success')
      } else if (resp.status === 409) {
        setErrorMsg(t('newsletter.already_subscribed'))
      } else {
        setErrorMsg(t('newsletter.error'))
      }
    } catch {
      setErrorMsg(t('newsletter.error'))
    } finally {
      setSubmitting(false)
    }
  }

  const inputClass =
    'w-full rounded-xl border border-brand-cream-dark bg-white px-4 py-2.5 text-sm text-brand-primary placeholder:text-brand-primary/40 focus:border-brand-gold focus:outline-none focus:ring-2 focus:ring-brand-gold/20 transition-colors'

  return (
    <AnimatePresence>
      {visible && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={handleClose}
            className="fixed inset-0 z-[10010] bg-black/60 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.92, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            className="fixed inset-0 z-[10011] flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              dir={isHebrew ? 'rtl' : 'ltr'}
              className="pointer-events-auto w-full max-w-md overflow-hidden rounded-2xl shadow-2xl border border-brand-gold/30 bg-[#F5EDD8]"
            >
              {/* Gold accent bar */}
              <div className="h-1.5 w-full bg-gradient-to-r from-brand-gold via-brand-gold-light to-brand-gold" />

              <div className="relative px-8 py-7">
                {/* Close button */}
                <button
                  onClick={handleClose}
                  aria-label={t('newsletter.close')}
                  className="absolute top-4 end-4 text-brand-primary/40 hover:text-brand-primary/70 transition-colors"
                >
                  <X size={18} />
                </button>

                <AnimatePresence mode="wait">
                  {step === 'form' ? (
                    <motion.div
                      key="form"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.2 }}
                    >
                      {/* Header */}
                      <div className="mb-5 text-center">
                        <h2 className="text-xl font-bold text-brand-primary mb-1">
                          {t('newsletter.title')}
                        </h2>
                        <p className="text-sm text-brand-primary/60 leading-relaxed">
                          {t('newsletter.subtitle')}
                        </p>
                      </div>

                      <form onSubmit={handleSubmit} className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <input
                            type="text"
                            name="firstName"
                            value={form.firstName}
                            onChange={handleChange}
                            placeholder={t('newsletter.first_name')}
                            className={inputClass}
                          />
                          <input
                            type="text"
                            name="lastName"
                            value={form.lastName}
                            onChange={handleChange}
                            placeholder={t('newsletter.last_name')}
                            className={inputClass}
                          />
                        </div>
                        <input
                          type="email"
                          name="email"
                          value={form.email}
                          onChange={handleChange}
                          placeholder={t('newsletter.email')}
                          required
                          className={inputClass}
                        />

                        {errorMsg && (
                          <p className="text-xs text-red-600 text-center">{errorMsg}</p>
                        )}

                        <button
                          type="submit"
                          disabled={submitting}
                          className="w-full rounded-xl bg-brand-gold px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-gold-hover disabled:opacity-60 transition-colors mt-1"
                        >
                          {submitting ? t('newsletter.submitting') : t('newsletter.submit')}
                        </button>

                        <button
                          type="button"
                          onClick={handleClose}
                          className="w-full text-xs text-brand-primary/40 hover:text-brand-primary/60 transition-colors py-1"
                        >
                          {t('newsletter.no_thanks')}
                        </button>
                      </form>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.25 }}
                      className="py-4 text-center"
                    >
                      <div className="text-4xl mb-3">✉️</div>
                      <h2 className="text-xl font-bold text-brand-primary mb-2">
                        {t('newsletter.success_title')}
                      </h2>
                      <p className="text-sm text-brand-primary/60 mb-5">
                        {t('newsletter.success_text')}
                      </p>
                      <button
                        onClick={() => setVisible(false)}
                        className="rounded-xl bg-brand-gold px-6 py-2 text-sm font-semibold text-white hover:bg-brand-gold-hover transition-colors"
                      >
                        {t('newsletter.close')}
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
