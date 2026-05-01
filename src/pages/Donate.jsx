import { useTranslation } from 'react-i18next'
import { Building2, Heart, Star } from 'lucide-react'
import AdminItemControls from '../components/AdminItemControls'
import AnimatedSection from '../components/AnimatedSection'
import Card from '../components/Card'
import CountUp from '../components/CountUp'
import EditableText from '../components/EditableText'
import GoldParticles from '../components/GoldParticles'
import PageHero from '../components/PageHero'
import PageLoading from '../components/PageLoading'
import { createId } from '../content/defaultContent'
import { useEditMode } from '../contexts/EditModeContext'
import { usePageContent, usePageSeo, useSettingsContent } from '../hooks/useEditableContent'

export default function Donate() {
  const { i18n } = useTranslation()
  const lang = i18n.language
  const edit = useEditMode()
  const { content, loading } = usePageContent('donate')
  const { settings, loading: settingsLoading } = useSettingsContent()
  usePageSeo('donate', content, lang)

  if (loading || settingsLoading || !content || !settings) return <PageLoading />

  const donationUrl = settings.donation_url || '#'

  return (
    <div>
      <PageHero>
        <EditableText field={`title_${lang}`} tag="h1" className="text-4xl md:text-6xl font-bold text-white font-hebrew leading-tight mb-4 drop-shadow-lg block">
          {content[`title_${lang}`]}
        </EditableText>
        <div className="w-20 h-1 bg-brand-gold mx-auto rounded-full mb-4" />
        <EditableText field={`subtitle_${lang}`} tag="p" className="text-white/80 text-lg md:text-xl block">
          {content[`subtitle_${lang}`]}
        </EditableText>
      </PageHero>
      <div className="py-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        <AnimatedSection delay={0.05} variant="scaleIn">
          <Card className="mb-10 text-center">
            <EditableText field={`why_title_${lang}`} tag="h2" className="heading-subsection mb-6 block">
              {content[`why_title_${lang}`]}
            </EditableText>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
              {(content.impactStats || []).map((stat, index) => {
                const numeric = parseFloat(String(stat.value).replace(/[^0-9.]/g, '')) || 0
                const suffix = String(stat.value).replace(/[0-9.]/g, '')
                return (
                  <div key={stat.id} className="relative text-center">
                    <AdminItemControls
                      label="Impact"
                      onEdit={() => edit.openDrawer({
                        title: 'Impact stat',
                        kicker: 'Repeatable',
                        collectionKey: 'impactStats',
                        itemId: stat.id,
                        fields: [
                          { name: 'value', label: 'Value' },
                          { name: 'label_he', label: 'Label HE' },
                          { name: 'label_en', label: 'Label EN' },
                        ],
                      })}
                      onAdd={() => edit.addCollectionItem('impactStats', { id: createId('impact'), value: '0', label_he: 'מדד חדש', label_en: 'New impact' })}
                      onDelete={() => edit.removeCollectionItem('impactStats', stat.id)}
                      onMoveUp={() => edit.moveCollectionItem('impactStats', stat.id, -1)}
                      onMoveDown={() => edit.moveCollectionItem('impactStats', stat.id, 1)}
                      canMoveUp={index > 0}
                      canMoveDown={index < (content.impactStats || []).length - 1}
                    />
                    <div className="text-5xl font-bold text-brand-gold mb-2">
                      {edit.isEditMode ? stat.value : (numeric > 0 ? <CountUp to={numeric} suffix={suffix} /> : stat.value)}
                    </div>
                    <div className="text-gray-600 text-sm">{stat[`label_${lang}`]}</div>
                  </div>
                )
              })}
            </div>
          </Card>
        </AnimatedSection>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
          <AnimatedSection delay={0.1} variant="slideRight">
            <Card hover className="text-center h-full flex flex-col items-center justify-center">
              <Heart size={48} className="text-brand-gold mb-4" />
              <EditableText field={`online_title_${lang}`} tag="h2" className="heading-subsection mb-3 block">
                {content[`online_title_${lang}`]}
              </EditableText>
              <EditableText field={`online_desc_${lang}`} tag="p" className="text-gray-600 mb-6 text-sm leading-relaxed block" multiline>
                {content[`online_desc_${lang}`]}
              </EditableText>
              {donationUrl !== '#' ? (
                <a href={donationUrl} target="_blank" rel="noopener noreferrer" className="btn-primary">
                  <EditableText field={`donate_button_${lang}`}>{content[`donate_button_${lang}`]}</EditableText>
                </a>
              ) : (
                <EditableText field={`coming_soon_${lang}`} tag="span" className="text-gray-400 text-sm border border-gray-200 rounded-lg px-4 py-2">
                  {content[`coming_soon_${lang}`]}
                </EditableText>
              )}
            </Card>
          </AnimatedSection>

          <AnimatedSection delay={0.15} variant="slideLeft">
            <Card hover className="h-full">
              <Building2 size={36} className="text-brand-gold mb-4" />
              <EditableText field={`bank_title_${lang}`} tag="h2" className="heading-subsection mb-4 block">
                {content[`bank_title_${lang}`]}
              </EditableText>
              <div className="space-y-3 text-sm">
                {[
                  { labelField: `bank_account_label_${lang}`, valueField: `bank_account_name_${lang}`, value: settings[`bank_account_name_${lang}`] },
                  { labelField: `bank_name_label_${lang}`, valueField: `bank_name_${lang}`, value: settings[`bank_name_${lang}`] || '—' },
                  { labelField: `bank_number_label_${lang}`, valueField: 'bank_account', value: settings.bank_account || '—' },
                  { labelField: `bank_branch_label_${lang}`, valueField: 'bank_branch', value: settings.bank_branch || '—' },
                ].map(({ labelField, valueField, value }) => (
                  <div key={labelField} className="flex flex-col sm:flex-row sm:items-center gap-1">
                    <EditableText field={labelField} tag="span" className="font-semibold text-gray-600 sm:w-32 shrink-0">
                      {content[labelField]}
                    </EditableText>
                    <span>:</span>
                    <EditableText scope="settings" field={valueField} tag="span" className="text-gray-800 font-mono">
                      {value}
                    </EditableText>
                  </div>
                ))}
              </div>
              <EditableText field={`bank_note_${lang}`} tag="p" className="text-xs text-gray-500 mt-4 block">
                {content[`bank_note_${lang}`]}
              </EditableText>
            </Card>
          </AnimatedSection>
        </div>

        <AnimatedSection delay={0.2} variant="fadeUp">
          <div className="relative overflow-hidden rounded-2xl">
            <GoldParticles />
            <Card className="relative z-10 bg-brand-neutral-50 text-center">
              <Star size={32} className="text-brand-gold mx-auto mb-3" />
              <EditableText field={`quote_${lang}`} tag="p" className="text-gray-700 leading-relaxed block" multiline>
                {content[`quote_${lang}`]}
              </EditableText>
            </Card>
          </div>
        </AnimatedSection>
      </div>
      </div>
    </div>
  )
}
