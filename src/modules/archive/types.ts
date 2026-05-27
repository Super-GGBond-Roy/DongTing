export interface Language {
  id: string;
  name: string;
  native_name?: string;
  description?: string;
  region?: string;
  note?: string;
}

export interface Category {
  id: string;
  language_id: string;
  name: string;
  description?: string;
  sort_order: number;
}

export interface Entry {
  id: string;
  language_id: string;
  entry_type: 'word' | 'phrase' | 'sentence';
  text_original: string;
  text_transcription?: string;
  text_translation?: string;
  short_description?: string;
  cultural_note?: string;
  example_sentence?: string;
  example_translation?: string;
  category_id?: string;
  category_name?: string;
  tags?: string;
  images: EntryImage[];
  audio: EntryAudio[];
}

export interface EntrySummary {
  id: string;
  language_id: string;
  entry_type: string;
  text_original: string;
  text_transcription?: string;
  text_translation?: string;
  short_description?: string;
  category_id?: string;
  category_name?: string;
  tags?: string;
  main_image_path?: string;
  audio: EntryAudioSummary[];
}

export interface EntryImage {
  id: string;
  entry_id: string;
  image_path: string;
  caption?: string;
  alt_text?: string;
  sort_order: number;
}

export interface EntryAudio {
  id: string;
  entry_id: string;
  source_key: string;
  source_name: string;
  audio_path: string;
  speaker_name?: string;
  speaker_description?: string;
  dialect_name?: string;
  speed_label?: string;
  note?: string;
  sort_order: number;
}

export interface EntryAudioSummary {
  id: string;
  source_key: string;
  source_name: string;
  audio_path: string;
}
