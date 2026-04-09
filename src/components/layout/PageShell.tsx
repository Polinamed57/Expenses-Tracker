import { Sidebar } from './Sidebar'

interface PageShellProps {
  children: React.ReactNode
}

export function PageShell({ children }: PageShellProps) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--background)' }}>
      <Sidebar />
      <main style={{ marginLeft: '240px', flex: 1, padding: '32px', minWidth: 0 }}>
        {children}
      </main>
    </div>
  )
}
