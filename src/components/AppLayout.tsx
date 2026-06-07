import { useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { Activity, BarChart3, Container, FileText, LayoutDashboard, List, Menu, Search } from 'lucide-react'
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
      { to: '/provas', label: 'Provas', icon: FileText, badge: 'NOVO' },
      { to: '/auditoria', label: 'Auditoria Genética', icon: BarChart3 },
      { to: '/lista-rebanho', label: 'Lista do Rebanho', icon: List },
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
  '/provas': ['Prova Individual', 'Formato oficial Select Sires'],
  '/semen': ['Botijão Virtual', 'Estoque, doses e nitrogênio'],
  '/auditoria': ['Auditoria Genética', 'Fluxo sequencial 1→7 · Fazenda Sape'],
  '/lista-rebanho': ['Lista do Rebanho', 'Todas as fêmeas genotipadas'],
  '/admin': ['Administração', 'Usuários, fazendas e permissões'],
}

function userInitials(name?: string | null, email?: string | null) {
  const source = name || email || '?'
  return source.split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase()
}

function Brand() {
  return (
    <div className="flex items-center gap-[13px] border-b border-[var(--ss-sidebar-border)] px-5 py-[22px]">
      <div className="relative flex h-[38px] w-[38px] shrink-0 items-center justify-center overflow-hidden rounded-[10px] bg-[linear-gradient(135deg,#DC2626,#991B1B)] shadow-[0_4px_16px_rgba(220,38,38,.3)] after:absolute after:inset-0 after:rounded-[10px] after:bg-[linear-gradient(135deg,rgba(255,255,255,.2),transparent_60%)]">
        <span className="relative z-10 text-[14px] font-black text-white">SS</span>
      </div>
      <div>
        <b className="block text-[17px] font-extrabold leading-none tracking-[-0.5px] text-white">SSGen</b>
        <small className="mt-0.5 text-[9px] uppercase tracking-[2.5px] text-[var(--ss-sidebar-muted)]">Select Sires</small>
      </div>
    </div>
  )
}

function SidebarContent({ onNavClick }: { onNavClick?: () => void }) {
  const { profile } = useAuth()
  const initials = userInitials(profile?.full_name, profile?.email)

  return (
    <div className="flex h-full flex-col bg-[var(--ss-sidebar-bg)]">
      <Brand />
      <nav className="flex-1 overflow-auto px-2.5 py-3.5">
        {navGroups.map((group) => (
          <div key={group.title}>
            <div className="px-3.5 pb-2 pt-4 text-[9px] font-bold uppercase tracking-[2px] text-[var(--ss-sidebar-muted)] first:pt-1">
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
                    `relative mb-0.5 flex items-center gap-[11px] rounded-[9px] border border-transparent px-3.5 py-2.5 text-[13px] font-medium transition ${
                      isActive
                        ? 'bg-[var(--ss-sidebar-active)] text-white font-semibold border-[#333]'
                        : 'text-[#9CA3AF] hover:bg-[var(--ss-sidebar-hover)] hover:text-[#D1D5DB]'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive && <span className="absolute -left-2.5 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-[3px] bg-[#DC2626]" />}
                      <Icon className={`h-[17px] w-[17px] shrink-0 ${isActive ? 'text-[#EF4444]' : 'opacity-50'}`} strokeWidth={1.8} />
                      <span>{item.label}</span>
                      {item.badge && (
                        <span className="ml-auto rounded-[4px] bg-[rgba(220,38,38,.2)] px-[7px] py-px text-[8.5px] font-bold tracking-[.5px] text-[#EF4444]">
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
      <div className="flex items-center gap-[11px] border-t border-[var(--ss-sidebar-border)] px-[18px] py-3.5">
        <div className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full border-2 border-[#333] bg-[#27272A] text-[12px] font-bold text-[#71717A]">
          {initials}
        </div>
        <div className="min-w-0">
          <b className="block truncate text-[13px] font-semibold leading-tight text-[#E4E4E7]">{profile?.full_name ?? 'Diego C.'}</b>
          <small className="text-[10px] text-[var(--ss-sidebar-muted)]">Select Sires BR</small>
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
      <aside className="sticky top-0 hidden h-screen flex-col border-r border-[var(--ss-sidebar-border)] md:flex">
        <SidebarContent />
      </aside>

      <div className="flex min-w-0 flex-col">
        <header className="sticky top-0 z-30 flex h-[60px] items-center justify-between border-b border-[var(--ss-border)] bg-[rgba(244,244,245,.85)] px-4 backdrop-blur-[16px] [backdrop-filter:blur(16px)_saturate(1.3)] md:px-7">
          <div className="flex items-center gap-3">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger render={<Button variant="ghost" size="icon" className="md:hidden" />}>
                <Menu className="h-5 w-5" />
              </SheetTrigger>
              <SheetContent side="left" className="w-[240px] p-0">
                <SidebarContent onNavClick={() => setMobileOpen(false)} />
              </SheetContent>
            </Sheet>
            <h1 className="text-[17px] font-extrabold tracking-[-.3px] text-[var(--ss-fg)]">
              {title}
              <small className="mt-px block text-[11px] font-normal tracking-normal text-[var(--ss-muted)]">{subtitle}</small>
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden items-center gap-[7px] rounded-[8px] border border-[var(--ss-border)] bg-white px-3.5 py-[7px] text-[12px] font-semibold text-[var(--ss-text)] sm:flex">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--ss-primary-bright)] shadow-[0_0_8px_rgba(220,38,38,.4)] animate-[ss-pulse_2s_infinite]" />
              Fazenda Sape
            </div>
            <div className="hidden w-[220px] items-center gap-2 rounded-[8px] border border-[var(--ss-border)] bg-white px-3.5 py-[7px] text-[var(--ss-muted)] lg:flex">
              <Search className="h-[14px] w-[14px]" strokeWidth={1.8} />
              <input className="w-full border-0 bg-transparent text-[12px] text-[var(--ss-fg)] outline-none placeholder:text-[var(--ss-muted-2)]" placeholder="Buscar animal, brinco..." />
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
