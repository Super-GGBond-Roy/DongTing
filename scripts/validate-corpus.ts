import fs from 'node:fs';
import path from 'node:path';

interface EntryJson {
  id: string;
  original: string;
  transcription?: string;
  translation?: string;
  categoryId?: string;
  tags?: string[];
  images?: { path: string }[];
  audio?: { sourceKey: string; path: string }[];
}

const DATA_DIR = path.resolve('data/languages');
let errors = 0;

function err(msg: string) {
  console.error(`  ERROR: ${msg}`);
  errors++;
}

function warn(msg: string) {
  console.warn(`  WARN: ${msg}`);
}

const langDirs = fs.readdirSync(DATA_DIR).filter((d) => {
  const full = path.join(DATA_DIR, d);
  return fs.statSync(full).isDirectory();
});

for (const langDir of langDirs) {
  console.log(`Validating ${langDir}...`);
  const langPath = path.join(DATA_DIR, langDir);

  const langFile = path.join(langPath, 'language.json');
  if (!fs.existsSync(langFile)) {
    err('Missing language.json');
    continue;
  }

  const lang = JSON.parse(fs.readFileSync(langFile, 'utf-8'));
  if (!lang.id) err('language.json: missing id');
  if (!lang.name) err('language.json: missing name');

  const catsFile = path.join(langPath, 'categories.json');
  if (fs.existsSync(catsFile)) {
    const cats = JSON.parse(fs.readFileSync(catsFile, 'utf-8'));
    const catIds = new Set<string>();
    for (const cat of cats) {
      if (!cat.id) err('categories.json: entry missing id');
      if (!cat.name) err('categories.json: entry missing name');
      if (catIds.has(cat.id)) err(`categories.json: duplicate id ${cat.id}`);
      catIds.add(cat.id);
    }
  }

  const entriesFile = path.join(langPath, 'entries.json');
  if (!fs.existsSync(entriesFile)) {
    warn('No entries.json');
    continue;
  }

  const entries: EntryJson[] = JSON.parse(fs.readFileSync(entriesFile, 'utf-8'));
  const entryIds = new Set<string>();

  for (const entry of entries) {
    if (!entry.id) err(`Entry missing id`);
    if (entryIds.has(entry.id)) err(`Duplicate entry id: ${entry.id}`);
    entryIds.add(entry.id);

    if (!entry.original || entry.original.trim() === '') {
      err(`${entry.id}: original text is empty`);
    }

    if (!entry.images || entry.images.length === 0) {
      err(`${entry.id}: no images`);
    } else {
      for (const img of entry.images) {
        const imgPath = path.join(langPath, img.path);
        if (!fs.existsSync(imgPath)) {
          err(`${entry.id}: image not found: ${img.path}`);
        }
      }
    }

    if (!entry.audio || entry.audio.length === 0) {
      err(`${entry.id}: no audio`);
    } else {
      const sourceKeys = entry.audio.map((a) => a.sourceKey);
      if (!sourceKeys.includes('source_a')) {
        err(`${entry.id}: missing source_a audio`);
      }
      if (!sourceKeys.includes('source_b')) {
        err(`${entry.id}: missing source_b audio`);
      }
      for (const aud of entry.audio) {
        const audPath = path.join(langPath, aud.path);
        if (!fs.existsSync(audPath)) {
          err(`${entry.id}: audio not found: ${aud.path}`);
        }
      }
    }
  }

  console.log(`  Entries validated: ${entries.length}`);
}

if (errors > 0) {
  console.error(`\nValidation failed with ${errors} error(s)`);
  process.exit(1);
} else {
  console.log('\nValidation passed');
}
