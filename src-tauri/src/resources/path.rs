use std::path::PathBuf;
use tauri::AppHandle;
use tauri::Manager;

#[tauri::command]
pub fn resolve_resource_url(app: AppHandle, path: String) -> Result<String, String> {
    let resource_dir = app
        .path()
        .resource_dir()
        .map_err(|e| format!("Failed to get resource dir: {}", e))?;

    let full_path = resource_dir.join("resources").join("corpus").join(&path);

    if full_path.exists() {
        return Ok(format!("file://{}", full_path.display()));
    }

    let dev_path = PathBuf::from("../src-tauri/resources/corpus").join(&path);
    if dev_path.exists() {
        let abs = dev_path
            .canonicalize()
            .map_err(|e| format!("Failed to canonicalize path: {}", e))?;
        return Ok(format!("file://{}", abs.display()));
    }

    Err(format!("Resource not found: {}", path))
}
