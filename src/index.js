import express from 'express';
import dotenv from 'dotenv';
import db from './db.js';
import countriesRouter from './routes/countries.js';
import fs from 'fs';

dotenv.config();

const app = express();
app.use(express.json());

app.use('/countries', countriesRouter);

app.get('/status', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT COUNT(*) as total, MAX(last_refreshed_at) as last_refreshed_at FROM countries');
    const total = rows[0]?.total || 0;
    const last = rows[0]?.last_refreshed_at ? new Date(rows[0].last_refreshed_at).toISOString() : null;
    res.json({ total_countries: total, last_refreshed_at: last });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

const PORT = process.env.PORT || 5000;
const cacheDir = process.env.CACHE_DIR || 'cache';
if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });

async function start() {
  try {
    // Create table if not exists (simple migration)
    const migrationSql = fs.readFileSync('migrations/001-create-countries.sql', 'utf8');
    await db.query(migrationSql);

    await db.getConnection(); // verify connection
    console.log('✅ MySQL connected');

    app.listen(PORT, () => {
      console.log(`🚀 Server listening on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start', err);
    process.exit(1);
  }
}

start();
