import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { Profile } from '../models/Profile.js';

const router = Router();
router.use(requireAuth);

const ALLOWED = [
  'display_name',
  'timezone',
  'day_boundary_hour',
  'streak_freezes_remaining',
  'week_starts_on',
  'confetti_enabled',
  'theme',
];

router.get('/me', async (req, res) => {
  const profile = await Profile.findById(req.user.id);
  if (!profile) return res.status(404).json({ error: 'Profile not found' });
  res.json(profile.toJSON());
});

router.patch('/me', async (req, res) => {
  const updates = {};
  for (const key of ALLOWED) {
    if (Object.prototype.hasOwnProperty.call(req.body, key)) {
      updates[key] = req.body[key];
    }
  }
  const profile = await Profile.findByIdAndUpdate(req.user.id, { $set: updates }, { new: true });
  if (!profile) return res.status(404).json({ error: 'Profile not found' });
  res.json(profile.toJSON());
});

export default router;
