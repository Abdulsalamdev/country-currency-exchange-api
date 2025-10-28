import express from 'express';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import countryRoutes from './routes/countryRoutes.js';
import db from './config/database.js';

dotenv.config();

const app = express();
app.use(express.json());

const cacheDir = process.env.CACHE_DIR || 'cache';
if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });

app.use('/countries', countryRoutes);

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

async function start() {
  try {
    const migrationSql = fs.readFileSync(path.join('migrations','001-create-countries.sql'),'utf8');
    await db.query(migrationSql);
    console.log('✅ Migration executed (table ensured)');

    const conn = await db.getConnection();
    conn.release();
    console.log('✅ MySQL connection OK');

    app.listen(PORT, () => {
      console.log('🚀 Server listening on port', PORT);
    });
  } catch (err) {
    console.error('Failed to start', err);
    process.exit(1);
  }
}

start();
