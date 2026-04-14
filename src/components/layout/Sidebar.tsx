import { NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Settings, TrendingUp, User, Moon, Sun, Menu, ChevronRight, ChevronLeft, X, Target, LogOut } from 'lucide-react'
import { useTheme } from '@/providers/ThemeProvider'
import { useProfile } from '@/hooks/useProfile'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'

interface SidebarProps {
  isOpen: boolean
  onToggle: () => void
  isMobile: boolean
}

const navLinks = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/goals', label: 'Goals', icon: Target },
  { to: '/profile', label: 'Profile', icon: User },
  { to: '/settings', label: 'Settings', icon: Settings },
]

function ThemeButton() {
  const { theme, setTheme } = useTheme()
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      aria-label="Toggle theme"
      style={{ flexShrink: 0 }}
    >
      {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
    </Button>
  )
}

function NavItems({ isOpen, onClose }: { isOpen: boolean; onClose?: () => void }) {
  return (
    <nav style={{ flex: 1, padding: '12px 8px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
      {navLinks.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          onClick={onClose}
          title={!isOpen ? label : undefined}
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
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            justifyContent: isOpen ? 'flex-start' : 'center',
          })}
        >
          <Icon size={16} style={{ flexShrink: 0 }} />
          {isOpen && <span>{label}</span>}
        </NavLink>
      ))}
    </nav>
  )
}

export function Sidebar({ isOpen, onToggle, isMobile }: SidebarProps) {
  const { data: profile } = useProfile()
  const { theme } = useTheme()
  const navigate = useNavigate()
  const initial = profile?.display_name?.[0]?.toUpperCase() ?? '?'

  async function handleLogout() {
    await supabase.auth.signOut()
    navigate('/login')
  }

  if (isMobile) {
    return (
      <>
        {/* Top bar */}
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            height: '56px',
            background: 'var(--sidebar)',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            padding: '0 16px',
            zIndex: 50,
            gap: '12px',
          }}
        >
          <button
            onClick={onToggle}
            aria-label="Open menu"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '32px',
              height: '32px',
              borderRadius: '6px',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              color: 'var(--sidebar-foreground)',
            }}
          >
            <Menu size={18} />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '28px',
                height: '28px',
                borderRadius: '6px',
                background: 'var(--primary)',
                color: 'var(--primary-foreground)',
                flexShrink: 0,
              }}
            >
              <TrendingUp size={14} />
            </span>
            <span style={{ fontWeight: 600, fontSize: '14px', color: 'var(--sidebar-foreground)' }}>
              Expenses Tracker
            </span>
          </div>
          <div style={{ flex: 1 }} />
          <ThemeButton />
        </div>

        {/* Overlay sidebar */}
        <aside
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            height: '100vh',
            width: '240px',
            background: 'var(--sidebar)',
            borderRight: '1px solid var(--border)',
            transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
            transition: 'transform 0.25s ease',
            zIndex: 50,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div
            style={{
              padding: '16px',
              borderBottom: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
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
            <button
              onClick={onToggle}
              aria-label="Close menu"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '28px',
                height: '28px',
                borderRadius: '6px',
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                color: 'var(--sidebar-foreground)',
              }}
            >
              <X size={16} />
            </button>
          </div>

          <NavItems isOpen={true} onClose={onToggle} />

          <div
            style={{
              padding: '12px 16px',
              borderTop: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
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
                flex: 1,
              }}
            >
              {profile?.display_name ?? 'You'}
            </span>
            <button
              onClick={handleLogout}
              aria-label="Sign out"
              title="Sign out"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '28px',
                height: '28px',
                borderRadius: '6px',
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                color: 'var(--sidebar-foreground)',
                opacity: 0.6,
                flexShrink: 0,
              }}
            >
              <LogOut size={14} />
            </button>
          </div>
        </aside>
      </>
    )
  }

  // Desktop
  return (
    <aside
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        height: '100vh',
        width: isOpen ? '240px' : '60px',
        transition: 'width 0.2s ease',
        overflow: 'hidden',
        background: 'var(--sidebar)',
        borderRight: '1px solid var(--border)',
        zIndex: 40,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Logo row */}
      <div
        style={{
          padding: '16px 8px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: isOpen ? 'space-between' : 'center',
          gap: '8px',
          overflow: 'hidden',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
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
          {isOpen && (
            <span
              style={{
                fontWeight: 600,
                fontSize: '15px',
                color: 'var(--sidebar-foreground)',
                whiteSpace: 'nowrap',
              }}
            >
              Expenses Tracker
            </span>
          )}
        </div>
        {isOpen && (
          <button
            onClick={onToggle}
            aria-label="Collapse sidebar"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '28px',
              height: '28px',
              borderRadius: '6px',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              color: 'var(--sidebar-foreground)',
              flexShrink: 0,
            }}
          >
            <ChevronLeft size={16} />
          </button>
        )}
      </div>

      {/* Toggle button when collapsed */}
      {!isOpen && (
        <div style={{ padding: '8px', display: 'flex', justifyContent: 'center' }}>
          <button
            onClick={onToggle}
            aria-label="Expand sidebar"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '28px',
              height: '28px',
              borderRadius: '6px',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              color: 'var(--sidebar-foreground)',
            }}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      <NavItems isOpen={isOpen} />

      {/* Theme toggle — always visible */}
      <div
        style={{
          padding: '4px 8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: isOpen ? 'space-between' : 'center',
          paddingLeft: isOpen ? '16px' : '8px',
          paddingRight: isOpen ? '8px' : '8px',
        }}
      >
        {isOpen && (
          <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--sidebar-foreground)' }}>
            {theme === 'dark' ? 'Light mode' : 'Dark mode'}
          </span>
        )}
        <ThemeButton />
      </div>

      {/* Bottom: user */}
      <div
        style={{
          padding: '8px 8px 12px',
          borderTop: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: isOpen ? 'flex-start' : 'center',
          overflow: 'hidden',
          gap: '8px',
        }}
      >
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
        {isOpen && (
          <>
            <span
              style={{
                fontSize: '13px',
                fontWeight: 500,
                color: 'var(--sidebar-foreground)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                flex: 1,
              }}
            >
              {profile?.display_name ?? 'You'}
            </span>
            <button
              onClick={handleLogout}
              aria-label="Sign out"
              title="Sign out"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '28px',
                height: '28px',
                borderRadius: '6px',
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                color: 'var(--sidebar-foreground)',
                opacity: 0.6,
                flexShrink: 0,
              }}
            >
              <LogOut size={14} />
            </button>
          </>
        )}
      </div>
    </aside>
  )
}
