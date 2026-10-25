-- Seed habits for Purushottam
-- User ID: 02221cbb-96a1-48ce-9f86-519c4273ed9e
-- Run in Supabase SQL Editor

-- Optional: clear existing habits for this user first (uncomment if re-seeding)
-- DELETE FROM public.entries WHERE user_id = '02221cbb-96a1-48ce-9f86-519c4273ed9e';
-- DELETE FROM public.trackables WHERE user_id = '02221cbb-96a1-48ce-9f86-519c4273ed9e';

INSERT INTO public.trackables (user_id, type, title, description, category, group_name, color, icon, sort_order, schedule, target_per_period, archived) VALUES

-- Morning
('02221cbb-96a1-48ce-9f86-519c4273ed9e', 'habit', 'Wake up before 7 AM',      'Start the day early',           'Personal', 'Morning',  '#f59e0b', '☀️',  0,  '{"type":"daily"}',                          NULL, false),
('02221cbb-96a1-48ce-9f86-519c4273ed9e', 'habit', 'Drink water after waking', 'Hydrate first thing',           'Health',   'Morning',  '#06b6d4', '💧',  1,  '{"type":"daily"}',                          NULL, false),
('02221cbb-96a1-48ce-9f86-519c4273ed9e', 'habit', 'Make the bed',             'Small win to start the day',    'Personal', 'Morning',  '#8b5cf6', '🛏️',  2,  '{"type":"daily"}',                          NULL, false),
('02221cbb-96a1-48ce-9f86-519c4273ed9e', 'habit', 'Morning stretch',          '5-10 min flexibility routine',  'Health',   'Morning',  '#22c55e', '🧘',  3,  '{"type":"daily"}',                          NULL, false),
('02221cbb-96a1-48ce-9f86-519c4273ed9e', 'habit', 'Healthy breakfast',        'Protein + fruits',              'Health',   'Morning',  '#22c55e', '🍎',  4,  '{"type":"daily"}',                          NULL, false),
('02221cbb-96a1-48ce-9f86-519c4273ed9e', 'habit', 'Plan the day',             '5 min review of priorities',    'Work',     'Morning',  '#6366f1', '📝',  5,  '{"type":"daily"}',                          NULL, false),

-- Health
('02221cbb-96a1-48ce-9f86-519c4273ed9e', 'habit', 'Drink 8 glasses of water', 'Stay hydrated all day',         'Health',   'Health',   '#06b6d4', '💧',  6,  '{"type":"daily"}',                          NULL, false),
('02221cbb-96a1-48ce-9f86-519c4273ed9e', 'habit', 'Exercise / workout',       'Gym, run, or home workout',     'Health',   'Health',   '#ef4444', '🏃',  7,  '{"type":"times_per_week","count":3}',     3,    false),
('02221cbb-96a1-48ce-9f86-519c4273ed9e', 'habit', 'Walk 10,000 steps',       'Daily movement goal',           'Health',   'Health',   '#22c55e', '🚶',  8,  '{"type":"daily"}',                          NULL, false),
('02221cbb-96a1-48ce-9f86-519c4273ed9e', 'habit', 'Eat vegetables',           'At least one serving',          'Health',   'Health',   '#22c55e', '🥗',  9,  '{"type":"daily"}',                          NULL, false),
('02221cbb-96a1-48ce-9f86-519c4273ed9e', 'habit', 'No junk food',             'Avoid fast food and snacks',    'Health',   'Health',   '#ef4444', '🚫', 10,  '{"type":"daily"}',                          NULL, false),
('02221cbb-96a1-48ce-9f86-519c4273ed9e', 'habit', 'Sleep 7+ hours',          'Consistent sleep schedule',     'Health',   'Health',   '#8b5cf6', '💤', 11,  '{"type":"daily"}',                          NULL, false),
('02221cbb-96a1-48ce-9f86-519c4273ed9e', 'habit', 'Take vitamins',            'Daily supplements',             'Health',   'Health',   '#f59e0b', '💊', 12,  '{"type":"daily"}',                          NULL, false),
('02221cbb-96a1-48ce-9f86-519c4273ed9e', 'habit', 'Meditate 10 minutes',      'Mindfulness or breathing',      'Health',   'Health',   '#8b5cf6', '🧘', 13,  '{"type":"daily"}',                          NULL, false),
('02221cbb-96a1-48ce-9f86-519c4273ed9e', 'habit', 'No phone before bed',      'Screen-free 1 hour before sleep','Health',  'Health',   '#6366f1', '📵', 14,  '{"type":"daily"}',                          NULL, false),

-- Work
('02221cbb-96a1-48ce-9f86-519c4273ed9e', 'habit', 'Deep work (2 hours)',      'Focused work without distractions','Work', 'Work',     '#6366f1', '🎯', 15,  '{"type":"weekly","days":[1,2,3,4,5]}',      NULL, false),
('02221cbb-96a1-48ce-9f86-519c4273ed9e', 'habit', 'Check email once',         'Batch email, not all day',      'Work',     'Work',     '#6366f1', '📧', 16,  '{"type":"weekly","days":[1,2,3,4,5]}',      NULL, false),
('02221cbb-96a1-48ce-9f86-519c4273ed9e', 'habit', 'Update to-do list',        'End-of-day or morning planning','Work',     'Work',     '#6366f1', '✅', 17,  '{"type":"weekly","days":[1,2,3,4,5]}',      NULL, false),
('02221cbb-96a1-48ce-9f86-519c4273ed9e', 'habit', 'No social media at work',  'Stay focused during work hours','Work',     'Work',     '#ef4444', '📵', 18,  '{"type":"weekly","days":[1,2,3,4,5]}',      NULL, false),

-- Learning
('02221cbb-96a1-48ce-9f86-519c4273ed9e', 'habit', 'Read 30 minutes',          'Books, articles, or docs',      'Learning', 'Learning', '#f97316', '📚', 19,  '{"type":"daily"}',                          NULL, false),
('02221cbb-96a1-48ce-9f86-519c4273ed9e', 'habit', 'Practice coding',          'DSA, projects, or tutorials',   'Learning', 'Learning', '#6366f1', '💻', 20,  '{"type":"times_per_week","count":5}',     5,    false),
('02221cbb-96a1-48ce-9f86-519c4273ed9e', 'habit', 'Watch educational video',  'Courses or tech talks',         'Learning', 'Learning', '#f97316', '🎓', 21,  '{"type":"times_per_week","count":3}',     3,    false),
('02221cbb-96a1-48ce-9f86-519c4273ed9e', 'habit', 'Write / journal',          'Reflect or take notes',         'Learning', 'Personal', '#ec4899', '✍️', 22,  '{"type":"daily"}',                          NULL, false),
('02221cbb-96a1-48ce-9f86-519c4273ed9e', 'habit', 'Learn a new word',         'Expand vocabulary daily',       'Learning', 'Learning', '#f97316', '📖', 23,  '{"type":"daily"}',                          NULL, false),

-- Personal & Finance
('02221cbb-96a1-48ce-9f86-519c4273ed9e', 'habit', 'Call family or friend',    'Stay connected',                'Personal', 'Personal', '#ec4899', '📞', 24,  '{"type":"times_per_week","count":3}',     3,    false),
('02221cbb-96a1-48ce-9f86-519c4273ed9e', 'habit', 'Gratitude (3 things)',     'Write 3 things you are grateful for','Personal','Personal','#ec4899','🙏',25,'{"type":"daily"}',                          NULL, false),
('02221cbb-96a1-48ce-9f86-519c4273ed9e', 'habit', 'Clean room or desk',       'Tidy workspace',                'Personal', 'Personal', '#8b5cf6', '🧹', 26,  '{"type":"daily"}',                          NULL, false),
('02221cbb-96a1-48ce-9f86-519c4273ed9e', 'habit', 'No impulse spending',      'Think before buying',           'Finance',  'Personal', '#22c55e', '💰', 27,  '{"type":"daily"}',                          NULL, false),
('02221cbb-96a1-48ce-9f86-519c4273ed9e', 'habit', 'Save money today',         'Transfer or skip a purchase',   'Finance',  'Personal', '#22c55e', '🏦', 28,  '{"type":"daily"}',                          NULL, false),
('02221cbb-96a1-48ce-9f86-519c4273ed9e', 'habit', 'Hobby time (30 min)',      'Music, art, gaming, etc.',      'Personal', 'Personal', '#ec4899', '🎨', 29,  '{"type":"times_per_week","count":3}',     3,    false),

-- Evening / General
('02221cbb-96a1-48ce-9f86-519c4273ed9e', 'habit', 'Review the day',           'What went well, what to improve','Personal', 'General',  '#6366f1', '📝', 30,  '{"type":"daily"}',                          NULL, false),
('02221cbb-96a1-48ce-9f86-519c4273ed9e', 'habit', 'Prepare clothes tomorrow', 'Lay out outfit for next day',   'Personal', 'General',  '#8b5cf6', '👔', 31,  '{"type":"weekly","days":[1,2,3,4,5]}',      NULL, false),
('02221cbb-96a1-48ce-9f86-519c4273ed9e', 'habit', 'Skincare routine',         'Wash, moisturize, etc.',        'Health',   'General',  '#ec4899', '✨', 32,  '{"type":"daily"}',                          NULL, false),
('02221cbb-96a1-48ce-9f86-519c4273ed9e', 'habit', 'Read before sleep',        'Wind down with a book',         'Learning', 'General',  '#f97316', '📚', 33,  '{"type":"daily"}',                          NULL, false);

-- Sample events (one-time / recurring reminders)
INSERT INTO public.trackables (user_id, type, title, description, category, group_name, color, icon, sort_order, schedule, starts_at, archived) VALUES
('02221cbb-96a1-48ce-9f86-519c4273ed9e', 'event', 'Weekly team meeting',  'Sync with team',        'Work',     'Work',     '#6366f1', '📅', 34, '{"type":"none"}', '2026-06-09 10:00:00+00', false),
('02221cbb-96a1-48ce-9f86-519c4273ed9e', 'event', 'Gym session',          'Leg day workout',       'Health',   'Health',   '#ef4444', '🏋️', 35, '{"type":"none"}', '2026-06-07 07:00:00+00', false),
('02221cbb-96a1-48ce-9f86-519c4273ed9e', 'event', 'Doctor checkup',       'Annual health visit',   'Health',   'Health',   '#22c55e', '🏥', 36, '{"type":"none"}', '2026-06-15 14:00:00+00', false);

-- Sample mood logs (last 7 days) — realistic mix
INSERT INTO public.mood_logs (user_id, log_date, mood_score, note) VALUES
('02221cbb-96a1-48ce-9f86-519c4273ed9e', CURRENT_DATE - 6, 4, 'Productive morning'),
('02221cbb-96a1-48ce-9f86-519c4273ed9e', CURRENT_DATE - 5, 3, 'Average day'),
('02221cbb-96a1-48ce-9f86-519c4273ed9e', CURRENT_DATE - 4, 5, 'Great workout and reading session'),
('02221cbb-96a1-48ce-9f86-519c4273ed9e', CURRENT_DATE - 3, 2, 'Felt tired, skipped some habits'),
('02221cbb-96a1-48ce-9f86-519c4273ed9e', CURRENT_DATE - 2, 4, 'Good focus on coding'),
('02221cbb-96a1-48ce-9f86-519c4273ed9e', CURRENT_DATE - 1, 3, 'Busy but okay'),
('02221cbb-96a1-48ce-9f86-519c4273ed9e', CURRENT_DATE,     4, NULL)
ON CONFLICT (user_id, log_date) DO UPDATE SET mood_score = EXCLUDED.mood_score, note = EXCLUDED.note;

-- Sample journal entry for today
INSERT INTO public.journal_entries (user_id, log_date, content) VALUES
('02221cbb-96a1-48ce-9f86-519c4273ed9e', CURRENT_DATE,
 'Started DayTrack today. Goals: stay consistent with water, reading, and coding practice. Feeling motivated.')
ON CONFLICT (user_id, log_date) DO UPDATE SET content = EXCLUDED.content, updated_at = now();

-- Sample habit entries for last 7 days (starter habits only — dashboard will show data)
-- Uses subquery to link trackable titles to IDs
INSERT INTO public.entries (trackable_id, user_id, log_date, status)
SELECT t.id, t.user_id, d.log_date, d.status
FROM public.trackables t
CROSS JOIN (
  VALUES
    (CURRENT_DATE - 6, 'done'),    (CURRENT_DATE - 5, 'done'),    (CURRENT_DATE - 4, 'done'),
    (CURRENT_DATE - 3, 'skipped'), (CURRENT_DATE - 2, 'done'),    (CURRENT_DATE - 1, 'missed'),
    (CURRENT_DATE,     'done')
) AS d(log_date, status)
WHERE t.user_id = '02221cbb-96a1-48ce-9f86-519c4273ed9e'
  AND t.title IN ('Drink 8 glasses of water', 'Read 30 minutes', 'Plan the day', 'Gratitude (3 things)', 'Review the day')
ON CONFLICT (trackable_id, log_date) DO UPDATE SET status = EXCLUDED.status;

INSERT INTO public.entries (trackable_id, user_id, log_date, status)
SELECT t.id, t.user_id, d.log_date, d.status
FROM public.trackables t
CROSS JOIN (
  VALUES
    (CURRENT_DATE - 6, 'missed'),  (CURRENT_DATE - 4, 'done'),
    (CURRENT_DATE - 2, 'done'),    (CURRENT_DATE,     'done')
) AS d(log_date, status)
WHERE t.user_id = '02221cbb-96a1-48ce-9f86-519c4273ed9e'
  AND t.title = 'Exercise / workout'
ON CONFLICT (trackable_id, log_date) DO UPDATE SET status = EXCLUDED.status;

INSERT INTO public.entries (trackable_id, user_id, log_date, status)
SELECT t.id, t.user_id, d.log_date, d.status
FROM public.trackables t
CROSS JOIN (
  VALUES
    (CURRENT_DATE - 5, 'done'), (CURRENT_DATE - 3, 'done'),
    (CURRENT_DATE - 1, 'done'), (CURRENT_DATE,     'done')
) AS d(log_date, status)
WHERE t.user_id = '02221cbb-96a1-48ce-9f86-519c4273ed9e'
  AND t.title = 'Practice coding'
ON CONFLICT (trackable_id, log_date) DO UPDATE SET status = EXCLUDED.status;
