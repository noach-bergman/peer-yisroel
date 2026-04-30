import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Mail, MapPin, Phone } from 'lucide-react'
import AnimatedSection from '../components/AnimatedSection'
import Button from '../components/Button'
import Card from '../components/Card'
import EditableText from '../components/EditableText'
import PageLoading from '../components/PageLoading'
import { usePageContent, usePageSeo, useSettingsContent } from '../hooks/useEditableContent'

export default function Contact() {
  const { i18n } = useTranslation()
  const lang = i18n.language
  const { content, loading } = usePageContent('contact')
  const { settings, loading: settingsLoading } = useSettingsContent()
  const [success] = useState(window.location.search.includes('success=true'))
  usePageSeo('contact', content, lang)

  if (loading || settingsLoading || !content || !settings) return <PageLoading />

  const email = settings.contact_email || 'info@peeryisroel.com'
  const phone = settings.contact_phone || ''
  const address = settings[`contact_address_${lang}`] || ''
  const subject = settings[`contact_form_subject_${lang}`] || settings.contact_form_subject_he

  return (
    <div className="page-shell">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedSection className="text-center mb-12">
          <EditableText field={`title_${lang}`} tag="h1" className="heading-page mb-3 block">
            {content[`title_${lang}`]}
          </EditableText>
          <EditableText field={`subtitle_${lang}`} tag="p" className="text-xl text-gray-600 block">
            {content[`subtitle_${lang}`]}
          </EditableText>
        </AnimatedSection>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <AnimatedSection delay={0.05} variant="slideRight">
            <Card>
              <EditableText field={`form_title_${lang}`} tag="h2" className="heading-subsection mb-6 block">
                {content[`form_title_${lang}`]}
              </EditableText>

              {success && (
                <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <EditableText field={`success_${lang}`} tag="p" className="text-green-800 font-semibold block">
                    {content[`success_${lang}`]}
                  </EditableText>
                </div>
              )}

              <form action={`https://formsubmit.co/${email}`} method="POST" className="space-y-4">
                <input type="hidden" name="_subject" value={subject} />
                <input type="hidden" name="_next" value={`${window.location.origin}/contact?success=true`} />
                <input type="hidden" name="_template" value="table" />
                <input type="hidden" name="_captcha" value="false" />

                <div>
                  <EditableText field={`name_label_${lang}`} tag="label" className="block text-sm font-medium text-gray-700 mb-1">
                    {content[`name_label_${lang}`]}
                  </EditableText>
                  <input type="text" name="name" required className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-colors" />
                </div>

                <div>
                  <EditableText field={`email_label_${lang}`} tag="label" className="block text-sm font-medium text-gray-700 mb-1">
                    {content[`email_label_${lang}`]}
                  </EditableText>
                  <input type="email" name="email" required className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-colors" />
                </div>

                <div>
                  <EditableText field={`message_label_${lang}`} tag="label" className="block text-sm font-medium text-gray-700 mb-1">
                    {content[`message_label_${lang}`]}
                  </EditableText>
                  <textarea name="message" required rows={5} className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-colors resize-none" />
                </div>

                <Button type="submit" variant="primary" className="w-full">
                  <EditableText field={`send_button_${lang}`}>{content[`send_button_${lang}`]}</EditableText>
                </Button>
              </form>
            </Card>
          </AnimatedSection>

          <div className="space-y-4">
            <AnimatedSection delay={0.1} variant="slideLeft">
              <Card>
                <EditableText field={`info_title_${lang}`} tag="h2" className="heading-subsection mb-4 block">
                  {content[`info_title_${lang}`]}
                </EditableText>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Mail size={20} className="text-brand-gold mt-0.5 shrink-0" />
                    <div>
                      <EditableText field={`email_title_${lang}`} tag="p" className="font-semibold text-brand-primary text-sm block">
                        {content[`email_title_${lang}`]}
                      </EditableText>
                      <EditableText scope="settings" field="contact_email" tag="a" href={`mailto:${email}`} className="text-gray-700 hover:text-brand-gold transition-colors text-sm">
                        {email}
                      </EditableText>
                    </div>
                  </div>

                  {phone && (
                    <div className="flex items-start gap-3">
                      <Phone size={20} className="text-brand-gold mt-0.5 shrink-0" />
                      <div>
                        <EditableText field={`phone_title_${lang}`} tag="p" className="font-semibold text-brand-primary text-sm block">
                          {content[`phone_title_${lang}`]}
                        </EditableText>
                        <EditableText scope="settings" field="contact_phone" tag="a" href={`tel:${phone}`} className="text-gray-700 text-sm">
                          {phone}
                        </EditableText>
                      </div>
                    </div>
                  )}

                  {address && (
                    <div className="flex items-start gap-3">
                      <MapPin size={20} className="text-brand-gold mt-0.5 shrink-0" />
                      <div>
                        <EditableText field={`address_title_${lang}`} tag="p" className="font-semibold text-brand-primary text-sm block">
                          {content[`address_title_${lang}`]}
                        </EditableText>
                        <EditableText scope="settings" field={`contact_address_${lang}`} tag="p" className="text-gray-700 text-sm whitespace-pre-line block" multiline>
                          {address}
                        </EditableText>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            </AnimatedSection>

            <AnimatedSection delay={0.15} variant="fadeUp">
              <Card className="bg-brand-primary text-white">
                <EditableText field={`quick_title_${lang}`} tag="h2" className="font-bold text-white mb-2 block">
                  {content[`quick_title_${lang}`]}
                </EditableText>
                <EditableText field={`quick_text_${lang}`} tag="p" className="text-white/80 text-sm leading-relaxed block" multiline>
                  {content[`quick_text_${lang}`]}
                </EditableText>
              </Card>
            </AnimatedSection>
          </div>
        </div>
      </div>
    </div>
  )
}
