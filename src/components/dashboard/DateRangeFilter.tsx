import { useState } from 'react'
import { format } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { DateFilterPreset, DateRange } from '@/types'
import { getDateRange } from '@/lib/analytics'
import { cn } from '@/lib/utils'

interface DateRangeFilterProps {
  value: DateRange
  onChange: (range: DateRange) => void
  weekStartsOn?: 'monday' | 'sunday'
}

const presets: { key: DateFilterPreset; label: string }[] = [
  { key: 'today', label: 'Today' },
  { key: 'week', label: 'Week' },
  { key: 'month', label: 'Month' },
  { key: 'custom', label: 'Custom' },
]

export function DateRangeFilter({ value, onChange, weekStartsOn = 'monday' }: DateRangeFilterProps) {
  const [customStart, setCustomStart] = useState(format(value.start, 'yyyy-MM-dd'))
  const [customEnd, setCustomEnd] = useState(format(value.end, 'yyyy-MM-dd'))

  const setPreset = (preset: DateFilterPreset) => {
    if (preset === 'custom') {
      onChange(getDateRange('custom', new Date(customStart), new Date(customEnd), weekStartsOn))
    } else {
      onChange(getDateRange(preset, undefined, undefined, weekStartsOn))
    }
  }

  const applyCustom = () => {
    onChange(getDateRange('custom', new Date(customStart), new Date(customEnd), weekStartsOn))
  }

  return (
    <div className="sticky top-0 z-10 mb-4 w-full rounded-xl border border-border bg-background/95 py-3 px-3 backdrop-blur">
      <div className="flex flex-wrap gap-1.5">
        {presets.map(({ key, label }) => (
          <Button
            key={key}
            size="sm"
            variant={value.preset === key ? 'default' : 'outline'}
            onClick={() => setPreset(key)}
          >
            {label}
          </Button>
        ))}
      </div>
      {value.preset === 'custom' && (
        <div className="mt-2 grid grid-cols-1 gap-2 sm:flex sm:flex-wrap sm:items-center">
          <Input type="date" value={customStart} onChange={(e) => setCustomStart(e.target.value)} className="w-full sm:w-auto" />
          <span className="hidden text-muted-foreground sm:inline">to</span>
          <Input type="date" value={customEnd} onChange={(e) => setCustomEnd(e.target.value)} className="w-full sm:w-auto" />
          <Button size="sm" onClick={applyCustom} className="w-full sm:w-auto">Apply</Button>
        </div>
      )}
      <p className={cn('mt-2 text-xs text-muted-foreground')}>
        {format(value.start, 'MMM d, yyyy')} — {format(value.end, 'MMM d, yyyy')}
      </p>
    </div>
  )
}
