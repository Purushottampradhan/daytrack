export type EntryStatus = 'done' | 'skipped' | 'missed'
export type TrackableType = 'habit' | 'event'
export type WeekStartsOn = 'monday' | 'sunday'
export type ThemeOption = 'system' | 'light' | 'dark' | 'ocean' | 'sunset'

export type Schedule =
  | { type: 'daily' }
  | { type: 'weekly'; days: number[] }
  | { type: 'times_per_week'; count: number }
  | { type: 'every_other_day' }
  | { type: 'none' }

export interface Profile {
  id: string
  display_name: string | null
  timezone: string
  day_boundary_hour: number
  streak_freezes_remaining: number
  week_starts_on: WeekStartsOn
  confetti_enabled: boolean
  theme: ThemeOption
  created_at: string
}

export interface Trackable {
  id: string
  user_id: string
  type: TrackableType
  title: string
  description: string | null
  category: string
  group_name: string
  color: string
  icon: string
  sort_order: number
  schedule: Schedule
  target_per_period: number | null
  starts_at: string | null
  ends_at: string | null
  reminder_time: string | null
  archived: boolean
  created_at: string
}

export interface Entry {
  id: string
  trackable_id: string
  user_id: string
  log_date: string
  status: EntryStatus
  value: number | null
  notes: string | null
  created_at: string
}

export interface MoodLog {
  id: string
  user_id: string
  log_date: string
  mood_score: number
  note: string | null
  created_at: string
}

export interface JournalEntry {
  id: string
  user_id: string
  log_date: string
  content: string
  created_at: string
  updated_at: string
}

export type DateFilterPreset = 'today' | 'week' | 'month' | 'custom'

export interface DateRange {
  start: Date
  end: Date
  preset: DateFilterPreset
}

export const MOOD_EMOJIS = ['😢', '😕', '😐', '🙂', '😄'] as const
export const MOOD_LABELS = ['Awful', 'Bad', 'Okay', 'Good', 'Great'] as const

export const HABIT_GROUPS = ['Morning', 'Health', 'Work', 'Personal', 'Learning', 'General'] as const
export const CATEGORIES = ['Work', 'Health', 'Personal', 'Learning', 'Finance', 'Other'] as const
export const HABIT_ICONS = ['✅', '🏃', '📚', '💧', '🧘', '💤', '🍎', '💪', '🎯', '📝'] as const
export const HABIT_COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#ec4899', '#06b6d4', '#8b5cf6', '#f97316'] as const

export interface Database {
  public: {
    Tables: {
      profiles: { Row: Profile; Insert: Partial<Profile> & { id: string }; Update: Partial<Profile> }
      trackables: { Row: Trackable; Insert: Omit<Trackable, 'id' | 'created_at'>; Update: Partial<Trackable> }
      entries: { Row: Entry; Insert: Omit<Entry, 'id' | 'created_at'>; Update: Partial<Entry> }
      mood_logs: { Row: MoodLog; Insert: Omit<MoodLog, 'id' | 'created_at'>; Update: Partial<MoodLog> }
      journal_entries: { Row: JournalEntry; Insert: Omit<JournalEntry, 'id' | 'created_at' | 'updated_at'>; Update: Partial<JournalEntry> }
    }
  }
}
