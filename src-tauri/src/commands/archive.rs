use crate::database::connection::Database;
use crate::database::models::*;
use std::sync::Mutex;
use tauri::State;

pub struct AppState {
    pub db: Mutex<Option<Database>>,
}

#[tauri::command]
pub fn get_languages(state: State<'_, AppState>) -> Result<Vec<Language>, String> {
    let guard = state.db.lock().map_err(|e| format!("Lock error: {}", e))?;
    let db = guard.as_ref().ok_or("Database not initialized")?;
    db.get_languages()
}

#[tauri::command]
pub fn get_categories(state: State<'_, AppState>, language_id: String) -> Result<Vec<Category>, String> {
    let guard = state.db.lock().map_err(|e| format!("Lock error: {}", e))?;
    let db = guard.as_ref().ok_or("Database not initialized")?;
    db.get_categories(&language_id)
}

#[tauri::command]
pub fn list_entries(state: State<'_, AppState>, category_id: Option<String>) -> Result<Vec<EntrySummary>, String> {
    let guard = state.db.lock().map_err(|e| format!("Lock error: {}", e))?;
    let db = guard.as_ref().ok_or("Database not initialized")?;
    db.list_entries(category_id.as_deref())
}

#[tauri::command]
pub fn get_entry_detail(state: State<'_, AppState>, entry_id: String) -> Result<EntryDetail, String> {
    let guard = state.db.lock().map_err(|e| format!("Lock error: {}", e))?;
    let db = guard.as_ref().ok_or("Database not initialized")?;
    db.get_entry_detail(&entry_id)
}

#[tauri::command]
pub fn search_entries(state: State<'_, AppState>, query: String) -> Result<Vec<EntrySummary>, String> {
    let guard = state.db.lock().map_err(|e| format!("Lock error: {}", e))?;
    let db = guard.as_ref().ok_or("Database not initialized")?;
    db.search_entries(&query)
}
