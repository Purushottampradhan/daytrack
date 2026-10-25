import { cn } from '@/lib/utils'
import type { EntryStatus } from '@/types'
import { Check, Minus, X } from 'lucide-react'

interface HabitCardProps {
  id: string
  title: string
  icon: string
  color: string
  status?: EntryStatus | null
  onStatusChange: (status: EntryStatus) => void
  compact?: boolean
}

export function HabitCard({ title, icon, color, status, onStatusChange, compact }: HabitCardProps) {
  return (
    <div
      className={cn(
        'flex min-w-0 items-center gap-2 sm:gap-3 rounded-xl border border-border bg-card p-2 sm:p-3 transition-all',
        status === 'done' && 'border-green-500/30 bg-green-500/5',
        compact && 'p-2',
      )}
    >
      <button
        type="button"
        onClick={() => onStatusChange(status === 'done' ? 'missed' : 'done')}
        className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-full text-base sm:text-lg transition-transform active:scale-95"
        style={{ backgroundColor: `${color}22`, border: `2px solid ${status === 'done' ? color : 'transparent'}` }}
      >
        {status === 'done' ? <Check className="h-5 w-5" style={{ color }} /> : icon}
      </button>

      <div className="flex-1 min-w-0">
        <p className={cn('font-medium truncate', status === 'done' && 'line-through text-muted-foreground')}>
          {title}
        </p>
      </div>

      <div className="flex gap-1">
        <button
          type="button"
          title="Skipped"
          onClick={() => onStatusChange('skipped')}
          className={cn(
            'rounded-lg p-1.5 transition-colors',
            status === 'skipped' ? 'bg-yellow-500/20 text-yellow-600' : 'text-muted-foreground hover:bg-accent',
          )}
        >
          <Minus className="h-4 w-4" />
        </button>
        <button
          type="button"
          title="Missed"
          onClick={() => onStatusChange('missed')}
          className={cn(
            'rounded-lg p-1.5 transition-colors',
            status === 'missed' ? 'bg-red-500/20 text-red-600' : 'text-muted-foreground hover:bg-accent',
          )}
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
