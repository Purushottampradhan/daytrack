import {
  eachDayOfInterval,
  endOfWeek,
  format,
  parseISO,
  startOfDay,
  startOfWeek,
} from 'date-fns'
import type { WeekStartsOn } from '@/types'
import { formatDateKey } from '@/lib/utils'

const PADDING_CELL_COLOR = '#f1f5f9'

export interface HeatmapLayoutCell {
  date: string
  color: string
  label: string
  inRange: boolean
}

export interface HeatmapLayout {
  cells: HeatmapLayoutCell[]
  numColumns: number
  weekdayLabels: string[]
  monthLabels: { column: number; label: string }[]
  rangeLabel: string
  todayDate: string | null
  todayColumn: number
}

export function buildHeatmapLayout(
  cells: { date: string; color: string; label: string }[],
  weekStartsOn: WeekStartsOn = 'monday',
): HeatmapLayout {
  if (cells.length === 0) {
    return {
      cells: [],
      numColumns: 0,
      weekdayLabels: [],
      monthLabels: [],
      rangeLabel: '',
      todayDate: null,
      todayColumn: 0,
    }
  }

  const cellMap = new Map(cells.map((c) => [c.date, c]))
  const rangeStart = startOfDay(parseISO(cells[0].date))
  const rangeEnd = startOfDay(parseISO(cells[cells.length - 1].date))
  const weekOptions = { weekStartsOn: weekStartsOn === 'monday' ? (1 as const) : (0 as const) }

  const gridStart = startOfWeek(rangeStart, weekOptions)
  const gridEnd = endOfWeek(rangeEnd, weekOptions)
  const allDays = eachDayOfInterval({ start: gridStart, end: gridEnd })

  const layoutCells: HeatmapLayoutCell[] = allDays.map((date) => {
    const key = formatDateKey(date)
    const inRange = date >= rangeStart && date <= rangeEnd
    const existing = cellMap.get(key)
    const displayDate = format(date, 'MMM d, yyyy')

    if (existing) {
      return { ...existing, inRange }
    }

    return {
      date: key,
      color: inRange ? '#cbd5e1' : PADDING_CELL_COLOR,
      label: inRange ? `${displayDate}: no activity` : '',
      inRange,
    }
  })

  const dayOrder =
    weekStartsOn === 'monday'
      ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
      : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const weekdayLabels = dayOrder.map((day) => (['Mon', 'Wed', 'Fri'].includes(day) ? day : ''))

  const numColumns = Math.ceil(layoutCells.length / 7)
  const monthLabels: { column: number; label: string }[] = []
  const seenMonths = new Set<string>()

  for (let col = 0; col < numColumns; col++) {
    for (let row = 0; row < 7; row++) {
      const idx = col * 7 + row
      if (idx >= allDays.length) break
      const date = allDays[idx]
      const monthKey = format(date, 'yyyy-MM')
      if (date.getDate() === 1 && !seenMonths.has(monthKey)) {
        monthLabels.push({ column: col, label: format(date, 'MMM') })
        seenMonths.add(monthKey)
        break
      }
    }
  }

  if (!monthLabels.some((m) => m.column === 0)) {
    monthLabels.unshift({ column: 0, label: format(allDays[0], 'MMM') })
  }

  const todayKey = formatDateKey(new Date())
  const todayIndex = layoutCells.findIndex((c) => c.date === todayKey && c.inRange)
  const todayColumn = todayIndex >= 0 ? Math.floor(todayIndex / 7) : numColumns - 1

  return {
    cells: layoutCells,
    numColumns,
    weekdayLabels,
    monthLabels,
    rangeLabel: `${format(rangeStart, 'MMM d, yyyy')} – ${format(rangeEnd, 'MMM d, yyyy')}`,
    todayDate: todayIndex >= 0 ? todayKey : null,
    todayColumn,
  }
}
