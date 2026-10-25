import * as DialogPrimitive from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

export const Dialog = DialogPrimitive.Root
export const DialogTrigger = DialogPrimitive.Trigger
export const DialogClose = DialogPrimitive.Close

export function DialogContent({ className, children, ...props }: React.ComponentProps<typeof DialogPrimitive.Content>) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-[100] bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out" />
      <DialogPrimitive.Content
        className={cn(
          'fixed z-[100] flex w-full flex-col overflow-hidden border border-border bg-card shadow-lg duration-200',
          /* Mobile: bottom sheet, fits viewport */
          'inset-x-0 bottom-0 top-auto max-h-[min(88dvh,calc(100dvh-env(safe-area-inset-bottom)-0.5rem))] rounded-t-2xl',
          'pb-[max(0.75rem,env(safe-area-inset-bottom))]',
          /* Desktop: centered modal */
          'sm:inset-auto sm:left-1/2 sm:top-1/2 sm:max-h-[min(90dvh,640px)] sm:max-w-lg sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-xl',
          className,
        )}
        {...props}
      >
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain p-4 sm:p-6">
          {children}
        </div>
        <DialogPrimitive.Close className="absolute right-3 top-3 z-10 rounded-full bg-muted/80 p-1.5 opacity-80 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring sm:right-4 sm:top-4">
          <X className="h-4 w-4" />
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  )
}

export function DialogHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex shrink-0 flex-col gap-1.5 pr-8 text-center sm:text-left', className)} {...props} />
}

export function DialogTitle({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return <DialogPrimitive.Title className={cn('text-lg font-semibold', className)} {...props} />
}
