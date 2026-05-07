import { createClient } from '@supabase/supabase-js'

const BATCH_SIZE = 50

async function sendBatch(toList, subject, htmlContent, senderName, senderEmail) {
  let sent = 0, failed = 0
  for (let i = 0; i < toList.length; i += BATCH_SIZE) {
    const batch = toList.slice(i, i + BATCH_SIZE)
    try {
      const resp = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: { 'api-key': process.env.BREVO_API_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender: { name: senderName || "Pe'er Yisroel", email: senderEmail },
          to: batch,
          subject,
          htmlContent,
        }),
      })
      if (resp.ok) sent += batch.length; else failed += batch.length
    } catch { failed += batch.length }
  }
  return { sent, failed }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const authHeader = req.headers['authorization'] ?? ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null
  if (!token) return res.status(401).json({ error: 'No token' })

  const supabaseAnon = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY)
  const { data: { user }, error: authError } = await supabaseAnon.auth.getUser(token)
  if (authError || !user) return res.status(401).json({ error: 'Unauthorized' })

  const {
    subjectHe, subjectEn,
    htmlContentHe, htmlContentEn,
    senderName, senderEmail,
    test, testEmail,
  } = req.body ?? {}

  if (!subjectHe || !subjectEn || !htmlContentHe || !htmlContentEn || !senderEmail) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  // Test mode: send both versions to admin
  if (test) {
    const target = testEmail || user.email
    let sent = 0, failed = 0
    const results = await Promise.all([
      sendBatch([{ email: target, name: 'Admin' }], `[TEST - עברית] ${subjectHe}`, htmlContentHe, senderName, senderEmail),
      sendBatch([{ email: target, name: 'Admin' }], `[TEST - English] ${subjectEn}`, htmlContentEn, senderName, senderEmail),
    ])
    results.forEach(r => { sent += r.sent; failed += r.failed })
    return res.status(200).json({ sent, failed, test: true, sentTo: target })
  }

  // Full send: group subscribers by language
  const supabaseAdmin = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
  const { data: subscribers, error: fetchError } = await supabaseAdmin
    .from('newsletter_subscribers')
    .select('email, first_name, last_name, language')
    .eq('active', true)

  if (fetchError) return res.status(500).json({ error: fetchError.message })
  if (!subscribers?.length) return res.status(200).json({ sent: 0, failed: 0 })

  const toList = (subs) => subs.map(s => ({
    email: s.email,
    name: [s.first_name, s.last_name].filter(Boolean).join(' ') || s.email,
  }))

  const heSubs = subscribers.filter(s => s.language === 'he')
  const enSubs = subscribers.filter(s => s.language !== 'he')

  let sent = 0, failed = 0
  const results = await Promise.all([
    heSubs.length ? sendBatch(toList(heSubs), subjectHe, htmlContentHe, senderName, senderEmail) : { sent: 0, failed: 0 },
    enSubs.length ? sendBatch(toList(enSubs), subjectEn, htmlContentEn, senderName, senderEmail) : { sent: 0, failed: 0 },
  ])
  results.forEach(r => { sent += r.sent; failed += r.failed })

  return res.status(200).json({ sent, failed })
}
