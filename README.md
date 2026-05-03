# KiteSpot Radar Germany

KiteSpot Radar Germany is a full-stack Next.js app that collects wind and weather forecasts for German kitesurfing spots, scores each spot from 0-100, explains the score, and supports rider preferences, saved alerts, email notifications, and admin spot management.

## Stack

- Next.js App Router and TypeScript
- PostgreSQL with Prisma ORM
- Tailwind CSS and React components
- Open-Meteo and Windy Point Forecast weather ingestion
- NextAuth credentials login
- Leaflet map
- Resend email integration
- Cron-ready forecast crawling and alert evaluation

## MVP Coverage

Implemented in the requested order:

1. Prisma database schema for users, spots, forecasts, ratings, alerts, favorites, notification logs, and scoring rules
2. Static seed list of German kite spots
3. Weather API ingestion and storage
4. Modular scoring algorithm with safety warnings and explanations
5. Ranking dashboard and filters
6. Spot detail pages
7. User accounts and profile preferences
8. Saved alerts
9. Email notification evaluation with duplicate suppression
10. Admin spot management and scoring-rule visibility

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create your environment file:

```bash
cp .env.example .env
```

3. Start PostgreSQL:

```bash
docker compose up -d
```

4. Create the database schema and seed data:

```bash
npm run db:migrate
npm run db:seed
```

5. Start the app:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Demo Accounts

Seed creates:

- Admin: `admin@kitespot-radar.local` / `change-me-admin`
- Rider: `rider@example.com` / `change-me-rider`

Change these before using the app outside local development.

## Environment Variables

`DATABASE_URL` points Prisma to PostgreSQL.

`NEXTAUTH_URL` and `NEXTAUTH_SECRET` configure login sessions.

`WEATHER_PROVIDER` controls the forecast source. Use `open-meteo` without an API key, or `windy` with a Windy Point Forecast API key.

`WEATHER_API_URL` defaults to an Open-Meteo-compatible forecast endpoint.

`WINDY_API_KEY` enables Windy Point Forecast ingestion when `WEATHER_PROVIDER=windy`.

`WINDY_MODEL` defaults to `iconEu`, which is a good starting model for Germany.

`WEATHER_TIMEZONE` defaults to `Europe/Berlin`.

`CRON_SECRET` protects crawler and alert routes in production.

`RESEND_API_KEY` and `EMAIL_FROM` enable email alerts. Without an API key, emails are skipped in local development and logged.

## Weather Crawler

Run a manual crawl:

```bash
npm run weather:crawl
```

This fetches forecast data for all seeded spots and refreshes stored guest ratings for the next seven days.

To use Windy instead of Open-Meteo, add these values to `.env` and to your Vercel environment variables:

```bash
WEATHER_PROVIDER="windy"
WINDY_API_KEY="your-windy-point-forecast-key"
WINDY_MODEL="iconEu"
```

Windy Point Forecast uses `POST https://api.windy.com/api/point-forecast/v2`. The crawler requests surface wind, gusts, temperature, precipitation, and low/mid/high cloud cover, then converts the result into the same kite scoring format used by the dashboard.

The API route can also be called by a scheduler:

```bash
curl -H "Authorization: Bearer $CRON_SECRET" http://localhost:3000/api/forecast/refresh
```

`vercel.json` includes a 3-hour cron schedule for `/api/forecast/refresh`.

### Preview Without Docker

If Docker/PostgreSQL is not installed, the dashboard and ranking pages still fetch live Open-Meteo forecasts directly at request time. In that mode, accounts, saved alerts, admin edits, stored forecasts, and email notification logs are not persisted. Install Docker Desktop and run the database setup when you want those features.

## Alert Evaluation

Run alert matching manually:

```bash
npm run alerts:evaluate
```

Alerts match forecast windows against spot, region, wind direction, wind range, gust limit, weekday/weekend, rain, temperature, beginner safety, flat water, and travel distance. Sent alerts are recorded in `NotificationLog` by fingerprint so users do not receive duplicate emails for the same window.

## Scoring Logic

The scoring engine lives in `src/lib/scoring.ts`.

It considers:

- Side-shore and side-onshore direction compatibility
- Offshore and near-offshore danger
- Average wind strength against spot and rider preferences
- Gust factor
- Multi-hour consistency and minimum usable session length
- Rain, temperature, daylight, tide relevance, restrictions, and thermal potential
- Beginner suitability, spot type, and travel distance

Example explanation:

`Fehmarn Gold - 87/100. Best window 12:00-17:00. Wind SW 18-23 knots, excellent side-shore or side-onshore angle, moderate gusts, low rain risk.`

## Key Routes

- `/` dashboard
- `/rankings` filters and top 10 ranking
- `/map` Leaflet spot map
- `/spots/[slug]` spot detail and forecast ratings
- `/calendar` seven-day forecast calendar
- `/alerts` saved alert builder
- `/profile` rider preferences and favorites
- `/admin/spots` spot management

## API Routes

- `GET /api/rankings`
- `GET /api/spots`
- `POST /api/spots` admin only
- `GET /api/spots/[id]`
- `PUT /api/spots/[id]` admin only
- `DELETE /api/spots/[id]` admin only
- `GET|POST /api/forecast/refresh`
- `GET|POST /api/alerts/evaluate`
- `GET|POST /api/alerts`
- `GET|PUT /api/profile`
- `GET|POST|DELETE /api/favorites`

## Notes

Weather warnings are modeled and stored, but Open-Meteo's basic forecast response does not always provide official warning text. The ingestion layer keeps `weatherWarnings` as an array so a DWD warning provider can be added without changing the scoring or database shape.
