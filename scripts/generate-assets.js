#!/usr/bin/env node
/**
 * Asset generation helper.
 * Requires: npm install -g sharp-cli
 *
 * Usage:
 *   node scripts/generate-assets.js --source ./assets/icon-master.png
 *
 * Generates all required icon and splash sizes for Android and iOS.
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const ASSETS_DIR = path.join(__dirname, '..', 'assets');

const androidIcons = [
  // Adaptive icon foreground (transparent background)
  { name: 'adaptive-icon.png', size: 1024 },
  // Legacy launcher icons
  { name: 'android/mipmap-mdpi/ic_launcher.png', size: 48 },
  { name: 'android/mipmap-hdpi/ic_launcher.png', size: 72 },
  { name: 'android/mipmap-xhdpi/ic_launcher.png', size: 96 },
  { name: 'android/mipmap-xxhdpi/ic_launcher.png', size: 144 },
  { name: 'android/mipmap-xxxhdpi/ic_launcher.png', size: 192 },
  // Play Store icon
  { name: 'android/play-store-icon.png', size: 512 },
  // Feature graphic (must be exactly 1024x500)
  // { name: 'android/feature-graphic.png', width: 1024, height: 500 },
];

const iosIcons = [
  { name: 'ios/icon-20.png', size: 20 },
  { name: 'ios/icon-20@2x.png', size: 40 },
  { name: 'ios/icon-20@3x.png', size: 60 },
  { name: 'ios/icon-29.png', size: 29 },
  { name: 'ios/icon-29@2x.png', size: 58 },
  { name: 'ios/icon-29@3x.png', size: 87 },
  { name: 'ios/icon-40.png', size: 40 },
  { name: 'ios/icon-40@2x.png', size: 80 },
  { name: 'ios/icon-40@3x.png', size: 120 },
  { name: 'ios/icon-60@2x.png', size: 120 },
  { name: 'ios/icon-60@3x.png', size: 180 },
  { name: 'ios/icon-76.png', size: 76 },
  { name: 'ios/icon-76@2x.png', size: 152 },
  { name: 'ios/icon-83.5@2x.png', size: 167 },
  { name: 'ios/icon-1024.png', size: 1024 },
];

const splashVariants = [
  { name: 'splash.png', width: 1242, height: 2688 },
  { name: 'android/splash-port-xxhdpi.png', width: 1080, height: 1920 },
  { name: 'android/splash-port-xxxhdpi.png', width: 1440, height: 2560 },
];

const sourceIcon = process.argv[3] || path.join(ASSETS_DIR, 'icon.png');
const sourceSplash = path.join(ASSETS_DIR, 'splash-master.png');

if (!fs.existsSync(sourceIcon)) {
  console.error(`Source icon not found: ${sourceIcon}`);
  console.log('Place your master icon (1024x1024 PNG, no alpha for iOS) at assets/icon.png');
  process.exit(1);
}

let sharpAvailable = false;
try {
  execSync('sharp --version', { stdio: 'ignore' });
  sharpAvailable = true;
} catch {
  console.warn('sharp-cli not found. Install with: npm install -g sharp-cli');
  console.log('\nRequired asset sizes:');
  console.log('\n=== Android Icons ===');
  androidIcons.forEach(i => console.log(`  ${i.name}: ${i.size}x${i.size}`));
  console.log('\n=== iOS Icons ===');
  iosIcons.forEach(i => console.log(`  ${i.name}: ${i.size}x${i.size}`));
  process.exit(0);
}

if (sharpAvailable) {
  const allIcons = [...androidIcons, ...iosIcons];
  allIcons.forEach(({ name, size }) => {
    const outPath = path.join(ASSETS_DIR, name);
    const dir = path.dirname(outPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    execSync(`sharp -i "${sourceIcon}" -o "${outPath}" resize ${size} ${size}`);
    console.log(`  Generated: ${name} (${size}x${size})`);
  });

  if (fs.existsSync(sourceSplash)) {
    splashVariants.forEach(({ name, width, height }) => {
      const outPath = path.join(ASSETS_DIR, name);
      const dir = path.dirname(outPath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      execSync(
        `sharp -i "${sourceSplash}" -o "${outPath}" resize ${width} ${height} --fit contain --background "#0A0E27"`
      );
      console.log(`  Generated: ${name} (${width}x${height})`);
    });
  }

  console.log('\nAll assets generated successfully.');
}
