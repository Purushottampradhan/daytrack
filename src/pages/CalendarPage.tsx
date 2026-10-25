import { useState, useMemo } from 'react'
import { format } from 'date-fns'
import { useTrackables } from '@/hooks/useTrackables'
import { useEntries, useEntryMutations } from '@/hooks/useEntries'
import { useMoodLogs } from '@/hooks/useMood'
import { CalendarGrid } from '@/components/calendar/CalendarGrid'
import { HabitCard } from '@/components/habits/HabitCard'
import { MoodPicker } from '@/components/mood/MoodPicker'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { getHabitsForDate, getEventsForDate } from '@/lib/analytics'
import { formatDateKey } from '@/lib/utils'
import type { EntryStatus } from '@/types'
import { useMoodMutations } from '@/hooks/useMood'
import { MOOD_EMOJIS } from '@/types'

export function CalendarPage() {
  const [month, setMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const monthStart = formatDateKey(new Date(month.getFullYear(), month.getMonth(), 1))
  const monthEnd = formatDateKey(new Date(month.getFullYear(), month.getMonth() + 1, 0))

  const { data: trackables = [] } = useTrackables()
  const { data: entries = [] } = useEntries(monthStart, monthEnd)
  const { upsert: upsertEntry } = useEntryMutations()
  const { data: moods = [] } = useMoodLogs()
  const { upsert: upsertMood } = useMoodMutations()

  const handleDayClick = (date: Date) => {
    setSelectedDate(date)
    setDialogOpen(true)
  }

  const dayDetails = useMemo(() => {
    if (!selectedDate) return null
    const key = formatDateKey(selectedDate)
    return {
      habits: getHabitsForDate(trackables, selectedDate),
      events: getEventsForDate(trackables, selectedDate),
      dayEntries: entries.filter((e) => e.log_date === key),
      mood: moods.find((m) => m.log_date === key),
      key,
    }
  }, [selectedDate, trackables, entries, moods])

  const handleStatusChange = (trackableId: string, status: EntryStatus) => {
    if (!dayDetails) return
    upsertEntry.mutate({
      trackable_id: trackableId,
      log_date: dayDetails.key,
      status,
      useGrace: status === 'skipped',
    })
  }

  return (
    <div className="space-y-4 sm:space-y-6 overflow-x-hidden">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold">Calendar</h1>
        <p className="text-muted-foreground">Tap a day to view or log habits</p>
      </div>

      <CalendarGrid
        month={month}
        onMonthChange={setMonth}
        entries={entries}
        onDayClick={handleDayClick}
        selectedDate={selectedDate ?? undefined}
      />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedDate && format(selectedDate, 'EEEE, MMMM d, yyyy')}
            </DialogTitle>
          </DialogHeader>
          {dayDetails && (
            <div className="space-y-4">
              {dayDetails.mood && (
                <p className="text-sm">
                  Mood: {MOOD_EMOJIS[dayDetails.mood.mood_score - 1]} ({dayDetails.mood.mood_score}/5)
                </p>
              )}
              <MoodPicker
                compact
                value={dayDetails.mood?.mood_score}
                onChange={(score) => upsertMood.mutate({ log_date: dayDetails.key, mood_score: score })}
              />
              <div className="space-y-2">
                {dayDetails.habits.map((h) => {
                  const entry = dayDetails.dayEntries.find((e) => e.trackable_id === h.id)
                  return (
                    <HabitCard
                      key={h.id}
                      id={h.id}
                      title={h.title}
                      icon={h.icon}
                      color={h.color}
                      status={entry?.status}
                      onStatusChange={(s) => handleStatusChange(h.id, s)}
                      compact
                    />
                  )
                })}
              </div>
              {dayDetails.events.length > 0 && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Events</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-1">
                    {dayDetails.events.map((e) => (
                      <p key={e.id} className="text-sm">{e.icon} {e.title}</p>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
