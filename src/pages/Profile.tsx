import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { PageShell } from '@/components/layout/PageShell'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { useProfile, useUpdateProfile } from '@/hooks/useProfile'
import { useTheme } from '@/providers/ThemeProvider'
import { useAuth } from '@/providers/AuthProvider'

const schema = z.object({
  display_name: z.string().min(1, 'Enter your name'),
})

type FormValues = z.infer<typeof schema>

type ThemeOption = 'light' | 'dark' | 'system'

const themeOptions: { value: ThemeOption; label: string }[] = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'system', label: 'System' },
]

export default function Profile() {
  const { session } = useAuth()
  const { data: profile } = useProfile()
  const updateProfile = useUpdateProfile()
  const { theme, setTheme } = useTheme()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { display_name: '' },
  })

  useEffect(() => {
    if (profile) {
      reset({ display_name: profile.display_name ?? '' })
    }
  }, [profile, reset])

  async function onSubmit(values: FormValues) {
    await updateProfile.mutateAsync({ display_name: values.display_name })
    reset(values)
  }

  return (
    <PageShell>
      <div className="flex flex-col gap-8 max-w-md">
        <h1 className="text-2xl font-semibold">Profile</h1>

        <section className="flex flex-col gap-4">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            Account
          </h2>
          <div className="rounded-lg border border-border bg-card p-5 flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label>Email</Label>
              <p className="text-sm text-muted-foreground">{session?.user.email}</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="display_name">Display name</Label>
                <Input id="display_name" placeholder="Your name" {...register('display_name')} />
                {errors.display_name && (
                  <p className="text-sm text-destructive">{errors.display_name.message}</p>
                )}
              </div>
              <div className="flex justify-end">
                <Button type="submit" disabled={isSubmitting || !isDirty}>
                  Save
                </Button>
              </div>
            </form>
          </div>
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            Appearance
          </h2>
          <div className="rounded-lg border border-border bg-card p-5">
            <div className="flex gap-2">
              {themeOptions.map((opt) => (
                <Button
                  key={opt.value}
                  variant={theme === opt.value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTheme(opt.value)}
                >
                  {opt.label}
                </Button>
              ))}
            </div>
          </div>
        </section>
      </div>
    </PageShell>
  )
}
