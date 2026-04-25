import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '@/lib/queryClient'
import { AuthProvider } from '@/providers/AuthProvider'
import { ThemeProvider } from '@/providers/ThemeProvider'
import { AuthGuard } from '@/components/auth/AuthGuard'

import { Toaster } from 'sonner'
import Login from '@/pages/Login'
import Register from '@/pages/Register'
import Dashboard from '@/pages/Dashboard'
import Profile from '@/pages/Profile'
import Settings from '@/pages/Settings'
import Goals from '@/pages/Goals'
import Category from '@/pages/Category'

export default function App() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route
                path="/"
                element={
                  <AuthGuard>
                    <Dashboard />
                  </AuthGuard>
                }
              />
              <Route
                path="/profile"
                element={
                  <AuthGuard>
                    <Profile />
                  </AuthGuard>
                }
              />
              <Route
                path="/settings"
                element={
                  <AuthGuard>
                    <Settings />
                  </AuthGuard>
                }
              />
              <Route
                path="/goals"
                element={
                  <AuthGuard>
                    <Goals />
                  </AuthGuard>
                }
              />
              <Route
                path="/category/:id"
                element={
                  <AuthGuard>
                    <Category />
                  </AuthGuard>
                }
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            <Toaster position="bottom-right" richColors />
          </BrowserRouter>
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  )
}
