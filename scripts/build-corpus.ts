import fs from 'node:fs';
import path from 'node:path';
import initSqlJs from 'sql.js';

interface LanguageJson {
  id: string;
  name: string;
  nativeName?: string;
  description?: string;
  region?: string;
  note?: string;
}

interface CategoryJson {
  id: string;
  name: string;
  description?: string;
  sortOrder?: number;
}

interface EntryImageJson {
  path: string;
  caption?: string;
  altText?: string;
}

interface EntryAudioJson {
  sourceKey: string;
  sourceName: string;
  path: string;
  speakerName?: string;
  speakerDescription?: string;
  dialectName?: string;
  speedLabel?: string;
  note?: string;
}

interface EntryJson {
  id: string;
  type?: string;
  original: string;
  transcription?: string;
  translation?: string;
  categoryId?: string;
  tags?: string[];
  shortDescription?: string;
  culturalNote?: string;
  exampleSentence?: string;
  exampleTranslation?: string;
  images?: EntryImageJson[];
  audio?: EntryAudioJson[];
}

const DATA_DIR = path.resolve('data/languages');
const OUTPUT_DIR = path.resolve('src-tauri/resources/corpus');
const OUTPUT_DB = path.join(OUTPUT_DIR, 'corpus.sqlite');

async function main() {
  console.log('Building corpus.sqlite...');

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const SQL = await initSqlJs();
  const db = new SQL.Database();

  db.run(`
    CREATE TABLE languages (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      native_name TEXT,
      description TEXT,
      region TEXT,
      note TEXT
    )
  `);

  db.run(`
    CREATE TABLE categories (
      id TEXT PRIMARY KEY,
      language_id TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      sort_order INTEGER DEFAULT 0,
      FOREIGN KEY (language_id) REFERENCES languages(id)
    )
  `);

  db.run(`
    CREATE TABLE entries (
      id TEXT PRIMARY KEY,
      language_id TEXT NOT NULL,
      entry_type TEXT NOT NULL DEFAULT 'word',
      text_original TEXT NOT NULL,
      text_transcription TEXT,
      text_translation TEXT,
      short_description TEXT,
      cultural_note TEXT,
      example_sentence TEXT,
      example_translation TEXT,
      category_id TEXT,
      tags TEXT,
      sort_order INTEGER DEFAULT 0,
      created_at TEXT,
      updated_at TEXT,
      FOREIGN KEY (language_id) REFERENCES languages(id),
      FOREIGN KEY (category_id) REFERENCES categories(id)
    )
  `);

  db.run(`
    CREATE TABLE entry_images (
      id TEXT PRIMARY KEY,
      entry_id TEXT NOT NULL,
      image_path TEXT NOT NULL,
      caption TEXT,
      alt_text TEXT,
      sort_order INTEGER DEFAULT 0,
      FOREIGN KEY (entry_id) REFERENCES entries(id) ON DELETE CASCADE
    )
  `);

  db.run(`
    CREATE TABLE entry_audio (
      id TEXT PRIMARY KEY,
      entry_id TEXT NOT NULL,
      source_key TEXT NOT NULL,
      source_name TEXT NOT NULL,
      audio_path TEXT NOT NULL,
      speaker_name TEXT,
      speaker_description TEXT,
      dialect_name TEXT,
      speed_label TEXT,
      note TEXT,
      sort_order INTEGER DEFAULT 0,
      FOREIGN KEY (entry_id) REFERENCES entries(id) ON DELETE CASCADE
    )
  `);

  db.run(`
    CREATE TABLE entry_search (
      entry_id TEXT PRIMARY KEY,
      text_original TEXT,
      text_transcription TEXT,
      text_translation TEXT,
      category_name TEXT,
      tags TEXT,
      short_description TEXT,
      cultural_note TEXT
    )
  `);

  db.run(`
    CREATE TABLE entry_search_plain (
      entry_id TEXT PRIMARY KEY,
      normalized_text TEXT NOT NULL
    )
  `);

  const langDirs = fs.readdirSync(DATA_DIR).filter((d) => {
    const full = path.join(DATA_DIR, d);
    return fs.statSync(full).isDirectory();
  });

  for (const langDir of langDirs) {
    const langPath = path.join(DATA_DIR, langDir);
    const langFile = path.join(langPath, 'language.json');
    const catsFile = path.join(langPath, 'categories.json');
    const entriesFile = path.join(langPath, 'entries.json');

    if (!fs.existsSync(langFile)) {
      console.warn(`Skipping ${langDir}: no language.json`);
      continue;
    }

    const lang: LanguageJson = JSON.parse(fs.readFileSync(langFile, 'utf-8'));
    db.run(
      'INSERT INTO languages (id, name, native_name, description, region, note) VALUES (?, ?, ?, ?, ?, ?)',
      [lang.id, lang.name, lang.nativeName || null, lang.description || null, lang.region || null, lang.note || null]
    );
    console.log(`  Language: ${lang.name}`);

    if (fs.existsSync(catsFile)) {
      const categories: CategoryJson[] = JSON.parse(fs.readFileSync(catsFile, 'utf-8'));
      for (const cat of categories) {
        db.run(
          'INSERT INTO categories (id, language_id, name, description, sort_order) VALUES (?, ?, ?, ?, ?)',
          [cat.id, lang.id, cat.name, cat.description || null, cat.sortOrder || 0]
        );
      }
      console.log(`  Categories: ${categories.length}`);
    }

    if (!fs.existsSync(entriesFile)) {
      console.warn(`  No entries.json found`);
      continue;
    }

    const entries: EntryJson[] = JSON.parse(fs.readFileSync(entriesFile, 'utf-8'));

    const imagesDir = path.join(OUTPUT_DIR, 'images');
    const audioDir = path.join(OUTPUT_DIR, 'audio');
    if (!fs.existsSync(imagesDir)) fs.mkdirSync(imagesDir, { recursive: true });
    if (!fs.existsSync(audioDir)) fs.mkdirSync(audioDir, { recursive: true });

    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i];
      const now = new Date().toISOString();

      db.run(
        `INSERT INTO entries (id, language_id, entry_type, text_original, text_transcription, text_translation,
         short_description, cultural_note, example_sentence, example_translation, category_id, tags, sort_order, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          entry.id,
          lang.id,
          entry.type || 'word',
          entry.original,
          entry.transcription || null,
          entry.translation || null,
          entry.shortDescription || null,
          entry.culturalNote || null,
          entry.exampleSentence || null,
          entry.exampleTranslation || null,
          entry.categoryId || null,
          entry.tags ? entry.tags.join(',') : null,
          i,
          now,
          now,
        ]
      );

      if (entry.images) {
        for (let j = 0; j < entry.images.length; j++) {
          const img = entry.images[j];
          const imgId = `${entry.id}_img_${j}`;
          db.run(
            'INSERT INTO entry_images (id, entry_id, image_path, caption, alt_text, sort_order) VALUES (?, ?, ?, ?, ?, ?)',
            [imgId, entry.id, img.path, img.caption || null, img.altText || null, j]
          );

          const srcImg = path.join(langPath, img.path);
          const dstImg = path.join(OUTPUT_DIR, img.path);
          if (fs.existsSync(srcImg)) {
            const dstDir = path.dirname(dstImg);
            if (!fs.existsSync(dstDir)) fs.mkdirSync(dstDir, { recursive: true });
            fs.copyFileSync(srcImg, dstImg);
          }
        }
      }

      if (entry.audio) {
        for (let j = 0; j < entry.audio.length; j++) {
          const aud = entry.audio[j];
          const audId = `${entry.id}_aud_${j}`;
          db.run(
            `INSERT INTO entry_audio (id, entry_id, source_key, source_name, audio_path, speaker_name, speaker_description, dialect_name, speed_label, note, sort_order)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              audId,
              entry.id,
              aud.sourceKey,
              aud.sourceName,
              aud.path,
              aud.speakerName || null,
              aud.speakerDescription || null,
              aud.dialectName || null,
              aud.speedLabel || null,
              aud.note || null,
              j,
            ]
          );

          const srcAud = path.join(langPath, aud.path);
          const dstAud = path.join(OUTPUT_DIR, aud.path);
          if (fs.existsSync(srcAud)) {
            const dstDir = path.dirname(dstAud);
            if (!fs.existsSync(dstDir)) fs.mkdirSync(dstDir, { recursive: true });
            fs.copyFileSync(srcAud, dstAud);
          }
        }
      }

      const plainText = [
        entry.original,
        entry.transcription || '',
        entry.translation || '',
        entry.tags ? entry.tags.join(' ') : '',
        entry.shortDescription || '',
        entry.culturalNote || '',
      ]
        .join(' ')
        .toLowerCase()
        .trim();

      db.run(
        'INSERT INTO entry_search (entry_id, text_original, text_transcription, text_translation, category_name, tags, short_description, cultural_note) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [
          entry.id,
          entry.original,
          entry.transcription || '',
          entry.translation || '',
          '',
          entry.tags ? entry.tags.join(',') : '',
          entry.shortDescription || '',
          entry.culturalNote || '',
        ]
      );

      db.run(
        'INSERT INTO entry_search_plain (entry_id, normalized_text) VALUES (?, ?)',
        [entry.id, plainText]
      );
    }

    console.log(`  Entries: ${entries.length}`);
  }

  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(OUTPUT_DB, buffer);
  console.log(`\nCorpus built: ${OUTPUT_DB} (${buffer.length} bytes)`);

  db.close();
}

main().catch((err) => {
  console.error('Build failed:', err);
  process.exit(1);
});
