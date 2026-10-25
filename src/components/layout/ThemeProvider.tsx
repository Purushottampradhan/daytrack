import { useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { localStore } from '@/lib/localStore'
import { getUserId } from '@/contexts/AuthContext'
import type { ProfileForm } from '@/lib/validators'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { profile } = useAuth()

  useEffect(() => {
    const root = document.documentElement
    root.classList.remove('dark', 'theme-ocean', 'theme-sunset', 'light')

    const theme = profile?.theme ?? 'system'
    if (theme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      root.classList.toggle('dark', prefersDark)
    } else if (theme === 'dark') {
      root.classList.add('dark')
    } else if (theme === 'light') {
      root.classList.add('light')
    } else if (theme === 'ocean') {
      root.classList.add('dark', 'theme-ocean')
    } else if (theme === 'sunset') {
      root.classList.add('dark', 'theme-sunset')
    }
  }, [profile?.theme])

  return <>{children}</>
}

export async function saveProfile(userId: string, data: ProfileForm) {
  if (!isSupabaseConfigured) {
    const existing = localStore.getProfile(userId)
    localStore.saveProfile({ ...existing, ...data, id: userId })
    return
  }
  await supabase.from('profiles').update(data).eq('id', userId)
}

export function useProfileSave() {
  const { user, refreshProfile } = useAuth()
  const userId = getUserId(user)

  return async (data: ProfileForm) => {
    if (!userId) return
    await saveProfile(userId, data)
    await refreshProfile()
  }
}
