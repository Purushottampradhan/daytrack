import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { localStore, type LocalSession } from '@/lib/localStore'
import type { Profile } from '@/types'

interface AuthContextValue {
  user: User | LocalSession | null
  session: Session | null
  profile: Profile | null
  loading: boolean
  isDemo: boolean
  signUp: (email: string, password: string, displayName: string) => Promise<{ error: string | null }>
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<{ error: string | null }>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | LocalSession | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const isDemo = !isSupabaseConfigured

  const loadProfile = async (userId: string) => {
    if (isDemo) {
      setProfile(localStore.getProfile(userId))
      return
    }
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single()
    if (data) setProfile(data as Profile)
  }

  useEffect(() => {
    if (isDemo) {
      const local = localStore.getSession()
      setUser(local)
      if (local) loadProfile(local.id)
      setLoading(false)
      return
    }

    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s)
      setUser(s?.user ?? null)
      if (s?.user) loadProfile(s.user.id)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s)
      setUser(s?.user ?? null)
      if (s?.user) loadProfile(s.user.id)
      else setProfile(null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signUp = async (email: string, password: string, displayName: string) => {
    if (isDemo) {
      const id = crypto.randomUUID()
      localStore.setSession({ id, email })
      localStore.saveProfile({
        id,
        display_name: displayName,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        day_boundary_hour: 0,
        streak_freezes_remaining: 2,
        week_starts_on: 'monday',
        confetti_enabled: true,
        theme: 'system',
        created_at: new Date().toISOString(),
      })
      setUser({ id, email })
      setProfile(localStore.getProfile(id))
      return { error: null }
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: displayName } },
    })
    return { error: error?.message ?? null }
  }

  const signIn = async (email: string, password: string) => {
    if (isDemo) {
      const existing = localStore.getSession()
      if (existing?.email === email) {
        setUser(existing)
        setProfile(localStore.getProfile(existing.id))
        return { error: null }
      }
      const id = crypto.randomUUID()
      const session = { id, email }
      localStore.setSession(session)
      localStore.saveProfile(localStore.getProfile(id))
      setUser(session)
      setProfile(localStore.getProfile(id))
      return { error: null }
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error: error?.message ?? null }
  }

  const signOut = async () => {
    if (isDemo) {
      localStore.setSession(null)
      setUser(null)
      setProfile(null)
      return
    }
    await supabase.auth.signOut()
  }

  const resetPassword = async (email: string) => {
    if (isDemo) return { error: null }
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${import.meta.env.VITE_SITE_URL}/reset-password`,
    })
    return { error: error?.message ?? null }
  }

  const refreshProfile = async () => {
    const id = user && 'id' in user ? user.id : null
    if (id) await loadProfile(id)
  }

  return (
    <AuthContext.Provider
      value={{ user, session, profile, loading, isDemo, signUp, signIn, signOut, resetPassword, refreshProfile }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

export function getUserId(user: User | LocalSession | null): string | null {
  if (!user) return null
  return user.id
}
