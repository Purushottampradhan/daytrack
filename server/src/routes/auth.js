import { Router } from 'express';
import bcrypt from 'bcryptjs';
import rateLimit from 'express-rate-limit';
import { User } from '../models/User.js';
import { Profile } from '../models/Profile.js';
import { requireAuth, signToken } from '../middleware/auth.js';

const router = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 40,
  standardHeaders: true,
  legacyHeaders: false,
});

function defaultProfile(userId, displayName) {
  return {
    _id: userId,
    display_name: displayName || null,
    timezone: 'UTC',
    day_boundary_hour: 0,
    streak_freezes_remaining: 2,
    week_starts_on: 'monday',
    confetti_enabled: true,
    theme: 'system',
  };
}

router.post('/signup', authLimiter, async (req, res) => {
  try {
    const email = String(req.body.email || '')
      .trim()
      .toLowerCase();
    const password = String(req.body.password || '');
    const displayName = String(req.body.display_name || req.body.displayName || '').trim();

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({ email, passwordHash });
    const userId = String(user._id);
    const profile = await Profile.create(defaultProfile(userId, displayName || email.split('@')[0]));
    const token = signToken(user);

    res.status(201).json({
      token,
      user: { id: userId, email: user.email },
      profile: profile.toJSON(),
    });
  } catch (err) {
    console.error('signup', err);
    res.status(500).json({ error: 'Could not create account' });
  }
});

router.post('/login', authLimiter, async (req, res) => {
  try {
    const email = String(req.body.email || '')
      .trim()
      .toLowerCase();
    const password = String(req.body.password || '');
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const userId = String(user._id);
    let profile = await Profile.findById(userId);
    if (!profile) {
      profile = await Profile.create(defaultProfile(userId, email.split('@')[0]));
    }

    res.json({
      token: signToken(user),
      user: { id: userId, email: user.email },
      profile: profile.toJSON(),
    });
  } catch (err) {
    console.error('login', err);
    res.status(500).json({ error: 'Could not sign in' });
  }
});

router.get('/me', requireAuth, async (req, res) => {
  let profile = await Profile.findById(req.user.id);
  if (!profile) {
    profile = await Profile.create(defaultProfile(req.user.id, req.user.email.split('@')[0]));
  }
  res.json({
    user: { id: req.user.id, email: req.user.email },
    profile: profile.toJSON(),
  });
});

router.post('/change-password', requireAuth, authLimiter, async (req, res) => {
  try {
    const currentPassword = String(req.body.current_password || '');
    const newPassword = String(req.body.new_password || '');
    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'New password must be at least 8 characters' });
    }
    const user = await User.findById(req.user.id);
    if (!user || !(await bcrypt.compare(currentPassword, user.passwordHash))) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }
    user.passwordHash = await bcrypt.hash(newPassword, 12);
    await user.save();
    res.json({ ok: true });
  } catch (err) {
    console.error('change-password', err);
    res.status(500).json({ error: 'Could not update password' });
  }
});

export default router;
