import fs from 'node:fs';
import path from 'node:path';

const DATA_DIR = path.resolve('data/languages');
const MAX_SIZE_KB = 500;

let warnings = 0;
let errors = 0;

const langDirs = fs.readdirSync(DATA_DIR).filter((d) => {
  const full = path.join(DATA_DIR, d);
  return fs.statSync(full).isDirectory();
});

for (const langDir of langDirs) {
  console.log(`Checking images in ${langDir}...`);
  const langPath = path.join(DATA_DIR, langDir);
  const entriesFile = path.join(langPath, 'entries.json');

  if (!fs.existsSync(entriesFile)) continue;

  const entries = JSON.parse(fs.readFileSync(entriesFile, 'utf-8'));

  for (const entry of entries) {
    if (!entry.images) continue;
    for (const img of entry.images) {
      const imgPath = path.join(langPath, img.path);
      if (!fs.existsSync(imgPath)) {
        console.error(`  ERROR: ${entry.id}: missing ${img.path}`);
        errors++;
        continue;
      }

      const stat = fs.statSync(imgPath);
      const sizeKB = stat.size / 1024;

      if (sizeKB > MAX_SIZE_KB) {
        console.warn(`  WARN: ${entry.id}: ${img.path} is ${Math.round(sizeKB)}KB (max ${MAX_SIZE_KB}KB)`);
        warnings++;
      }

      const ext = path.extname(img.path).toLowerCase();
      if (!['.webp', '.jpg', '.jpeg', '.png'].includes(ext)) {
        console.warn(`  WARN: ${entry.id}: ${img.path} has unusual extension ${ext}`);
        warnings++;
      }
    }
  }
}

console.log(`\nImage check complete: ${errors} errors, ${warnings} warnings`);
if (errors > 0) process.exit(1);
