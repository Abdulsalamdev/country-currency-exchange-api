import axios from 'axios';
import db from '../db.js';
import { generateSummaryImage } from '../utils/imageGenerator.js';
import fs from 'fs';
import path from 'path';

const COUNTRIES_API = 'https://restcountries.com/v2/all?fields=name,capital,region,population,flag,currencies';
const EXCHANGE_API = 'https://open.er-api.com/v6/latest/USD';
const HTTP_TIMEOUT = parseInt(process.env.HTTP_TIMEOUT || '15000', 10);
const axiosInstance = axios.create({ timeout: HTTP_TIMEOUT });

function validationError(details) {
  return { status: 400, body: { error: 'Validation failed', details } };
}

export async function refreshHandler(req, res) {
  // Fetch external APIs first
  let countriesData, exchangeData;
  try {
    const [cResp, eResp] = await Promise.all([
      axiosInstance.get(COUNTRIES_API),
      axiosInstance.get(EXCHANGE_API)
    ]);
    countriesData = cResp.data;
    exchangeData = eResp.data;
    if (!exchangeData || !exchangeData.rates) throw new Error('Bad exchange data');
  } catch (err) {
    console.error('External API error', err.message || err);
    return res.status(503).json({ error: 'External data source unavailable', details: 'Could not fetch data from external APIs' });
  }

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const rates = exchangeData.rates || {};
    const now = new Date();

    for (const c of countriesData) {
      const name = c.name?.trim();
      const population = Number(c.population || 0);
      const capital = c.capital || null;
      const region = c.region || null;
      const flag_url = c.flag || null;

      let currency_code = null;
      if (Array.isArray(c.currencies) && c.currencies.length > 0) {
        currency_code = c.currencies[0].code || c.currencies[0].currency || null;
      }

      let exchange_rate = null;
      let estimated_gdp = null;

      if (currency_code) {
        const rate = rates[currency_code];
        if (typeof rate === 'number') {
          exchange_rate = rate;
          const randMultiplier = Math.floor(Math.random() * 1001) + 1000; // 1000-2000
          estimated_gdp = (population * randMultiplier) / exchange_rate;
        } else {
          exchange_rate = null;
          estimated_gdp = null;
        }
      } else {
        currency_code = null;
        exchange_rate = null;
        estimated_gdp = 0;
      }

      if (!name || !population) {
        // skip invalid external record
        continue;
      }

      const name_lc = name.toLowerCase();

      // Upsert: insert or update based on unique name_lc
      const sql = `
        INSERT INTO countries
        (name, name_lc, capital, region, population, currency_code, exchange_rate, estimated_gdp, flag_url, last_refreshed_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          name = VALUES(name),
          capital = VALUES(capital),
          region = VALUES(region),
          population = VALUES(population),
          currency_code = VALUES(currency_code),
          exchange_rate = VALUES(exchange_rate),
          estimated_gdp = VALUES(estimated_gdp),
          flag_url = VALUES(flag_url),
          last_refreshed_at = VALUES(last_refreshed_at);
      `;
      await conn.query(sql, [name, name_lc, capital, region, population, currency_code, exchange_rate, estimated_gdp, flag_url, now]);
    }

    await conn.commit();

    // generate summary image
    const [rows] = await conn.query('SELECT COUNT(*) as total FROM countries');
    const total = rows[0]?.total || 0;
    const [top5rows] = await conn.query('SELECT name, estimated_gdp FROM countries ORDER BY estimated_gdp DESC LIMIT 5');

    const summary = {
      total,
      top5: top5rows.map(r => ({ name: r.name, estimated_gdp: r.estimated_gdp })),
      last_refreshed_at: new Date().toISOString()
    };

    const cacheDir = process.env.CACHE_DIR || 'cache';
    const outPath = path.join(cacheDir, 'summary.png');
    await generateSummaryImage(summary, outPath);

    return res.json({ ok: true, total_countries: total, last_refreshed_at: summary.last_refreshed_at });
  } catch (err) {
    console.error('Refresh failed', err);
    try { await conn.rollback(); } catch (e) { console.error('Rollback failed', e); }
    return res.status(500).json({ error: 'Internal server error' });
  } finally {
    conn.release();
  }
}

export async function listHandler(req, res) {
  try {
    const { region, currency, sort } = req.query;
    const where = [];
    const params = [];

    if (region) { where.push('region = ?'); params.push(region); }
    if (currency) { where.push('currency_code = ?'); params.push(currency); }

    let sql = 'SELECT id, name, capital, region, population, currency_code, exchange_rate, estimated_gdp, flag_url, last_refreshed_at FROM countries';
    if (where.length) sql += ' WHERE ' + where.join(' AND ');
    if (sort === 'gdp_desc') sql += ' ORDER BY estimated_gdp DESC';

    const [rows] = await db.query(sql, params);
    return res.json(rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getOneHandler(req, res) {
  try {
    const name = req.params.name;
    const name_lc = name.toLowerCase();
    const [rows] = await db.query('SELECT * FROM countries WHERE name_lc = ? LIMIT 1', [name_lc]);
    if (!rows.length) return res.status(404).json({ error: 'Country not found' });
    return res.json(rows[0]);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function deleteHandler(req, res) {
  try {
    const name = req.params.name;
    const name_lc = name.toLowerCase();
    const [result] = await db.query('DELETE FROM countries WHERE name_lc = ?', [name_lc]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Country not found' });
    return res.json({ ok: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function statusHandler(req, res) {
  try {
    const [rows] = await db.query('SELECT COUNT(*) as total, MAX(last_refreshed_at) as last_refreshed_at FROM countries');
    const total = rows[0]?.total || 0;
    const last = rows[0]?.last_refreshed_at ? new Date(rows[0].last_refreshed_at).toISOString() : null;
    return res.json({ total_countries: total, last_refreshed_at: last });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function imageHandler(req, res) {
  try {
    const cacheDir = process.env.CACHE_DIR || 'cache';
    const filePath = path.join(cacheDir, 'summary.png');
    if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'Summary image not found' });
    return res.sendFile(path.resolve(filePath));
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
