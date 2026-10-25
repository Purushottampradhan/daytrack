import { useMemo } from 'react'
import { format } from 'date-fns'
import confetti from 'canvas-confetti'
import { useAuth } from '@/contexts/AuthContext'
import { useTrackables } from '@/hooks/useTrackables'
import { useEntries, useEntryMutations } from '@/hooks/useEntries'
import { useMoodLogs, useMoodMutations } from '@/hooks/useMood'
import { HabitCard } from '@/components/habits/HabitCard'
import { MoodPicker } from '@/components/mood/MoodPicker'
import { Progress } from '@/components/ui/progress'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getHabitsForDate, getEventsForDate } from '@/lib/analytics'
import { formatDateKey } from '@/lib/utils'
import type { EntryStatus } from '@/types'
import { Clock } from 'lucide-react'
import { toast } from 'sonner'

export function TodayPage() {
  const { profile } = useAuth()
  const today = new Date()
  const dateKey = formatDateKey(today)

  const { data: trackables = [] } = useTrackables()
  const { data: entries = [] } = useEntries(dateKey, dateKey)
  const { data: moods = [] } = useMoodLogs(dateKey, dateKey)
  const { upsert: upsertEntry } = useEntryMutations()
  const { upsert: upsertMood } = useMoodMutations()

  const habits = useMemo(() => getHabitsForDate(trackables, today), [trackables, today])
  const events = useMemo(() => getEventsForDate(trackables, today), [trackables, today])

  const todayEntries = entries.filter((e) => e.log_date === dateKey)
  const doneCount = todayEntries.filter((e) => e.status === 'done').length
  const progress = habits.length > 0 ? Math.round((doneCount / habits.length) * 100) : 0
  const todayMood = moods.find((m) => m.log_date === dateKey)

  const handleStatusChange = async (trackableId: string, status: EntryStatus) => {
    await upsertEntry.mutateAsync({
      trackable_id: trackableId,
      log_date: dateKey,
      status,
      useGrace: status === 'skipped',
    })

    const newDone = status === 'done' ? doneCount + 1 : doneCount
    if (
      profile?.confetti_enabled &&
      habits.length > 0 &&
      newDone === habits.length &&
      status === 'done'
    ) {
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } })
      toast.success('All habits done! 🎉')
    }
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold">Today</h1>
        <p className="text-muted-foreground">{format(today, 'EEEE, MMMM d')}</p>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Progress</CardTitle>
            <Badge variant="secondary">{doneCount}/{habits.length} habits</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Progress value={progress} className="h-3" />
          <p className="text-sm text-muted-foreground mt-2">{progress}% complete</p>
        </CardContent>
      </Card>

      <section>
        <h2 className="text-lg font-semibold mb-3">Habits</h2>
        {habits.length === 0 ? (
          <p className="text-muted-foreground text-sm">No habits scheduled today. Add some in My Stuff.</p>
        ) : (
          <div className="space-y-2">
            {habits.map((habit) => {
              const entry = todayEntries.find((e) => e.trackable_id === habit.id)
              return (
                <HabitCard
                  key={habit.id}
                  id={habit.id}
                  title={habit.title}
                  icon={habit.icon}
                  color={habit.color}
                  status={entry?.status}
                  onStatusChange={(s) => handleStatusChange(habit.id, s)}
                />
              )
            })}
          </div>
        )}
      </section>

      {events.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold mb-3">Events</h2>
          <div className="space-y-2">
            {events.map((event) => (
              <Card key={event.id}>
                <CardContent className="flex items-center gap-3 p-4">
                  <span className="text-xl">{event.icon}</span>
                  <div className="flex-1">
                    <p className="font-medium">{event.title}</p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {event.starts_at && format(new Date(event.starts_at), 'h:mm a')}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      <Card>
        <CardContent className="pt-6">
          <MoodPicker
            value={todayMood?.mood_score}
            onChange={(score) => upsertMood.mutate({ log_date: dateKey, mood_score: score })}
          />
        </CardContent>
      </Card>
    </div>
  )
}
