import { NavLink } from 'react-router-dom'
import {
  CalendarDays,
  LayoutDashboard,
  ListTodo,
  BookOpen,
  Settings,
  Sun,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { to: '/today', label: 'Today', icon: Sun },
  { to: '/calendar', label: 'Calendar', icon: CalendarDays },
  { to: '/events', label: 'Stuff', icon: ListTodo },
  { to: '/dashboard', label: 'Stats', icon: LayoutDashboard },
  { to: '/journal', label: 'Journal', icon: BookOpen },
  { to: '/settings', label: 'Settings', icon: Settings },
]

export function Sidebar() {
  return (
    <aside className="hidden md:flex w-64 shrink-0 flex-col border-r border-border bg-card/50 p-4">
      <div className="mb-8 px-2">
        <h1 className="text-xl font-bold text-primary">DayTrack</h1>
        <p className="text-xs text-muted-foreground">Track habits & events</p>
      </div>
      <nav className="flex flex-col gap-1">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
              )
            }
          >
            <Icon className="h-4 w-4" />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}

export function BottomNav() {
  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 z-50 border-t border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/90"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="flex h-16 items-stretch justify-around px-1">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 px-0.5 text-[9px] font-medium transition-colors',
                isActive ? 'text-primary' : 'text-muted-foreground',
              )
            }
          >
            <Icon className="h-5 w-5 shrink-0" />
            <span className="truncate max-w-full">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-dvh w-full overflow-hidden bg-background">
      <Sidebar />
      <div className="relative flex min-w-0 flex-1 flex-col">
        <main
          className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain md:pb-0"
          style={{
            paddingBottom: 'calc(var(--bottom-nav-height) + env(safe-area-inset-bottom, 0px))',
          }}
        >
          <div className="mx-auto w-full min-w-0 max-w-5xl p-3 sm:p-4 md:p-6">{children}</div>
        </main>
        <BottomNav />
      </div>
    </div>
  )
}
