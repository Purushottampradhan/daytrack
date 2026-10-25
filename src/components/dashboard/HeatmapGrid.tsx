import { useLayoutEffect, useMemo, useRef } from 'react'
import type { ReactNode } from 'react'
import { buildHeatmapLayout } from '@/lib/heatmapLayout'
import type { WeekStartsOn } from '@/types'

const CELL = 13
const GAP = 3
const MONTH_AXIS_HEIGHT = 18
const WEEKDAY_AXIS_WIDTH = 30
const COLUMN_WIDTH = CELL + GAP

interface HeatmapGridProps {
  cells: { date: string; color: string; label: string }[]
  weekStartsOn?: WeekStartsOn
  legend?: ReactNode
  summary?: string
}

export function HeatmapGrid({ cells, weekStartsOn = 'monday', legend, summary }: HeatmapGridProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const layout = useMemo(() => buildHeatmapLayout(cells, weekStartsOn), [cells, weekStartsOn])

  useLayoutEffect(() => {
    const el = scrollRef.current
    if (!el || layout.cells.length === 0) return

    const scrollToToday = () => {
      const gridStart = WEEKDAY_AXIS_WIDTH + 6
      const todayLeft = gridStart + layout.todayColumn * COLUMN_WIDTH
      const visiblePadding = COLUMN_WIDTH * 2
      const target = todayLeft - el.clientWidth + visiblePadding
      const maxScroll = el.scrollWidth - el.clientWidth
      el.scrollLeft = Math.max(0, Math.min(target, maxScroll))
    }

    scrollToToday()
    const frame = requestAnimationFrame(scrollToToday)
    const observer = new ResizeObserver(scrollToToday)
    observer.observe(el)
    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
    }
  }, [layout.todayColumn, layout.cells.length, layout.numColumns])

  if (layout.cells.length === 0) {
    return <p className="text-sm text-muted-foreground">No data yet</p>
  }

  const gridWidth = layout.numColumns * COLUMN_WIDTH

  return (
    <div className="w-full">
      <p className="mb-2 text-xs text-muted-foreground">{layout.rangeLabel}</p>

      <div
        ref={scrollRef}
        className="w-full overflow-x-auto overscroll-x-contain rounded-lg bg-muted/30 p-2"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        <div className="inline-flex items-start gap-1.5">
          {/* Weekday axis */}
          <div
            className="shrink-0 text-[10px] text-muted-foreground"
            style={{ width: WEEKDAY_AXIS_WIDTH, paddingTop: MONTH_AXIS_HEIGHT }}
          >
            {layout.weekdayLabels.map((label, row) => (
              <div
                key={row}
                className="flex items-center justify-end pr-1"
                style={{ height: CELL, marginBottom: row < 6 ? GAP : 0 }}
              >
                {label}
              </div>
            ))}
          </div>

          {/* Month axis + heatmap */}
          <div className="min-w-0">
            <div className="relative text-[10px] text-muted-foreground" style={{ height: MONTH_AXIS_HEIGHT, width: gridWidth }}>
              {layout.monthLabels.map(({ column, label }) => (
                <span
                  key={`${column}-${label}`}
                  className="absolute top-0 whitespace-nowrap"
                  style={{ left: column * COLUMN_WIDTH }}
                >
                  {label}
                </span>
              ))}
            </div>

            <div
              style={{
                display: 'inline-grid',
                gridTemplateRows: `repeat(7, ${CELL}px)`,
                gridAutoFlow: 'column',
                gridAutoColumns: `${CELL}px`,
                gap: `${GAP}px`,
                width: gridWidth,
                minHeight: 7 * CELL + 6 * GAP,
              }}
            >
              {layout.cells.map((cell) => {
                const isToday = cell.date === layout.todayDate
                return (
                  <div
                    key={cell.date}
                    title={cell.inRange ? cell.label : undefined}
                    style={{
                      width: CELL,
                      height: CELL,
                      borderRadius: 2,
                      backgroundColor: cell.color,
                      opacity: cell.inRange ? 1 : 0.35,
                      flexShrink: 0,
                      boxShadow: isToday ? '0 0 0 2px #6366f1' : undefined,
                    }}
                  />
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {legend}
      {summary && <p className="mt-2 text-xs text-muted-foreground">{summary}</p>}
    </div>
  )
}
