import { useState, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { subDays } from 'date-fns'
import { ArrowLeft } from 'lucide-react'
import { useTrackables } from '@/hooks/useTrackables'
import { useEntries } from '@/hooks/useEntries'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CalendarGrid } from '@/components/calendar/CalendarGrid'
import { CompletionLineChart, StatCard } from '@/components/dashboard/Charts'
import { calculateStreak, calculateHabitStrength, getCompletionStats, getDateRange } from '@/lib/analytics'
import { formatDateKey } from '@/lib/utils'

export function HabitDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [month, setMonth] = useState(new Date())

  const { data: trackables = [] } = useTrackables(true)
  const habit = trackables.find((t) => t.id === id)

  const fromDate = formatDateKey(subDays(new Date(), 90))
  const toDate = formatDateKey(new Date())
  const { data: allEntries = [] } = useEntries(fromDate, toDate)

  const habitEntries = useMemo(
    () => allEntries.filter((e) => e.trackable_id === id),
    [allEntries, id],
  )

  const streak = useMemo(
    () => (id ? calculateStreak(allEntries, id) : { current: 0, best: 0 }),
    [allEntries, id],
  )

  const strength = useMemo(
    () => (id ? calculateHabitStrength(allEntries, id) : 0),
    [allEntries, id],
  )

  const range = getDateRange('month')
  const stats = useMemo(
    () => getCompletionStats(habitEntries, range),
    [habitEntries, range],
  )

  if (!habit) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Habit not found</p>
        <Link to="/events"><Button variant="link">Back to My Stuff</Button></Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/events">
          <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <span className="text-3xl">{habit.icon}</span>
        <div>
          <h1 className="text-2xl font-bold">{habit.title}</h1>
          <div className="flex gap-2 mt-1">
            <Badge>{habit.group_name}</Badge>
            <Badge variant="outline">{habit.schedule.type}</Badge>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard title="Current Streak" value={`${streak.current} 🔥`} />
        <StatCard title="Best Streak" value={streak.best} />
        <StatCard title="Habit Strength" value={`${strength}%`} subtitle="Resilient score" />
        <StatCard title="This Month" value={`${stats.completionRate}%`} subtitle="Completion rate" />
      </div>

      <CompletionLineChart data={stats.dailyRates} />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Calendar</CardTitle>
        </CardHeader>
        <CardContent>
          <CalendarGrid
            month={month}
            onMonthChange={setMonth}
            entries={habitEntries}
            onDayClick={() => {}}
          />
        </CardContent>
      </Card>

      {habit.description && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">{habit.description}</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
