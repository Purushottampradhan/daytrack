import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api, isApiConfigured } from '@/lib/api'
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
      if (!isApiConfigured) {
        let moods = localStore.getMoods(userId)
        if (fromDate) moods = moods.filter((m) => m.log_date >= fromDate)
        if (toDate) moods = moods.filter((m) => m.log_date <= toDate)
        return moods
      }
      const params = new URLSearchParams()
      if (fromDate) params.set('from', fromDate)
      if (toDate) params.set('to', toDate)
      const q = params.toString() ? `?${params}` : ''
      return api<MoodLog[]>(`/api/moods${q}`)
    },
  })
}

export function useMoodMutations() {
  const { user } = useAuth()
  const userId = getUserId(user)!
  const qc = useQueryClient()

  const upsert = useMutation({
    mutationFn: async (input: { log_date: string; mood_score: number; note?: string }) => {
      if (!isApiConfigured) {
        const mood: MoodLog = {
          id: generateId(),
          user_id: userId,
          log_date: input.log_date,
          mood_score: input.mood_score,
          note: input.note ?? null,
          created_at: new Date().toISOString(),
        }
        localStore.saveMood(mood)
        return mood
      }
      return api<MoodLog>('/api/moods/upsert', {
        method: 'POST',
        body: JSON.stringify(input),
      })
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
      if (!isApiConfigured) return localStore.getJournal(userId)
      return api<JournalEntry[]>('/api/journal')
    },
  })

  const save = useMutation({
    mutationFn: async (input: { log_date: string; content: string }) => {
      if (!userId) throw new Error('Not authenticated')
      if (!isApiConfigured) {
        const entry: JournalEntry = {
          id: generateId(),
          user_id: userId,
          log_date: input.log_date,
          content: input.content,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
        localStore.saveJournal(entry)
        return entry
      }
      return api<JournalEntry>('/api/journal/upsert', {
        method: 'POST',
        body: JSON.stringify(input),
      })
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['journal'] }),
  })

  return { ...query, save }
}
