import { createCanvas } from 'canvas';
import fs from 'fs';
import path from 'path';

export async function generateSummaryImage(summary, outPath) {
  const width = 1200;
  const height = 630;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);

  // Title
  ctx.fillStyle = '#111111';
  ctx.font = 'bold 36px Sans';
  ctx.fillText('Countries Summary', 40, 70);

  // Timestamp & total
  ctx.font = '16px Sans';
  ctx.fillText(`Last refresh: ${summary.last_refreshed_at}`, 40, 110);
  ctx.fillText(`Total countries: ${summary.total}`, 40, 140);

  // Top 5
  ctx.font = '20px Sans';
  ctx.fillText('Top 5 by estimated GDP', 40, 190);

  ctx.font = '18px Sans';
  let y = 230;
  summary.top5.forEach((t, i) => {
    const gdp = t.estimated_gdp ? Number(t.estimated_gdp).toLocaleString(undefined, { maximumFractionDigits: 2 }) : 'N/A';
    ctx.fillText(`${i + 1}. ${t.name} — ${gdp}`, 60, y);
    y += 36;
  });

  const dir = path.dirname(outPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const buffer = canvas.toBuffer('image/png');
  await fs.promises.writeFile(outPath, buffer);
}
