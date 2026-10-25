import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { trackableSchema, type TrackableForm } from '@/lib/validators'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input, Label, Textarea } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CATEGORIES, HABIT_COLORS, HABIT_GROUPS, HABIT_ICONS } from '@/types'
import type { Schedule, Trackable } from '@/types'
import { Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TrackableFormDialogProps {
  trackable?: Trackable
  onSubmit: (data: TrackableForm) => void
  trigger?: React.ReactNode
}

const defaultValues: TrackableForm = {
  type: 'habit',
  title: '',
  description: '',
  category: 'Personal',
  group_name: 'General',
  color: HABIT_COLORS[0],
  icon: HABIT_ICONS[0],
  schedule: { type: 'daily' },
  target_per_period: null,
  starts_at: null,
  ends_at: null,
  reminder_time: null,
}

const SCHEDULE_OPTIONS = [
  { value: 'daily', label: 'Every day' },
  { value: 'weekly', label: 'Specific weekdays' },
  { value: 'times_per_week', label: 'X times per week' },
  { value: 'every_other_day', label: 'Every other day' },
] as const

const WEEKDAYS = [
  { value: 0, label: 'Sun' },
  { value: 1, label: 'Mon' },
  { value: 2, label: 'Tue' },
  { value: 3, label: 'Wed' },
  { value: 4, label: 'Thu' },
  { value: 5, label: 'Fri' },
  { value: 6, label: 'Sat' },
]

function normalizeSchedule(schedule: Schedule | undefined): TrackableForm['schedule'] {
  if (!schedule?.type) return { type: 'daily' }
  if (schedule.type === 'weekly') {
    return { type: 'weekly', days: schedule.days?.length ? schedule.days : [1, 2, 3, 4, 5] }
  }
  if (schedule.type === 'times_per_week') {
    return { type: 'times_per_week', count: schedule.count ?? 3 }
  }
  if (schedule.type === 'every_other_day') return { type: 'every_other_day' }
  if (schedule.type === 'none') return { type: 'none' }
  return { type: 'daily' }
}

function toFormValues(trackable?: Trackable): TrackableForm {
  if (!trackable) return defaultValues
  return {
    type: trackable.type,
    title: trackable.title,
    description: trackable.description ?? '',
    category: trackable.category,
    group_name: trackable.group_name,
    color: trackable.color,
    icon: trackable.icon,
    schedule: normalizeSchedule(trackable.schedule),
    target_per_period: trackable.target_per_period,
    starts_at: trackable.starts_at,
    ends_at: trackable.ends_at,
    reminder_time: trackable.reminder_time,
  }
}

export function TrackableFormDialog({ trackable, onSubmit, trigger }: TrackableFormDialogProps) {
  const [open, setOpen] = useState(false)
  const form = useForm<TrackableForm>({
    resolver: zodResolver(trackableSchema),
    defaultValues: toFormValues(trackable),
  })

  useEffect(() => {
    if (open) {
      form.reset(toFormValues(trackable))
    }
  }, [open, trackable, form])

  const type = form.watch('type')
  const schedule = form.watch('schedule')
  const scheduleType = schedule?.type ?? 'daily'

  const handleScheduleChange = (value: string) => {
    switch (value) {
      case 'weekly':
        form.setValue('schedule', { type: 'weekly', days: [1, 2, 3, 4, 5] })
        break
      case 'times_per_week':
        form.setValue('schedule', { type: 'times_per_week', count: 3 })
        break
      case 'every_other_day':
        form.setValue('schedule', { type: 'every_other_day' })
        break
      default:
        form.setValue('schedule', { type: 'daily' })
    }
  }

  const toggleWeekday = (day: number) => {
    if (schedule.type !== 'weekly') return
    const days = schedule.days ?? []
    const next = days.includes(day) ? days.filter((d) => d !== day) : [...days, day].sort()
    form.setValue('schedule', { type: 'weekly', days: next.length > 0 ? next : [day] })
  }

  const handleSubmit = form.handleSubmit((data) => {
    onSubmit(data)
    setOpen(false)
    if (!trackable) form.reset(defaultValues)
  })

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button>
            <Plus className="h-4 w-4" />
            Add New
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{trackable ? 'Edit' : 'Create'} {type === 'habit' ? 'Habit' : 'Event'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
          <Tabs value={type} onValueChange={(v) => form.setValue('type', v as 'habit' | 'event')}>
            <TabsList className="w-full">
              <TabsTrigger value="habit" className="flex-1">Habit</TabsTrigger>
              <TabsTrigger value="event" className="flex-1">Event</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="space-y-2">
            <Label>Title</Label>
            <Input {...form.register('title')} placeholder="Morning run" />
            {form.formState.errors.title && (
              <p className="text-xs text-destructive">{form.formState.errors.title.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Group</Label>
              <Select value={form.watch('group_name')} onValueChange={(v) => form.setValue('group_name', v)}>
                <SelectTrigger><SelectValue placeholder="Select group" /></SelectTrigger>
                <SelectContent>
                  {HABIT_GROUPS.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={form.watch('category')} onValueChange={(v) => form.setValue('category', v)}>
                <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Icon</Label>
              <div className="grid grid-cols-5 gap-1">
                {HABIT_ICONS.map((icon) => (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => form.setValue('icon', icon)}
                    className={cn(
                      'rounded-lg p-1.5 text-base',
                      form.watch('icon') === icon ? 'bg-primary/20 ring-2 ring-primary' : 'bg-muted',
                    )}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Color</Label>
              <div className="grid grid-cols-8 gap-1">
                {HABIT_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => form.setValue('color', color)}
                    className={cn(
                      'h-7 w-7 rounded-full',
                      form.watch('color') === color && 'ring-2 ring-offset-2 ring-primary',
                    )}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </div>

          {type === 'habit' ? (
            <div className="space-y-3">
              <div className="space-y-2">
                <Label>Schedule</Label>
                <Select value={scheduleType} onValueChange={handleScheduleChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select schedule" />
                  </SelectTrigger>
                  <SelectContent>
                    {SCHEDULE_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {scheduleType === 'weekly' && (
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Pick days</Label>
                  <div className="flex flex-wrap gap-1">
                    {WEEKDAYS.map(({ value, label }) => {
                      const selected = schedule.type === 'weekly' && (schedule.days ?? []).includes(value)
                      return (
                        <button
                          key={value}
                          type="button"
                          onClick={() => toggleWeekday(value)}
                          className={cn(
                            'rounded-lg px-2.5 py-1.5 text-xs font-medium',
                            selected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground',
                          )}
                        >
                          {label}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {scheduleType === 'times_per_week' && (
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Times per week</Label>
                  <Input
                    type="number"
                    min={1}
                    max={7}
                    value={schedule.type === 'times_per_week' ? (schedule.count ?? 3) : 3}
                    onChange={(e) => {
                      const count = Math.min(7, Math.max(1, Number(e.target.value) || 1))
                      form.setValue('schedule', { type: 'times_per_week', count })
                    }}
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <Label>Date & Time</Label>
              <Input
                type="datetime-local"
                defaultValue={
                  trackable?.starts_at
                    ? new Date(trackable.starts_at).toISOString().slice(0, 16)
                    : undefined
                }
                onChange={(e) => form.setValue('starts_at', e.target.value ? new Date(e.target.value).toISOString() : null)}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label>Notes (optional)</Label>
            <Textarea {...form.register('description')} placeholder="Any details..." rows={2} />
          </div>

          <Button type="submit" className="w-full">
            {trackable ? 'Save Changes' : 'Create'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
