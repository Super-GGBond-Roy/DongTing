import fs from 'node:fs';
import path from 'node:path';

const DATA_DIR = path.resolve('data/languages');

let warnings = 0;
let errors = 0;

const langDirs = fs.readdirSync(DATA_DIR).filter((d) => {
  const full = path.join(DATA_DIR, d);
  return fs.statSync(full).isDirectory();
});

for (const langDir of langDirs) {
  console.log(`Checking audio in ${langDir}...`);
  const langPath = path.join(DATA_DIR, langDir);
  const entriesFile = path.join(langPath, 'entries.json');

  if (!fs.existsSync(entriesFile)) continue;

  const entries = JSON.parse(fs.readFileSync(entriesFile, 'utf-8'));

  for (const entry of entries) {
    if (!entry.audio) {
      console.error(`  ERROR: ${entry.id}: no audio entries`);
      errors++;
      continue;
    }

    const sourceKeys = entry.audio.map((a: { sourceKey: string }) => a.sourceKey);
    if (!sourceKeys.includes('source_a')) {
      console.error(`  ERROR: ${entry.id}: missing source_a`);
      errors++;
    }
    if (!sourceKeys.includes('source_b')) {
      console.error(`  ERROR: ${entry.id}: missing source_b`);
      errors++;
    }

    for (const aud of entry.audio) {
      const audPath = path.join(langPath, aud.path);
      if (!fs.existsSync(audPath)) {
        console.error(`  ERROR: ${entry.id}: missing ${aud.path}`);
        errors++;
        continue;
      }

      const ext = path.extname(aud.path).toLowerCase();
      if (ext !== '.mp3') {
        console.warn(`  WARN: ${entry.id}: ${aud.path} is not mp3 (${ext})`);
        warnings++;
      }

      const basename = path.basename(aud.path);
      if (/\s/.test(basename) || /[\u4e00-\u9fff]/.test(basename)) {
        console.warn(`  WARN: ${entry.id}: ${aud.path} filename contains spaces or Chinese characters`);
        warnings++;
      }
    }
  }
}

console.log(`\nAudio check complete: ${errors} errors, ${warnings} warnings`);
if (errors > 0) process.exit(1);
