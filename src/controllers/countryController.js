import { refreshCountries } from "../services/countryService.js";
import { db } from "../utils/db.js";
import fs from "fs";

export const refresh = async (req, res) => {
  try {
    const result = await refreshCountries();
    res.json(result);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};

export const getAll = async (req, res) => {
  const { region, currency, sort } = req.query;
  let query = "SELECT * FROM countries";
  const conditions = [];
  const params = [];

  if (region) {
    conditions.push("region = ?");
    params.push(region);
  }
  if (currency) {
    conditions.push("currency_code = ?");
    params.push(currency);
  }

  if (conditions.length) query += " WHERE " + conditions.join(" AND ");
  if (sort === "gdp_desc") query += " ORDER BY estimated_gdp DESC";

  const [rows] = await db.query(query, params);
  res.json(rows);
};

export const getOne = async (req, res) => {
  const [rows] = await db.query("SELECT * FROM countries WHERE name = ?", [req.params.name]);
  if (rows.length === 0) return res.status(404).json({ error: "Country not found" });
  res.json(rows[0]);
};

export const remove = async (req, res) => {
  const [result] = await db.query("DELETE FROM countries WHERE name = ?", [req.params.name]);
  if (result.affectedRows === 0) return res.status(404).json({ error: "Country not found" });
  res.json({ message: "Deleted successfully" });
};

export const status = async (req, res) => {
  const [[{ count }]] = await db.query("SELECT COUNT(*) as count FROM countries");
  const [meta] = await db.query("SELECT last_refreshed_at FROM meta");
  res.json({
    total_countries: count,
    last_refreshed_at: meta[0]?.last_refreshed_at || null,
  });
};

export const image = async (req, res) => {
  if (!fs.existsSync("cache/summary.png"))
    return res.status(404).json({ error: "Summary image not found" });

  res.sendFile("summary.png", { root: "cache" });
};
