# DayTrack API (MongoDB + Render)

Express API for DayTrack. Uses the **same Atlas cluster** as quiz97 (`MONGODB_URI`), with database name `daytrack` by default so quiz collections stay separate.

## Local

```bash
cd daytrack/server
cp ../.env.example ../.env   # or set env in daytrack/.env
# Set MONGODB_URI (same as quiz97), JWT_SECRET, CLIENT_URL
npm install
npm run dev
```

Health: `http://127.0.0.1:5090/api/health`

## Render

1. Push this `daytrack` project (folder with `server/` + `render.yaml`) or deploy from monorepo with rootDir `server`.
2. Blueprint / Web Service → `daytrack-api`
3. Env:

| Key | Value |
|-----|--------|
| `MONGODB_URI` | **Same** Atlas URI as quiz97 |
| `MONGODB_DB_NAME` | `daytrack` (default) |
| `JWT_SECRET` | long random string |
| `CLIENT_URL` | `https://YOURDOMAIN/daytrack` |
| `CORS_ORIGINS` | `https://YOURDOMAIN,https://YOUR-SITE.netlify.app` |

4. Point hub `VITE_DAYTRACK_API_URL` at this service and rebuild the static site.
