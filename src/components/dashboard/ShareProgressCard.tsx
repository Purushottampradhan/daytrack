import { Share2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'

interface ShareProgressCardProps {
  completionRate: number
  streak: number
  totalDone: number
}

export function ShareProgressCard({ completionRate, streak, totalDone }: ShareProgressCardProps) {
  const handleShare = async () => {
    const text = `DayTrack Progress 🎯\n${completionRate}% completion rate\n${streak} day streak\n${totalDone} habits completed\n\nTrack your daily habits at DayTrack`

    if (navigator.share) {
      try {
        await navigator.share({ title: 'My DayTrack Progress', text })
        return
      } catch {
        // fall through to clipboard
      }
    }

    await navigator.clipboard.writeText(text)
    toast.success('Progress copied to clipboard!')
  }

  return (
    <Card className="min-w-0 max-w-full overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between gap-2 p-3 sm:p-6">
        <CardTitle className="text-base">Share Progress</CardTitle>
        <Button variant="outline" size="sm" onClick={handleShare}>
          <Share2 className="h-4 w-4 mr-1" /> Share
        </Button>
      </CardHeader>
      <CardContent>
        <div className="rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 p-6 text-center">
          <p className="text-3xl font-bold text-primary">{completionRate}%</p>
          <p className="text-sm text-muted-foreground mt-1">Completion rate</p>
          <div className="mt-4 flex justify-center gap-6 text-sm">
            <div>
              <p className="font-semibold">{streak} 🔥</p>
              <p className="text-muted-foreground">Streak</p>
            </div>
            <div>
              <p className="font-semibold">{totalDone}</p>
              <p className="text-muted-foreground">Done</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
