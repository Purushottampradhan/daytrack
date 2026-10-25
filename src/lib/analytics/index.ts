import {
  addDays,
  eachDayOfInterval,
  endOfDay,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from 'date-fns'
import type { DateFilterPreset, DateRange, Entry, EntryStatus, Schedule, Trackable, WeekStartsOn } from '@/types'
import { formatDateKey } from '@/lib/utils'

export function getDateRange(
  preset: DateFilterPreset,
  customStart?: Date,
  customEnd?: Date,
  weekStartsOn: WeekStartsOn = 'monday',
): DateRange {
  const now = new Date()
  const weekOptions = { weekStartsOn: weekStartsOn === 'monday' ? 1 as const : 0 as const }

  switch (preset) {
    case 'today':
      return { start: startOfDay(now), end: endOfDay(now), preset }
    case 'week':
      return {
        start: startOfWeek(now, weekOptions),
        end: endOfWeek(now, weekOptions),
        preset,
      }
    case 'month':
      return { start: startOfMonth(now), end: endOfMonth(now), preset }
    case 'custom':
      return {
        start: startOfDay(customStart ?? now),
        end: endOfDay(customEnd ?? now),
        preset,
      }
  }
}

export function isScheduledForDate(schedule: Schedule, date: Date, createdAt?: string): boolean {
  switch (schedule.type) {
    case 'daily':
      return true
    case 'weekly':
      return schedule.days.includes(date.getDay())
    case 'times_per_week':
      return true
    case 'every_other_day': {
      if (!createdAt) return true
      const start = new Date(createdAt)
      const diff = Math.floor((date.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
      return diff >= 0 && diff % 2 === 0
    }
    case 'none':
      return false
  }
}

export function getHabitsForDate(habits: Trackable[], date: Date): Trackable[] {
  return habits
    .filter((h) => h.type === 'habit' && !h.archived)
    .filter((h) => isScheduledForDate(h.schedule, date, h.created_at))
    .sort((a, b) => a.sort_order - b.sort_order)
}

export function getEventsForDate(events: Trackable[], date: Date): Trackable[] {
  return events
    .filter((e) => e.type === 'event' && !e.archived && e.starts_at)
    .filter((e) => isSameDay(new Date(e.starts_at!), date))
    .sort((a, b) => new Date(a.starts_at!).getTime() - new Date(b.starts_at!).getTime())
}

export interface StreakResult {
  current: number
  best: number
}

export function calculateStreak(
  entries: Entry[],
  trackableId: string,
  upToDate: Date = new Date(),
): StreakResult {
  const byDate = new Map(
    entries
      .filter((e) => e.trackable_id === trackableId)
      .map((e) => [e.log_date, e.status]),
  )

  let current = 0
  let best = 0
  let streak = 0
  const days = eachDayOfInterval({
    start: addDays(upToDate, -365),
    end: upToDate,
  })

  for (const day of days) {
    const key = formatDateKey(day)
    const status = byDate.get(key)
    if (status === 'done' || status === 'skipped') {
      streak++
      best = Math.max(best, streak)
    } else if (status === 'missed') {
      streak = 0
    } else if (isSameDay(day, upToDate) || day < upToDate) {
      // gap without entry breaks streak for past days
      if (!isSameDay(day, upToDate)) streak = 0
    }
  }

  // current streak from today backwards
  let d = upToDate
  while (true) {
    const key = formatDateKey(d)
    const status = byDate.get(key)
    if (status === 'done' || status === 'skipped') {
      current++
      d = addDays(d, -1)
    } else if (isSameDay(d, upToDate) && !status) {
      d = addDays(d, -1)
    } else {
      break
    }
  }

  return { current, best: Math.max(best, current) }
}

export function calculateHabitStrength(entries: Entry[], trackableId: string): number {
  const relevant = entries.filter((e) => e.trackable_id === trackableId)
  if (relevant.length === 0) return 0

  let strength = 0
  for (const entry of relevant.sort((a, b) => a.log_date.localeCompare(b.log_date))) {
    if (entry.status === 'done') {
      strength = Math.min(1, strength + 0.05)
    } else if (entry.status === 'missed') {
      strength = Math.max(0, strength - 0.03)
    }
  }
  return Math.round(strength * 100)
}

export function getCompletionStats(entries: Entry[], range: DateRange) {
  const days = eachDayOfInterval({ start: range.start, end: range.end })
  const inRange = entries.filter(
    (e) => e.log_date >= formatDateKey(range.start) && e.log_date <= formatDateKey(range.end),
  )

  const done = inRange.filter((e) => e.status === 'done').length
  const skipped = inRange.filter((e) => e.status === 'skipped').length
  const missed = inRange.filter((e) => e.status === 'missed').length
  const total = done + skipped + missed

  const dailyRates = days.map((day) => {
    const key = formatDateKey(day)
    const dayEntries = inRange.filter((e) => e.log_date === key)
    const dayDone = dayEntries.filter((e) => e.status === 'done').length
    const dayTotal = dayEntries.length
    return {
      date: key,
      label: format(day, 'MMM d'),
      rate: dayTotal > 0 ? Math.round((dayDone / dayTotal) * 100) : 0,
      done: dayDone,
      total: dayTotal,
    }
  })

  return {
    done,
    skipped,
    missed,
    total,
    completionRate: total > 0 ? Math.round((done / total) * 100) : 0,
    dailyRates,
  }
}

export function getCategoryBreakdown(entries: Entry[], trackables: Trackable[], range: DateRange) {
  const inRange = entries.filter(
    (e) =>
      e.status === 'done' &&
      e.log_date >= formatDateKey(range.start) &&
      e.log_date <= formatDateKey(range.end),
  )

  const counts: Record<string, number> = {}
  for (const entry of inRange) {
    const trackable = trackables.find((t) => t.id === entry.trackable_id)
    const cat = trackable?.category ?? 'Other'
    counts[cat] = (counts[cat] ?? 0) + 1
  }

  return Object.entries(counts).map(([name, value]) => ({ name, value }))
}

export function getGroupBreakdown(entries: Entry[], trackables: Trackable[], range: DateRange) {
  const inRange = entries.filter(
    (e) =>
      e.status === 'done' &&
      e.log_date >= formatDateKey(range.start) &&
      e.log_date <= formatDateKey(range.end),
  )

  const counts: Record<string, number> = {}
  for (const entry of inRange) {
    const trackable = trackables.find((t) => t.id === entry.trackable_id)
    const group = trackable?.group_name ?? 'General'
    counts[group] = (counts[group] ?? 0) + 1
  }

  return Object.entries(counts).map(([name, value]) => ({ name, value }))
}

export function getDaySummary(entries: Entry[], date: Date): {
  status: EntryStatus | 'empty' | 'partial'
  done: number
  total: number
} {
  const key = formatDateKey(date)
  const dayEntries = entries.filter((e) => e.log_date === key)
  if (dayEntries.length === 0) return { status: 'empty', done: 0, total: 0 }

  const done = dayEntries.filter((e) => e.status === 'done').length
  const allDone = dayEntries.every((e) => e.status === 'done')
  const allMissed = dayEntries.every((e) => e.status === 'missed')
  const allSkipped = dayEntries.every((e) => e.status === 'skipped')

  let status: EntryStatus | 'empty' | 'partial' = 'partial'
  if (allDone) status = 'done'
  else if (allMissed) status = 'missed'
  else if (allSkipped) status = 'skipped'

  return { status, done, total: dayEntries.length }
}

export function getWeekOverWeekChange(entries: Entry[]): number {
  const now = new Date()
  const thisWeekStart = startOfWeek(now, { weekStartsOn: 1 })
  const lastWeekStart = addDays(thisWeekStart, -7)
  const lastWeekEnd = addDays(thisWeekStart, -1)

  const thisWeek = entries.filter(
    (e) => e.log_date >= formatDateKey(thisWeekStart) && e.status === 'done',
  ).length
  const lastWeek = entries.filter(
    (e) =>
      e.log_date >= formatDateKey(lastWeekStart) &&
      e.log_date <= formatDateKey(lastWeekEnd) &&
      e.status === 'done',
  ).length

  if (lastWeek === 0) return thisWeek > 0 ? 100 : 0
  return Math.round(((thisWeek - lastWeek) / lastWeek) * 100)
}

export interface MoodCorrelation {
  habitTitle: string
  habitId: string
  avgMoodWith: number
  avgMoodWithout: number
  lift: number
}

export function getMoodCorrelations(
  entries: Entry[],
  moodLogs: { log_date: string; mood_score: number }[],
  trackables: Trackable[],
): MoodCorrelation[] {
  const moodByDate = new Map(moodLogs.map((m) => [m.log_date, m.mood_score]))
  const habits = trackables.filter((t) => t.type === 'habit')

  return habits
    .map((habit) => {
      const doneDates = new Set(
        entries
          .filter((e) => e.trackable_id === habit.id && e.status === 'done')
          .map((e) => e.log_date),
      )

      const withHabit: number[] = []
      const withoutHabit: number[] = []

      for (const [date, score] of moodByDate) {
        if (doneDates.has(date)) withHabit.push(score)
        else withoutHabit.push(score)
      }

      if (withHabit.length === 0 || withoutHabit.length === 0) return null

      const avgWith = withHabit.reduce((a, b) => a + b, 0) / withHabit.length
      const avgWithout = withoutHabit.reduce((a, b) => a + b, 0) / withoutHabit.length

      return {
        habitTitle: habit.title,
        habitId: habit.id,
        avgMoodWith: avgWith,
        avgMoodWithout: avgWithout,
        lift: Math.round(((avgWith - avgWithout) / avgWithout) * 100),
      }
    })
    .filter((c): c is MoodCorrelation => c !== null)
    .sort((a, b) => b.lift - a.lift)
    .slice(0, 3)
}

export function getWeeklyReview(
  entries: Entry[],
  trackables: Trackable[],
  range: DateRange,
) {
  const stats = getCompletionStats(entries, range)
  const habitCounts: Record<string, number> = {}

  for (const entry of entries.filter((e) => e.status === 'done')) {
    const t = trackables.find((tr) => tr.id === entry.trackable_id)
    if (t) habitCounts[t.title] = (habitCounts[t.title] ?? 0) + 1
  }

  const bestHabit = Object.entries(habitCounts).sort((a, b) => b[1] - a[1])[0]
  const missedDays = stats.missed

  return {
    completionRate: stats.completionRate,
    bestHabit: bestHabit ? { title: bestHabit[0], count: bestHabit[1] } : null,
    missedCount: missedDays,
    totalDone: stats.done,
    message: stats.completionRate >= 80
      ? 'Great week! You stayed consistent.'
      : stats.completionRate >= 50
        ? 'Solid progress. A few more check-ins next week could help.'
        : 'Tough week — try focusing on just one habit tomorrow.',
  }
}

export function getHeatmapData(entries: Entry[], days = 365) {
  const now = new Date()
  const data: { date: string; count: number }[] = []

  for (let i = days - 1; i >= 0; i--) {
    const date = addDays(now, -i)
    const key = formatDateKey(date)
    const count = entries.filter((e) => e.log_date === key && e.status === 'done').length
    data.push({ date: key, count })
  }

  return data
}

const MOOD_PIXEL_COLORS = ['#ef4444', '#f97316', '#eab308', '#84cc16', '#22c55e'] as const
const EMPTY_CELL_COLOR = '#cbd5e1'

export function getYearInPixels(moodLogs: { log_date: string; mood_score: number }[], days = 365) {
  const moodByDate = new Map(moodLogs.map((m) => [m.log_date, m.mood_score]))
  const now = new Date()
  const data: { date: string; color: string; score: number }[] = []

  for (let i = days - 1; i >= 0; i--) {
    const date = addDays(now, -i)
    const key = formatDateKey(date)
    const score = moodByDate.get(key) ?? 0
    data.push({
      date: key,
      score,
      color: score > 0 ? MOOD_PIXEL_COLORS[score - 1] ?? EMPTY_CELL_COLOR : EMPTY_CELL_COLOR,
    })
  }

  return data
}

export function getActivityCellColor(count: number, max: number): string {
  if (count === 0) return EMPTY_CELL_COLOR
  const intensity = 0.35 + (count / max) * 0.65
  return `rgba(99, 102, 241, ${intensity})`
}
