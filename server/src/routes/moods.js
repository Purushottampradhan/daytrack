import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { MoodLog } from '../models/MoodLog.js';

const router = Router();
router.use(requireAuth);

router.get('/', async (req, res) => {
  const filter = { user_id: req.user.id };
  if (req.query.from) filter.log_date = { ...(filter.log_date || {}), $gte: String(req.query.from) };
  if (req.query.to) filter.log_date = { ...(filter.log_date || {}), $lte: String(req.query.to) };
  const rows = await MoodLog.find(filter).sort({ log_date: 1 });
  res.json(rows.map((r) => r.toJSON()));
});

router.post('/upsert', async (req, res) => {
  const logDate = String(req.body.log_date || '');
  const moodScore = Number(req.body.mood_score);
  if (!logDate || !Number.isFinite(moodScore) || moodScore < 1 || moodScore > 5) {
    return res.status(400).json({ error: 'log_date and mood_score (1-5) are required' });
  }

  const doc = await MoodLog.findOneAndUpdate(
    { user_id: req.user.id, log_date: logDate },
    {
      $set: {
        mood_score: moodScore,
        note: req.body.note ?? null,
      },
      $setOnInsert: {
        user_id: req.user.id,
        log_date: logDate,
      },
    },
    { new: true, upsert: true }
  );

  res.json(doc.toJSON());
});

export default router;
