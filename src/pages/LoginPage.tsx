import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema, type LoginForm } from '@/lib/validators'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input, Label } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'

export function LoginPage() {
  const { signIn, isDemo } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const form = useForm<LoginForm>({ resolver: zodResolver(loginSchema) })

  const onSubmit = form.handleSubmit(async (data) => {
    setLoading(true)
    const { error } = await signIn(data.email, data.password)
    setLoading(false)
    if (error) toast.error(error)
    else navigate('/today')
  })

  return (
    <div className="flex h-dvh items-center justify-center overflow-hidden p-4 bg-gradient-to-br from-primary/5 via-background to-primary/10">
      <Card className="w-full max-w-md max-h-[calc(100dvh-2rem)] overflow-y-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Welcome back</CardTitle>
          <CardDescription>Sign in to DayTrack</CardDescription>
          {isDemo && (
            <p className="text-xs text-amber-600 bg-amber-500/10 rounded-lg p-2 mt-2">
              Demo mode — any email/password works locally. Set VITE_API_URL to your Render API for cloud sync.
            </p>
          )}
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" placeholder="you@example.com" {...form.register('email')} />
            </div>
            <div className="space-y-2">
              <Label>Password</Label>
              <Input type="password" {...form.register('password')} />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm space-y-2">
            <Link to="/forgot-password" className="text-primary hover:underline block">Forgot password?</Link>
            <p className="text-muted-foreground">
              No account? <Link to="/signup" className="text-primary hover:underline">Sign up</Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
