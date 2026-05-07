import { createClient } from '@supabase/supabase-js'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { email, firstName, lastName, language } = req.body ?? {}

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Invalid email' })
  }

  const lang = language === 'en' ? 'en' : 'he'

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
  )

  const { error: dbError } = await supabase
    .from('newsletter_subscribers')
    .insert({
      email: email.toLowerCase().trim(),
      first_name: (firstName ?? '').trim(),
      last_name: (lastName ?? '').trim(),
      language: lang,
    })

  if (dbError) {
    if (dbError.code === '23505') {
      return res.status(409).json({ error: 'Already subscribed' })
    }
    return res.status(500).json({ error: dbError.message })
  }

  // Sync to Brevo — non-fatal if it fails
  try {
    await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: {
        'api-key': process.env.BREVO_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email.toLowerCase().trim(),
        attributes: {
          FIRSTNAME: (firstName ?? '').trim(),
          LASTNAME: (lastName ?? '').trim(),
        },
        updateEnabled: true,
      }),
    })
  } catch (_) {
    // Subscriber is saved in Supabase; Brevo sync can be retried later
  }

  return res.status(200).json({ ok: true })
}
