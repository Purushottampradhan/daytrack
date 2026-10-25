import { cn } from '@/lib/utils'

export function Badge({ className, variant = 'default', ...props }: React.HTMLAttributes<HTMLDivElement> & { variant?: 'default' | 'secondary' | 'outline' | 'success' | 'warning' | 'destructive' }) {
  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors',
        variant === 'default' && 'border-transparent bg-primary text-primary-foreground',
        variant === 'secondary' && 'border-transparent bg-secondary text-secondary-foreground',
        variant === 'outline' && 'text-foreground',
        variant === 'success' && 'border-transparent bg-green-500/15 text-green-600 dark:text-green-400',
        variant === 'warning' && 'border-transparent bg-yellow-500/15 text-yellow-600 dark:text-yellow-400',
        variant === 'destructive' && 'border-transparent bg-destructive/15 text-destructive',
        className,
      )}
      {...props}
    />
  )
}

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('animate-pulse rounded-md bg-muted', className)} {...props} />
}
