import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api, isApiConfigured } from '@/lib/api'
import { localStore, generateId } from '@/lib/localStore'
import { getUserId, useAuth } from '@/contexts/AuthContext'
import type { Entry, EntryStatus } from '@/types'

export function useEntries(fromDate?: string, toDate?: string) {
  const { user } = useAuth()
  const userId = getUserId(user)

  return useQuery({
    queryKey: ['entries', userId, fromDate, toDate],
    enabled: !!userId,
    queryFn: async () => {
      if (!userId) return []
      if (!isApiConfigured) {
        let entries = localStore.getEntries(userId)
        if (fromDate) entries = entries.filter((e) => e.log_date >= fromDate)
        if (toDate) entries = entries.filter((e) => e.log_date <= toDate)
        return entries
      }
      const params = new URLSearchParams()
      if (fromDate) params.set('from', fromDate)
      if (toDate) params.set('to', toDate)
      const q = params.toString() ? `?${params}` : ''
      return api<Entry[]>(`/api/entries${q}`)
    },
  })
}

export function useEntryMutations() {
  const { user, profile, refreshProfile } = useAuth()
  const userId = getUserId(user)!
  const qc = useQueryClient()

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['entries'] })
    qc.invalidateQueries({ queryKey: ['analytics'] })
  }

  const upsert = useMutation({
    mutationFn: async (input: {
      trackable_id: string
      log_date: string
      status: EntryStatus
      notes?: string | null
      useGrace?: boolean
    }) => {
      if (!isApiConfigured) {
        const existing = localStore
          .getEntries(userId)
          .find((e) => e.trackable_id === input.trackable_id && e.log_date === input.log_date)

        if (input.status === 'skipped' && input.useGrace && profile && profile.streak_freezes_remaining > 0) {
          const updated = { ...profile, streak_freezes_remaining: profile.streak_freezes_remaining - 1 }
          localStore.saveProfile(updated)
          await refreshProfile()
        }

        const entry: Entry = {
          id: existing?.id ?? generateId(),
          trackable_id: input.trackable_id,
          user_id: userId,
          log_date: input.log_date,
          status: input.status,
          value: null,
          notes: input.notes ?? null,
          created_at: existing?.created_at ?? new Date().toISOString(),
        }
        localStore.saveEntry(entry)
        return entry
      }

      const entry = await api<Entry>('/api/entries/upsert', {
        method: 'POST',
        body: JSON.stringify({
          trackable_id: input.trackable_id,
          log_date: input.log_date,
          status: input.status,
          notes: input.notes ?? null,
          use_grace: Boolean(input.useGrace),
        }),
      })
      if (input.useGrace) await refreshProfile()
      return entry
    },
    onMutate: async (input) => {
      await qc.cancelQueries({ queryKey: ['entries'] })
      const previous = qc.getQueryData<Entry[]>(['entries', userId])
      qc.setQueriesData<Entry[]>({ queryKey: ['entries'] }, (old) => {
        const list = old ?? []
        const filtered = list.filter(
          (e) => !(e.trackable_id === input.trackable_id && e.log_date === input.log_date),
        )
        return [
          ...filtered,
          {
            id: generateId(),
            trackable_id: input.trackable_id,
            user_id: userId,
            log_date: input.log_date,
            status: input.status,
            value: null,
            notes: input.notes ?? null,
            created_at: new Date().toISOString(),
          },
        ]
      })
      return { previous }
    },
    onError: (_err, _input, context) => {
      if (context?.previous) qc.setQueryData(['entries', userId], context.previous)
    },
    onSettled: invalidate,
  })

  return { upsert }
}
