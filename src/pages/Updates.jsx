import { useTranslation } from 'react-i18next'
import { Calendar } from 'lucide-react'
import EditableText from '../components/EditableText'
import PageHero from '../components/PageHero'
import PageLoading from '../components/PageLoading'
import { TextEffect } from '../components/ui/text-effect'
import { useEditMode } from '../contexts/EditModeContext'
import { useEditableTable, usePageContent, usePageSeo } from '../hooks/useEditableContent'

function formatDate(dateStr, lang) {
  if (!dateStr) return null
  try {
    const d = new Date(dateStr)
    return {
      day: d.toLocaleDateString(lang === 'he' ? 'he-IL' : 'en-US', { day: 'numeric' }),
      month: d.toLocaleDateString(lang === 'he' ? 'he-IL' : 'en-US', { month: 'long' }),
      year: d.getFullYear(),
      full: d.toLocaleDateString(lang === 'he' ? 'he-IL' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      iso: dateStr,
    }
  } catch {
    return null
  }
}

function DateBadge({ dateStr, lang }) {
  const d = formatDate(dateStr, lang)
  if (!d) return null
  return (
    <time
      dateTime={d.iso}
      className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200/60 rounded-full px-3 py-1"
    >
      <Calendar size={11} aria-hidden="true" />
      {d.full}
    </time>
  )
}

/* Featured (first) update — horizontal layout, more presence */
function FeaturedCard({ update, lang }) {
  const title = update[`title_${lang}`] || update.title_he || ''
  const body  = update[`body_${lang}`]  || update.body_he  || ''

  return (
    <article className="overflow-hidden rounded-2xl bg-white border border-stone-200/60 shadow-sm">
      <div className={`grid gap-0 ${update.image_url ? 'md:grid-cols-5' : ''}`}>
        {update.image_url && (
          <div className="md:col-span-3 aspect-video md:aspect-auto overflow-hidden">
            <img
              src={update.image_url}
              alt={title}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
              loading="eager"
            />
          </div>
        )}
        <div className={`flex flex-col justify-center p-8 ${update.image_url ? 'md:col-span-2' : ''}`}>
          <div className="mb-4">
            <DateBadge dateStr={update.date} lang={lang} />
          </div>
          <h2
            className="text-2xl md:text-3xl font-bold text-stone-900 leading-snug mb-4"
            dir={lang === 'he' ? 'rtl' : 'ltr'}
          >
            {title}
          </h2>
          {body && (
            <p
              className="text-base text-stone-600 leading-relaxed"
              dir={lang === 'he' ? 'rtl' : 'ltr'}
            >
              {body}
            </p>
          )}
        </div>
      </div>
    </article>
  )
}

/* Secondary update card */
function UpdateCard({ update, lang }) {
  const title = update[`title_${lang}`] || update.title_he || ''
  const body  = update[`body_${lang}`]  || update.body_he  || ''

  return (
    <article className="flex flex-col overflow-hidden rounded-xl bg-white border border-stone-200/60 shadow-sm hover:shadow-md transition-shadow duration-300">
      {update.image_url && (
        <div className="aspect-video overflow-hidden">
          <img
            src={update.image_url}
            alt={title}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        </div>
      )}
      <div className="flex flex-col flex-1 p-5">
        <div className="mb-3">
          <DateBadge dateStr={update.date} lang={lang} />
        </div>
        <h3
          className="text-lg font-bold text-stone-900 leading-snug mb-2"
          dir={lang === 'he' ? 'rtl' : 'ltr'}
        >
          {title}
        </h3>
        {body && (
          <p
            className="text-sm text-stone-500 leading-relaxed line-clamp-3 flex-1"
            dir={lang === 'he' ? 'rtl' : 'ltr'}
          >
            {body}
          </p>
        )}
      </div>
    </article>
  )
}

function EmptyState({ lang }) {
  return (
    <div className="text-center py-24 px-4">
      <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-amber-50 border border-amber-200/60 flex items-center justify-center">
        <Calendar size={24} className="text-amber-600" aria-hidden="true" />
      </div>
      <p className="text-stone-500 text-lg font-medium">
        {lang === 'he' ? 'אין עדכונים עדיין.' : 'No updates yet.'}
      </p>
      <p className="text-stone-400 text-sm mt-1">
        {lang === 'he' ? 'חזרו בקרוב לחדשות ועדכונים.' : 'Check back soon for news and updates.'}
      </p>
    </div>
  )
}

export default function Updates() {
  const { i18n } = useTranslation()
  const lang = i18n.language
  const { isEditMode } = useEditMode()
  const { content, loading: contentLoading } = usePageContent('updates')
  const { data: updates, loading: updatesLoading } = useEditableTable('updates', { orderBy: 'date', ascending: false })
  usePageSeo('updates', content, lang)

  if (contentLoading || !content) return <PageLoading />

  const [featured, ...rest] = updates

  return (
    <div>
      <PageHero>
        {isEditMode ? (
          <EditableText field={`title_${lang}`} tag="h1" className="text-4xl md:text-6xl font-bold text-white font-hebrew leading-tight mb-4 drop-shadow-lg block">
            {content[`title_${lang}`]}
          </EditableText>
        ) : (
          <TextEffect as="h1" per="word" preset="slide" className="text-4xl md:text-6xl font-bold text-white font-hebrew leading-tight mb-4 drop-shadow-lg">
            {content[`title_${lang}`] || (lang === 'he' ? 'עדכונים' : 'Updates')}
          </TextEffect>
        )}
        <div className="w-20 h-1 bg-brand-gold mx-auto rounded-full mb-4" />
        {isEditMode ? (
          <EditableText field={`subtitle_${lang}`} tag="p" className="text-white/80 text-lg md:text-xl block">
            {content[`subtitle_${lang}`]}
          </EditableText>
        ) : (
          <TextEffect as="p" per="word" preset="fade" delay={0.35} className="text-white/80 text-lg md:text-xl">
            {content[`subtitle_${lang}`] || ''}
          </TextEffect>
        )}
      </PageHero>

      <div className="py-16" style={{ backgroundColor: 'oklch(97% 0.006 75)' }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {updatesLoading && (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary" aria-label={lang === 'he' ? 'טוען...' : 'Loading...'} />
            </div>
          )}

          {!updatesLoading && updates.length === 0 && <EmptyState lang={lang} />}

          {!updatesLoading && updates.length > 0 && (
            <div className="space-y-8">
              <FeaturedCard update={featured} lang={lang} />

              {rest.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {rest.map((update) => (
                    <UpdateCard key={update.id} update={update} lang={lang} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
