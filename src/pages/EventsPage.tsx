import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import { Archive, Pencil, Search, Trash2 } from 'lucide-react'
import { useTrackables, useTrackableMutations } from '@/hooks/useTrackables'
import { TrackableFormDialog } from '@/components/events/TrackableFormDialog'
import { SortableTrackableList } from '@/components/habits/SortableList'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { TrackableForm } from '@/lib/validators'
import type { Trackable } from '@/types'
import { toast } from 'sonner'

function HabitActions({
  trackable,
  onUpdate,
  onArchive,
  onDelete,
}: {
  trackable: Trackable
  onUpdate: (data: TrackableForm) => void
  onArchive: () => void
  onDelete: () => void
}) {
  return (
    <div className="flex shrink-0 items-center gap-0">
      <TrackableFormDialog
        trackable={trackable}
        onSubmit={onUpdate}
        trigger={
          <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
            <Pencil className="h-3.5 w-3.5" />
          </Button>
        }
      />
      <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={onArchive}>
        <Archive className="h-3.5 w-3.5" />
      </Button>
      <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={onDelete}>
        <Trash2 className="h-3.5 w-3.5 text-destructive" />
      </Button>
    </div>
  )
}

export function EventsPage() {
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<'all' | 'habit' | 'event'>('all')
  const [showArchived, setShowArchived] = useState(false)

  const { data: trackables = [], isLoading } = useTrackables(showArchived)
  const { create, update, remove, reorder } = useTrackableMutations()

  const filtered = useMemo(() => {
    return trackables
      .filter((t) => typeFilter === 'all' || t.type === typeFilter)
      .filter((t) => showArchived || !t.archived)
      .filter((t) => t.title.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => a.sort_order - b.sort_order)
  }, [trackables, search, typeFilter, showArchived])

  const habits = filtered.filter((t) => t.type === 'habit')
  const events = filtered.filter((t) => t.type === 'event')

  const handleCreate = (data: TrackableForm) => {
    create.mutate({
      ...data,
      sort_order: trackables.length,
      archived: false,
      description: data.description ?? null,
      target_per_period: data.target_per_period ?? null,
      starts_at: data.starts_at ?? null,
      ends_at: data.ends_at ?? null,
      reminder_time: data.reminder_time ?? null,
      schedule: data.schedule as Trackable['schedule'],
    }, {
      onSuccess: () => toast.success('Created!'),
    })
  }

  const handleUpdate = (id: string, data: TrackableForm) => {
    update.mutate({ id, ...data, description: data.description ?? null, schedule: data.schedule as Trackable['schedule'] }, {
      onSuccess: () => toast.success('Updated!'),
    })
  }

  const handleReorder = (ids: string[]) => {
    reorder.mutate(ids.map((id, i) => ({ id, sort_order: i })))
  }

  return (
    <div className="min-w-0 w-full max-w-full space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold">My Stuff</h1>
          <p className="text-sm text-muted-foreground">Habits & events</p>
        </div>
        <TrackableFormDialog onSubmit={handleCreate} />
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_auto_auto] sm:items-center">
        <div className="relative min-w-0 w-full">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9"
          />
        </div>
        <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as typeof typeFilter)}>
          <SelectTrigger className="w-full sm:w-28"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="habit">Habits</SelectItem>
            <SelectItem value="event">Events</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="sm" className="w-full sm:w-auto" onClick={() => setShowArchived(!showArchived)}>
          <Archive className="mr-1 h-4 w-4 shrink-0" />
          <span className="truncate">{showArchived ? 'Hide archived' : 'Archived'}</span>
        </Button>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : (
        <>
          {habits.length > 0 && (
            <section className="min-w-0">
              <h2 className="mb-3 text-base font-semibold sm:text-lg">Habits ({habits.length})</h2>
              <SortableTrackableList
                trackables={habits}
                onReorder={handleReorder}
                renderItem={(t) => (
                  <Card className="min-w-0 overflow-hidden">
                    <CardContent className="p-2 sm:p-3">
                      <div className="flex min-w-0 items-center gap-2">
                        <span className="shrink-0 text-lg sm:text-xl">{t.icon}</span>
                        <div className="min-w-0 flex-1">
                          <Link
                            to={`/habits/${t.id}`}
                            className="block truncate text-sm font-medium hover:text-primary sm:text-base"
                          >
                            {t.title}
                          </Link>
                          <div className="mt-1 flex flex-wrap gap-1">
                            <Badge variant="secondary" className="max-w-[100px] truncate text-[10px] sm:max-w-none sm:text-xs">
                              {t.group_name}
                            </Badge>
                            <Badge variant="outline" className="text-[10px] sm:text-xs">
                              {t.schedule.type.replace('_', ' ')}
                            </Badge>
                          </div>
                        </div>
                        <HabitActions
                          trackable={t}
                          onUpdate={(data) => handleUpdate(t.id, data)}
                          onArchive={() => update.mutate({ id: t.id, archived: !t.archived })}
                          onDelete={() => remove.mutate(t.id)}
                        />
                      </div>
                    </CardContent>
                  </Card>
                )}
              />
            </section>
          )}

          {events.length > 0 && (
            <section className="min-w-0">
              <h2 className="mb-3 text-base font-semibold sm:text-lg">Events ({events.length})</h2>
              <div className="space-y-2">
                {events.map((t) => (
                  <Card key={t.id} className="min-w-0 overflow-hidden">
                    <CardContent className="flex min-w-0 items-center gap-2 p-2 sm:gap-3 sm:p-3">
                      <span className="shrink-0 text-lg sm:text-xl">{t.icon}</span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium sm:text-base">{t.title}</p>
                        <p className="truncate text-xs text-muted-foreground sm:text-sm">
                          {t.starts_at && format(new Date(t.starts_at), 'MMM d, yyyy h:mm a')}
                        </p>
                      </div>
                      <div className="flex shrink-0 gap-0">
                        <TrackableFormDialog
                          trackable={t}
                          onSubmit={(data) => handleUpdate(t.id, data)}
                          trigger={
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                          }
                        />
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => remove.mutate(t.id)}>
                          <Trash2 className="h-3.5 w-3.5 text-destructive" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          )}

          {filtered.length === 0 && (
            <p className="py-12 text-center text-sm text-muted-foreground">
              No items yet. Tap &quot;Add New&quot; to create your first habit or event.
            </p>
          )}
        </>
      )}
    </div>
  )
}
