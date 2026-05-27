use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Language {
    pub id: String,
    pub name: String,
    pub native_name: Option<String>,
    pub description: Option<String>,
    pub region: Option<String>,
    pub note: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Category {
    pub id: String,
    pub language_id: String,
    pub name: String,
    pub description: Option<String>,
    pub sort_order: i32,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct EntrySummary {
    pub id: String,
    pub language_id: String,
    pub entry_type: String,
    pub text_original: String,
    pub text_transcription: Option<String>,
    pub text_translation: Option<String>,
    pub short_description: Option<String>,
    pub category_id: Option<String>,
    pub category_name: Option<String>,
    pub tags: Option<String>,
    pub main_image_path: Option<String>,
    pub audio: Vec<EntryAudioSummary>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct EntryAudioSummary {
    pub id: String,
    pub source_key: String,
    pub source_name: String,
    pub audio_path: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct EntryDetail {
    pub id: String,
    pub language_id: String,
    pub entry_type: String,
    pub text_original: String,
    pub text_transcription: Option<String>,
    pub text_translation: Option<String>,
    pub short_description: Option<String>,
    pub cultural_note: Option<String>,
    pub example_sentence: Option<String>,
    pub example_translation: Option<String>,
    pub category_id: Option<String>,
    pub category_name: Option<String>,
    pub tags: Option<String>,
    pub images: Vec<EntryImage>,
    pub audio: Vec<EntryAudio>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct EntryImage {
    pub id: String,
    pub entry_id: String,
    pub image_path: String,
    pub caption: Option<String>,
    pub alt_text: Option<String>,
    pub sort_order: i32,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct EntryAudio {
    pub id: String,
    pub entry_id: String,
    pub source_key: String,
    pub source_name: String,
    pub audio_path: String,
    pub speaker_name: Option<String>,
    pub speaker_description: Option<String>,
    pub dialect_name: Option<String>,
    pub speed_label: Option<String>,
    pub note: Option<String>,
    pub sort_order: i32,
}
