# Changelog

## 2026-02-16

### Native menu bar and single-file opening
- Added native macOS menu bar with app, File, Edit, View, Navigate menus
- Created `src-tauri/src/menu.rs` with full menu setup and event emission
- Added File > Open File (Cmd+O) for opening individual HTML files
- Renamed folder opening to File > Open Folder (Cmd+Shift+O)
- File picker filters to `.html`/`.htm` files
- Opening a file auto-populates sidebar with sibling HTML files
- Open Folder auto-loads the first chapter
- Added File > Export to Browser menu item
- Edit menu uses native Cut/Copy/Paste/Select All for proper WebView support
- Fixed toolbar Open/Save buttons being wiped by `initToolbar()` clearing innerHTML
- Fixed dialog plugin crash from `"dialog": {}` config (expects no config object)

### HTML fragment and subdirectory support
- Updated `html_parser.rs` to detect and handle body-only HTML fragments
- Fragment files (no `<html>`/`<body>` tags) load and save without added wrappers
- Updated `project.rs` to recursively scan subdirectories for HTML files
- Added `relative_path` field to `ChapterMeta` for directory grouping
- Updated `src/sidebar.js` to group chapters by subdirectory with folder headers
- Created `src/styles/default_book.css` as fallback stylesheet for fragment files
- Updated `src/css_injector.js` to apply default CSS when no `book.css` is found
- Added CSS search in common locations (book.css, style.css, styles/, css/)

### Phase 1: Project scaffolding
- Created `package.json` with TipTap, Tauri, and Vite dependencies
- Created `vite.config.js` for dev server on port 1420
- Created `index.html` app shell with toolbar, sidebar, editor, status bar
- Created `src/main.js` with TipTap editor initialization (StarterKit + Link)
- Created `src/styles/main.css` with grid layout and editor styling
- Created `src-tauri/Cargo.toml` with tauri 2.x, scraper, serde dependencies
- Created `src-tauri/build.rs`, `src-tauri/src/main.rs`, `src-tauri/src/lib.rs`
- Created `src-tauri/tauri.conf.json` with window config and CSP
- Created `src-tauri/capabilities/default.json` for core + dialog permissions
- Generated app icons via `npx tauri icon`
- Created [VERSION](../VERSION) file (`26.02`)
- Updated [.gitignore](../.gitignore) with node_modules, dist, target exclusions
- Updated [README.md](../README.md) with project description and quick start

### Phase 2: Core load/save pipeline
- Created `src-tauri/src/commands.rs` with open_file, open_project, list_chapters,
  read_chapter, write_chapter Tauri commands
- Created `src-tauri/src/html_parser.rs` with head/body split and reassembly
- Created `src-tauri/src/project.rs` with HTML file listing, CSS reading,
  atomic write (tmp + rename)
- Created `src/editor.js` with TipTap editor factory (StarterKit + Link)
- Created `src/sidebar.js` with chapter list rendering and selection

### Phase 3: Editor UI, toolbar, and CSS preview
- Created `src/toolbar.js` with formatting buttons and active state tracking
- Created `src/status_bar.js` with filename, dirty indicator, word count
- Created `src/css_injector.js` for injecting project CSS into editor
- Created `src/dirty_guard.js` with save/discard/cancel navigation guard

### Phase 4: Find/replace, backups, source view
- Created `src/find_replace.js` with floating Cmd+F panel
- Created `src/source_view.js` for WYSIWYG/HTML source toggle
- Created `src-tauri/src/backup.rs` with per-session .bak backup tracking
- Created `src/styles/find_replace.css` for panel styling

### Build and version
- Updated version to `26.02` across VERSION, package.json, Cargo.toml, tauri.conf.json
- Created [build.sh](../build.sh) for one-command .app bundle builds

### Phase 5: Polish and documentation
- Created `src/zoom.js` with Cmd+=/Cmd+- zoom (50-200%)
- Added export_chapter command for browser preview
- Created [docs/INSTALL.md](INSTALL.md), [docs/USAGE.md](USAGE.md),
  [docs/CODE_ARCHITECTURE.md](CODE_ARCHITECTURE.md),
  [docs/FILE_STRUCTURE.md](FILE_STRUCTURE.md)
