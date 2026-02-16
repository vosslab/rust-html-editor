mod backup;
mod commands;
mod html_parser;
mod project;

pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .manage(backup::BackupTracker::new())
        .invoke_handler(tauri::generate_handler![
            commands::open_project,
            commands::list_chapters,
            commands::read_chapter,
            commands::write_chapter,
            commands::export_chapter,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
