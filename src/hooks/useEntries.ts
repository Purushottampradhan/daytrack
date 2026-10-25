import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
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
      if (!isSupabaseConfigured) {
        let entries = localStore.getEntries(userId)
        if (fromDate) entries = entries.filter((e) => e.log_date >= fromDate)
        if (toDate) entries = entries.filter((e) => e.log_date <= toDate)
        return entries
      }
      let q = supabase.from('entries').select('*').eq('user_id', userId)
      if (fromDate) q = q.gte('log_date', fromDate)
      if (toDate) q = q.lte('log_date', toDate)
      const { data, error } = await q
      if (error) throw error
      return (data ?? []) as Entry[]
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
      const existing = (!isSupabaseConfigured
        ? localStore.getEntries(userId)
        : []
      ).find((e) => e.trackable_id === input.trackable_id && e.log_date === input.log_date)

      if (input.status === 'skipped' && input.useGrace && profile && profile.streak_freezes_remaining > 0) {
        const updated = { ...profile, streak_freezes_remaining: profile.streak_freezes_remaining - 1 }
        if (!isSupabaseConfigured) localStore.saveProfile(updated)
        else await supabase.from('profiles').update({ streak_freezes_remaining: updated.streak_freezes_remaining }).eq('id', userId)
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

      if (!isSupabaseConfigured) {
        localStore.saveEntry(entry)
        return entry
      }

      const { data, error } = await supabase
        .from('entries')
        .upsert(entry, { onConflict: 'trackable_id,log_date' })
        .select()
        .single()
      if (error) throw error
      return data as Entry
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
