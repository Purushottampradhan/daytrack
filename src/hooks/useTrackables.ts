import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { localStore, generateId } from '@/lib/localStore'
import { getUserId, useAuth } from '@/contexts/AuthContext'
import type { Trackable } from '@/types'

export function useTrackables(includeArchived = false) {
  const { user } = useAuth()
  const userId = getUserId(user)

  return useQuery({
    queryKey: ['trackables', userId, includeArchived],
    enabled: !!userId,
    queryFn: async () => {
      if (!userId) return []
      if (!isSupabaseConfigured) {
        const all = localStore.getTrackables(userId)
        return includeArchived ? all : all.filter((t) => !t.archived)
      }
      let q = supabase.from('trackables').select('*').eq('user_id', userId).order('sort_order')
      if (!includeArchived) q = q.eq('archived', false)
      const { data, error } = await q
      if (error) throw error
      return (data ?? []) as Trackable[]
    },
  })
}

export function useTrackableMutations() {
  const { user } = useAuth()
  const userId = getUserId(user)!
  const qc = useQueryClient()

  const invalidate = () => qc.invalidateQueries({ queryKey: ['trackables'] })

  const create = useMutation({
    mutationFn: async (input: Omit<Trackable, 'id' | 'user_id' | 'created_at'>) => {
      const trackable: Trackable = {
        ...input,
        id: generateId(),
        user_id: userId,
        created_at: new Date().toISOString(),
      }
      if (!isSupabaseConfigured) {
        localStore.saveTrackable(trackable)
        return trackable
      }
      const { data, error } = await supabase.from('trackables').insert(trackable).select().single()
      if (error) throw error
      return data as Trackable
    },
    onSuccess: invalidate,
  })

  const update = useMutation({
    mutationFn: async (trackable: Partial<Trackable> & { id: string }) => {
      if (!isSupabaseConfigured) {
        const existing = localStore.getTrackables(userId).find((t) => t.id === trackable.id)
        if (!existing) throw new Error('Not found')
        const updated = { ...existing, ...trackable }
        localStore.saveTrackable(updated)
        return updated
      }
      const { data, error } = await supabase.from('trackables').update(trackable).eq('id', trackable.id).select().single()
      if (error) throw error
      return data as Trackable
    },
    onSuccess: invalidate,
  })

  const remove = useMutation({
    mutationFn: async (id: string) => {
      if (!isSupabaseConfigured) {
        localStore.deleteTrackable(id)
        return
      }
      const { error } = await supabase.from('trackables').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: invalidate,
  })

  const reorder = useMutation({
    mutationFn: async (ordered: { id: string; sort_order: number }[]) => {
      for (const item of ordered) {
        if (!isSupabaseConfigured) {
          const t = localStore.getTrackables(userId).find((x) => x.id === item.id)
          if (t) localStore.saveTrackable({ ...t, sort_order: item.sort_order })
        } else {
          await supabase.from('trackables').update({ sort_order: item.sort_order }).eq('id', item.id)
        }
      }
    },
    onSuccess: invalidate,
  })

  return { create, update, remove, reorder }
}
