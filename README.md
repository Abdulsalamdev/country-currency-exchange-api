# Country Currency & Exchange API (Railway-ready)

This is a deploy-ready **Node.js + Express** project (no ORM) that implements the HNG task:
- Fetches countries from restcountries
- Fetches exchange rates from open.er-api
- Caches countries in MySQL (Railway)
- Computes `estimated_gdp = population * random(1000-2000) / exchange_rate`
- Generates a summary image `cache/summary.png` on refresh

## How to deploy on Railway
1. Push this repository to GitHub.
2. Create a new Railway project and deploy from GitHub.
3. Add the **MySQL** plugin on Railway. Railway will expose these env vars:
   - MYSQL_HOST
   - MYSQL_PORT
   - MYSQL_USER
   - MYSQL_PASSWORD
   - MYSQL_DATABASE
4. In Railway project variables add `PORT=5000` (or desired port).
5. Deploy. Railway will install dependencies and run `npm start`.

## Endpoints
- `POST /countries/refresh` — fetch countries and exchange rates and cache them.
- `GET /countries` — list countries (filters: `?region=`, `?currency=`, `?sort=gdp_desc`).
- `GET /countries/:name` — get country by name (case-insensitive).
- `DELETE /countries/:name` — delete country by name.
- `GET /status` — return `{ total_countries, last_refreshed_at }`.
- `GET /countries/image` — serve cached `cache/summary.png`.

## Notes
- No `.env` is required on Railway; variables are injected by Railway.
- This project uses native `canvas`. Railway builds with Debian and should install native deps during build. A Dockerfile is not required but you can add one if needed.
