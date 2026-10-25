import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { signupSchema, type SignupForm } from '@/lib/validators'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input, Label } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'

export function SignupPage() {
  const { signUp } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const form = useForm<SignupForm>({ resolver: zodResolver(signupSchema) })

  const onSubmit = form.handleSubmit(async (data) => {
    setLoading(true)
    const { error } = await signUp(data.email, data.password, data.displayName)
    setLoading(false)
    if (error) toast.error(error)
    else {
      toast.success('Account created!')
      navigate('/today')
    }
  })

  return (
    <div className="flex h-dvh items-center justify-center overflow-hidden p-4 bg-gradient-to-br from-primary/5 via-background to-primary/10">
      <Card className="w-full max-w-md max-h-[calc(100dvh-2rem)] overflow-y-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Create account</CardTitle>
          <CardDescription>Start tracking your daily progress</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input placeholder="Your name" {...form.register('displayName')} />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" placeholder="you@example.com" {...form.register('email')} />
            </div>
            <div className="space-y-2">
              <Label>Password</Label>
              <Input type="password" {...form.register('password')} />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Creating...' : 'Sign Up'}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Already have an account? <Link to="/login" className="text-primary hover:underline">Sign in</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
