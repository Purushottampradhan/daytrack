import { useState } from 'react'
import { format } from 'date-fns'
import { useJournal } from '@/hooks/useMood'
import { useMoodLogs } from '@/hooks/useMood'
import { useEntries } from '@/hooks/useEntries'
import { useTrackables } from '@/hooks/useTrackables'
import { MoodPicker } from '@/components/mood/MoodPicker'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { formatDateKey } from '@/lib/utils'
import { getHabitsForDate } from '@/lib/analytics'
import { MOOD_EMOJIS } from '@/types'
import { toast } from 'sonner'
import { useMoodMutations } from '@/hooks/useMood'

export function JournalPage() {
  const today = new Date()
  const dateKey = formatDateKey(today)
  const [selectedDate, setSelectedDate] = useState(dateKey)
  const [content, setContent] = useState('')

  const { data: journalEntries = [], save } = useJournal()
  const { data: moods = [] } = useMoodLogs()
  const { data: entries = [] } = useEntries()
  const { data: trackables = [] } = useTrackables()
  const { upsert: upsertMood } = useMoodMutations()

  const existing = journalEntries.find((j) => j.log_date === selectedDate)
  const mood = moods.find((m) => m.log_date === selectedDate)
  const dayHabits = getHabitsForDate(trackables, new Date(selectedDate + 'T12:00:00'))
  const dayEntries = entries.filter((e) => e.log_date === selectedDate)

  const handleSave = () => {
    if (!content.trim() && !existing) return
    save.mutate(
      { log_date: selectedDate, content: content || existing?.content || '' },
      { onSuccess: () => toast.success('Journal saved!') },
    )
  }

  const loadEntry = (date: string) => {
    setSelectedDate(date)
    const entry = journalEntries.find((j) => j.log_date === date)
    setContent(entry?.content ?? '')
  }

  return (
    <div className="space-y-4 sm:space-y-6 overflow-x-hidden">
      <div>
        <h1 className="text-2xl font-bold">Journal</h1>
        <p className="text-muted-foreground">Reflect on your day</p>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Date</label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => loadEntry(e.target.value)}
          className="flex h-10 rounded-lg border border-input bg-background px-3 text-sm"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {format(new Date(selectedDate + 'T12:00:00'), 'EEEE, MMMM d')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <MoodPicker
            value={mood?.mood_score}
            onChange={(score) => upsertMood.mutate({ log_date: selectedDate, mood_score: score })}
          />

          {dayHabits.length > 0 && (
            <div className="text-sm text-muted-foreground">
              Habits: {dayHabits.map((h) => {
                const e = dayEntries.find((en) => en.trackable_id === h.id)
                return `${h.icon} ${h.title}${e?.status === 'done' ? ' ✓' : ''}`
              }).join(' · ')}
            </div>
          )}

          <Textarea
            placeholder="How was your day?"
            rows={6}
            value={content || existing?.content || ''}
            onChange={(e) => setContent(e.target.value)}
          />

          <Button onClick={handleSave}>Save Entry</Button>
        </CardContent>
      </Card>

      <section>
        <h2 className="text-lg font-semibold mb-3">Past Entries</h2>
        {journalEntries.length === 0 && moods.length === 0 ? (
          <p className="text-muted-foreground text-sm">No entries yet. Start writing above!</p>
        ) : (
          <div className="space-y-2">
            {[...new Set([...journalEntries.map((j) => j.log_date), ...moods.map((m) => m.log_date)])]
              .sort((a, b) => b.localeCompare(a))
              .slice(0, 20)
              .map((date) => {
                const j = journalEntries.find((e) => e.log_date === date)
                const m = moods.find((e) => e.log_date === date)
                return (
                  <Card key={date} className="cursor-pointer hover:bg-accent/50" onClick={() => loadEntry(date)}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm">
                          {format(new Date(date + 'T12:00:00'), 'MMM d, yyyy')}
                        </span>
                        {m && <span>{MOOD_EMOJIS[m.mood_score - 1]}</span>}
                      </div>
                      {j && <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{j.content}</p>}
                    </CardContent>
                  </Card>
                )
              })}
          </div>
        )}
      </section>
    </div>
  )
}
