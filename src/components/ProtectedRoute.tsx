import { Navigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { PrivacyGate } from '@/components/PrivacyGate'
import { useAuth } from '@/hooks/useAuth'
import { privacyApi } from '@/lib/privacy'
import { useI18n } from '@/i18n'

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { session, loading, signOut } = useAuth()
  const { t } = useI18n()
  // aceite da Política de Privacidade (LGPD): sem aceitar a versão vigente, não passa daqui
  const { data: privacy, isLoading: privacyLoading, isError: privacyError, refetch } = useQuery({
    queryKey: ['privacy-status'],
    queryFn: privacyApi.status,
    enabled: !!session,
    staleTime: 5 * 60_000,
    retry: 1,
  })

  if (loading || (session && privacyLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  if (!session) {
    return <Navigate to="/auth" replace />
  }

  if (privacyError || !privacy) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 p-6 text-center">
        <p className="text-sm text-muted-foreground">{t('privacy.gate.error')}</p>
        <div className="flex gap-2">
          <Button onClick={() => void refetch()}>{t('privacy.gate.retry')}</Button>
          <Button variant="outline" onClick={() => void signOut()}>{t('privacy.gate.signOut')}</Button>
        </div>
      </div>
    )
  }

  if (!privacy.accepted) return <PrivacyGate />

  return <>{children}</>
}
