import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'

export function DashboardPage() {
  const { profile, signOut } = useAuth()

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-8 gap-6">
      <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center">
        <span className="text-2xl font-bold text-primary-foreground">S</span>
      </div>

      <h1 className="text-2xl font-bold">
        Bem-vindo{profile?.full_name ? `, ${profile.full_name}` : ''}!
      </h1>

      <p className="text-muted-foreground">
        Perfil: <span className="font-medium capitalize">{profile?.role ?? '—'}</span>
      </p>

      <p className="text-sm text-muted-foreground">
        Dashboard em construção. Em breve você verá seus resultados genômicos aqui.
      </p>

      <Button variant="outline" onClick={() => { void signOut() }}>
        Sair
      </Button>
    </div>
  )
}
