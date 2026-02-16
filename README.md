# rust-html-editor

A desktop WYSIWYG HTML editor for book chapter files, built with
Tauri v2 (Rust backend) and TipTap (ProseMirror-based rich-text editor).

## Features

- Paragraph-level WYSIWYG editing of HTML chapter files
- Project folder browsing with chapter sidebar
- CSS preview using the project's `book.css`
- Clean HTML saves that preserve `<head>` and produce small diffs
- Find/replace, source view, zoom, backups

## Prerequisites

- Rust >= 1.77 (`brew install rust` or via [rustup](https://rustup.rs/))
- Node.js >= 18 (`brew install node`)
- Xcode Command Line Tools (`xcode-select --install`)

## Quick start

```bash
npm install
npx tauri dev
```

## Build

```bash
npx tauri build
```

The built `.app` is in `src-tauri/target/release/bundle/macos/`.

## Project structure

- `src/` -- Frontend JavaScript (TipTap editor, toolbar, sidebar)
- `src-tauri/` -- Rust backend (file I/O, HTML parsing, Tauri commands)
- `docs/` -- Documentation
- `tests/` -- Python lint and compliance tests

## License

GPLv3. See [LICENSE](LICENSE).

## Author

Neil Voss, https://bsky.app/profile/neilvosslab.bsky.social
