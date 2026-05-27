mod commands;
mod database;
mod resources;

use commands::archive::AppState;
use database::connection::Database;
use std::sync::Mutex;
use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_log::Builder::new().build())
        .manage(AppState {
            db: Mutex::new(None),
        })
        .setup(|app| {
            let state = app.state::<AppState>();
            match Database::open(app.handle()) {
                Ok(db) => {
                    let mut guard = state
                        .db
                        .lock()
                        .expect("Failed to lock state during setup");
                    *guard = Some(db);
                    log::info!("Database loaded successfully");
                }
                Err(e) => {
                    log::error!("Failed to load database: {}", e);
                }
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::archive::get_languages,
            commands::archive::get_categories,
            commands::archive::list_entries,
            commands::archive::get_entry_detail,
            commands::archive::search_entries,
            resources::path::resolve_resource_url,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
