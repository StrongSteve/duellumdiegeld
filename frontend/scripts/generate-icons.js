import sharp from 'sharp';
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const svgPath = join(__dirname, '../public/icon.svg');
const svg = readFileSync(svgPath);

const sizes = [192, 512];

async function generateIcons() {
  for (const size of sizes) {
    const outputPath = join(__dirname, `../public/icon-${size}.png`);
    await sharp(svg)
      .resize(size, size)
      .png()
      .toFile(outputPath);
    console.log(`Generated ${outputPath}`);
  }

  // Also generate apple-touch-icon
  const applePath = join(__dirname, '../public/apple-touch-icon.png');
  await sharp(svg)
    .resize(180, 180)
    .png()
    .toFile(applePath);
  console.log(`Generated ${applePath}`);
}

generateIcons().catch(console.error);
