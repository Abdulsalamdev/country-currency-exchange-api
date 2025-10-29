import sharp from "sharp";
import { db } from "./db.js";

export async function generateSummaryImage() {
  const [countries] = await db.query("SELECT * FROM countries ORDER BY estimated_gdp DESC LIMIT 5");
  const [meta] = await db.query("SELECT last_refreshed_at FROM meta");

  const summary = `
Total Countries: ${countries.length}
Top 5 by GDP:
${countries.map(c => `- ${c.name} (${c.estimated_gdp.toFixed(2)})`).join("\n")}
Last Refresh: ${meta[0].last_refreshed_at}
`;

  await sharp({
    create: {
      width: 800,
      height: 400,
      channels: 3,
      background: "#fff"
    }
  })
    .composite([
      {
        input: Buffer.from(summary, "utf-8"),
        gravity: "northwest"
      }
    ])
    .toFile("cache/summary.png");
}
