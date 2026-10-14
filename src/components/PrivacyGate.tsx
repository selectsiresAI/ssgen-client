import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { LanguageSelector } from '@/components/LanguageSelector'
import { PRIVACY_EFFECTIVE, PRIVACY_SECTIONS, PRIVACY_VERSION, policyHash, privacyApi } from '@/lib/privacy'
import { useAuth } from '@/hooks/useAuth'
import { useI18n } from '@/i18n'

// Tela de aceite: bloqueia o portal até o usuário aceitar a versão vigente da política.
export function PrivacyGate() {
  const { t, locale, formatDate } = useI18n()
  const { signOut } = useAuth()
  const queryClient = useQueryClient()
  const [accepted, setAccepted] = useState(false)
  const [marketing, setMarketing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(false)
  const date = formatDate(new Date(`${PRIVACY_EFFECTIVE}T12:00:00`), { day: '2-digit', month: '2-digit', year: 'numeric' })

  async function submit() {
    setSaving(true)
    setError(false)
    try {
      const texts = PRIVACY_SECTIONS.flatMap((s) => [t(s.title)])
      const hash = await policyHash(texts.concat(Array.from({ length: 5 }, (_, i) => t(`privacy.gate.b${i + 1}`))))
      const status = await privacyApi.accept({ marketing, locale, hash, source: 'login-gate' })
      queryClient.setQueryData(['privacy-status'], status)
    } catch {
      setError(true)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-4">
      <div className="absolute right-4 top-4"><LanguageSelector /></div>
      <div role="dialog" aria-modal="true" aria-labelledby="privacy-title" className="my-auto w-full max-w-[560px] overflow-hidden rounded-2xl bg-white shadow-2xl">
        <header className="flex items-center gap-3 px-6 pb-2 pt-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-lg font-bold text-primary-foreground">S</div>
          <h1 id="privacy-title" className="text-[19px] font-bold leading-tight">{t('privacy.gate.title')}</h1>
        </header>
        <p className="px-6 text-[14px] text-[var(--ss-muted)]">{t('privacy.gate.lead')}</p>

        <div className="mx-6 mt-3 max-h-[260px] overflow-y-auto rounded-[10px] border border-[var(--ss-border)] bg-[var(--ss-wash)] px-4 py-3.5 text-[13.5px]">
          {[1, 2, 3, 4, 5].map((n) => (
            <div key={n} className="mb-3 last:mb-0">
              <h2 className="mb-0.5 text-[13.5px] font-bold">{t(`privacy.gate.h${n}`)}</h2>
              <p>{t(`privacy.gate.b${n}`)}</p>
            </div>
          ))}
        </div>

        <p className="mx-6 mt-2.5 text-[13.5px]">
          <a href="/privacidade" target="_blank" rel="noopener noreferrer" className="font-semibold text-primary underline-offset-2 hover:underline">{t('privacy.gate.read')}</a>{' '}
          <span className="text-[var(--ss-muted)]">{t('privacy.gate.readNote')}</span>
        </p>

        <label className="mx-6 mt-4 flex cursor-pointer items-start gap-3 text-[14px]">
          <input type="checkbox" checked={accepted} onChange={(e) => setAccepted(e.target.checked)} className="mt-0.5 h-5 w-5 shrink-0 accent-[var(--ss-primary)]" />
          <span>
            <b>{t('privacy.gate.accept', { version: PRIVACY_VERSION, date })}</b>
            <span className="ml-1.5 rounded-full bg-[var(--ss-primary-soft)] px-2 py-px text-[11px] font-bold tracking-wide text-[var(--ss-primary)]">{t('privacy.tag.required')}</span>
          </span>
        </label>
        <label className="mx-6 mt-3 flex cursor-pointer items-start gap-3 text-[14px]">
          <input type="checkbox" checked={marketing} onChange={(e) => setMarketing(e.target.checked)} className="mt-0.5 h-5 w-5 shrink-0 accent-[var(--ss-primary)]" />
          <span>
            {t('privacy.gate.marketing')}
            <span className="ml-1.5 rounded-full bg-[var(--ss-wash)] px-2 py-px text-[11px] font-bold tracking-wide text-[var(--ss-muted)]">{t('privacy.tag.optional')}</span>
          </span>
        </label>

        {error && <p className="mx-6 mt-3 text-[13px] text-destructive">{t('privacy.gate.error')}</p>}

        <div className="flex flex-wrap items-center justify-end gap-2.5 px-6 pb-6 pt-5">
          <p className="basis-full text-[12px] text-[var(--ss-muted)]">{t('privacy.gate.hint')}</p>
          <Button variant="outline" className="h-10" onClick={() => void signOut()}>{t('privacy.gate.signOut')}</Button>
          <Button className="h-10" disabled={!accepted || saving} onClick={() => void submit()}>
            {saving ? t('privacy.gate.saving') : t('privacy.gate.continue')}
          </Button>
        </div>
      </div>
    </div>
  )
}
