import { createClient } from '@supabase/supabase-js'

const BATCH_SIZE = 50

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Verify admin JWT
  const authHeader = req.headers['authorization'] ?? ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null
  if (!token) return res.status(401).json({ error: 'No token' })

  const supabaseAnon = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY
  )
  const { data: { user }, error: authError } = await supabaseAnon.auth.getUser(token)
  if (authError || !user) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const { subject, htmlContent, senderName, senderEmail } = req.body ?? {}
  if (!subject || !htmlContent || !senderEmail) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  // Fetch active subscribers with service role (bypasses RLS)
  const supabaseAdmin = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )
  const { data: subscribers, error: fetchError } = await supabaseAdmin
    .from('newsletter_subscribers')
    .select('email, first_name, last_name')
    .eq('active', true)

  if (fetchError) {
    return res.status(500).json({ error: fetchError.message })
  }
  if (!subscribers?.length) {
    return res.status(200).json({ sent: 0, failed: 0 })
  }

  let sent = 0
  let failed = 0

  for (let i = 0; i < subscribers.length; i += BATCH_SIZE) {
    const batch = subscribers.slice(i, i + BATCH_SIZE)
    const toList = batch.map((s) => ({
      email: s.email,
      name: [s.first_name, s.last_name].filter(Boolean).join(' ') || s.email,
    }))

    try {
      const resp = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'api-key': process.env.BREVO_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sender: { name: senderName || "Pe'er Yisroel", email: senderEmail },
          to: toList,
          subject,
          htmlContent,
        }),
      })
      if (resp.ok) {
        sent += batch.length
      } else {
        failed += batch.length
      }
    } catch (_) {
      failed += batch.length
    }
  }

  return res.status(200).json({ sent, failed })
}
