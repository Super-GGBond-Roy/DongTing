import { convertFileSrc, invoke } from '@tauri-apps/api/core';
import type { Language, Category, EntrySummary, Entry } from './types';

export async function getLanguages(): Promise<Language[]> {
  return invoke<Language[]>('get_languages');
}

export async function getCategories(languageId: string): Promise<Category[]> {
  return invoke<Category[]>('get_categories', { languageId });
}

export async function listEntries(categoryId?: string): Promise<EntrySummary[]> {
  return invoke<EntrySummary[]>('list_entries', { categoryId: categoryId || null });
}

export async function getEntryDetail(entryId: string): Promise<Entry> {
  return invoke<Entry>('get_entry_detail', { entryId });
}

export async function searchEntries(query: string): Promise<EntrySummary[]> {
  return invoke<EntrySummary[]>('search_entries', { query });
}

export async function resolveResourceUrl(path: string): Promise<string> {
  const filePath = await invoke<string>('resolve_resource_url', { path });
  return convertFileSrc(filePath);
}
