const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const logoPath = path.join(__dirname, 'public', 'logo.jpg');
const publicDir = path.join(__dirname, 'public');

async function generateFavicons() {
  try {
    console.log('🎨 Converting logo.jpg to favicon files...\n');

    // Read the logo
    const logoBuffer = fs.readFileSync(logoPath);

    // Generate favicon.ico (32x32)
    await sharp(logoBuffer)
      .resize(32, 32, { fit: 'cover' })
      .toFormat('png')
      .toFile(path.join(publicDir, 'favicon-32.png'));
    console.log('✓ Generated favicon-32.png');

    // Generate favicon-96x96.png
    await sharp(logoBuffer)
      .resize(96, 96, { fit: 'cover' })
      .toFormat('png')
      .toFile(path.join(publicDir, 'favicon-96x96.png'));
    console.log('✓ Generated favicon-96x96.png');

    // Generate apple-touch-icon.png (180x180)
    await sharp(logoBuffer)
      .resize(180, 180, { fit: 'cover' })
      .toFormat('png')
      .toFile(path.join(publicDir, 'apple-touch-icon.png'));
    console.log('✓ Generated apple-touch-icon.png');

    // Generate web-app-manifest icons
    await sharp(logoBuffer)
      .resize(192, 192, { fit: 'cover' })
      .toFormat('png')
      .toFile(path.join(publicDir, 'web-app-manifest-192x192.png'));
    console.log('✓ Generated web-app-manifest-192x192.png');

    await sharp(logoBuffer)
      .resize(512, 512, { fit: 'cover' })
      .toFormat('png')
      .toFile(path.join(publicDir, 'web-app-manifest-512x512.png'));
    console.log('✓ Generated web-app-manifest-512x512.png');

    // Generate SVG version (copy and resize)
    await sharp(logoBuffer)
      .resize(256, 256, { fit: 'cover' })
      .toFormat('png')
      .toFile(path.join(publicDir, 'favicon.png'));
    console.log('✓ Generated favicon.png');

    console.log('\n✅ All favicon files generated successfully!\n');
    console.log('⚠️  Note: favicon.ico cannot be generated from Node.js easily.');
    console.log('   The build process will use favicon.png as fallback.\n');

  } catch (error) {
    console.error('❌ Error generating favicons:', error);
    process.exit(1);
  }
}

generateFavicons();
