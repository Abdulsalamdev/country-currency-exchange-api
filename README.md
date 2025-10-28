# Country Currency & Exchange API (Option B — No image)

Deploy-ready Node.js + Express API that implements the HNG backend task except image generation (disabled).
Designed for deployment on Railway with MySQL.

## Endpoints
- POST /countries/refresh
- GET /countries
- GET /countries?region=Africa&currency=NGN&sort=gdp_desc
- GET /countries/:name
- DELETE /countries/:name
- GET /status
- GET /countries/image  -> returns {"error":"Summary image generation disabled"}

## Deploy on Railway
1. Push this repo to GitHub.
2. Create a new Railway project → Deploy from GitHub.
3. Add MySQL plugin to the Railway project.
4. Railway will inject:
   MYSQL_HOST, MYSQL_PORT, MYSQL_USER, MYSQL_PASSWORD, MYSQL_DATABASE
5. Add a project variable: PORT=5000
6. Deploy — Railway will run `npm install` and `npm start`.

## Notes
- Node version: 20.x
- No native dependencies; canvas/summary image generation is disabled to ensure smooth Railway builds.
