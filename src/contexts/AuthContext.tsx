import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { api, getToken, isApiConfigured, setToken } from '@/lib/api'
import { localStore, type LocalSession } from '@/lib/localStore'
import type { Profile } from '@/types'

export interface AuthUser {
  id: string
  email: string
}

interface AuthContextValue {
  user: AuthUser | LocalSession | null
  profile: Profile | null
  loading: boolean
  isDemo: boolean
  signUp: (email: string, password: string, displayName: string) => Promise<{ error: string | null }>
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<{ error: string | null }>
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ error: string | null }>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | LocalSession | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const isDemo = !isApiConfigured

  const loadProfile = async (userId: string) => {
    if (isDemo) {
      setProfile(localStore.getProfile(userId))
      return
    }
    const data = await api<Profile>('/api/profiles/me')
    setProfile(data)
  }

  useEffect(() => {
    let cancelled = false

    async function boot() {
      if (isDemo) {
        const local = localStore.getSession()
        setUser(local)
        if (local) await loadProfile(local.id)
        if (!cancelled) setLoading(false)
        return
      }

      const token = getToken()
      if (!token) {
        if (!cancelled) setLoading(false)
        return
      }

      try {
        const me = await api<{ user: AuthUser; profile: Profile }>('/api/auth/me')
        if (cancelled) return
        setUser(me.user)
        setProfile(me.profile)
      } catch {
        setToken(null)
        if (!cancelled) {
          setUser(null)
          setProfile(null)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void boot()
    return () => {
      cancelled = true
    }
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

    try {
      const data = await api<{ token: string; user: AuthUser; profile: Profile }>('/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify({ email, password, display_name: displayName }),
      })
      setToken(data.token)
      setUser(data.user)
      setProfile(data.profile)
      return { error: null }
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Sign up failed' }
    }
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

    try {
      const data = await api<{ token: string; user: AuthUser; profile: Profile }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      })
      setToken(data.token)
      setUser(data.user)
      setProfile(data.profile)
      return { error: null }
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Sign in failed' }
    }
  }

  const signOut = async () => {
    if (isDemo) {
      localStore.setSession(null)
      setUser(null)
      setProfile(null)
      return
    }
    setToken(null)
    setUser(null)
    setProfile(null)
  }

  const resetPassword = async (_email: string) => {
    if (isDemo) return { error: null }
    return {
      error: 'Email reset is not enabled. Sign in and change your password from Settings.',
    }
  }

  const changePassword = async (currentPassword: string, newPassword: string) => {
    if (isDemo) return { error: null }
    try {
      await api('/api/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
        }),
      })
      return { error: null }
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Could not change password' }
    }
  }

  const refreshProfile = async () => {
    const id = user && 'id' in user ? user.id : null
    if (id) await loadProfile(id)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        isDemo,
        signUp,
        signIn,
        signOut,
        resetPassword,
        changePassword,
        refreshProfile,
      }}
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

export function getUserId(user: AuthUser | LocalSession | null): string | null {
  if (!user) return null
  return user.id
}
