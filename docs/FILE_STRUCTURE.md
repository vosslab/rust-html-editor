# File structure

```
rust-html-editor/
|-- AGENTS.md                        Agent instructions
|-- CLAUDE.md                        Claude project config
|-- LICENSE                          GPLv3 license
|-- README.md                        Project overview and quick start
|-- VERSION                          CalVer version string
|-- package.json                     npm dependencies and scripts
|-- vite.config.js                   Vite dev server and build config
|-- index.html                       App shell (entry point for Vite)
|-- app-icon.png                     Source icon (generated, gitignored)
|-- pip_requirements-dev.txt         Python dev dependencies (pytest, etc.)
|-- source_me.sh                     Bash environment bootstrap
|-- src/
|   |-- main.js                      App init, wiring, keyboard shortcuts
|   |-- editor.js                    TipTap editor factory
|   |-- sidebar.js                   Chapter list rendering
|   |-- toolbar.js                   Formatting buttons
|   |-- status_bar.js                Filename, dirty, word count display
|   |-- css_injector.js              Project CSS injection
|   |-- dirty_guard.js               Unsaved changes guard
|   |-- find_replace.js              Find/replace panel
|   |-- source_view.js               WYSIWYG/HTML toggle
|   |-- zoom.js                      Editor zoom control
|   |-- styles/
|       |-- main.css                 App layout and editor styling
|       |-- find_replace.css         Find/replace panel styling
|-- src-tauri/
|   |-- Cargo.toml                   Rust dependencies
|   |-- build.rs                     Tauri build script
|   |-- tauri.conf.json              Tauri app configuration
|   |-- capabilities/
|   |   |-- default.json             Window permissions
|   |-- icons/                       Generated app icons (all sizes)
|   |-- src/
|       |-- main.rs                  Rust entry point
|       |-- lib.rs                   Tauri builder setup
|       |-- commands.rs              IPC command handlers
|       |-- html_parser.rs           HTML split/reassemble
|       |-- project.rs               File operations (list, read, write)
|       |-- backup.rs                Per-session backup tracker
|-- docs/
|   |-- AUTHORS.md                   Maintainers
|   |-- CHANGELOG.md                 Change log
|   |-- CODE_ARCHITECTURE.md         System design
|   |-- FILE_STRUCTURE.md            This file
|   |-- INSTALL.md                   Setup and dependencies
|   |-- MARKDOWN_STYLE.md            Markdown conventions
|   |-- PYTHON_STYLE.md              Python conventions
|   |-- REPO_STYLE.md                Repo organization rules
|   |-- USAGE.md                     Editor usage and shortcuts
|-- tests/
|   |-- conftest.py                  Pytest config
|   |-- git_file_utils.py            Git utility helpers
|   |-- test_ascii_compliance.py     ASCII encoding checks
|   |-- test_bandit_security.py      Security lint
|   |-- test_import_requirements.py  Import checks
|   |-- test_import_star.py          Star import checks
|   |-- test_indentation.py          Indentation checks
|   |-- test_pyflakes_code_lint.py   Pyflakes lint gate
|   |-- test_shebangs.py             Shebang checks
|   |-- test_whitespace.py           Whitespace checks
|   |-- check_ascii_compliance.py    Single-file ASCII check
|   |-- fix_ascii_compliance.py      Single-file ASCII fix
|   |-- fix_whitespace.py            Whitespace fixer
|-- devel/
    |-- commit_changelog.py          Changelog commit helper
```

## Generated directories (gitignored)

- `node_modules/` -- npm packages
- `dist/` -- Vite build output
- `src-tauri/target/` -- Cargo build output
