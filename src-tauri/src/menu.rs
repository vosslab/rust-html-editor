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
    let import_md = MenuItemBuilder::with_id("import_markdown", "Import Markdown...")
        .build(app)?;
    let export_md = MenuItemBuilder::with_id("export_markdown", "Export as Markdown...")
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
        .item(&import_md)
        .item(&export_md)
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

    // -- Format menu --
    let underline = MenuItemBuilder::with_id("underline", "Underline")
        .accelerator("CmdOrCtrl+U")
        .build(app)?;
    let subscript = MenuItemBuilder::with_id("subscript", "Subscript")
        .build(app)?;
    let superscript = MenuItemBuilder::with_id("superscript", "Superscript")
        .build(app)?;
    let highlight = MenuItemBuilder::with_id("highlight", "Highlight")
        .build(app)?;
    let align_left = MenuItemBuilder::with_id("align_left", "Align Left")
        .build(app)?;
    let align_center = MenuItemBuilder::with_id("align_center", "Align Center")
        .build(app)?;
    let align_right = MenuItemBuilder::with_id("align_right", "Align Right")
        .build(app)?;
    let align_justify = MenuItemBuilder::with_id("align_justify", "Justify")
        .build(app)?;

    let format_menu = SubmenuBuilder::new(app, "Format")
        .item(&underline)
        .item(&subscript)
        .item(&superscript)
        .item(&highlight)
        .separator()
        .item(&align_left)
        .item(&align_center)
        .item(&align_right)
        .item(&align_justify)
        .build()?;

    // -- Insert menu --
    let horizontal_rule = MenuItemBuilder::with_id("horizontal_rule", "Horizontal Rule")
        .build(app)?;
    let insert_image = MenuItemBuilder::with_id("insert_image", "Image...")
        .build(app)?;
    let insert_table = MenuItemBuilder::with_id("insert_table", "Table (3x3)")
        .build(app)?;
    let code_block = MenuItemBuilder::with_id("code_block", "Code Block")
        .build(app)?;

    let insert_menu = SubmenuBuilder::new(app, "Insert")
        .item(&horizontal_rule)
        .item(&insert_image)
        .item(&insert_table)
        .item(&code_block)
        .build()?;

    // -- View menu --
    let source_view = MenuItemBuilder::with_id("source_view", "Toggle Source View")
        .accelerator("CmdOrCtrl+Shift+U")
        .build(app)?;
    let fullscreen = MenuItemBuilder::with_id("fullscreen", "Toggle Fullscreen")
        .accelerator("Ctrl+CmdOrCtrl+F")
        .build(app)?;
    let dark_theme = MenuItemBuilder::with_id("dark_theme", "Toggle Dark Theme")
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
        .item(&fullscreen)
        .item(&dark_theme)
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
        .item(&format_menu)
        .item(&insert_menu)
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
