import { useEffect, useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import { LanguageSelector } from '@/components/LanguageSelector'
import { useI18n } from '@/i18n'

function PasswordInput({ id, value, onChange, placeholder, minLength }: { id: string; value: string; onChange: (v: string) => void; placeholder: string; minLength?: number }) {
  const { t } = useI18n()
  const [visible, setVisible] = useState(false)
  return (
    <div className="relative">
      <Input
        id={id}
        type={visible ? 'text' : 'password'}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
        minLength={minLength}
        className="pr-10"
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? t('auth.hidePassword') : t('auth.showPassword')}
        title={visible ? t('auth.hidePassword') : t('auth.showPassword')}
        className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-muted-foreground hover:text-foreground"
      >
        {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  )
}

export function AuthPage() {
  const navigate = useNavigate()
  const { session, signIn, signUp, sendMagicLink, sendPasswordReset, verifyEmailCode, updatePassword } = useAuth()
  const { t } = useI18n()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [breed, setBreed] = useState<'HO' | 'JE'>('HO')
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [codeSent, setCodeSent] = useState(false)
  const [code, setCode] = useState('')
  // link de redefinição de senha: a sessão de recuperação não pode mandar direto para o portal
  const [recovery, setRecovery] = useState(() => typeof window !== 'undefined' && window.location.hash.includes('type=recovery'))
  const [newPassword, setNewPassword] = useState('')

  // acesso aberto pela equipe (dashboard central): link de uso único com token_hash
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const tokenHash = params.get('token_hash')
    if (!tokenHash || params.get('type') !== 'magiclink') return
    window.history.replaceState(null, '', '/auth')
    void supabase.auth.verifyOtp({ token_hash: tokenHash, type: 'magiclink' }).then(({ error: otpError }) => {
      if (otpError) setError(t('auth.invalidCode'))
      else navigate('/', { replace: true })
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((event) => { if (event === 'PASSWORD_RECOVERY') setRecovery(true) })
    return () => data.subscription.unsubscribe()
  }, [])

  // Redirect if already logged in
  if (session && !recovery) {
    navigate('/', { replace: true })
    return null
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await signIn(email, password)
      navigate('/', { replace: true })
    } catch {
      setError(t('auth.invalidCredentials'))
    } finally {
      setLoading(false)
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await signUp(email, password, fullName, breed)
      setMessage(t('auth.accountCreated'))
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t('auth.createAccountError')
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  const handleMagicLink = async () => {
    if (!email) {
      setError(t('auth.enterEmailFirst'))
      return
    }
    setError(null)
    setLoading(true)
    try {
      await sendMagicLink(email)
      setCodeSent(true)
      setMessage(t('auth.magicLinkSent'))
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t('auth.sendLinkError')
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  const handleForgot = async () => {
    if (!email) {
      setError(t('auth.enterEmailFirst'))
      return
    }
    setError(null)
    setLoading(true)
    try {
      await sendPasswordReset(email)
      setMessage(t('auth.resetSent'))
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t('auth.sendLinkError'))
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await verifyEmailCode(email, code)
      navigate('/', { replace: true })
    } catch {
      setError(t('auth.invalidCode'))
    } finally {
      setLoading(false)
    }
  }

  const handleNewPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await updatePassword(newPassword)
      setRecovery(false)
      window.history.replaceState(null, '', '/auth')
      navigate('/', { replace: true })
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t('auth.createAccountError'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-background p-4">
      <div className="absolute right-4 top-4"><LanguageSelector /></div>
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center">
              <span className="text-xl font-bold text-primary-foreground">S</span>
            </div>
            <CardTitle className="text-2xl">SSGEN</CardTitle>
          </div>
          <CardDescription>
            {t('auth.portalDescription')}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {error && (
            <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {message && (
            <div className="mb-4 p-3 bg-primary/10 border border-primary/20 rounded-md">
              <p className="text-sm text-primary">{message}</p>
            </div>
          )}

          {recovery ? (
            <form onSubmit={(e) => { void handleNewPassword(e) }} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-password">{t('auth.newPassword')}</Label>
                <PasswordInput id="new-password" value={newPassword} onChange={setNewPassword} placeholder={t('auth.passwordPlaceholder')} minLength={6} />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>{t('auth.saveNewPassword')}</Button>
            </form>
          ) : (
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">{t('auth.signIn')}</TabsTrigger>
              <TabsTrigger value="register">{t('auth.createAccount')}</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={(e) => { void handleSignIn(e) }} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">{t('auth.email')}</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder={t('auth.emailPlaceholder')}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">{t('auth.password')}</Label>
                  <PasswordInput id="login-password" value={password} onChange={setPassword} placeholder="••••••••" />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? t('auth.signingIn') : t('auth.signIn')}
                </Button>

                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">{t('auth.or')}</span>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  disabled={loading}
                  onClick={() => { void handleMagicLink() }}
                >
                  {t('auth.signInMagicLink')}
                </Button>

                {codeSent && (
                  <div className="space-y-2 rounded-md border p-3">
                    <Label htmlFor="login-code">{t('auth.emailCode')}</Label>
                    <div className="flex gap-2">
                      <Input id="login-code" inputMode="numeric" autoComplete="one-time-code" placeholder="••••••••" value={code} onChange={(e) => setCode(e.target.value)} />
                      <Button type="button" disabled={loading || code.trim().length < 6} onClick={(e) => { void handleVerifyCode(e) }}>{t('auth.signIn')}</Button>
                    </div>
                  </div>
                )}

                <button type="button" className="w-full text-center text-sm text-primary underline-offset-4 hover:underline" disabled={loading} onClick={() => { void handleForgot() }}>
                  {t('auth.forgotPassword')}
                </button>
              </form>
            </TabsContent>

            <TabsContent value="register">
              <form onSubmit={(e) => { void handleSignUp(e) }} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="reg-name">{t('auth.fullName')}</Label>
                  <Input
                    id="reg-name"
                    type="text"
                    placeholder={t('auth.fullNamePlaceholder')}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-email">{t('auth.email')}</Label>
                  <Input
                    id="reg-email"
                    type="email"
                    placeholder={t('auth.emailPlaceholder')}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-password">{t('auth.password')}</Label>
                  <PasswordInput id="reg-password" value={password} onChange={setPassword} placeholder={t('auth.passwordPlaceholder')} minLength={6} />
                </div>
                <div className="space-y-2">
                  <Label>{t('auth.breed')}</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {([
                      ['HO', t('auth.holstein')],
                      ['JE', 'Jersey'],
                    ] as const).map(([value, label]) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setBreed(value)}
                        className={`rounded-md border px-3 py-2 text-sm font-medium transition ${
                          breed === value
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'border-input bg-background text-foreground hover:bg-accent'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? t('auth.creating') : t('auth.createAccount')}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
          )}

          <p className="text-xs text-center text-muted-foreground mt-6">
            Select Sires do Brasil &copy; {new Date().getFullYear()}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
