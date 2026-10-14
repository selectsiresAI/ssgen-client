import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { LanguageSelector } from '@/components/LanguageSelector'
import { PrivacyPolicyText } from '@/components/PrivacyPolicyText'
import { PRIVACY_EFFECTIVE, PRIVACY_VERSION, privacyApi } from '@/lib/privacy'
import { useAuth } from '@/hooks/useAuth'
import { useI18n } from '@/i18n'

// Página pública da política (abre sem login). Logado, mostra quando o usuário aceitou e a preferência de avisos.
export function PrivacyPage() {
  const { t, locale, formatDate } = useI18n()
  const { session } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [saved, setSaved] = useState(false)
  const { data: status } = useQuery({ queryKey: ['privacy-status'], queryFn: privacyApi.status, enabled: !!session })
  const date = formatDate(new Date(`${PRIVACY_EFFECTIVE}T12:00:00`), { day: '2-digit', month: '2-digit', year: 'numeric' })

  async function toggleMarketing(value: boolean) {
    setSaved(false)
    const next = await privacyApi.setMarketing(value, locale)
    queryClient.setQueryData(['privacy-status'], next)
    setSaved(true)
  }

  return (
    <div className="min-h-screen bg-[var(--ss-bg)] px-4 py-8">
      <div className="mx-auto max-w-[860px]">
        <div className="mb-5 flex items-center justify-between">
          <Button variant="ghost" className="gap-1.5 px-2" onClick={() => (window.history.length > 1 ? navigate(-1) : navigate('/'))}>
            <ArrowLeft className="h-4 w-4" />{t('privacy.page.back')}
          </Button>
          <LanguageSelector />
        </div>
        <div className="rounded-2xl border border-[var(--ss-border)] bg-white px-6 py-7 sm:px-9">
          <h1 className="text-[24px] font-extrabold tracking-tight">{t('privacy.page.title')}</h1>
          <p className="mb-6 mt-1 text-[13px] text-[var(--ss-muted)]">{t('privacy.page.version', { version: PRIVACY_VERSION, date })}</p>

          {session && status?.accepted && status.accepted_at && (
            <div className="mb-6 rounded-[10px] border border-[var(--ss-border)] bg-[var(--ss-wash)] px-4 py-3 text-[13.5px]">
              <p>{t('privacy.page.acceptedAt', { date: formatDate(status.accepted_at, { dateStyle: 'short', timeStyle: 'short' }) })}</p>
              <label className="mt-2 flex cursor-pointer items-center gap-2.5">
                <input type="checkbox" checked={status.marketing_opt_in} onChange={(e) => { void toggleMarketing(e.target.checked) }} className="h-4 w-4 accent-[var(--ss-primary)]" />
                <span>{t('privacy.page.marketingLabel')}</span>
              </label>
              {saved && <p className="mt-1 text-[12px] text-[var(--ss-muted)]">{t('privacy.page.marketingSaved')}</p>}
            </div>
          )}

          <PrivacyPolicyText />
        </div>
      </div>
    </div>
  )
}
