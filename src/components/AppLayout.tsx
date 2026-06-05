import { useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { Activity, BarChart3, Container, FileText, LayoutDashboard, List, Menu, Search, Warehouse } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { NotificationsDropdown } from '@/components/NotificationsDropdown'

const navGroups = [
  {
    title: 'Visão geral',
    items: [
      { to: '/', label: 'Dashboard', icon: LayoutDashboard },
      { to: '/painel', label: 'Painel Genômico', icon: Activity, badge: 'NOVO' },
    ],
  },
  {
    title: 'Rebanho',
    items: [
      { to: '/herd', label: 'Rebanho', icon: List },
      { to: '/provas', label: 'Provas', icon: FileText, badge: 'NOVO' },
      { to: '/auditoria', label: 'Auditoria Genética', icon: BarChart3 },
    ],
  },
  {
    title: 'Operação',
    items: [
      { to: '/semen', label: 'Botijão Virtual', icon: Container },
    ],
  },
]

const titles: Record<string, [string, string]> = {
  '/': ['Dashboard', 'Ordens de serviço e downloads'],
  '/painel': ['Painel Genômico', 'Visão analítica do lote genotipado'],
  '/herd': ['Rebanho', 'Ranking e perfil dos animais'],
  '/provas': ['Prova Individual', 'Formato oficial Select Sires'],
  '/semen': ['Botijão Virtual', 'Estoque, doses e nitrogênio'],
  '/auditoria': ['Auditoria Genética', 'Fluxo sequencial 1→7 · Fazenda Sape'],
  '/admin': ['Administração', 'Usuários, fazendas e permissões'],
}

function userInitials(name?: string | null, email?: string | null) {
  const source = name || email || '?'
  return source.split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase()
}

function Brand() {
  return (
    <div className="flex items-center gap-[11px] border-b border-[var(--ss-border)] px-5 py-[18px]">
      <div className="relative flex h-[34px] w-[34px] shrink-0 items-center justify-center overflow-hidden rounded-[9px] bg-[var(--ss-primary)] after:absolute after:inset-0 after:bg-[linear-gradient(135deg,rgba(255,255,255,.28),transparent_60%)]">
        <span className="relative z-10 text-sm font-bold tracking-[-0.5px] text-white">SS</span>
      </div>
      <div>
        <b className="block text-[15px] font-semibold leading-none text-[var(--ss-fg)]">SSGen</b>
        <small className="text-[10px] uppercase tracking-[1.5px] text-[var(--ss-muted-2)]">Select Sires</small>
      </div>
    </div>
  )
}

function SidebarContent({ onNavClick }: { onNavClick?: () => void }) {
  const { profile } = useAuth()
  const initials = userInitials(profile?.full_name, profile?.email)

  return (
    <div className="flex h-full flex-col bg-[var(--ss-card)]">
      <Brand />
      <nav className="flex-1 overflow-auto px-3 py-3.5">
        {navGroups.map((group) => (
          <div key={group.title}>
            <div className="px-2.5 pb-[7px] pt-3.5 text-[10px] font-semibold uppercase tracking-[1.2px] text-[var(--ss-muted-2)] first:pt-0">
              {group.title}
            </div>
            {group.items.map((item) => {
              const Icon = item.icon
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  onClick={onNavClick}
                  className={({ isActive }) =>
                    `mb-0.5 flex items-center gap-[11px] rounded-[7px] border border-transparent px-[11px] py-[9px] text-[13.5px] font-medium transition ${
                      isActive
                        ? 'bg-[var(--ss-primary-soft)] text-[var(--ss-primary)] font-semibold'
                        : 'text-[var(--ss-text)] hover:bg-[var(--ss-wash)]'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon className={`h-[17px] w-[17px] shrink-0 ${isActive ? 'text-[var(--ss-primary)]' : 'text-[var(--ss-muted)]'}`} strokeWidth={1.8} />
                      <span>{item.label}</span>
                      {item.badge && (
                        <span className={`ml-auto rounded-full border border-[#F3D2D8] px-1.5 py-px text-[9px] font-bold tracking-[.5px] text-[var(--ss-primary)] ${isActive ? 'bg-white' : 'bg-[var(--ss-primary-soft)]'}`}>
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              )
            })}
          </div>
        ))}
      </nav>
      <div className="flex items-center gap-[11px] border-t border-[var(--ss-border)] px-4 py-3.5">
        <div className="flex h-[34px] w-[34px] items-center justify-center rounded-full border border-[var(--ss-border)] bg-[var(--ss-wash)] text-[13px] font-semibold text-[var(--ss-fg)]">
          {initials}
        </div>
        <div className="min-w-0">
          <b className="block truncate text-[13px] font-semibold leading-tight text-[var(--ss-fg)]">{profile?.full_name ?? 'Diego C.'}</b>
          <small className="text-[11px] text-[var(--ss-muted)]">Select Sires BR</small>
        </div>
      </div>
    </div>
  )
}

export function AppLayout() {
  const { signOut } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()
  const [title, subtitle] = titles[location.pathname] ?? titles['/']

  return (
    <div className="grid min-h-screen grid-cols-1 bg-[var(--ss-bg)] text-[var(--ss-text)] md:grid-cols-[248px_1fr]">
      <aside className="sticky top-0 hidden h-screen flex-col border-r border-[var(--ss-border)] md:flex">
        <SidebarContent />
      </aside>

      <div className="flex min-w-0 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[var(--ss-border)] bg-[rgba(250,250,249,.85)] px-4 backdrop-blur md:px-[30px]">
          <div className="flex items-center gap-3">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger render={<Button variant="ghost" size="icon" className="md:hidden" />}>
                <Menu className="h-5 w-5" />
              </SheetTrigger>
              <SheetContent side="left" className="w-[248px] p-0">
                <SidebarContent onNavClick={() => setMobileOpen(false)} />
              </SheetContent>
            </Sheet>
            <h1 className="text-[18px] font-semibold tracking-[-.2px] text-[var(--ss-fg)]">
              {title}
              <small className="mt-px block text-[11.5px] font-normal tracking-normal text-[var(--ss-muted)]">{subtitle}</small>
            </h1>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="hidden items-center gap-[7px] rounded-[7px] border border-[var(--ss-border)] bg-[var(--ss-card)] px-3 py-2 text-[12.5px] font-medium text-[var(--ss-fg)] sm:flex">
              <Warehouse className="h-3.5 w-3.5 text-[var(--ss-primary)]" strokeWidth={1.9} />
              Fazenda Sape
            </div>
            <div className="hidden w-[230px] items-center gap-2 rounded-[7px] border border-[var(--ss-border)] bg-[var(--ss-card)] px-3 py-2 text-[var(--ss-muted)] lg:flex">
              <Search className="h-[15px] w-[15px]" strokeWidth={1.8} />
              <input className="w-full border-0 bg-transparent text-[13px] text-[var(--ss-fg)] outline-none" placeholder="Buscar animal, brinco, touro..." />
            </div>
            <NotificationsDropdown />
            <Button variant="ghost" className="h-8 px-2 text-xs text-[var(--ss-muted)]" onClick={() => void signOut()}>
              Sair
            </Button>
          </div>
        </header>

        <main className="w-full max-w-[1320px] px-4 py-[26px] pb-[50px] md:px-[30px]">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
