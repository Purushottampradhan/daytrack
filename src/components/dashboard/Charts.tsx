import { format, parseISO } from 'date-fns'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { HeatmapGrid } from '@/components/dashboard/HeatmapGrid'
import { getActivityCellColor } from '@/lib/analytics'
import { cn } from '@/lib/utils'
import type { WeekStartsOn } from '@/types'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

const CHART_HEIGHT = 200

function ChartShell({ title, children, className }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <Card className={cn('min-w-0 max-w-full', className)}>
      <CardHeader className="p-3 pb-1 sm:p-6 sm:pb-2">
        <CardTitle className="text-sm font-semibold sm:text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="min-w-0 p-2 pb-3 sm:p-6 sm:pt-0">
        {children}
      </CardContent>
    </Card>
  )
}

function getTickInterval(length: number) {
  if (length <= 5) return 0
  if (length <= 10) return 1
  return Math.ceil(length / 5) - 1
}

export function StatCard({ title, value, subtitle }: { title: string; value: string | number; subtitle?: string }) {
  return (
    <Card className="min-w-0 overflow-hidden">
      <CardHeader className="p-3 pb-1 sm:p-6 sm:pb-2">
        <CardTitle className="text-[11px] font-medium text-muted-foreground leading-tight sm:text-sm">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
        <div className="text-lg font-bold truncate sm:text-2xl">{value}</div>
        {subtitle && <p className="text-[10px] text-muted-foreground mt-0.5 truncate sm:text-xs">{subtitle}</p>}
      </CardContent>
    </Card>
  )
}

export function CompletionLineChart({ data }: { data: { label: string; rate: number }[] }) {
  const interval = getTickInterval(data.length)
  const chartData = data.length > 0 ? data : [{ label: '—', rate: 0 }]

  return (
    <ChartShell title="Daily Completion %">
      <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
        <AreaChart data={chartData} margin={{ top: 10, right: 8, left: 0, bottom: 0 }}>
          <XAxis
            dataKey="label"
            tick={{ fontSize: 10 }}
            interval={interval}
            tickLine={false}
            axisLine={false}
          />
          <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} width={32} tickLine={false} axisLine={false} />
          <Tooltip contentStyle={{ fontSize: 12 }} />
          <Area type="monotone" dataKey="rate" stroke="#6366f1" fill="#6366f133" strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </ChartShell>
  )
}

export function CategoryBarChart({ data }: { data: { name: string; value: number }[] }) {
  const shortData = (data.length > 0 ? data : [{ name: 'None', value: 0 }]).map((d) => ({
    ...d,
    shortName: d.name.length > 8 ? `${d.name.slice(0, 7)}…` : d.name,
  }))

  return (
    <ChartShell title="By Category">
      <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
        <BarChart data={shortData} margin={{ top: 10, right: 8, left: 0, bottom: 24 }}>
          <XAxis
            dataKey="shortName"
            tick={{ fontSize: 10 }}
            interval={0}
            angle={-30}
            textAnchor="end"
            height={50}
            tickLine={false}
            axisLine={false}
          />
          <YAxis tick={{ fontSize: 10 }} width={32} tickLine={false} axisLine={false} allowDecimals={false} />
          <Tooltip
            contentStyle={{ fontSize: 12 }}
            labelFormatter={(_, payload) => (payload?.[0]?.payload as { name?: string })?.name ?? ''}
          />
          <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} maxBarSize={48} />
        </BarChart>
      </ResponsiveContainer>
    </ChartShell>
  )
}

export function StatusDonutChart({ done, skipped, missed }: { done: number; skipped: number; missed: number }) {
  const data = [
    { name: 'Done', value: done, color: '#22c55e' },
    { name: 'Skipped', value: skipped, color: '#eab308' },
    { name: 'Missed', value: missed, color: '#ef4444' },
  ].filter((d) => d.value > 0)

  return (
    <ChartShell title="Status Breakdown">
      {data.length === 0 ? (
        <div className="flex items-center justify-center text-sm text-muted-foreground" style={{ height: CHART_HEIGHT }}>
          No data yet
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={75}
            >
              {data.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip contentStyle={{ fontSize: 12 }} />
          </PieChart>
        </ResponsiveContainer>
      )}
    </ChartShell>
  )
}

function formatHeatmapDate(dateKey: string) {
  return format(parseISO(dateKey), 'MMM d, yyyy')
}

export function ActivityHeatmap({
  data,
  weekStartsOn = 'monday',
}: {
  data: { date: string; count: number }[]
  weekStartsOn?: WeekStartsOn
}) {
  const max = Math.max(...data.map((d) => d.count), 1)
  const activeDays = data.filter((d) => d.count > 0).length
  const totalCompletions = data.reduce((sum, d) => sum + d.count, 0)

  const cells = data.map((d) => ({
    date: d.date,
    color: getActivityCellColor(d.count, max),
    label: `${formatHeatmapDate(d.date)}: ${d.count} completion${d.count === 1 ? '' : 's'}`,
  }))

  return (
    <ChartShell title="365-Day Activity">
      <HeatmapGrid
        cells={cells}
        weekStartsOn={weekStartsOn}
        summary={`${activeDays} active days · ${totalCompletions} total completions`}
        legend={
          <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
            <span>Less</span>
            {[0.35, 0.55, 0.75, 1].map((o) => (
              <div
                key={o}
                style={{ width: 13, height: 13, borderRadius: 2, backgroundColor: `rgba(99, 102, 241, ${o})` }}
              />
            ))}
            <span>More</span>
          </div>
        }
      />
    </ChartShell>
  )
}

const MOOD_LEGEND = [
  { color: '#ef4444', label: 'Awful' },
  { color: '#f97316', label: 'Bad' },
  { color: '#eab308', label: 'Okay' },
  { color: '#84cc16', label: 'Good' },
  { color: '#22c55e', label: 'Great' },
]

export function YearInPixels({
  data,
  weekStartsOn = 'monday',
}: {
  data: { date: string; color: string; score: number }[]
  weekStartsOn?: WeekStartsOn
}) {
  const loggedDays = data.filter((d) => d.score > 0).length

  const cells = data.map((d) => ({
    date: d.date,
    color: d.color,
    label:
      d.score > 0
        ? `${formatHeatmapDate(d.date)}: mood ${d.score}/5`
        : `${formatHeatmapDate(d.date)}: no mood logged`,
  }))

  return (
    <ChartShell title="Year in Pixels (Mood)">
      <HeatmapGrid
        cells={cells}
        weekStartsOn={weekStartsOn}
        summary={`${loggedDays} days with mood logged`}
        legend={
          <div className="mt-2 flex flex-wrap items-center gap-2 text-[10px] text-muted-foreground sm:text-xs">
            <span className="mr-1">Mood:</span>
            {MOOD_LEGEND.map(({ color, label }) => (
              <span key={label} className="inline-flex items-center gap-1">
                <span style={{ width: 12, height: 12, borderRadius: 2, backgroundColor: color, display: 'inline-block' }} />
                {label}
              </span>
            ))}
          </div>
        }
      />
    </ChartShell>
  )
}
