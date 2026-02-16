use std::path::Path;
use tauri::State;
use tauri_plugin_dialog::DialogExt;

use crate::backup::BackupTracker;
use crate::html_parser;
use crate::project;

/// Data returned when reading a chapter.
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct ChapterData {
    pub filename: String,
    pub body_html: String,
    pub css: String,
    pub original_head: String,
    /// True if the file is a body-only fragment (no <html>/<head>/<body> wrapper)
    pub is_fragment: bool,
}

/// Open a native file picker for HTML files and return the selected path.
#[tauri::command]
pub async fn open_file(app: tauri::AppHandle) -> Result<String, String> {
    let file = app.dialog()
        .file()
        .add_filter("HTML files", &["html", "htm"])
        .blocking_pick_file();

    match file {
        Some(path) => Ok(path.to_string()),
        None => Err("No file selected".to_string()),
    }
}

/// Open a native folder picker and return the selected path.
#[tauri::command]
pub async fn open_project(app: tauri::AppHandle) -> Result<String, String> {
    let folder = app.dialog()
        .file()
        .blocking_pick_folder();

    match folder {
        Some(path) => Ok(path.to_string()),
        None => Err("No folder selected".to_string()),
    }
}

/// List HTML chapter files in the project directory.
#[tauri::command]
pub fn list_chapters(project_dir: String) -> Result<Vec<project::ChapterMeta>, String> {
    let dir = Path::new(&project_dir);
    if !dir.is_dir() {
        return Err(format!("Not a directory: {}", project_dir));
    }
    project::list_html_files(dir)
        .map_err(|e| format!("Failed to list chapters: {}", e))
}

/// Read a chapter file, splitting into body HTML, CSS, and original head.
#[tauri::command]
pub fn read_chapter(file_path: String, project_dir: String) -> Result<ChapterData, String> {
    let path = Path::new(&file_path);
    let dir = Path::new(&project_dir);

    // Read the raw HTML
    let raw_html = std::fs::read_to_string(path)
        .map_err(|e| format!("Failed to read {}: {}", file_path, e))?;

    // Split into head and body (handles both full docs and fragments)
    let split = html_parser::split_html(&raw_html);

    // Read project CSS
    let css = project::read_css(dir);

    // Get filename
    let filename = path.file_name()
        .and_then(|n| n.to_str())
        .unwrap_or("unknown")
        .to_string();

    Ok(ChapterData {
        filename,
        body_html: split.body_content,
        css,
        original_head: split.head_content,
        is_fragment: split.is_fragment,
    })
}

/// Write edited body HTML back to a chapter file, preserving the original head.
/// Creates a .bak backup on the first save per session.
#[tauri::command]
pub fn write_chapter(
    file_path: String,
    body_html: String,
    original_head: String,
    is_fragment: bool,
    tracker: State<'_, BackupTracker>,
) -> Result<(), String> {
    let path = Path::new(&file_path);

    // Create backup on first save per session
    tracker.backup_if_needed(path)?;

    // Build the output content
    let output = if is_fragment {
        // Fragment: save body content directly
        body_html
    } else {
        // Full document: read original for doctype, reassemble
        let raw_html = std::fs::read_to_string(path)
            .map_err(|e| format!("Failed to read {}: {}", file_path, e))?;
        let split = html_parser::split_html(&raw_html);
        html_parser::reassemble_html(
            &split.doctype,
            &original_head,
            &body_html,
            false,
        )
    };

    // Write atomically
    project::atomic_write(path, &output)
        .map_err(|e| format!("Failed to write {}: {}", file_path, e))?;

    Ok(())
}

/// Export a chapter by opening it in the default browser.
#[tauri::command]
pub fn export_chapter(file_path: String) -> Result<(), String> {
    let path = Path::new(&file_path);
    if !path.exists() {
        return Err(format!("File not found: {}", file_path));
    }

    // Open in default browser
    open::that(path)
        .map_err(|e| format!("Failed to open browser: {}", e))?;

    Ok(())
}
