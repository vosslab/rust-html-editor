# Usage

## Starting the editor

```bash
npx tauri dev
```

Or run the built application from `src-tauri/target/release/bundle/macos/`.

## Opening a project

1. Click **Open** in the toolbar (or press `Cmd+O`)
2. Select a folder containing HTML chapter files
3. The sidebar populates with `.html`/`.htm` files sorted by filename

## Project folder expectations

The editor expects a folder containing:
- One or more `.html` or `.htm` chapter files
- An optional `book.css` stylesheet (applied to the editor preview)

## Editing

The editor is a WYSIWYG rich-text editor. Type normally; use the toolbar
or keyboard shortcuts for formatting.

## Saving

Press `Cmd+S` or click **Save**. The editor:
1. Creates a `.html.bak` backup on the first save per session
2. Preserves the original `<head>` section verbatim
3. Writes only the edited `<body>` content
4. Uses atomic writes (temp file + rename) to prevent corruption

## Keyboard shortcuts

| Shortcut | Action |
| --- | --- |
| `Cmd+O` | Open project folder |
| `Cmd+S` | Save current chapter |
| `Cmd+B` | Bold |
| `Cmd+I` | Italic |
| `Cmd+Z` | Undo |
| `Cmd+Shift+Z` | Redo |
| `Cmd+F` | Find/replace |
| `Cmd+Shift+U` | Toggle source view |
| `Alt+PageDown` | Next chapter |
| `Alt+PageUp` | Previous chapter |
| `Cmd+=` | Zoom in |
| `Cmd+-` | Zoom out |
| `Cmd+0` | Reset zoom |

## Find and replace

- `Cmd+F` opens the floating find/replace panel
- Type a search term to highlight all matches
- Use **Next**/**Prev** (or `Enter`/`Shift+Enter`) to navigate matches
- **Replace** replaces the current match; **Replace All** replaces all
- Press `Esc` to close the panel

## Source view

`Cmd+Shift+U` toggles between WYSIWYG and raw HTML editing.
Changes in source view are applied when switching back to WYSIWYG.
ProseMirror normalizes the HTML structure on round-trip.

## CSS preview

If the project folder contains a `book.css` file, its styles are
injected into the editor area. Styles are scoped to the editor content
and do not affect the application UI.

## Backups

On the first save of each file per session, the editor copies the
original file to `filename.html.bak`. Subsequent saves do not
overwrite the backup.

## Export

The export command opens the current chapter file in the default
web browser for preview.
