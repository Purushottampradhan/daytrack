import { useState, useMemo } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useTrackables } from '@/hooks/useTrackables'
import { useEntries } from '@/hooks/useEntries'
import { useMoodLogs } from '@/hooks/useMood'
import { DateRangeFilter } from '@/components/dashboard/DateRangeFilter'
import {
  StatCard,
  CompletionLineChart,
  CategoryBarChart,
  StatusDonutChart,
  ActivityHeatmap,
  YearInPixels,
} from '@/components/dashboard/Charts'
import { ShareProgressCard } from '@/components/dashboard/ShareProgressCard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  getDateRange,
  getCompletionStats,
  getCategoryBreakdown,
  getGroupBreakdown,
  getWeekOverWeekChange,
  getMoodCorrelations,
  getWeeklyReview,
  getHeatmapData,
  getYearInPixels,
  calculateStreak,
} from '@/lib/analytics'
import { formatDateKey } from '@/lib/utils'
import type { DateRange } from '@/types'
import { subDays } from 'date-fns'

export function DashboardPage() {
  const { profile } = useAuth()
  const [range, setRange] = useState<DateRange>(
    getDateRange('week', undefined, undefined, profile?.week_starts_on ?? 'monday'),
  )

  const fromDate = formatDateKey(subDays(new Date(), 365))
  const toDate = formatDateKey(new Date())

  const { data: trackables = [] } = useTrackables()
  const { data: entries = [] } = useEntries(fromDate, toDate)
  const { data: moods = [] } = useMoodLogs(fromDate, toDate)

  const stats = useMemo(() => getCompletionStats(entries, range), [entries, range])
  const categoryData = useMemo(() => getCategoryBreakdown(entries, trackables, range), [entries, trackables, range])
  const groupData = useMemo(() => getGroupBreakdown(entries, trackables, range), [entries, trackables, range])
  const weekChange = useMemo(() => getWeekOverWeekChange(entries), [entries])
  const correlations = useMemo(() => getMoodCorrelations(entries, moods, trackables), [entries, moods, trackables])
  const weeklyReview = useMemo(() => getWeeklyReview(entries, trackables, range), [entries, trackables, range])
  const heatmap = useMemo(() => getHeatmapData(entries), [entries])
  const yearPixels = useMemo(() => getYearInPixels(moods), [moods])

  const habits = trackables.filter((t) => t.type === 'habit' && !t.archived)
  const bestStreak = habits.reduce((max, h) => {
    const s = calculateStreak(entries, h.id)
    return Math.max(max, s.current)
  }, 0)

  return (
    <div className="min-w-0 w-full max-w-full space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Your progress at a glance</p>
      </div>

      <DateRangeFilter
        value={range}
        onChange={setRange}
        weekStartsOn={profile?.week_starts_on ?? 'monday'}
      />

      <div className="grid min-w-0 grid-cols-2 gap-2 sm:gap-3 md:grid-cols-4">
        <StatCard title="Completion Rate" value={`${stats.completionRate}%`} />
        <StatCard title="Best Streak" value={`${bestStreak} 🔥`} />
        <StatCard
          title="Grace Days Left"
          value={profile?.streak_freezes_remaining ?? 2}
          subtitle="This month"
        />
        <StatCard
          title="Week vs Last"
          value={`${weekChange >= 0 ? '+' : ''}${weekChange}%`}
          subtitle="Completions change"
        />
      </div>

      {weekChange !== 0 && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="pt-6">
            <p className="text-sm">
              {weekChange > 0
                ? `You're ${weekChange}% more consistent this week vs last week. Keep it up!`
                : `You're ${Math.abs(weekChange)}% less active this week. One habit tomorrow is a great start.`}
            </p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Weekly Review</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm">{weeklyReview.message}</p>
          <div className="mt-2 flex flex-col gap-1 text-sm text-muted-foreground sm:flex-row sm:gap-4">
            <span>{weeklyReview.totalDone} completed</span>
            {weeklyReview.bestHabit && (
              <span className="truncate">Top: {weeklyReview.bestHabit.title} ({weeklyReview.bestHabit.count}×)</span>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid min-w-0 grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2">
        <CompletionLineChart data={stats.dailyRates} />
        <StatusDonutChart done={stats.done} skipped={stats.skipped} missed={stats.missed} />
      </div>

      <div className="grid min-w-0 grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2">
        <CategoryBarChart data={categoryData.length > 0 ? categoryData : groupData} />
        <ActivityHeatmap data={heatmap} weekStartsOn={profile?.week_starts_on ?? 'monday'} />
      </div>

      {correlations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Mood × Habit Insights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {correlations.map((c) => (
              <p key={c.habitId} className="text-sm">
                You feel <strong>{c.lift > 0 ? `${c.lift}% better` : 'about the same'}</strong> on days you complete <strong>{c.habitTitle}</strong>
              </p>
            ))}
          </CardContent>
        </Card>
      )}

      <YearInPixels data={yearPixels} weekStartsOn={profile?.week_starts_on ?? 'monday'} />

      <ShareProgressCard
        completionRate={stats.completionRate}
        streak={bestStreak}
        totalDone={stats.done}
      />
    </div>
  )
}
