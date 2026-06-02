import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Separator } from '@/components/ui/separator'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { NotificationsDropdown } from '@/components/NotificationsDropdown'

interface NavItem {
  to: string
  label: string
  icon: string
  adminOnly?: boolean
}

interface NavGroup {
  title?: string
  items: NavItem[]
}

const NAV_GROUPS: NavGroup[] = [
  {
    items: [
      { to: '/', label: 'Dashboard', icon: '📊' },
    ],
  },
  {
    title: 'Bancos de Dados',
    items: [
      { to: '/herd', label: 'Rebanho', icon: '🐄' },
      { to: '/semen', label: 'Botijao Virtual', icon: '🧪' },
    ],
  },
  {
    title: 'Analises',
    items: [
      { to: '/auditoria', label: 'Auditoria Genetica', icon: '📈' },
    ],
  },
  {
    items: [
      { to: '/orders', label: 'Ordens de Servico', icon: '📋' },
      { to: '/results', label: 'Resultados', icon: '🧬' },
      { to: '/females', label: 'Femeas', icon: '🐮' },
      { to: '/admin', label: 'Administracao', icon: '⚙️', adminOnly: true },
    ],
  },
]

function NavItems({ onClick, isAdmin }: { onClick?: () => void; isAdmin: boolean }) {
  return (
    <nav className="flex flex-col gap-1">
      {NAV_GROUPS.map((group, gi) => {
        const items = isAdmin ? group.items : group.items.filter((i) => !i.adminOnly)
        if (items.length === 0) return null
        return (
          <div key={gi}>
            {group.title && (
              <p className="px-3 pt-3 pb-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {group.title}
              </p>
            )}
            {items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                onClick={onClick}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                    isActive
                      ? 'bg-primary/10 text-primary font-medium'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`
                }
              >
                <span>{item.icon}</span>
                {item.label}
              </NavLink>
            ))}
          </div>
        )
      })}
    </nav>
  )
}

function SidebarContent({ onNavClick, isAdmin }: { onNavClick?: () => void; isAdmin: boolean }) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 px-4 py-5">
        <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center">
          <span className="text-lg font-bold text-primary-foreground">S</span>
        </div>
        <div>
          <p className="font-semibold text-sm">SSGEN Cliente</p>
          <p className="text-xs text-muted-foreground">Portal de Resultados</p>
        </div>
      </div>
      <Separator />
      <div className="flex-1 px-3 py-4">
        <NavItems onClick={onNavClick} isAdmin={isAdmin} />
      </div>
      <Separator />
      <div className="px-4 py-3">
        <p className="text-xs text-muted-foreground text-center">
          Select Sires &copy; {new Date().getFullYear()}
        </p>
      </div>
    </div>
  )
}

export function AppLayout() {
  const { profile, signOut } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)

  const initials = profile?.full_name
    ? profile.full_name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : '?'

  const isAdmin = profile?.role === 'admin'

  return (
    <div className="min-h-screen flex">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-60 flex-col border-r bg-card">
        <SidebarContent isAdmin={isAdmin} />
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-14 border-b bg-card flex items-center justify-between px-4 gap-4">
          <div className="flex items-center gap-2">
            {/* Mobile hamburger */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger
                render={<Button variant="ghost" size="icon" className="md:hidden" />}
              >
                <span className="text-lg">&#9776;</span>
              </SheetTrigger>
              <SheetContent side="left" className="w-60 p-0">
                <SidebarContent onNavClick={() => setMobileOpen(false)} isAdmin={isAdmin} />
              </SheetContent>
            </Sheet>
            <span className="text-sm font-medium md:hidden">SSGEN</span>
          </div>

          <div className="flex items-center gap-1">
          <NotificationsDropdown />
          <DropdownMenu>
            <DropdownMenuTrigger
              render={<Button variant="ghost" className="flex items-center gap-2" />}
            >
              <Avatar className="h-7 w-7">
                <AvatarFallback className="text-xs">{initials}</AvatarFallback>
              </Avatar>
              <span className="text-sm hidden sm:inline">
                {profile?.full_name ?? profile?.email ?? ''}
              </span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => {
                  void signOut()
                }}
              >
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
