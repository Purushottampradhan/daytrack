import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical } from 'lucide-react'
import type { Trackable } from '@/types'
import { cn } from '@/lib/utils'

function SortableItem({ trackable, children }: { trackable: Trackable; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: trackable.id,
  })

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn('flex min-w-0 items-stretch gap-1 sm:gap-2', isDragging && 'opacity-50')}
    >
      <button
        type="button"
        className="hidden shrink-0 cursor-grab touch-none self-center text-muted-foreground sm:flex"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4" />
      </button>
      <div className="min-w-0 flex-1 overflow-hidden">{children}</div>
    </div>
  )
}

interface SortableTrackableListProps {
  trackables: Trackable[]
  onReorder: (ids: string[]) => void
  renderItem: (trackable: Trackable) => React.ReactNode
}

export function SortableTrackableList({ trackables, onReorder, renderItem }: SortableTrackableListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = trackables.findIndex((t) => t.id === active.id)
    const newIndex = trackables.findIndex((t) => t.id === over.id)
    const reordered = [...trackables]
    const [removed] = reordered.splice(oldIndex, 1)
    reordered.splice(newIndex, 0, removed)
    onReorder(reordered.map((t) => t.id))
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={trackables.map((t) => t.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-2 min-w-0">
          {trackables.map((t) => (
            <SortableItem key={t.id} trackable={t}>
              {renderItem(t)}
            </SortableItem>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}
