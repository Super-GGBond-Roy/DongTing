use rusqlite::params;
use crate::database::connection::Database;
use crate::database::models::*;

impl Database {
    pub fn get_languages(&self) -> Result<Vec<Language>, String> {
        let conn = self.conn();
        let mut stmt = conn
            .prepare("SELECT id, name, native_name, description, region, note FROM languages")
            .map_err(|e| format!("Failed to prepare statement: {}", e))?;

        let rows = stmt
            .query_map([], |row| {
                Ok(Language {
                    id: row.get(0)?,
                    name: row.get(1)?,
                    native_name: row.get(2)?,
                    description: row.get(3)?,
                    region: row.get(4)?,
                    note: row.get(5)?,
                })
            })
            .map_err(|e| format!("Failed to query languages: {}", e))?;

        let mut languages = Vec::new();
        for row in rows {
            languages.push(row.map_err(|e| format!("Failed to read row: {}", e))?);
        }
        Ok(languages)
    }

    pub fn get_categories(&self, language_id: &str) -> Result<Vec<Category>, String> {
        let conn = self.conn();
        let mut stmt = conn
            .prepare(
                "SELECT id, language_id, name, description, sort_order FROM categories WHERE language_id = ?1 ORDER BY sort_order",
            )
            .map_err(|e| format!("Failed to prepare statement: {}", e))?;

        let rows = stmt
            .query_map(params![language_id], |row| {
                Ok(Category {
                    id: row.get(0)?,
                    language_id: row.get(1)?,
                    name: row.get(2)?,
                    description: row.get(3)?,
                    sort_order: row.get(4)?,
                })
            })
            .map_err(|e| format!("Failed to query categories: {}", e))?;

        let mut categories = Vec::new();
        for row in rows {
            categories.push(row.map_err(|e| format!("Failed to read row: {}", e))?);
        }
        Ok(categories)
    }

    pub fn list_entries(&self, category_id: Option<&str>) -> Result<Vec<EntrySummary>, String> {
        let conn = self.conn();

        let mut stmt = if category_id.is_some() {
            conn.prepare(
                "SELECT e.id, e.language_id, e.entry_type, e.text_original, e.text_transcription,
                        e.text_translation, e.short_description, e.category_id, c.name as category_name, e.tags,
                        (SELECT ei.image_path FROM entry_images ei WHERE ei.entry_id = e.id ORDER BY ei.sort_order LIMIT 1) as main_image_path
                 FROM entries e
                 LEFT JOIN categories c ON e.category_id = c.id
                 WHERE e.category_id = ?1
                 ORDER BY e.sort_order ASC",
            )
        } else {
            conn.prepare(
                "SELECT e.id, e.language_id, e.entry_type, e.text_original, e.text_transcription,
                        e.text_translation, e.short_description, e.category_id, c.name as category_name, e.tags,
                        (SELECT ei.image_path FROM entry_images ei WHERE ei.entry_id = e.id ORDER BY ei.sort_order LIMIT 1) as main_image_path
                 FROM entries e
                 LEFT JOIN categories c ON e.category_id = c.id
                 ORDER BY e.sort_order ASC",
            )
        }
        .map_err(|e| format!("Failed to prepare statement: {}", e))?;

        let mut entries = Vec::new();

        if let Some(cid) = category_id {
            let rows = stmt
                .query_map(params![cid], |row| {
                    Ok(EntrySummary {
                        id: row.get(0)?,
                        language_id: row.get(1)?,
                        entry_type: row.get(2)?,
                        text_original: row.get(3)?,
                        text_transcription: row.get(4)?,
                        text_translation: row.get(5)?,
                        short_description: row.get(6)?,
                        category_id: row.get(7)?,
                        category_name: row.get(8)?,
                        tags: row.get(9)?,
                        main_image_path: row.get(10)?,
                        audio: Vec::new(),
                    })
                })
                .map_err(|e| format!("Failed to query entries: {}", e))?;

            for row in rows {
                let mut entry = row.map_err(|e| format!("Failed to read row: {}", e))?;
                entry.audio = self.get_entry_audio_summary(&entry.id)?;
                entries.push(entry);
            }
        } else {
            let rows = stmt
                .query_map([], |row| {
                    Ok(EntrySummary {
                        id: row.get(0)?,
                        language_id: row.get(1)?,
                        entry_type: row.get(2)?,
                        text_original: row.get(3)?,
                        text_transcription: row.get(4)?,
                        text_translation: row.get(5)?,
                        short_description: row.get(6)?,
                        category_id: row.get(7)?,
                        category_name: row.get(8)?,
                        tags: row.get(9)?,
                        main_image_path: row.get(10)?,
                        audio: Vec::new(),
                    })
                })
                .map_err(|e| format!("Failed to query entries: {}", e))?;

            for row in rows {
                let mut entry = row.map_err(|e| format!("Failed to read row: {}", e))?;
                entry.audio = self.get_entry_audio_summary(&entry.id)?;
                entries.push(entry);
            }
        }

        Ok(entries)
    }

    fn get_entry_audio_summary(&self, entry_id: &str) -> Result<Vec<EntryAudioSummary>, String> {
        let conn = self.conn();
        let mut stmt = conn
            .prepare(
                "SELECT id, source_key, source_name, audio_path FROM entry_audio WHERE entry_id = ?1 ORDER BY sort_order",
            )
            .map_err(|e| format!("Failed to prepare audio statement: {}", e))?;

        let rows = stmt
            .query_map(params![entry_id], |row| {
                Ok(EntryAudioSummary {
                    id: row.get(0)?,
                    source_key: row.get(1)?,
                    source_name: row.get(2)?,
                    audio_path: row.get(3)?,
                })
            })
            .map_err(|e| format!("Failed to query audio: {}", e))?;

        let mut audio = Vec::new();
        for row in rows {
            audio.push(row.map_err(|e| format!("Failed to read audio row: {}", e))?);
        }
        Ok(audio)
    }

    pub fn get_entry_detail(&self, entry_id: &str) -> Result<EntryDetail, String> {
        let conn = self.conn();
        let mut stmt = conn
            .prepare(
                "SELECT e.id, e.language_id, e.entry_type, e.text_original, e.text_transcription,
                        e.text_translation, e.short_description, e.cultural_note, e.example_sentence,
                        e.example_translation, e.category_id, c.name as category_name, e.tags
                 FROM entries e
                 LEFT JOIN categories c ON e.category_id = c.id
                 WHERE e.id = ?1",
            )
            .map_err(|e| format!("Failed to prepare statement: {}", e))?;

        let entry = stmt
            .query_row(params![entry_id], |row| {
                Ok(EntryDetail {
                    id: row.get(0)?,
                    language_id: row.get(1)?,
                    entry_type: row.get(2)?,
                    text_original: row.get(3)?,
                    text_transcription: row.get(4)?,
                    text_translation: row.get(5)?,
                    short_description: row.get(6)?,
                    cultural_note: row.get(7)?,
                    example_sentence: row.get(8)?,
                    example_translation: row.get(9)?,
                    category_id: row.get(10)?,
                    category_name: row.get(11)?,
                    tags: row.get(12)?,
                    images: Vec::new(),
                    audio: Vec::new(),
                })
            })
            .map_err(|e| format!("Entry not found: {}", e))?;

        let mut detail = entry;
        detail.images = self.get_entry_images(entry_id)?;
        detail.audio = self.get_entry_audio(entry_id)?;
        Ok(detail)
    }

    fn get_entry_images(&self, entry_id: &str) -> Result<Vec<EntryImage>, String> {
        let conn = self.conn();
        let mut stmt = conn
            .prepare(
                "SELECT id, entry_id, image_path, caption, alt_text, sort_order FROM entry_images WHERE entry_id = ?1 ORDER BY sort_order",
            )
            .map_err(|e| format!("Failed to prepare images statement: {}", e))?;

        let rows = stmt
            .query_map(params![entry_id], |row| {
                Ok(EntryImage {
                    id: row.get(0)?,
                    entry_id: row.get(1)?,
                    image_path: row.get(2)?,
                    caption: row.get(3)?,
                    alt_text: row.get(4)?,
                    sort_order: row.get(5)?,
                })
            })
            .map_err(|e| format!("Failed to query images: {}", e))?;

        let mut images = Vec::new();
        for row in rows {
            images.push(row.map_err(|e| format!("Failed to read image row: {}", e))?);
        }
        Ok(images)
    }

    fn get_entry_audio(&self, entry_id: &str) -> Result<Vec<EntryAudio>, String> {
        let conn = self.conn();
        let mut stmt = conn
            .prepare(
                "SELECT id, entry_id, source_key, source_name, audio_path, speaker_name, speaker_description, dialect_name, speed_label, note, sort_order FROM entry_audio WHERE entry_id = ?1 ORDER BY sort_order",
            )
            .map_err(|e| format!("Failed to prepare audio statement: {}", e))?;

        let rows = stmt
            .query_map(params![entry_id], |row| {
                Ok(EntryAudio {
                    id: row.get(0)?,
                    entry_id: row.get(1)?,
                    source_key: row.get(2)?,
                    source_name: row.get(3)?,
                    audio_path: row.get(4)?,
                    speaker_name: row.get(5)?,
                    speaker_description: row.get(6)?,
                    dialect_name: row.get(7)?,
                    speed_label: row.get(8)?,
                    note: row.get(9)?,
                    sort_order: row.get(10)?,
                })
            })
            .map_err(|e| format!("Failed to query audio: {}", e))?;

        let mut audio = Vec::new();
        for row in rows {
            audio.push(row.map_err(|e| format!("Failed to read audio row: {}", e))?);
        }
        Ok(audio)
    }

    pub fn search_entries(&self, query: &str) -> Result<Vec<EntrySummary>, String> {
        let conn = self.conn();
        let normalized_query = query.trim().to_lowercase();
        let like_pattern = format!("%{}%", normalized_query);

        let mut stmt = conn
            .prepare(
                "SELECT DISTINCT e.id, e.language_id, e.entry_type, e.text_original, e.text_transcription,
                        e.text_translation, e.short_description, e.category_id, c.name as category_name, e.tags,
                        (SELECT ei.image_path FROM entry_images ei WHERE ei.entry_id = e.id ORDER BY ei.sort_order LIMIT 1) as main_image_path
                 FROM entries e
                 LEFT JOIN categories c ON e.category_id = c.id
                 LEFT JOIN entry_search_plain s ON s.entry_id = e.id
                 LEFT JOIN entry_search es ON es.entry_id = e.id
                 WHERE s.normalized_text LIKE ?1
                    OR LOWER(e.text_original) LIKE ?1
                    OR LOWER(e.text_transcription) LIKE ?1
                    OR LOWER(e.text_translation) LIKE ?1
                    OR LOWER(e.tags) LIKE ?1
                    OR LOWER(e.short_description) LIKE ?1
                    OR LOWER(e.cultural_note) LIKE ?1
                    OR LOWER(es.text_original) LIKE ?1
                    OR LOWER(es.text_transcription) LIKE ?1
                    OR LOWER(es.text_translation) LIKE ?1
                    OR LOWER(es.tags) LIKE ?1
                    OR LOWER(es.short_description) LIKE ?1
                    OR LOWER(es.cultural_note) LIKE ?1
                 ORDER BY e.sort_order ASC
                 LIMIT 100",
            )
            .map_err(|e| format!("Failed to prepare search statement: {}", e))?;

        let entry_iter = stmt
            .query_map(params![like_pattern], |row| {
                Ok(EntrySummary {
                    id: row.get(0)?,
                    language_id: row.get(1)?,
                    entry_type: row.get(2)?,
                    text_original: row.get(3)?,
                    text_transcription: row.get(4)?,
                    text_translation: row.get(5)?,
                    short_description: row.get(6)?,
                    category_id: row.get(7)?,
                    category_name: row.get(8)?,
                    tags: row.get(9)?,
                    main_image_path: row.get(10)?,
                    audio: Vec::new(),
                })
            })
            .map_err(|e| format!("Failed to search entries: {}", e))?;

        let mut entries = Vec::new();
        for row in entry_iter {
            let mut entry = row.map_err(|e| format!("Failed to read row: {}", e))?;
            entry.audio = self.get_entry_audio_summary(&entry.id)?;
            entries.push(entry);
        }

        Ok(entries)
    }
}
