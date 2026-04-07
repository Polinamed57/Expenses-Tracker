import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { RegisterForm } from '@/components/auth/RegisterForm'

export default function Register() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Expenses Tracker</h1>
        </div>
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-xl">Create account</CardTitle>
            <CardDescription>Sign up to get started</CardDescription>
          </CardHeader>
          <CardContent>
            <RegisterForm />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
