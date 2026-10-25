import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { JournalEntry } from '../models/JournalEntry.js';

const router = Router();
router.use(requireAuth);

router.get('/', async (req, res) => {
  const rows = await JournalEntry.find({ user_id: req.user.id }).sort({ log_date: -1 });
  res.json(rows.map((r) => r.toJSON()));
});

router.post('/upsert', async (req, res) => {
  const logDate = String(req.body.log_date || '');
  const content = String(req.body.content || '');
  if (!logDate || !content.trim()) {
    return res.status(400).json({ error: 'log_date and content are required' });
  }

  const doc = await JournalEntry.findOneAndUpdate(
    { user_id: req.user.id, log_date: logDate },
    {
      $set: { content },
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
