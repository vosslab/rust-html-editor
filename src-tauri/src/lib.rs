mod backup;
mod commands;
mod html_parser;
mod menu;
mod project;

pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .manage(backup::BackupTracker::new())
        .setup(|app| {
            menu::setup_menu(app)?;
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::open_file,
            commands::open_project,
            commands::list_chapters,
            commands::read_chapter,
            commands::write_chapter,
            commands::export_chapter,
            commands::open_markdown_file,
            commands::read_text_file,
            commands::save_markdown_file,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
