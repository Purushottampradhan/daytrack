import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { localStore, generateId } from '@/lib/localStore'
import { getUserId, useAuth } from '@/contexts/AuthContext'
import type { MoodLog, JournalEntry } from '@/types'

export function useMoodLogs(fromDate?: string, toDate?: string) {
  const { user } = useAuth()
  const userId = getUserId(user)

  return useQuery({
    queryKey: ['moods', userId, fromDate, toDate],
    enabled: !!userId,
    queryFn: async () => {
      if (!userId) return []
      if (!isSupabaseConfigured) {
        let moods = localStore.getMoods(userId)
        if (fromDate) moods = moods.filter((m) => m.log_date >= fromDate)
        if (toDate) moods = moods.filter((m) => m.log_date <= toDate)
        return moods
      }
      let q = supabase.from('mood_logs').select('*').eq('user_id', userId)
      if (fromDate) q = q.gte('log_date', fromDate)
      if (toDate) q = q.lte('log_date', toDate)
      const { data, error } = await q
      if (error) throw error
      return (data ?? []) as MoodLog[]
    },
  })
}

export function useMoodMutations() {
  const { user } = useAuth()
  const userId = getUserId(user)!
  const qc = useQueryClient()

  const upsert = useMutation({
    mutationFn: async (input: { log_date: string; mood_score: number; note?: string }) => {
      const mood: MoodLog = {
        id: generateId(),
        user_id: userId,
        log_date: input.log_date,
        mood_score: input.mood_score,
        note: input.note ?? null,
        created_at: new Date().toISOString(),
      }

      if (!isSupabaseConfigured) {
        localStore.saveMood(mood)
        return mood
      }

      const { data, error } = await supabase
        .from('mood_logs')
        .upsert(mood, { onConflict: 'user_id,log_date' })
        .select()
        .single()
      if (error) throw error
      return data as MoodLog
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['moods'] }),
  })

  return { upsert }
}

export function useJournal() {
  const { user } = useAuth()
  const userId = getUserId(user)
  const qc = useQueryClient()

  const query = useQuery({
    queryKey: ['journal', userId],
    enabled: !!userId,
    queryFn: async () => {
      if (!userId) return []
      if (!isSupabaseConfigured) return localStore.getJournal(userId)
      const { data, error } = await supabase.from('journal_entries').select('*').eq('user_id', userId)
      if (error) throw error
      return data ?? []
    },
  })

  const save = useMutation({
    mutationFn: async (input: { log_date: string; content: string }) => {
      if (!userId) throw new Error('Not authenticated')
      const entry: JournalEntry = {
        id: generateId(),
        user_id: userId,
        log_date: input.log_date,
        content: input.content,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      if (!isSupabaseConfigured) {
        localStore.saveJournal(entry)
        return entry
      }
      const { data, error } = await supabase
        .from('journal_entries')
        .upsert(entry, { onConflict: 'user_id,log_date' })
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['journal'] }),
  })

  return { ...query, save }
}
