import { z } from 'zod'

export const loginSchema = z.object({
  email: z.email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export const signupSchema = loginSchema.extend({
  displayName: z.string().min(1, 'Name is required').max(50),
})

export const trackableSchema = z.object({
  type: z.enum(['habit', 'event']),
  title: z.string().min(1, 'Title is required').max(100),
  description: z.string().max(500).optional(),
  category: z.string().min(1),
  group_name: z.string().min(1),
  color: z.string(),
  icon: z.string(),
  schedule: z.object({
    type: z.enum(['daily', 'weekly', 'times_per_week', 'every_other_day', 'none']),
    days: z.array(z.number()).optional(),
    count: z.number().optional(),
  }),
  target_per_period: z.number().nullable().optional(),
  starts_at: z.string().nullable().optional(),
  ends_at: z.string().nullable().optional(),
  reminder_time: z.string().nullable().optional(),
})

export const profileSchema = z.object({
  display_name: z.string().max(50).nullable(),
  timezone: z.string(),
  day_boundary_hour: z.number().min(0).max(6),
  week_starts_on: z.enum(['monday', 'sunday']),
  confetti_enabled: z.boolean(),
  theme: z.enum(['system', 'light', 'dark', 'ocean', 'sunset']),
})

export type LoginForm = z.infer<typeof loginSchema>
export type SignupForm = z.infer<typeof signupSchema>
export type TrackableForm = z.infer<typeof trackableSchema>
export type ProfileForm = z.infer<typeof profileSchema>
