# Code architecture

## Overview

Rust HTML Editor is a desktop application built with Tauri v2.
The Rust backend owns all filesystem operations; the JavaScript
frontend handles rendering and user interaction through TipTap
(a ProseMirror wrapper).

## System diagram

```
+--------------------------------------------------+
|                  Tauri Window                     |
|  +----------------------------------------------+|
|  |  Toolbar  [ Open | Save | B I H1 H2 ... ]   ||
|  +----------------------------------------------+|
|  +--------+ +----------------------------------+ ||
|  |Sidebar | | Editor (TipTap/ProseMirror)      | ||
|  |        | |                                  | ||
|  |ch01.htm| | WYSIWYG content area             | ||
|  |ch02.htm| | (or raw HTML textarea)           | ||
|  |ch03.htm| |                                  | ||
|  +--------+ +----------------------------------+ ||
|  +----------------------------------------------+|
|  |  Status Bar  [ filename * | 1234 words ]     ||
|  +----------------------------------------------+|
+--------------------------------------------------+
         |                    |
         | invoke()           | events
         v                    v
+--------------------------------------------------+
|              Rust Backend (Tauri)                 |
|                                                  |
|  commands.rs   -- IPC command handlers           |
|  html_parser.rs -- split/reassemble HTML         |
|  project.rs    -- file listing, CSS, atomic I/O  |
|  backup.rs     -- per-session .bak tracking      |
+--------------------------------------------------+
         |
         v
+--------------------------------------------------+
|              Filesystem                           |
|  project_folder/                                 |
|    book.css                                      |
|    chapter01.html                                |
|    chapter02.html                                |
|    chapter01.html.bak  (created on first save)   |
+--------------------------------------------------+
```

## Data flow

### Load chapter

1. User clicks a chapter in the sidebar
2. Frontend calls `invoke("read_chapter", {filePath, projectDir})`
3. Rust reads the raw HTML file
4. `html_parser::split_html()` extracts doctype, head, and body
5. `project::read_css()` reads `book.css` if present
6. Rust returns `{filename, body_html, css, original_head}`
7. Frontend sets TipTap content and injects CSS

### Save chapter

1. User presses Cmd+S or clicks Save
2. Frontend calls `invoke("write_chapter", {filePath, bodyHtml, originalHead})`
3. Rust checks `BackupTracker` and creates `.bak` if first save
4. Rust reads the original file for the doctype
5. `html_parser::reassemble_html()` rebuilds the full document
6. `project::atomic_write()` writes to `.tmp` then renames

## Module responsibilities

### Rust modules

| Module | Responsibility |
| --- | --- |
| `main.rs` | Entry point, calls `lib::run()` |
| `lib.rs` | Tauri builder setup, plugin and command registration |
| `commands.rs` | IPC command handlers (open, list, read, write, export) |
| `html_parser.rs` | HTML split (head/body) and reassembly |
| `project.rs` | Filesystem operations (list files, read CSS, atomic write) |
| `backup.rs` | Per-session backup tracking with Mutex |

### JavaScript modules

| Module | Responsibility |
| --- | --- |
| `main.js` | App init, wiring, keyboard shortcuts |
| `editor.js` | TipTap editor factory |
| `sidebar.js` | Chapter list rendering and selection |
| `toolbar.js` | Formatting buttons and active state tracking |
| `status_bar.js` | Filename, dirty indicator, word count |
| `css_injector.js` | Inject/remove project CSS scoped to editor |
| `dirty_guard.js` | Unsaved changes navigation guard |
| `find_replace.js` | Find/replace panel with match cycling |
| `source_view.js` | WYSIWYG/HTML source toggle |
| `zoom.js` | Editor zoom control |
