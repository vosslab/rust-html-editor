# YAML-driven menus and toolbar (build-time code generation)

## Context

The menu bar (`menu.rs`, 196 lines of Rust) and toolbar (`toolbar.js`, 88 lines of group definitions) are hardcoded. The menu-to-editor mapping in `main.js` is a 100-line switch statement. Adding or reordering items requires touching 3 files in 2 languages. A single YAML config should be the source of truth, with a Python build script generating the Rust and JS code.

Key constraint: **YAML is processed at build time, not runtime.** No YAML parser ships with the app. Generated files are committed to git so fresh clones build without running the generator.

## YAML schema

File: `config/menu_toolbar.yaml`

Two top-level sections: `menus` (native macOS menu bar) and `toolbar_groups` (ribbon-style toolbar).

### Menu items

```yaml
menus:
  - name: File
    items:
      - id: open_file
        label: "Open File..."
        accelerator: "CmdOrCtrl+O"
        action: app_function          # JS handles this in hand-written switch
      - separator
      - id: underline
        label: "Underline"
        accelerator: "CmdOrCtrl+U"
        editor_command: toggleUnderline  # generated JS calls editor directly
      - id: align_left
        label: "Align Left"
        editor_command: setTextAlign
        editor_args: "left"            # string or object passed to command
      - id: insert_image
        label: "Image..."
        action: prompt_url
        prompt_text: "Enter image URL:"
        editor_command: setImage
        editor_args_key: src           # prompt result becomes { src: url }
      - predefined: cut               # macOS native (PredefinedMenuItem)
```

Item types:
- `action: app_function` -- menu-only, dispatched to hand-written JS switch
- `editor_command` -- generates `editor.chain().focus().COMMAND(ARGS).run()`
- `action: prompt_url` -- generates `window.prompt()` then editor command
- `predefined: cut/copy/paste/select_all/about/quit/hide/...` -- macOS native
- `separator` -- visual divider

### Toolbar groups

```yaml
toolbar_groups:
  - name: Text
    buttons:
      - label: "B"
        command: toggleBold
        title: "Bold (Cmd+B)"
        active_check: bold             # editor.isActive("bold")
      - label: "H1"
        command: toggleHeading
        args: { level: 1 }
        title: "Heading 1"
        active_check: heading
        active_args: { level: 1 }      # editor.isActive("heading", { level: 1 })
      - label: "Left"
        command: setTextAlign
        args: "left"
        title: "Align Left"
        active_check_attr: { textAlign: "left" }  # editor.isActive({ textAlign: "left" })

  - name: Insert
    buttons:
      - label: "Img"
        command: insertImage
        title: "Insert Image"
        special: prompt_url
        prompt_text: "Enter image URL:"
        editor_command: setImage
        editor_args_key: src
      - label: "Table"
        command: insertTable
        title: "Insert Table (3x3)"
        special: insert_table          # hardcoded 3x3 with header row

  - name: Table
    dom_id: "ribbon-table-group"
    visibility: in_table               # hidden unless cursor is in a table
    buttons:
      - label: "+Row"
        command: addRowAfter
        title: "Add Row After"
```

## Generated files

| Generated file | Source of | Replaces |
| --- | --- | --- |
| `src-tauri/src/generated_menu.rs` | Rust `setup_menu()` function | `src-tauri/src/menu.rs` |
| `src/generated_toolbar_data.js` | Toolbar groups, active checks, special handlers, conditional groups | Hardcoded arrays in `toolbar.js` |
| `src/generated_menu_actions.js` | `handleEditorMenuAction(editor, id)` for editor commands | Editor-command cases in `main.js` switch |

Each generated file has a `// AUTO-GENERATED -- DO NOT EDIT` header.

## Build script

File: `scripts/generate_menu_toolbar.py` (Python 3.12, uses `pyyaml`)

Runs as part of the build chain:
```json
"scripts": {
  "generate": "python3 scripts/generate_menu_toolbar.py",
  "dev": "npm run generate && vite",
  "build": "npm run generate && vite build"
}
```

Tauri's `beforeDevCommand` and `beforeBuildCommand` already invoke `npm run dev` / `npm run build`, so the generator runs automatically before both Vite and Cargo.

### Generator logic

**Rust output** (`generated_menu.rs`):
- For each menu: emit `SubmenuBuilder::new(app, "NAME")`
- For `predefined` items: emit `PredefinedMenuItem::TYPE(app, None)?`
- For `separator`: emit `.separator()`
- For regular items: emit `MenuItemBuilder::with_id("ID", "LABEL")` with optional `.accelerator("...")`
- Chain all submenus into `MenuBuilder::new(app)` and set on app
- Emit `on_menu_event` handler that forwards all IDs to frontend via `emit("menu-action", id)`

**JS toolbar data** (`generated_toolbar_data.js`):
- `export const toolbarGroups = [...]` -- group objects with name, dom_id, buttons
- `export const activeStateChecks = [...]` -- `{ label, check, args? }` or `{ label, checkAttr }` objects
- `export const specialHandlers = { ... }` -- keyed by command, with type and data
- `export const conditionalGroups = [...]` -- `{ domId, condition }` for show/hide

**JS menu actions** (`generated_menu_actions.js`):
- `export function handleEditorMenuAction(editor, actionId)` -- switch on all `editor_command` items, returns true if handled

### Validation

The generator validates at build time:
- No duplicate menu IDs
- Every item has `predefined`, `action`, or `editor_command`
- Prints summary: N menu items, N toolbar buttons, N generated actions

## Implementation steps

### Step 1: Create `config/menu_toolbar.yaml`

Write the full YAML with every current menu item and toolbar button. Validate against current `menu.rs` and `toolbar.js` -- every ID and command must be represented.

### Step 2: Create `scripts/generate_menu_toolbar.py`

Python build script with three generator functions:
- `generate_rust_menu(config)` -> writes `src-tauri/src/generated_menu.rs`
- `generate_js_toolbar(config)` -> writes `src/generated_toolbar_data.js`
- `generate_js_menu_actions(config)` -> writes `src/generated_menu_actions.js`

### Step 3: Run generator and verify output matches current code

Run the script, diff `generated_menu.rs` against `menu.rs` to confirm equivalent Rust. Check that `generated_toolbar_data.js` contains every group/button currently in `toolbar.js`.

### Step 4: Update consumers

- `src-tauri/src/lib.rs`: change `mod menu` to `mod generated_menu`, update `setup` call
- `src/toolbar.js`: import from `generated_toolbar_data.js`, replace hardcoded arrays, make rendering data-driven
- `src/main.js`: import `handleEditorMenuAction`, use it as first check in `setupMenuListener`, keep hand-written switch for `app_function` items only

### Step 5: Update build chain

- `package.json`: add `"generate"` script, prepend to `dev` and `build`
- Delete `src-tauri/src/menu.rs`

### Step 6: Update docs

- `docs/CHANGELOG.md`: document the YAML-driven menu/toolbar system
- `docs/FILE_STRUCTURE.md`: add `config/` and `scripts/` directories

## Files modified

| File | Change |
| --- | --- |
| `config/menu_toolbar.yaml` | NEW -- single source of truth |
| `scripts/generate_menu_toolbar.py` | NEW -- build-time generator |
| `src-tauri/src/generated_menu.rs` | NEW (generated) -- replaces menu.rs |
| `src/generated_toolbar_data.js` | NEW (generated) -- toolbar data |
| `src/generated_menu_actions.js` | NEW (generated) -- editor menu actions |
| `src-tauri/src/lib.rs` | `mod generated_menu` instead of `mod menu` |
| `src/toolbar.js` | Import generated data, remove hardcoded arrays |
| `src/main.js` | Import generated actions, shrink switch statement |
| `package.json` | Add `generate` script to build chain |
| `src-tauri/src/menu.rs` | DELETED |
| `docs/CHANGELOG.md` | Document changes |

## Verification

1. `python3 scripts/generate_menu_toolbar.py` runs without errors
2. `npm run build` (which runs generate + vite build) succeeds
3. `cargo build --manifest-path src-tauri/Cargo.toml` succeeds
4. `npx tauri dev` launches, all menus present and functional
5. All toolbar groups render with correct buttons and labels
6. Table group appears only when cursor is in a table
7. Menu accelerators work (Cmd+S, Cmd+O, Cmd+F, etc.)
8. Editor commands from menus work (underline, alignment, insert table, etc.)
9. App function menu items work (open file, save, zoom, fullscreen, etc.)
10. Add a new test item to the YAML, regenerate, verify it appears in both menu and toolbar
