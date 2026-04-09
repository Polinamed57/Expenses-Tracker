import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Settings, TrendingUp, User, Moon, Sun } from 'lucide-react'
import { useTheme } from '@/providers/ThemeProvider'
import { useProfile } from '@/hooks/useProfile'
import { Button } from '@/components/ui/button'

const navLinks = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/profile', label: 'Profile', icon: User },
  { to: '/settings', label: 'Settings', icon: Settings },
]

export function Sidebar() {
  const { theme, setTheme } = useTheme()
  const { data: profile } = useProfile()

  const initial = profile?.display_name?.[0]?.toUpperCase() ?? '?'

  return (
    <aside
      style={{
        width: '240px',
        position: 'fixed',
        top: 0,
        left: 0,
        height: '100vh',
        borderRight: '1px solid var(--border)',
        background: 'var(--sidebar)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 40,
      }}
    >
      <div style={{ padding: '20px 16px 16px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'var(--primary)',
              color: 'var(--primary-foreground)',
              flexShrink: 0,
            }}
          >
            <TrendingUp size={16} />
          </span>
          <span style={{ fontWeight: 600, fontSize: '15px', color: 'var(--sidebar-foreground)' }}>
            Expenses Tracker
          </span>
        </div>
      </div>

      <nav style={{ flex: 1, padding: '12px 8px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {navLinks.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className="sidebar-link"
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '8px 12px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 500,
              textDecoration: 'none',
              color: isActive ? 'var(--sidebar-primary-foreground)' : 'var(--sidebar-foreground)',
              background: isActive ? 'var(--sidebar-primary)' : 'transparent',
            })}
          >
            <Icon size={16} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div
        style={{
          padding: '12px 8px',
          borderTop: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 8px' }}>
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              background: 'var(--sidebar-accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              fontWeight: 600,
              color: 'var(--sidebar-accent-foreground)',
              flexShrink: 0,
            }}
          >
            {initial}
          </div>
          <span
            style={{
              fontSize: '13px',
              fontWeight: 500,
              color: 'var(--sidebar-foreground)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              maxWidth: '110px',
            }}
          >
            {profile?.display_name ?? 'You'}
          </span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
        </Button>
      </div>
    </aside>
  )
}
