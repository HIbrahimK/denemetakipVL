// Generate PWA icons for landing page
// Run: node generate-icons.js

const fs = require('fs');
const path = require('path');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const iconsDir = path.join(__dirname, 'public', 'icons');

// Ensure directory exists
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

function generateSvg(size) {
  const fontSize = Math.round(size * 0.35);
  const subFontSize = Math.round(size * 0.12);
  const radius = Math.round(size * 0.15);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#3b82f6"/>
      <stop offset="100%" style="stop-color:#1d4ed8"/>
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" rx="${radius}" fill="url(#bg)"/>
  <text x="50%" y="45%" text-anchor="middle" dominant-baseline="middle" font-family="Arial,sans-serif" font-weight="bold" font-size="${fontSize}" fill="white">DT</text>
  <text x="50%" y="72%" text-anchor="middle" dominant-baseline="middle" font-family="Arial,sans-serif" font-weight="500" font-size="${subFontSize}" fill="rgba(255,255,255,0.85)">TAKİP</text>
</svg>`;
}

// Try to use Sharp if available (from backend), otherwise save SVGs
let useSharp = false;
let sharp;
try {
  // Try loading sharp from backend node_modules
  sharp = require(path.join(__dirname, '..', 'backend', 'node_modules', 'sharp'));
  useSharp = true;
  console.log('Using Sharp for PNG generation');
} catch {
  try {
    sharp = require('sharp');
    useSharp = true;
    console.log('Using local Sharp for PNG generation');
  } catch {
    console.log('Sharp not found. Generating SVG icons instead.');
  }
}

async function generateIcons() {
  for (const size of sizes) {
    const svg = generateSvg(size);
    const filename = `icon-${size}x${size}`;

    if (useSharp) {
      try {
        await sharp(Buffer.from(svg))
          .resize(size, size)
          .png()
          .toFile(path.join(iconsDir, `${filename}.png`));
        console.log(`✓ Generated ${filename}.png`);
      } catch (err) {
        console.error(`✗ Failed ${filename}.png:`, err.message);
        // Fallback to SVG
        fs.writeFileSync(path.join(iconsDir, `${filename}.svg`), svg);
        console.log(`  → Saved ${filename}.svg as fallback`);
      }
    } else {
      fs.writeFileSync(path.join(iconsDir, `${filename}.svg`), svg);
      console.log(`✓ Generated ${filename}.svg`);
    }
  }

  // Also generate apple-touch-icon
  const appleSvg = generateSvg(180);
  if (useSharp) {
    try {
      await sharp(Buffer.from(appleSvg))
        .resize(180, 180)
        .png()
        .toFile(path.join(iconsDir, 'apple-touch-icon.png'));
      console.log('✓ Generated apple-touch-icon.png');
    } catch {
      fs.writeFileSync(path.join(iconsDir, 'apple-touch-icon.svg'), appleSvg);
    }
  }

  // Generate favicon
  const faviconSvg = generateSvg(32);
  if (useSharp) {
    try {
      await sharp(Buffer.from(faviconSvg))
        .resize(32, 32)
        .png()
        .toFile(path.join(__dirname, 'public', 'favicon.png'));
      console.log('✓ Generated favicon.png');
    } catch {}
  }

  console.log('\nDone! Icons generated in public/icons/');
}

generateIcons().catch(console.error);
