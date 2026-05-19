export const SUPPORTED_LANGUAGES = ['he', 'en']

export const ADMIN_PAGES = [
  { key: 'home', path: '/admin/home', publicPath: '/', label: 'Home' },
  { key: 'slideshow', path: '/admin/slideshow', publicPath: '/', label: 'Hero Slides' },
  { key: 'about', path: '/admin/about', publicPath: '/about', label: 'About' },
  { key: 'gallery', path: '/admin/gallery', publicPath: '/gallery', label: 'Gallery' },
  { key: 'donate', path: '/admin/donate', publicPath: '/donate', label: 'Donate' },
  { key: 'contact', path: '/admin/contact', publicPath: '/contact', label: 'Contact' },
]

export const ICON_OPTIONS = ['BookOpen', 'Star', 'Heart', 'Globe', 'Users', 'Award']

export const DEFAULT_GLOBAL_CONTENT = {
  brand_short_he: 'פאר ישראל',
  brand_short_en: 'Peer Yisroel',
  brand_name_he: 'ישיבת פאר ישראל',
  brand_name_en: 'Yeshivat Peer Yisroel',
  brand_subtitle_he: 'ע"ש הרה"ק ר\' ישראל מסטאלין זצוקלל"ה',
  brand_subtitle_en: 'Named after the Holy Rebbe R\' Yisrael of Stolin ZT"L',
  nav_home_he: 'ראשי',
  nav_home_en: 'Home',
  nav_about_he: 'אודות',
  nav_about_en: 'About',
  nav_gallery_he: 'גלריה',
  nav_gallery_en: 'Gallery',
  nav_updates_he: 'עדכונים',
  nav_updates_en: 'Updates',
  nav_donate_he: 'תרומות',
  nav_donate_en: 'Donate',
  nav_contact_he: 'צור קשר',
  nav_contact_en: 'Contact',
  footer_links_he: 'קישורים מהירים',
  footer_links_en: 'Quick Links',
  footer_email_title_he: 'אימייל',
  footer_email_title_en: 'Email',
  footer_rights_he: 'כל הזכויות שמורות',
  footer_rights_en: 'All Rights Reserved',
}

export const DEFAULT_SETTINGS = {
  hebrew_enabled: true,
  contact_email: 'info@peeryisroel.com',
  contact_phone: '',
  contact_address_he: '',
  contact_address_en: '',
  donation_url: '',
  bank_account_name_he: 'ישיבת פאר ישראל',
  bank_account_name_en: 'Yeshivat Peer Yisroel',
  bank_name_he: '',
  bank_name_en: '',
  bank_account: '',
  bank_branch: '',
  contact_form_subject_he: 'הודעה חדשה מאתר ישיבת פאר ישראל',
  contact_form_subject_en: 'New message from Yeshivat Peer Yisroel website',
}

export const DEFAULT_PAGE_CONTENT = {
  home: {
    seo_title_he: 'ישיבת פאר ישראל',
    seo_title_en: 'Yeshivat Peer Yisroel',
    seo_description_he: 'ישיבה גבוהה ליוצאי מדינות חבר העמים לשעבר',
    seo_description_en: 'Advanced Yeshiva for students from former CIS countries',
    hero_title_he: 'ישיבת פאר ישראל',
    hero_title_en: 'Yeshivat Peer Yisroel',
    hero_subtitle_he: 'ע"ש הרה"ק ר\' ישראל מסטאלין זצוקלל"ה',
    hero_subtitle_en: 'Named after the Holy Rebbe R\' Yisrael of Stolin ZT"L',
    hero_cta_donate_he: 'תרמו עכשיו',
    hero_cta_donate_en: 'Donate Now',
    hero_cta_about_he: 'אודות הישיבה',
    hero_cta_about_en: 'About the Yeshiva',
    mission_title_he: 'שליחותנו',
    mission_title_en: 'Our Mission',
    mission_subtitle_he: 'תורה, יראת שמים ומידות טובות',
    mission_subtitle_en: 'Torah, Fear of Heaven & Fine Character',
    mission_text_he: 'ישיבת פאר ישראל הוקמה על שם הרה"ק ר\' ישראל מסטאלין זצוקלל"ה, ומטרתה לגדל דור של תלמידי חכמים הממלאים את ארץ ישראל בתורה ובאור. הישיבה מיוצאי מדינות חבר העמים לשעבר ומקבלת בחורים מוכשרים הרוצים להתעלות במדרגות התורה.',
    mission_text_en: 'Yeshivat Peer Yisroel, named after the Holy Rebbe R\' Yisrael of Stolin ZT"L, is dedicated to raising a generation of Torah scholars who illuminate the Land of Israel with Torah and light. The yeshiva welcomes talented students from former CIS countries who aspire to grow in Torah.',
    gallery_title_he: 'גלריה',
    gallery_title_en: 'Gallery',
    gallery_subtitle_he: 'רגעים מחיי הישיבה',
    gallery_subtitle_en: 'Moments from Yeshiva Life',
    gallery_button_he: 'גלריה',
    gallery_button_en: 'Gallery',
    cta_title_he: 'הצטרפו אלינו',
    cta_title_en: 'Get Involved',
    cta_text_he: 'תמכו בישיבה ועזרו לגדל דור של תלמידי חכמים',
    cta_text_en: 'Support the Yeshiva and help raise a generation of Torah scholars',
    cta_donate_he: 'תרמו',
    cta_donate_en: 'Donate',
    cta_contact_he: 'צרו קשר',
    cta_contact_en: 'Contact Us',
    stats: [
      { id: 'students', value: '150+', label_he: 'בחורי ישיבה', label_en: 'Students' },
      { id: 'years', value: '10+', label_he: 'שנות קיום', label_en: 'Years of Excellence' },
      { id: 'daily', value: '6', label_he: 'שיעורים יומיים', label_en: 'Daily Classes' },
    ],
    featureCards: [
      { id: 'torah', icon: 'BookOpen', title_he: 'לימוד תורה', title_en: 'Torah Study', text_he: 'שיעורים מסביב לשעון בגמרא, הלכה ומוסר', text_en: 'Around-the-clock classes in Gemara, Halacha and Mussar' },
      { id: 'community', icon: 'Users', title_he: 'קהילה', title_en: 'Community', text_he: 'בחורים מכל העולם לומדים יחד בבית מדרש אחד', text_en: 'Students from around the world learning together' },
      { id: 'tradition', icon: 'Star', title_he: 'מסורת', title_en: 'Tradition', text_he: 'הנחלת ערכי חב"ד ומסורת הסטאלין', text_en: 'Transmitting Chabad values and Stolin tradition' },
    ],
  },
  about: {
    seo_title_he: 'אודות הישיבה',
    seo_title_en: 'About the Yeshiva',
    seo_description_he: 'הכירו את ישיבת פאר ישראל',
    seo_description_en: 'Get to know Yeshivat Peer Yisroel',
    title_he: 'אודות הישיבה',
    title_en: 'About the Yeshiva',
    subtitle_he: 'ישיבה גבוהה ליוצאי מדינות חבר העמים לשעבר',
    subtitle_en: 'Advanced Yeshiva for students from former CIS countries',
    cards_title_he: 'הכירו את הישיבה',
    cards_title_en: 'Get to Know the Yeshiva',
    description_title_he: '',
    description_title_en: '',
    description_he: '',
    description_en: '',
    cards_hint_he: 'עברו עם העכבר על הכרטסיות לקריאה',
    cards_hint_en: 'Hover over the cards to read',
    card_hint_he: 'העבר עכבר לקרוא',
    card_hint_en: 'Hover to read',
    leadership_title_he: 'הנהלה',
    leadership_title_en: 'Leadership',
    leadership_text_he: 'הישיבה מתנהלת תחת הנהגה רוחנית ומנהלית מסורה, הדואגת לכל תלמיד באופן אישי ומלווה אותו בדרך לימודיו.',
    leadership_text_en: 'The yeshiva operates under dedicated spiritual and administrative leadership that cares for each student personally and accompanies them on their learning journey.',
    cards: [
      { id: 'history', icon: 'BookOpen', frontColor: 'bg-brand-primary', title_he: 'ההיסטוריה שלנו', title_en: 'Our History', text_he: 'ישיבת פאר ישראל הוקמה ליוצאי מדינות חבר העמים לשעבר, ונקראת על שם הרה"ק ר\' ישראל מסטאלין זצוקלל"ה, מגדולי אדמו"רי חסידות קרלין-סטולין.', text_en: 'Yeshivat Peer Yisroel was founded for students from former CIS countries, named after the Holy Rebbe R\' Yisrael of Stolin ZT"L of the Karlin-Stolin dynasty.' },
      { id: 'mission', icon: 'Star', frontColor: 'bg-[#1e4a3a]', title_he: 'השליחות שלנו', title_en: 'Our Mission', text_he: 'לגדל דור של תלמידי חכמים המשלבים בקיאות בתורה עם יראת שמים אמיתית ומידות טובות, תוך שמירה על מסורת חסידות קרלין-סטולין.', text_en: 'To raise a generation of Torah scholars combining deep learning with genuine fear of Heaven and fine character, preserving the Karlin-Stolin tradition.' },
      { id: 'community', icon: 'Users', frontColor: 'bg-[#3a2a5e]', title_he: 'הקהילה שלנו', title_en: 'Our Community', text_he: 'בחורים מרחבי העולם לומדים יחד בבית מדרש אחד, יוצרים קהילה חמה ומגובשת של לומדי תורה המחוברים בלב ובנפש.', text_en: 'Students from around the world learn together in one beit midrash, creating a warm, close-knit community of Torah learners united in heart and soul.' },
    ],
  },
  gallery: {
    seo_title_he: 'גלריה',
    seo_title_en: 'Gallery',
    seo_description_he: 'רגעים מחיי ישיבת פאר ישראל',
    seo_description_en: 'Moments from Yeshivat Peer Yisroel',
    title_he: 'גלריה',
    title_en: 'Gallery',
    subtitle_he: 'רגעים מחיי הישיבה',
    subtitle_en: 'Moments from Yeshiva Life',
    story_kicker_he: 'מסע בין סיפורים חזותיים',
    story_kicker_en: 'A Journey Through Visual Stories',
    story_heading_prefix_he: 'ברוכים הבאים ל',
    story_heading_prefix_en: 'Welcome to Our ',
    story_heading_highlight_he: 'סיפורים שלנו',
    story_heading_highlight_en: 'Stories',
    empty_he: 'בקרוב...',
    empty_en: 'Coming soon...',
  },
  donate: {
    seo_title_he: 'תמיכה בישיבה',
    seo_title_en: 'Support the Yeshiva',
    seo_description_he: 'שותפות בבניין בית מדרש',
    seo_description_en: 'Partner in Building a Beit Midrash',
    title_he: 'תמיכה בישיבה',
    title_en: 'Support the Yeshiva',
    subtitle_he: 'שותפות בבניין בית מדרש',
    subtitle_en: 'Partner in Building a Beit Midrash',
    why_title_he: 'למה לתרום?',
    why_title_en: 'Why Donate?',
    online_title_he: 'תרומה מקוונת',
    online_title_en: 'Online Donation',
    online_desc_he: 'תרמו בצורה מאובטחת באמצעות כרטיס אשראי או פייפאל',
    online_desc_en: 'Donate securely via credit card or PayPal',
    donate_button_he: 'תרמו עכשיו',
    donate_button_en: 'Donate Now',
    coming_soon_he: 'בקרוב...',
    coming_soon_en: 'Coming soon...',
    bank_title_he: 'העברה בנקאית',
    bank_title_en: 'Bank Transfer',
    bank_account_label_he: 'שם חשבון',
    bank_account_label_en: 'Account Name',
    bank_name_label_he: 'בנק',
    bank_name_label_en: 'Bank',
    bank_number_label_he: 'מספר חשבון',
    bank_number_label_en: 'Account No.',
    bank_branch_label_he: 'מספר סניף',
    bank_branch_label_en: 'Branch',
    bank_note_he: 'יש לציין את שמכם בהעברה',
    bank_note_en: 'Please include your name as reference',
    quote_he: '"כי לא יחדל אביון מקרב הארץ... פתוח תפתח את ידך לאחיך" — לתורמים לישיבת פאר ישראל יש חלק גדול בזכות לימוד התורה של כל בחור.',
    quote_en: '"The merit of supporting Torah study is immeasurable." Every donation to Yeshivat Peer Yisroel is a partnership in eternal learning.',
    impactStats: [
      { id: 'direct', value: '100%', label_he: 'מהתרומה מגיע לישיבה', label_en: 'goes directly to the yeshiva' },
      { id: 'students', value: '150+', label_he: 'בחורים נהנים מתרומתכם', label_en: 'students benefit from your gift' },
      { id: 'merit', value: '∞', label_he: 'זכות לנותן ולמשפחתו', label_en: 'merit for the giver and family' },
    ],
  },
  contact: {
    seo_title_he: 'צור קשר',
    seo_title_en: 'Contact Us',
    seo_description_he: 'נשמח לשמוע מכם',
    seo_description_en: "We'd love to hear from you",
    title_he: 'צור קשר',
    title_en: 'Contact Us',
    subtitle_he: 'נשמח לשמוע מכם',
    subtitle_en: "We'd love to hear from you",
    form_title_he: 'שלחו הודעה',
    form_title_en: 'Send a Message',
    success_he: 'ההודעה נשלחה בהצלחה! נחזור אליך בהקדם.',
    success_en: "Message sent successfully! We'll get back to you soon.",
    name_label_he: 'שם',
    name_label_en: 'Name',
    email_label_he: 'אימייל',
    email_label_en: 'Email',
    message_label_he: 'הודעה',
    message_label_en: 'Message',
    send_button_he: 'שלח הודעה',
    send_button_en: 'Send Message',
    info_title_he: 'פרטי התקשרות',
    info_title_en: 'Get in Touch',
    email_title_he: 'אימייל',
    email_title_en: 'Email',
    phone_title_he: 'טלפון',
    phone_title_en: 'Phone',
    address_title_he: 'כתובת',
    address_title_en: 'Address',
    quick_title_he: 'מענה מהיר',
    quick_title_en: 'Quick Response',
    quick_text_he: 'אנו מתחייבים לחזור לכל פנייה תוך 24-48 שעות בימי עסקים.',
    quick_text_en: 'We aim to respond to all enquiries within 24-48 hours during business days.',
  },
}

const copyArray = (items) => items.map((item) => ({ ...item }))

function isBlankText(value) {
  return typeof value === 'string' && value.trim() === ''
}

function mergeDefaults(defaults, content = {}) {
  const merged = { ...defaults, ...content }
  for (const [key, defaultValue] of Object.entries(defaults)) {
    if (typeof defaultValue === 'string' && isBlankText(merged[key])) {
      merged[key] = defaultValue
    }
  }
  return merged
}

function normalizeHome(content) {
  const normalized = mergeDefaults(DEFAULT_PAGE_CONTENT.home, content)
  if (!Array.isArray(content?.stats)) {
    normalized.stats = [
      { id: 'students', value: content?.stat1_value || '150+', label_he: content?.stat1_label_he || 'בחורי ישיבה', label_en: content?.stat1_label_en || 'Students' },
      { id: 'years', value: content?.stat2_value || '10+', label_he: content?.stat2_label_he || 'שנות קיום', label_en: content?.stat2_label_en || 'Years of Excellence' },
      { id: 'daily', value: content?.stat3_value || '6', label_he: content?.stat3_label_he || 'שיעורים יומיים', label_en: content?.stat3_label_en || 'Daily Classes' },
    ]
  }
  if (!Array.isArray(content?.featureCards)) {
    normalized.featureCards = [1, 2, 3].map((number, index) => {
      const fallback = DEFAULT_PAGE_CONTENT.home.featureCards[index]
      return {
        ...fallback,
        title_he: content?.[`card${number}_title_he`] || fallback.title_he,
        title_en: content?.[`card${number}_title_en`] || fallback.title_en,
        text_he: content?.[`card${number}_desc_he`] || fallback.text_he,
        text_en: content?.[`card${number}_desc_en`] || fallback.text_en,
      }
    })
  }
  return normalized
}

function normalizeAbout(row, content) {
  return {
    ...mergeDefaults(DEFAULT_PAGE_CONTENT.about, content),
    title_he: row?.title_he || content?.title_he || DEFAULT_PAGE_CONTENT.about.title_he,
    title_en: row?.title_en || content?.title_en || DEFAULT_PAGE_CONTENT.about.title_en,
    cards: Array.isArray(content?.cards) ? copyArray(content.cards) : copyArray(DEFAULT_PAGE_CONTENT.about.cards),
  }
}

function normalizeDonate(content) {
  const normalized = mergeDefaults(DEFAULT_PAGE_CONTENT.donate, content)
  if (!Array.isArray(content?.impactStats)) {
    normalized.impactStats = [
      { id: 'direct', value: content?.donate_impact1_num || '100%', label_he: content?.donate_impact1_label_he || 'מהתרומה מגיע לישיבה', label_en: content?.donate_impact1_label_en || 'goes directly to the yeshiva' },
      { id: 'students', value: content?.donate_impact2_num || '150+', label_he: content?.donate_impact2_label_he || 'בחורים נהנים מתרומתכם', label_en: content?.donate_impact2_label_en || 'students benefit from your gift' },
      { id: 'merit', value: content?.donate_impact3_num || '∞', label_he: content?.donate_impact3_label_he || 'זכות לנותן ולמשפחתו', label_en: content?.donate_impact3_label_en || 'merit for the giver and family' },
    ]
  }
  return normalized
}

export function normalizePageContent(pageKey, row) {
  const content = row?.content || {}
  if (pageKey === 'home') return normalizeHome(content)
  if (pageKey === 'about') return normalizeAbout(row, content)
  if (pageKey === 'donate') return normalizeDonate(content)
  return {
    ...mergeDefaults(DEFAULT_PAGE_CONTENT[pageKey] || {}, content),
  }
}

export function normalizeGlobalContent(row) {
  return mergeDefaults(DEFAULT_GLOBAL_CONTENT, row?.content || {})
}

export function normalizeSettings(row) {
  const legacy = row || {}
  const content = row?.content || {}
  return {
    ...DEFAULT_SETTINGS,
    ...content,
    hebrew_enabled: content.hebrew_enabled === false ? false : DEFAULT_SETTINGS.hebrew_enabled,
    contact_email: isBlankText(legacy.contact_email) ? DEFAULT_SETTINGS.contact_email : legacy.contact_email || content.contact_email || DEFAULT_SETTINGS.contact_email,
    contact_phone: isBlankText(legacy.contact_phone) ? DEFAULT_SETTINGS.contact_phone : legacy.contact_phone || content.contact_phone || DEFAULT_SETTINGS.contact_phone,
    contact_address_he: isBlankText(content.contact_address_he) ? legacy.contact_address || DEFAULT_SETTINGS.contact_address_he : content.contact_address_he || legacy.contact_address || DEFAULT_SETTINGS.contact_address_he,
    contact_address_en: isBlankText(content.contact_address_en) ? legacy.contact_address || DEFAULT_SETTINGS.contact_address_en : content.contact_address_en || legacy.contact_address || DEFAULT_SETTINGS.contact_address_en,
    donation_url: isBlankText(legacy.donation_url) ? DEFAULT_SETTINGS.donation_url : legacy.donation_url || content.donation_url || DEFAULT_SETTINGS.donation_url,
    bank_account_name_he: isBlankText(content.bank_account_name_he) ? legacy.bank_name || DEFAULT_SETTINGS.bank_account_name_he : content.bank_account_name_he || legacy.bank_name || DEFAULT_SETTINGS.bank_account_name_he,
    bank_account_name_en: isBlankText(content.bank_account_name_en) ? legacy.bank_name_en || DEFAULT_SETTINGS.bank_account_name_en : content.bank_account_name_en || legacy.bank_name_en || DEFAULT_SETTINGS.bank_account_name_en,
    bank_name_he: isBlankText(content.bank_name_he) ? legacy.bank_name_he || '' : content.bank_name_he || legacy.bank_name_he || '',
    bank_name_en: isBlankText(content.bank_name_en) ? legacy.bank_name_en || '' : content.bank_name_en || legacy.bank_name_en || '',
    bank_account: isBlankText(legacy.bank_account) ? '' : legacy.bank_account || content.bank_account || '',
    bank_branch: isBlankText(legacy.bank_branch) ? '' : legacy.bank_branch || content.bank_branch || '',
  }
}

export function buildPublicPath(pageKey) {
  return ADMIN_PAGES.find((page) => page.key === pageKey)?.publicPath || '/'
}

export function buildAdminPathFromPublicPath(pathname) {
  if (pathname === '/') return '/admin/home'
  const match = ADMIN_PAGES.find((page) => page.publicPath !== '/' && pathname.startsWith(page.publicPath))
  return match?.path || pathname
}

export function createId(prefix = 'item') {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID()
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}`
}
