# Install

## Prerequisites

- **Rust** >= 1.77.2 -- `brew install rust` or via [rustup](https://rustup.rs/)
- **Node.js** >= 18 -- `brew install node`
- **Xcode Command Line Tools** -- `xcode-select --install`

## Setup

```bash
git clone <repo-url>
cd rust-html-editor
npm install
```

## Development

```bash
npx tauri dev
```

This starts the Vite dev server on port 1420 and launches the Tauri window.
Hot-reload works for frontend changes; Rust changes trigger a recompile.

## Build

```bash
npx tauri build
```

The built `.app` bundle is in `src-tauri/target/release/bundle/macos/`.

## Dependencies

### Rust crates (managed by Cargo)

| Crate | Purpose |
| --- | --- |
| tauri 2.x | Desktop shell, IPC commands |
| tauri-plugin-dialog 2.x | Native file/folder dialogs |
| serde 1.x | Serialization for command arguments |
| scraper 0.22.x | HTML parsing (html5ever-based) |
| open 5.x | Open files in default browser |

### npm packages (managed by package.json)

| Package | Purpose |
| --- | --- |
| @tiptap/core | Rich-text editor core |
| @tiptap/starter-kit | Preset extensions (bold, italic, headings, lists) |
| @tiptap/extension-link | Link editing support |
| @tauri-apps/api | Frontend-to-Rust IPC |
| @tauri-apps/plugin-dialog | Dialog plugin JS bindings |
| vite | Frontend build tool and dev server |
