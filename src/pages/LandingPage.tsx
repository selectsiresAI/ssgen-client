import { Button } from '@/components/ui/button'

export function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-8">
      <div className="max-w-md text-center space-y-6">
        <div className="flex items-center justify-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center">
            <span className="text-2xl font-bold text-primary-foreground">S</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">SSGEN</h1>
        </div>

        <p className="text-muted-foreground text-lg">
          Portal de resultados genômicos Select Sires.
          Acompanhe suas ordens de serviço, resultados e fêmeas genotipadas.
        </p>

        <Button size="lg" className="w-full" disabled>
          Entrar (em breve)
        </Button>

        <p className="text-xs text-muted-foreground">
          Select Sires do Brasil &copy; {new Date().getFullYear()}
        </p>
      </div>
    </div>
  )
}
