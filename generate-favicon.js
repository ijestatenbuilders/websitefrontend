const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const inputFile = path.join(__dirname, 'public', 'logo.jpg');
const publicDir = path.join(__dirname, 'public');

async function generateFavicons() {
  try {
    console.log('Generating favicon files...');

    // Generate favicon.ico (32x32)
    await sharp(inputFile)
      .resize(32, 32, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
      .png()
      .toFile(path.join(publicDir, 'favicon-32x32.png'));
    console.log('✓ Created favicon-32x32.png');

    // Generate favicon-16x16.png
    await sharp(inputFile)
      .resize(16, 16, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
      .png()
      .toFile(path.join(publicDir, 'favicon-16x16.png'));
    console.log('✓ Created favicon-16x16.png');

    // Generate apple-touch-icon.png (180x180)
    await sharp(inputFile)
      .resize(180, 180, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
      .png()
      .toFile(path.join(publicDir, 'apple-touch-icon.png'));
    console.log('✓ Created apple-touch-icon.png');

    // Generate android-chrome-192x192.png
    await sharp(inputFile)
      .resize(192, 192, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
      .png()
      .toFile(path.join(publicDir, 'android-chrome-192x192.png'));
    console.log('✓ Created android-chrome-192x192.png');

    // Generate android-chrome-512x512.png
    await sharp(inputFile)
      .resize(512, 512, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
      .png()
      .toFile(path.join(publicDir, 'android-chrome-512x512.png'));
    console.log('✓ Created android-chrome-512x512.png');

    // Copy favicon-32x32.png as favicon.ico equivalent
    fs.copyFileSync(
      path.join(publicDir, 'favicon-32x32.png'),
      path.join(publicDir, 'favicon.png')
    );
    console.log('✓ Created favicon.png');

    console.log('\n✅ All favicon files generated successfully!');
    console.log('\nGenerated files:');
    console.log('  - favicon-16x16.png');
    console.log('  - favicon-32x32.png');
    console.log('  - favicon.png');
    console.log('  - apple-touch-icon.png');
    console.log('  - android-chrome-192x192.png');
    console.log('  - android-chrome-512x512.png');
  } catch (error) {
    console.error('Error generating favicons:', error);
    process.exit(1);
  }
}

generateFavicons();
