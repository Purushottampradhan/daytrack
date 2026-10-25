import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api, isApiConfigured } from '@/lib/api'
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
      if (!isApiConfigured) {
        const all = localStore.getTrackables(userId)
        return includeArchived ? all : all.filter((t) => !t.archived)
      }
      const q = includeArchived ? '?include_archived=true' : ''
      return api<Trackable[]>(`/api/trackables${q}`)
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
      if (!isApiConfigured) {
        const trackable: Trackable = {
          ...input,
          id: generateId(),
          user_id: userId,
          created_at: new Date().toISOString(),
        }
        localStore.saveTrackable(trackable)
        return trackable
      }
      return api<Trackable>('/api/trackables', {
        method: 'POST',
        body: JSON.stringify(input),
      })
    },
    onSuccess: invalidate,
  })

  const update = useMutation({
    mutationFn: async (trackable: Partial<Trackable> & { id: string }) => {
      if (!isApiConfigured) {
        const existing = localStore.getTrackables(userId).find((t) => t.id === trackable.id)
        if (!existing) throw new Error('Not found')
        const updated = { ...existing, ...trackable }
        localStore.saveTrackable(updated)
        return updated
      }
      const { id, ...rest } = trackable
      return api<Trackable>(`/api/trackables/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(rest),
      })
    },
    onSuccess: invalidate,
  })

  const remove = useMutation({
    mutationFn: async (id: string) => {
      if (!isApiConfigured) {
        localStore.deleteTrackable(id)
        return
      }
      await api(`/api/trackables/${id}`, { method: 'DELETE' })
    },
    onSuccess: invalidate,
  })

  const reorder = useMutation({
    mutationFn: async (ordered: { id: string; sort_order: number }[]) => {
      if (!isApiConfigured) {
        for (const item of ordered) {
          const t = localStore.getTrackables(userId).find((x) => x.id === item.id)
          if (t) localStore.saveTrackable({ ...t, sort_order: item.sort_order })
        }
        return
      }
      await api('/api/trackables/reorder', {
        method: 'POST',
        body: JSON.stringify({ items: ordered }),
      })
    },
    onSuccess: invalidate,
  })

  return { create, update, remove, reorder }
}
