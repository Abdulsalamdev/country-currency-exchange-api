import axios from "axios";
import { db } from "../utils/db.js";
import { getExchangeRates } from "./exchangeService.js";

export async function refreshCountries() {
  try {
    const [countries] = await axios.get(
      "https://restcountries.com/v2/all?fields=name,capital,region,population,flag,currencies"
    );
    const rates = await getExchangeRates();

    for (const country of countries.data) {
      const { name, capital, region, population, flag, currencies } = country;

      const currency_code = currencies?.[0]?.code || null;
      const exchange_rate = currency_code ? rates[currency_code] || null : null;
      const randomMultiplier = Math.floor(Math.random() * (2000 - 1000 + 1)) + 1000;

      const estimated_gdp =
        exchange_rate && population
          ? (population * randomMultiplier) / exchange_rate
          : 0;

      await db.query(
        `INSERT INTO countries (name, capital, region, population, currency_code, exchange_rate, estimated_gdp, flag_url, last_refreshed_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
         ON DUPLICATE KEY UPDATE
         capital = VALUES(capital),
         region = VALUES(region),
         population = VALUES(population),
         currency_code = VALUES(currency_code),
         exchange_rate = VALUES(exchange_rate),
         estimated_gdp = VALUES(estimated_gdp),
         flag_url = VALUES(flag_url),
         last_refreshed_at = NOW()`,
        [name, capital, region, population, currency_code, exchange_rate, estimated_gdp, flag]
      );
    }

    await db.query(
      `INSERT INTO meta (id, last_refreshed_at) VALUES (1, NOW())
       ON DUPLICATE KEY UPDATE last_refreshed_at = NOW()`
    );

    return { message: "Countries refreshed successfully" };
  } catch (err) {
    throw err.message.includes("exchange")
      ? { status: 503, message: "External data source unavailable" }
      : { status: 500, message: "Internal server error" };
  }
}
