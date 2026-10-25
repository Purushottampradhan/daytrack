import type { Entry, JournalEntry, MoodLog, Profile, Trackable } from '@/types'

const KEYS = {
  profile: 'daytrack_profile',
  trackables: 'daytrack_trackables',
  entries: 'daytrack_entries',
  moods: 'daytrack_moods',
  journal: 'daytrack_journal',
  session: 'daytrack_session',
} as const

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function write<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value))
}

export interface LocalSession {
  id: string
  email: string
}

export interface ExportData {
  profile: Profile
  trackables: Trackable[]
  entries: Entry[]
  moods: MoodLog[]
  journal: JournalEntry[]
  exportedAt: string
}

export const localStore = {
  getSession(): LocalSession | null {
    return read<LocalSession | null>(KEYS.session, null)
  },
  setSession(session: LocalSession | null) {
    if (session) write(KEYS.session, session)
    else localStorage.removeItem(KEYS.session)
  },

  getProfile(userId: string): Profile {
    const profiles = read<Record<string, Profile>>(KEYS.profile, {})
    return profiles[userId] ?? {
      id: userId,
      display_name: 'Demo User',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      day_boundary_hour: 0,
      streak_freezes_remaining: 2,
      week_starts_on: 'monday',
      confetti_enabled: true,
      theme: 'system',
      created_at: new Date().toISOString(),
    }
  },

  saveProfile(profile: Profile) {
    const profiles = read<Record<string, Profile>>(KEYS.profile, {})
    profiles[profile.id] = profile
    write(KEYS.profile, profiles)
  },

  getTrackables(userId: string): Trackable[] {
    return read<Trackable[]>(KEYS.trackables, []).filter((t) => t.user_id === userId)
  },

  saveTrackable(trackable: Trackable) {
    const all = read<Trackable[]>(KEYS.trackables, [])
    const idx = all.findIndex((t) => t.id === trackable.id)
    if (idx >= 0) all[idx] = trackable
    else all.push(trackable)
    write(KEYS.trackables, all)
  },

  deleteTrackable(id: string) {
    write(KEYS.trackables, read<Trackable[]>(KEYS.trackables, []).filter((t) => t.id !== id))
    write(KEYS.entries, read<Entry[]>(KEYS.entries, []).filter((e) => e.trackable_id !== id))
  },

  getEntries(userId: string): Entry[] {
    return read<Entry[]>(KEYS.entries, []).filter((e) => e.user_id === userId)
  },

  saveEntry(entry: Entry) {
    const all = read<Entry[]>(KEYS.entries, [])
    const idx = all.findIndex((e) => e.trackable_id === entry.trackable_id && e.log_date === entry.log_date)
    if (idx >= 0) all[idx] = entry
    else all.push(entry)
    write(KEYS.entries, all)
  },

  getMoods(userId: string): MoodLog[] {
    return read<MoodLog[]>(KEYS.moods, []).filter((m) => m.user_id === userId)
  },

  saveMood(mood: MoodLog) {
    const all = read<MoodLog[]>(KEYS.moods, [])
    const idx = all.findIndex((m) => m.user_id === mood.user_id && m.log_date === mood.log_date)
    if (idx >= 0) all[idx] = mood
    else all.push(mood)
    write(KEYS.moods, all)
  },

  getJournal(userId: string): JournalEntry[] {
    return read<JournalEntry[]>(KEYS.journal, []).filter((j) => j.user_id === userId)
  },

  saveJournal(entry: JournalEntry) {
    const all = read<JournalEntry[]>(KEYS.journal, [])
    const idx = all.findIndex((j) => j.user_id === entry.user_id && j.log_date === entry.log_date)
    if (idx >= 0) all[idx] = entry
    else all.push(entry)
    write(KEYS.journal, all)
  },

  exportAll(userId: string): ExportData {
    return {
      profile: this.getProfile(userId),
      trackables: this.getTrackables(userId),
      entries: this.getEntries(userId),
      moods: this.getMoods(userId),
      journal: this.getJournal(userId),
      exportedAt: new Date().toISOString(),
    }
  },

  importAll(userId: string, data: ExportData) {
    if (data.profile) this.saveProfile({ ...data.profile, id: userId })
    for (const t of data.trackables ?? []) this.saveTrackable({ ...t, user_id: userId })
    for (const e of data.entries ?? []) this.saveEntry({ ...e, user_id: userId })
    for (const m of data.moods ?? []) this.saveMood({ ...m, user_id: userId })
    for (const j of data.journal ?? []) this.saveJournal({ ...j, user_id: userId })
  },
}

export function generateId() {
  return crypto.randomUUID()
}
