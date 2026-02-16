use tauri::menu::{MenuBuilder, MenuItemBuilder, PredefinedMenuItem, SubmenuBuilder};
use tauri::Emitter;

/// Build and attach the native macOS menu bar.
pub fn setup_menu(app: &tauri::App) -> Result<(), Box<dyn std::error::Error>> {
    // -- App menu (macOS always shows this first as the app name) --
    let about = PredefinedMenuItem::about(app, Some("About Rust HTML Editor"), None)?;
    let hide = PredefinedMenuItem::hide(app, None)?;
    let hide_others = PredefinedMenuItem::hide_others(app, None)?;
    let show_all = PredefinedMenuItem::show_all(app, None)?;
    let quit = PredefinedMenuItem::quit(app, None)?;

    let app_menu = SubmenuBuilder::new(app, "Rust HTML Editor")
        .item(&about)
        .separator()
        .item(&hide)
        .item(&hide_others)
        .item(&show_all)
        .separator()
        .item(&quit)
        .build()?;

    // -- File menu --
    let open_file = MenuItemBuilder::with_id("open_file", "Open File...")
        .accelerator("CmdOrCtrl+O")
        .build(app)?;
    let open_folder = MenuItemBuilder::with_id("open_project", "Open Folder...")
        .accelerator("CmdOrCtrl+Shift+O")
        .build(app)?;
    let save = MenuItemBuilder::with_id("save", "Save")
        .accelerator("CmdOrCtrl+S")
        .build(app)?;
    let export = MenuItemBuilder::with_id("export", "Export to Browser")
        .build(app)?;
    let close_window = MenuItemBuilder::with_id("close_window", "Close Window")
        .accelerator("CmdOrCtrl+W")
        .build(app)?;

    let file_menu = SubmenuBuilder::new(app, "File")
        .item(&open_file)
        .item(&open_folder)
        .separator()
        .item(&save)
        .item(&export)
        .separator()
        .item(&close_window)
        .build()?;

    // -- Edit menu --
    let undo = MenuItemBuilder::with_id("undo", "Undo")
        .accelerator("CmdOrCtrl+Z")
        .build(app)?;
    let redo = MenuItemBuilder::with_id("redo", "Redo")
        .accelerator("CmdOrCtrl+Shift+Z")
        .build(app)?;
    let cut = PredefinedMenuItem::cut(app, None)?;
    let copy = PredefinedMenuItem::copy(app, None)?;
    let paste = PredefinedMenuItem::paste(app, None)?;
    let select_all = PredefinedMenuItem::select_all(app, None)?;
    let find = MenuItemBuilder::with_id("find", "Find and Replace...")
        .accelerator("CmdOrCtrl+F")
        .build(app)?;

    let edit_menu = SubmenuBuilder::new(app, "Edit")
        .item(&undo)
        .item(&redo)
        .separator()
        .item(&cut)
        .item(&copy)
        .item(&paste)
        .item(&select_all)
        .separator()
        .item(&find)
        .build()?;

    // -- View menu --
    let source_view = MenuItemBuilder::with_id("source_view", "Toggle Source View")
        .accelerator("CmdOrCtrl+Shift+U")
        .build(app)?;
    let zoom_in = MenuItemBuilder::with_id("zoom_in", "Zoom In")
        .accelerator("CmdOrCtrl+=")
        .build(app)?;
    let zoom_out = MenuItemBuilder::with_id("zoom_out", "Zoom Out")
        .accelerator("CmdOrCtrl+-")
        .build(app)?;
    let zoom_reset = MenuItemBuilder::with_id("zoom_reset", "Actual Size")
        .accelerator("CmdOrCtrl+0")
        .build(app)?;

    let view_menu = SubmenuBuilder::new(app, "View")
        .item(&source_view)
        .separator()
        .item(&zoom_in)
        .item(&zoom_out)
        .item(&zoom_reset)
        .build()?;

    // -- Navigate menu --
    let next_chapter = MenuItemBuilder::with_id("next_chapter", "Next Chapter")
        .accelerator("Alt+PageDown")
        .build(app)?;
    let prev_chapter = MenuItemBuilder::with_id("prev_chapter", "Previous Chapter")
        .accelerator("Alt+PageUp")
        .build(app)?;

    let navigate_menu = SubmenuBuilder::new(app, "Navigate")
        .item(&next_chapter)
        .item(&prev_chapter)
        .build()?;

    // -- Build the full menu bar --
    let menu = MenuBuilder::new(app)
        .item(&app_menu)
        .item(&file_menu)
        .item(&edit_menu)
        .item(&view_menu)
        .item(&navigate_menu)
        .build()?;

    app.set_menu(menu)?;

    // -- Handle menu events by emitting to the frontend --
    let app_handle = app.handle().clone();
    app.on_menu_event(move |_app, event| {
        let id = event.id().0.as_str();
        // Emit a "menu-action" event to the frontend with the menu item id
        let _ = app_handle.emit("menu-action", id);
    });

    Ok(())
}
