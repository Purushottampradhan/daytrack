import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  subMonths,
} from 'date-fns'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { getDaySummary } from '@/lib/analytics'
import { formatDateKey } from '@/lib/utils'
import type { Entry } from '@/types'

interface CalendarGridProps {
  month: Date
  onMonthChange: (date: Date) => void
  entries: Entry[]
  onDayClick: (date: Date) => void
  selectedDate?: Date
}

const statusColors: Record<string, string> = {
  done: 'bg-green-500',
  skipped: 'bg-yellow-500',
  missed: 'bg-red-500',
  partial: 'bg-blue-400',
  empty: 'bg-muted',
}

export function CalendarGrid({ month, onMonthChange, entries, onDayClick, selectedDate }: CalendarGridProps) {
  const monthStart = startOfMonth(month)
  const monthEnd = endOfMonth(month)
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })
  const startPad = monthStart.getDay()

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <Button variant="ghost" size="icon" onClick={() => onMonthChange(subMonths(month, 1))}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-lg font-semibold">{format(month, 'MMMM yyyy')}</h2>
        <Button variant="ghost" size="icon" onClick={() => onMonthChange(addMonths(month, 1))}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-0.5 sm:gap-1 mb-1">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
          <div key={i} className="text-center text-[10px] sm:text-xs font-medium text-muted-foreground py-0.5 sm:py-1">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-0.5 sm:gap-1">
        {Array.from({ length: startPad }).map((_, i) => (
          <div key={`pad-${i}`} />
        ))}
        {days.map((day) => {
          const summary = getDaySummary(entries, day)
          const isSelected = selectedDate && isSameDay(day, selectedDate)
          const isToday = isSameDay(day, new Date())

          return (
            <button
              key={formatDateKey(day)}
              type="button"
              onClick={() => onDayClick(day)}
              className={cn(
                'aspect-square min-h-0 rounded-md sm:rounded-lg flex flex-col items-center justify-center gap-0 text-[10px] sm:text-xs transition-all hover:ring-2 hover:ring-primary/50',
                !isSameMonth(day, month) && 'opacity-40',
                isSelected && 'ring-2 ring-primary',
                isToday && 'font-bold',
              )}
            >
              <span>{format(day, 'd')}</span>
              <div className={cn('h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full', statusColors[summary.status])} />
            </button>
          )
        })}
      </div>

      <div className="mt-4 flex flex-wrap gap-3 text-xs text-muted-foreground">
        {Object.entries({ Done: 'done', Skipped: 'skipped', Missed: 'missed', Partial: 'partial', Empty: 'empty' }).map(([label, key]) => (
          <div key={key} className="flex items-center gap-1">
            <div className={cn('h-2 w-2 rounded-full', statusColors[key])} />
            {label}
          </div>
        ))}
      </div>
    </div>
  )
}
