import { useState, useEffect } from 'react'
import { Sidebar } from './Sidebar'

interface PageShellProps {
  children: React.ReactNode
}

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])
  return isMobile
}

export function PageShell({ children }: PageShellProps) {
  const [isOpen, setIsOpen] = useState(false)
  const isMobile = useIsMobile()

  const marginLeft = isMobile ? 0 : isOpen ? 240 : 60

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--background)' }}>
      <Sidebar isOpen={isOpen} onToggle={() => setIsOpen(v => !v)} isMobile={isMobile} />

      {isMobile && isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.4)',
            zIndex: 39,
          }}
        />
      )}

      <main
        style={{
          marginLeft,
          flex: 1,
          padding: isMobile ? '16px' : '32px',
          paddingTop: isMobile ? '72px' : '32px',
          minWidth: 0,
          transition: 'margin-left 0.2s ease',
        }}
      >
        {children}
      </main>
    </div>
  )
}
