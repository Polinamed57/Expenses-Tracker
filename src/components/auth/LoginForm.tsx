import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Minimum 6 characters'),
})

type FormValues = z.infer<typeof schema>

export function LoginForm() {
  const navigate = useNavigate()
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  async function onSubmit(values: FormValues) {
    setServerError(null)
    const { error } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password,
    })
    if (error) {
      setServerError('Invalid email or password')
      return
    }
    navigate('/')
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          {...register('email')}
        />
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="••••••••"
          autoComplete="current-password"
          {...register('password')}
        />
        {errors.password && (
          <p className="text-sm text-destructive">{errors.password.message}</p>
        )}
      </div>

      {serverError && (
        <p className="text-sm text-destructive">{serverError}</p>
      )}

      <Button
        type="submit"
        disabled={isSubmitting}
        className="login-btn w-full"
        style={{
          background: 'linear-gradient(180deg, #a855f7 0%, #7c3aed 100%)',
          border: 'none',
          height: '44px',
          fontSize: '15px',
          fontWeight: 600,
          boxShadow: '0 5px 0px #5b21b6, 0 10px 25px rgba(124, 58, 237, 0.35)',
          transition: 'transform 0.1s ease, box-shadow 0.1s ease',
        }}
        onMouseDown={(e) => {
          e.currentTarget.style.transform = 'translateY(4px)'
          e.currentTarget.style.boxShadow = '0 1px 0px #5b21b6, 0 4px 12px rgba(124, 58, 237, 0.25)'
        }}
        onMouseUp={(e) => {
          e.currentTarget.style.transform = 'translateY(0)'
          e.currentTarget.style.boxShadow = '0 5px 0px #5b21b6, 0 10px 25px rgba(124, 58, 237, 0.35)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)'
          e.currentTarget.style.boxShadow = '0 5px 0px #5b21b6, 0 10px 25px rgba(124, 58, 237, 0.35)'
        }}
      >
        {isSubmitting ? 'Signing in...' : 'Sign in'}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        No account?{' '}
        <Link to="/register" className="text-foreground underline underline-offset-4">
          Sign up
        </Link>
      </p>
    </form>
  )
}
