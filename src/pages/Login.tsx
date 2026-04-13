import { TrendingUp, Sparkles, ChartPie, Target } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LoginForm } from '@/components/auth/LoginForm'

const features = [
  { icon: Sparkles, text: 'AI-powered category suggestions' },
  { icon: ChartPie, text: 'Budget tracking by category' },
  { icon: Target, text: 'Personal savings goals' },
]

export default function Login() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', position: 'relative' }}>

      {/* Left panel */}
      <div
        style={{
          flex: '0 0 55%',
          background: 'linear-gradient(135deg, #0f172a 0%, #3b0764 100%)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '64px',
        }}
        className="hidden md:flex"
      >
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '64px' }}>
          <span style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: '40px', height: '40px', borderRadius: '10px',
            background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)',
          }}>
            <TrendingUp size={20} color="white" />
          </span>
          <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: '16px', fontWeight: 500, fontFamily: "'Space Grotesk Variable', sans-serif" }}>
            Expenses Tracker
          </span>
        </div>

        {/* Headline */}
        <div style={{ marginBottom: '48px' }}>
          <h1 style={{
            fontFamily: "'Space Grotesk Variable', sans-serif",
            fontSize: '48px',
            fontWeight: 700,
            color: 'white',
            lineHeight: 1.15,
            marginBottom: '20px',
          }}>
            Track smarter,<br />not harder.
          </h1>
          <p style={{
            color: 'rgba(255,255,255,0.6)',
            fontSize: '17px',
            lineHeight: 1.6,
            maxWidth: '380px',
          }}>
            AI-powered expense tracking that learns your habits and helps you stay on budget.
          </p>
        </div>

        {/* Features */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {features.map(({ icon: Icon, text }) => (
            <div key={text} style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <span style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: '36px', height: '36px', borderRadius: '8px',
                background: 'rgba(255,255,255,0.1)', flexShrink: 0,
              }}>
                <Icon size={16} color="rgba(255,255,255,0.85)" />
              </span>
              <span style={{ color: 'rgba(255,255,255,0.75)', fontSize: '15px' }}>{text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Gradient blend between panels */}
      <div
        className="hidden md:block"
        style={{
          position: 'absolute',
          top: 0,
          left: 'calc(55% - 180px)',
          width: '180px',
          height: '100%',
          background: 'linear-gradient(to right, rgba(76,29,149,0) 0%, rgba(139,92,246,0.35) 30%, rgba(167,139,250,0.65) 60%, rgba(221,214,254,0.92) 82%, #faf5ff 100%)',
          pointerEvents: 'none',
          zIndex: 5,
        }}
      />

      {/* Right panel */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px',
        background: '#faf5ff',
      }}>
        <div style={{ width: '100%', maxWidth: '360px' }}>
          {/* Mobile logo */}
          <div className="md:hidden" style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
              <span style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: '36px', height: '36px', borderRadius: '8px',
                background: '#4c1d95',
              }}>
                <TrendingUp size={18} color="white" />
              </span>
              <span style={{ fontSize: '16px', fontWeight: 600 }}>Expenses Tracker</span>
            </div>
          </div>

          <Card style={{ boxShadow: '0 20px 60px rgba(76, 29, 149, 0.12), 0 4px 20px rgba(0,0,0,0.06)' }}>
            <CardHeader className="pb-4">
              <CardTitle className="text-xl">Sign in</CardTitle>
            </CardHeader>
            <CardContent>
              <LoginForm />
            </CardContent>
          </Card>
        </div>
      </div>

    </div>
  )
}
