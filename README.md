# rust-html-editor

A desktop WYSIWYG HTML editor for book chapter files, built with
Tauri v2 (Rust backend) and TipTap (ProseMirror-based rich-text editor).
Inspired by BlueGriffon, targeting modern HTML editing with a lightweight native app.

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

## Features

| Feature | Status |
| --- | --- |
| Native standalone macOS app | OK |
| WYSIWYG authoring | OK |
| Editable source view | OK |
| Keyboard shortcuts | OK |
| Copy/paste between HTML flavors | OK |
| Bold, italic, strikethrough | OK |
| Underline, subscript, superscript | OK |
| Text highlight | OK |
| Text color | OK |
| Text alignment (L/C/R/Justify) | OK |
| Headings H1-H6 | OK |
| Bullet and ordered lists | OK |
| Blockquote | OK |
| Inline code and code blocks | OK |
| Horizontal rule | OK |
| Table insertion and editing | OK |
| Image insertion | OK |
| Link insertion | OK |
| Find and replace | OK |
| Zoom (50-200%) | OK |
| Word count with warnings | OK |
| Fullscreen mode | OK |
| Dark theme | OK |
| XHTML file support | OK |
| Markdown import/export | OK |
| Project folder browsing | OK |
| Chapter sidebar with subdirectories | OK |
| CSS preview (book.css) | OK |
| HTML head preservation | OK |
| Per-session `.bak` backups | OK |
| Export to browser | OK |
| CSS Variables editor | Planned |
| Style Properties panel | Planned |
| DOM Explorer panel | Planned |
| EPUB 2/3 support | Planned |
| MathML editor | Planned |
| Mobile viewer | Planned |
| Project manager | Planned |

## Prerequisites

- Rust >= 1.77 (`brew install rust` or via [rustup](https://rustup.rs/))
- Node.js >= 18 (`brew install node`)
- Xcode Command Line Tools (`xcode-select --install`)

See [docs/INSTALL.md](docs/INSTALL.md) for full setup instructions.

## Documentation

- [docs/USAGE.md](docs/USAGE.md): how to run the editor, keyboard shortcuts, and examples
- [docs/INSTALL.md](docs/INSTALL.md): setup steps, dependencies, and environment requirements
- [docs/CHANGELOG.md](docs/CHANGELOG.md): chronological record of changes
- [docs/CODE_ARCHITECTURE.md](docs/CODE_ARCHITECTURE.md): high-level system design and data flow
- [docs/FILE_STRUCTURE.md](docs/FILE_STRUCTURE.md): directory map with what belongs where

## Project structure

- `src/` -- Frontend JavaScript (TipTap editor, toolbar, sidebar)
- `src-tauri/` -- Rust backend (file I/O, HTML parsing, Tauri commands)
- `docs/` -- Documentation
- `tests/` -- Python lint and compliance tests

## License

GPLv3. See [LICENSE](LICENSE).

## Author

Neil Voss, https://bsky.app/profile/neilvosslab.bsky.social
