import { MOOD_EMOJIS, MOOD_LABELS } from '@/types'
import { cn } from '@/lib/utils'

interface MoodPickerProps {
  value?: number
  onChange: (score: number) => void
  compact?: boolean
}

export function MoodPicker({ value, onChange, compact }: MoodPickerProps) {
  return (
    <div className={cn('space-y-2', compact && 'space-y-1')}>
      {!compact && <p className="text-sm font-medium">How are you feeling?</p>}
      <div className="flex justify-between gap-1">
        {MOOD_EMOJIS.map((emoji, i) => {
          const score = i + 1
          return (
            <button
              key={emoji}
              type="button"
              onClick={() => onChange(score)}
              className={cn(
                'flex flex-1 flex-col items-center gap-0.5 rounded-xl p-2 transition-all',
                value === score ? 'bg-primary/15 ring-2 ring-primary sm:scale-105' : 'hover:bg-accent',
              )}
            >
              <span className={cn('text-2xl', compact && 'text-xl')}>{emoji}</span>
              {!compact && <span className="text-[10px] text-muted-foreground">{MOOD_LABELS[i]}</span>}
            </button>
          )
        })}
      </div>
    </div>
  )
}
