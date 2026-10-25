import { Router } from 'express';
import mongoose from 'mongoose';
import { requireAuth } from '../middleware/auth.js';
import { Trackable } from '../models/Trackable.js';
import { Entry } from '../models/Entry.js';

const router = Router();
router.use(requireAuth);

router.get('/', async (req, res) => {
  const includeArchived = String(req.query.include_archived || '') === 'true';
  const filter = { user_id: req.user.id };
  if (!includeArchived) filter.archived = false;
  const rows = await Trackable.find(filter).sort({ sort_order: 1, created_at: 1 });
  res.json(rows.map((r) => r.toJSON()));
});

router.post('/', async (req, res) => {
  const body = req.body || {};
  if (!body.title || !body.type) {
    return res.status(400).json({ error: 'title and type are required' });
  }
  const doc = await Trackable.create({
    user_id: req.user.id,
    type: body.type,
    title: String(body.title).trim(),
    description: body.description ?? null,
    category: body.category ?? 'Other',
    group_name: body.group_name ?? 'General',
    color: body.color ?? '#6366f1',
    icon: body.icon ?? '✅',
    sort_order: Number(body.sort_order) || 0,
    schedule: body.schedule ?? { type: 'daily' },
    target_per_period: body.target_per_period ?? null,
    starts_at: body.starts_at ?? null,
    ends_at: body.ends_at ?? null,
    reminder_time: body.reminder_time ?? null,
    archived: Boolean(body.archived),
  });
  res.status(201).json(doc.toJSON());
});

router.patch('/:id', async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(404).json({ error: 'Not found' });
  }
  const allowed = [
    'title',
    'description',
    'category',
    'group_name',
    'color',
    'icon',
    'sort_order',
    'schedule',
    'target_per_period',
    'starts_at',
    'ends_at',
    'reminder_time',
    'archived',
    'type',
  ];
  const updates = {};
  for (const key of allowed) {
    if (Object.prototype.hasOwnProperty.call(req.body, key)) updates[key] = req.body[key];
  }
  const doc = await Trackable.findOneAndUpdate(
    { _id: req.params.id, user_id: req.user.id },
    { $set: updates },
    { new: true }
  );
  if (!doc) return res.status(404).json({ error: 'Not found' });
  res.json(doc.toJSON());
});

router.delete('/:id', async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(404).json({ error: 'Not found' });
  }
  const doc = await Trackable.findOneAndDelete({ _id: req.params.id, user_id: req.user.id });
  if (!doc) return res.status(404).json({ error: 'Not found' });
  await Entry.deleteMany({ trackable_id: String(doc._id), user_id: req.user.id });
  res.json({ ok: true });
});

router.post('/reorder', async (req, res) => {
  const items = Array.isArray(req.body?.items) ? req.body.items : [];
  await Promise.all(
    items.map((item) =>
      Trackable.updateOne(
        { _id: item.id, user_id: req.user.id },
        { $set: { sort_order: Number(item.sort_order) || 0 } }
      )
    )
  );
  res.json({ ok: true });
});

export default router;
