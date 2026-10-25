import './loadEnv.js';
import express from 'express';
import cors from 'cors';
import { connectDb } from './db.js';
import authRoutes from './routes/auth.js';
import profileRoutes from './routes/profiles.js';
import trackableRoutes from './routes/trackables.js';
import entryRoutes from './routes/entries.js';
import moodRoutes from './routes/moods.js';
import journalRoutes from './routes/journal.js';

const app = express();
app.set('trust proxy', 1);
const port = Number(process.env.PORT) || 5090;

function toOrigin(value) {
  const raw = String(value || '').trim();
  if (!raw) return '';
  try {
    return new URL(raw).origin;
  } catch {
    return raw.replace(/\/$/, '');
  }
}

function corsOrigins() {
  const isProd = process.env.NODE_ENV === 'production';
  const listed = [
    process.env.CLIENT_URL,
    ...(process.env.CORS_ORIGINS || '').split(','),
    ...(isProd
      ? []
      : [
          'http://localhost:5173',
          'http://127.0.0.1:5173',
          'http://localhost:5174',
          'http://127.0.0.1:5174',
          'http://localhost:5175',
          'http://127.0.0.1:5175',
        ]),
  ]
    .map(toOrigin)
    .filter(Boolean);
  return [...new Set(listed)];
}

function isLocalDevOrigin(origin) {
  if (process.env.NODE_ENV === 'production') return false;
  try {
    const u = new URL(origin);
    return (
      (u.hostname === 'localhost' || u.hostname === '127.0.0.1') &&
      (u.protocol === 'http:' || u.protocol === 'https:')
    );
  } catch {
    return false;
  }
}

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);
      const allowed = corsOrigins();
      if (allowed.includes(origin) || isLocalDevOrigin(origin)) {
        return callback(null, true);
      }
      if (process.env.CORS_ALLOW_RENDER === 'true' && origin.endsWith('.onrender.com')) {
        return callback(null, true);
      }
      return callback(null, false);
    },
    credentials: true,
  })
);
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, name: 'daytrack' });
});

app.use('/api/auth', authRoutes);
app.use('/api/profiles', profileRoutes);
app.use('/api/trackables', trackableRoutes);
app.use('/api/entries', entryRoutes);
app.use('/api/moods', moodRoutes);
app.use('/api/journal', journalRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Server error' });
});

await connectDb();
app.listen(port, () => {
  console.log(`DayTrack API listening on :${port}`);
});
