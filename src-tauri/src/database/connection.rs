use rusqlite::Connection;
use std::path::PathBuf;
use tauri::AppHandle;
use tauri::Manager;

pub struct Database {
    conn: Connection,
}

impl Database {
    pub fn open(app: &AppHandle) -> Result<Self, String> {
        let resource_path = get_corpus_path(app)?;
        let conn = Connection::open_with_flags(
            &resource_path,
            rusqlite::OpenFlags::SQLITE_OPEN_READ_ONLY | rusqlite::OpenFlags::SQLITE_OPEN_NO_MUTEX,
        )
        .map_err(|e| format!("Failed to open database: {}", e))?;
        Ok(Database { conn })
    }

    pub fn conn(&self) -> &Connection {
        &self.conn
    }
}

fn get_corpus_path(app: &AppHandle) -> Result<PathBuf, String> {
    let resource_path = app
        .path()
        .resource_dir()
        .map_err(|e| format!("Failed to get resource dir: {}", e))?;
    let corpus_path = resource_path.join("resources").join("corpus").join("corpus.sqlite");
    if corpus_path.exists() {
        Ok(corpus_path)
    } else {
        let dev_path = PathBuf::from("../src-tauri/resources/corpus/corpus.sqlite");
        if dev_path.exists() {
            Ok(dev_path)
        } else {
            Err(format!(
                "Database not found at {:?} or {:?}",
                corpus_path, dev_path
            ))
        }
    }
}
