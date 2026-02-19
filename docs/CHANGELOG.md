# Changelog

## 2026-02-19

### Ribbon-style toolbar grouping
- Reorganized flat toolbar into labeled ribbon groups inspired by Office 365 Ribbon
- Groups: File, History, Text, Heading, Align, Lists, Code, Insert, Table
- Each group has a small label underneath and vertical dividers between groups
- Moved Undo/Redo to the front as a History group
- File/Folder/Save buttons now in a matching ribbon File group
- Table editing group (+Row, -Row, +Col, -Col, DelTbl) hidden until cursor is inside a table

### Toolbar file buttons
- Split single "Open" toolbar button into "File" and "Folder" buttons
- "File" opens a single HTML file (Cmd+O), "Folder" opens a project directory (Cmd+Shift+O)

### Dark mode system preference matching
- Dark theme now auto-detects OS `prefers-color-scheme` setting on startup
- Listens for live system theme changes (e.g. macOS auto dark mode at sunset)
- Manual toggle via View > Toggle Dark Theme overrides system preference
- Override persists in localStorage; clearing localStorage restores system-following behavior

## 2026-02-18

### Rich editing features
- Added TipTap extensions: underline, subscript, superscript, highlight, text color,
  text alignment, tables, and image insertion
- Extended heading levels from H1-H3 to H1-H6
- Added toolbar buttons for all new formatting: U, Sub, Sup, Hi, H4-H6,
  Left/Center/Right/Justify, HR, Img, Table, Code Block, and table editing
  (+Row, -Row, +Col, -Col, DelTbl)
- Active state highlighting for all new toggleable toolbar buttons

### Tables
- Installed `@tiptap/extension-table`, table-row, table-cell, table-header
- Tables are resizable with column drag handles
- Insert 3x3 table with header row via toolbar or Insert menu
- Add/remove rows and columns, delete entire table

### Image support
- Installed `@tiptap/extension-image` with inline and base64 support
- Insert images via URL prompt from toolbar or Insert menu

### Text alignment
- Installed `@tiptap/extension-text-align` for headings and paragraphs
- Left, Center, Right, Justify via toolbar buttons and Format menu

### Menus
- Added Format menu with Underline (Cmd+U), Subscript, Superscript, Highlight,
  and text alignment items
- Added Insert menu with Horizontal Rule, Image, Table, Code Block
- Added Toggle Fullscreen (Ctrl+Cmd+F) and Toggle Dark Theme to View menu
- Added Import Markdown and Export as Markdown to File menu

### Dark theme
- Full dark theme toggle via View menu, persisted in localStorage
- Dark styles for toolbar, sidebar, editor, status bar, find/replace, source view

### Fullscreen mode
- Toggle fullscreen via View > Toggle Fullscreen (Ctrl+Cmd+F)
- Uses Tauri `setFullscreen()` window API

### Word count warnings
- Status bar turns red and bold when word count exceeds 5000

### XHTML support
- Added `.xhtml` to file picker filter and project scanner

### Markdown import/export
- Installed `turndown` (HTML-to-Markdown) and `marked` (Markdown-to-HTML)
- File > Import Markdown opens `.md` file and converts to editor HTML
- File > Export as Markdown saves editor content as `.md`
- Added `open_markdown_file`, `read_text_file`, `save_markdown_file` Rust commands

### README
- Added features table with current and planned features comparing to BlueGriffon
- Added documentation links section with file-path link text
- Restructured to follow readme-fix conventions

### CSS
- Table, image, highlight, horizontal rule styles for editor content
- Column resize handle and selected cell highlight for tables
- Word count warning style on status bar

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
