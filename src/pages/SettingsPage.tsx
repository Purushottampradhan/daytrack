import { useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Download, Upload, LogOut } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { getUserId } from '@/contexts/AuthContext'
import { profileSchema, type ProfileForm } from '@/lib/validators'
import { useProfileSave } from '@/components/layout/ThemeProvider'
import { localStore } from '@/lib/localStore'
import { Button } from '@/components/ui/button'
import { Input, Label } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'

export function SettingsPage() {
  const { profile, signOut, isDemo, user } = useAuth()
  const saveProfile = useProfileSave()
  const fileRef = useRef<HTMLInputElement>(null)
  const userId = getUserId(user)

  const form = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    values: profile
      ? {
          display_name: profile.display_name,
          timezone: profile.timezone,
          day_boundary_hour: profile.day_boundary_hour,
          week_starts_on: profile.week_starts_on,
          confetti_enabled: profile.confetti_enabled,
          theme: profile.theme,
        }
      : undefined,
  })

  const onSubmit = form.handleSubmit(async (data) => {
    await saveProfile(data)
    toast.success('Settings saved!')
  })

  const exportData = () => {
    if (!userId) return
    const data = localStore.exportAll(userId)
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `daytrack-export-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Data exported!')
  }

  const exportCsv = () => {
    if (!userId) return
    const data = localStore.exportAll(userId)
    const rows = [['date', 'habit', 'status', 'notes']]
    for (const entry of data.entries) {
      const t = data.trackables.find((tr) => tr.id === entry.trackable_id)
      rows.push([entry.log_date, t?.title ?? '', entry.status, entry.notes ?? ''])
    }
    const csv = rows.map((r) => r.map((c) => `"${c}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `daytrack-entries-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('CSV exported!')
  }

  const importData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !userId) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result as string)
        localStore.importAll(userId, data)
        toast.success('Data imported! Refresh to see changes.')
        window.location.reload()
      } catch {
        toast.error('Invalid JSON file')
      }
    }
    reader.readAsText(file)
  }

  const changePassword = async () => {
    const email = user && 'email' in user ? user.email : null
    if (!email || isDemo) {
      toast.info('Password change requires Supabase auth')
      return
    }
    await supabase.auth.resetPasswordForEmail(email)
    toast.success('Password reset email sent')
  }

  return (
    <div className="space-y-4 sm:space-y-6 max-w-lg overflow-x-hidden">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Customize your experience</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Display Name</Label>
              <Input {...form.register('display_name')} />
            </div>
            <div className="space-y-2">
              <Label>Timezone</Label>
              <Input {...form.register('timezone')} />
            </div>
            <div className="space-y-2">
              <Label>Week starts on</Label>
              <Select
                value={form.watch('week_starts_on')}
                onValueChange={(v) => form.setValue('week_starts_on', v as 'monday' | 'sunday')}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="monday">Monday</SelectItem>
                  <SelectItem value="sunday">Sunday</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Day boundary hour (0–6)</Label>
              <Input
                type="number"
                min={0}
                max={6}
                {...form.register('day_boundary_hour', { valueAsNumber: true })}
              />
              <p className="text-xs text-muted-foreground">Count day until this hour past midnight</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Appearance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Theme</Label>
              <Select
                value={form.watch('theme')}
                onValueChange={(v) => form.setValue('theme', v as ProfileForm['theme'])}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="system">System</SelectItem>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="ocean">Ocean</SelectItem>
                  <SelectItem value="sunset">Sunset</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <Label>Celebrate when all habits done</Label>
              <Switch
                checked={form.watch('confetti_enabled')}
                onCheckedChange={(v) => form.setValue('confetti_enabled', v)}
              />
            </div>
          </CardContent>
        </Card>

        <Button type="submit">Save Settings</Button>
      </form>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Notifications</CardTitle>
          <CardDescription>Reminder preferences (email requires Supabase Edge Function setup)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Browser push reminders</Label>
            <Switch
              defaultChecked={localStorage.getItem('daytrack_push') === 'true'}
              onCheckedChange={(v) => {
                localStorage.setItem('daytrack_push', String(v))
                if (v && 'Notification' in window) {
                  Notification.requestPermission()
                }
                toast.success(v ? 'Push reminders enabled' : 'Push reminders disabled')
              }}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label>Weekly summary email</Label>
            <Switch
              defaultChecked={localStorage.getItem('daytrack_weekly_email') === 'true'}
              onCheckedChange={(v) => {
                localStorage.setItem('daytrack_weekly_email', String(v))
                toast.success(v ? 'Weekly digest enabled' : 'Weekly digest disabled')
              }}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Data</CardTitle>
          <CardDescription>Export or import your tracking data</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={exportData}>
            <Download className="h-4 w-4 mr-1" /> Export JSON
          </Button>
          <Button variant="outline" onClick={exportCsv}>
            <Download className="h-4 w-4 mr-1" /> Export CSV
          </Button>
          <Button variant="outline" onClick={() => fileRef.current?.click()}>
            <Upload className="h-4 w-4 mr-1" /> Import JSON
          </Button>
          <input ref={fileRef} type="file" accept=".json" className="hidden" onChange={importData} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {!isDemo && (
            <Button variant="outline" onClick={changePassword}>Change Password</Button>
          )}
          <Button variant="destructive" onClick={() => signOut()}>
            <LogOut className="h-4 w-4 mr-1" /> Sign Out
          </Button>
        </CardContent>
      </Card>

      {isDemo && (
        <p className="text-xs text-muted-foreground">
          Running in demo mode with local storage. Configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY for cloud sync.
        </p>
      )}
    </div>
  )
}
