import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { Entry } from '../models/Entry.js';
import { Profile } from '../models/Profile.js';

const router = Router();
router.use(requireAuth);

router.get('/', async (req, res) => {
  const filter = { user_id: req.user.id };
  if (req.query.from) filter.log_date = { ...(filter.log_date || {}), $gte: String(req.query.from) };
  if (req.query.to) filter.log_date = { ...(filter.log_date || {}), $lte: String(req.query.to) };
  const rows = await Entry.find(filter).sort({ log_date: 1 });
  res.json(rows.map((r) => r.toJSON()));
});

router.post('/upsert', async (req, res) => {
  const trackableId = String(req.body.trackable_id || '');
  const logDate = String(req.body.log_date || '');
  const status = String(req.body.status || '');
  if (!trackableId || !logDate || !['done', 'skipped', 'missed'].includes(status)) {
    return res.status(400).json({ error: 'trackable_id, log_date, and status are required' });
  }

  if (status === 'skipped' && req.body.use_grace) {
    const profile = await Profile.findById(req.user.id);
    if (profile && profile.streak_freezes_remaining > 0) {
      profile.streak_freezes_remaining -= 1;
      await profile.save();
    }
  }

  const doc = await Entry.findOneAndUpdate(
    { trackable_id: trackableId, log_date: logDate, user_id: req.user.id },
    {
      $set: {
        status,
        notes: req.body.notes ?? null,
        value: req.body.value ?? null,
      },
      $setOnInsert: {
        trackable_id: trackableId,
        user_id: req.user.id,
        log_date: logDate,
      },
    },
    { new: true, upsert: true }
  );

  res.json(doc.toJSON());
});

export default router;
