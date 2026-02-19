import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { createEditor } from "./editor.js";
import { initSidebar } from "./sidebar.js";
import { initToolbar } from "./toolbar.js";
import { initStatusBar, updateStatusBar } from "./status_bar.js";
import { injectCSS } from "./css_injector.js";
import { setDirty, getDirty, guardNavigation } from "./dirty_guard.js";
import { initFindReplace, toggleFindReplace } from "./find_replace.js";
import { initSourceView, toggleSourceView, isInSourceMode } from "./source_view.js";
import { initZoom, zoomIn, zoomOut, zoomReset } from "./zoom.js";

// Application state
let editor = null;
let projectDir = null;
let currentFile = null;
let originalHead = null;
let isFragment = false;
let chapters = [];

//============================================
async function openFile() {
  /**
   * Open a single HTML file via native file picker.
   * Populates the sidebar with sibling HTML files from the same directory.
   */
  const filePath = await invoke("open_file");

  // Derive the parent directory from the file path
  const lastSlash = filePath.lastIndexOf("/");
  const dir = filePath.substring(0, lastSlash);
  const filename = filePath.substring(lastSlash + 1);
  projectDir = dir;

  // List sibling HTML files in the same directory
  chapters = await invoke("list_chapters", { projectDir: dir });

  // Populate sidebar with siblings
  const sidebar = document.querySelector("#sidebar");
  initSidebar(sidebar, chapters, (chapter) => {
    loadChapter(chapter);
  });

  // Load the selected file
  const selected = chapters.find((c) => c.path === filePath);
  if (selected) {
    loadChapter(selected);
  } else {
    // File might not be in the flat listing; load it directly
    loadChapter({ path: filePath, filename: filename, relative_path: filename });
  }
}

//============================================
async function openProject() {
  /**
   * Open a project folder via native dialog and load chapters.
   */
  const dir = await invoke("open_project");
  projectDir = dir;

  // List chapters in the project (recursively)
  chapters = await invoke("list_chapters", { projectDir: dir });

  // Populate sidebar
  const sidebar = document.querySelector("#sidebar");
  initSidebar(sidebar, chapters, (chapter) => {
    loadChapter(chapter);
  });

  // Auto-load the first chapter if any
  if (chapters.length > 0) {
    loadChapter(chapters[0]);
  }
}

//============================================
async function loadChapter(chapter) {
  /**
   * Load a chapter into the editor, with dirty guard.
   */
  const doLoad = async () => {
    const data = await invoke("read_chapter", {
      filePath: chapter.path,
      projectDir: projectDir,
    });

    currentFile = chapter.path;
    originalHead = data.original_head;
    isFragment = data.is_fragment;

    // Set editor content
    editor.commands.setContent(data.body_html);

    // Inject project CSS
    injectCSS(data.css);

    // Reset dirty state
    setDirty(false);
    updateStatusBar(data.filename, false, editor);
  };

  if (getDirty()) {
    await guardNavigation(saveCurrentChapter, doLoad);
  } else {
    await doLoad();
  }
}

//============================================
async function saveCurrentChapter() {
  /**
   * Save the current chapter back to disk.
   */
  if (!currentFile) return;

  // Get HTML from editor (or source textarea if in source mode)
  let bodyHtml;
  if (isInSourceMode()) {
    // Source view is active -- toggle back to sync, then get HTML
    toggleSourceView();
    bodyHtml = editor.getHTML();
    toggleSourceView();
  } else {
    bodyHtml = editor.getHTML();
  }

  await invoke("write_chapter", {
    filePath: currentFile,
    bodyHtml: bodyHtml,
    originalHead: originalHead,
    isFragment: isFragment,
  });

  setDirty(false);
  const filename = currentFile.split("/").pop();
  updateStatusBar(filename, false, editor);
}

//============================================
function navigateChapter(direction) {
  /**
   * Navigate to the next or previous chapter.
   * direction: 1 for next, -1 for previous.
   */
  if (chapters.length === 0 || !currentFile) return;

  const currentIndex = chapters.findIndex((c) => c.path === currentFile);
  if (currentIndex === -1) return;

  const newIndex = currentIndex + direction;
  if (newIndex < 0 || newIndex >= chapters.length) return;

  loadChapter(chapters[newIndex]);
}

//============================================
function toggleTheme() {
  /**
   * Manual toggle overrides system preference and persists to localStorage.
   */
  const isDark = document.body.classList.toggle("dark");
  localStorage.setItem("theme", isDark ? "dark" : "light");
}

//============================================
function applyTheme() {
  /**
   * Apply theme on startup. Uses localStorage if the user has manually toggled,
   * otherwise follows the OS prefers-color-scheme setting.
   */
  const stored = localStorage.getItem("theme");
  if (stored) {
    // User has explicitly chosen a theme
    document.body.classList.toggle("dark", stored === "dark");
  } else {
    // Follow system preference
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    document.body.classList.toggle("dark", prefersDark);
  }

  // Listen for system preference changes (only applies when no manual override)
  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (e) => {
    if (!localStorage.getItem("theme")) {
      document.body.classList.toggle("dark", e.matches);
    }
  });
}

//============================================
async function toggleFullscreen() {
  /**
   * Toggle fullscreen mode via Tauri window API.
   */
  const win = getCurrentWindow();
  const isFull = await win.isFullscreen();
  await win.setFullscreen(!isFull);
}

//============================================
async function importMarkdown() {
  /**
   * Import a Markdown file, converting it to HTML in the editor.
   */
  const { marked } = await import("marked");

  const filePath = await invoke("open_markdown_file");
  const content = await invoke("read_text_file", { filePath: filePath });

  // Convert Markdown to HTML
  const html = marked(content);
  editor.commands.setContent(html);
  setDirty(true);
  const filename = filePath.split("/").pop();
  updateStatusBar(filename, true, editor);
}

//============================================
async function exportMarkdown() {
  /**
   * Export the current editor content as a Markdown file.
   */
  const TurndownService = (await import("turndown")).default;
  const turndown = new TurndownService();

  // Get HTML from editor
  const html = editor.getHTML();

  // Convert to Markdown
  const markdown = turndown.turndown(html);

  // Save via Tauri dialog
  await invoke("save_markdown_file", { content: markdown });
}

//============================================
function setupKeyboardShortcuts() {
  /**
   * Register global keyboard shortcuts.
   */
  document.addEventListener("keydown", (e) => {
    const isMod = e.metaKey || e.ctrlKey;

    // Cmd+S: Save
    if (isMod && e.key === "s") {
      e.preventDefault();
      saveCurrentChapter();
      return;
    }

    // Cmd+Shift+O: Open folder
    if (isMod && e.shiftKey && e.key === "o") {
      e.preventDefault();
      openProject();
      return;
    }

    // Cmd+O: Open file
    if (isMod && e.key === "o") {
      e.preventDefault();
      openFile();
      return;
    }

    // Cmd+F: Find/replace
    if (isMod && e.key === "f") {
      e.preventDefault();
      toggleFindReplace();
      return;
    }

    // Cmd+Shift+U: Source view toggle
    if (isMod && e.shiftKey && e.key === "u") {
      e.preventDefault();
      toggleSourceView();
      return;
    }

    // Alt+PageDown: Next chapter
    if (e.altKey && e.key === "PageDown") {
      e.preventDefault();
      navigateChapter(1);
      return;
    }

    // Alt+PageUp: Previous chapter
    if (e.altKey && e.key === "PageUp") {
      e.preventDefault();
      navigateChapter(-1);
      return;
    }
  });
}

//============================================
function addToolbarOpenButton() {
  /**
   * Prepend a ribbon-style "File" group to the toolbar.
   */
  const toolbar = document.querySelector("#toolbar");
  const firstChild = toolbar.firstChild;

  // Divider after File group
  const divider = document.createElement("span");
  divider.className = "ribbon-divider";
  toolbar.insertBefore(divider, firstChild);

  // File group container
  const groupEl = document.createElement("div");
  groupEl.className = "ribbon-group";

  const btnRow = document.createElement("div");
  btnRow.className = "ribbon-buttons";

  // Open File button
  const openBtn = document.createElement("button");
  openBtn.textContent = "File";
  openBtn.title = "Open File (Cmd+O)";
  openBtn.addEventListener("click", openFile);
  btnRow.appendChild(openBtn);

  // Open Folder button
  const folderBtn = document.createElement("button");
  folderBtn.textContent = "Folder";
  folderBtn.title = "Open Folder (Cmd+Shift+O)";
  folderBtn.addEventListener("click", openProject);
  btnRow.appendChild(folderBtn);

  // Save button
  const saveBtn = document.createElement("button");
  saveBtn.textContent = "Save";
  saveBtn.title = "Save (Cmd+S)";
  saveBtn.addEventListener("click", saveCurrentChapter);
  btnRow.appendChild(saveBtn);

  groupEl.appendChild(btnRow);

  // Group label
  const label = document.createElement("span");
  label.className = "ribbon-label";
  label.textContent = "File";
  groupEl.appendChild(label);

  toolbar.insertBefore(groupEl, firstChild);
}

//============================================
function init() {
  /**
   * Application entry point.
   */
  const editorContainer = document.querySelector("#editor-container");
  const toolbar = document.querySelector("#toolbar");
  const statusBar = document.querySelector("#status-bar");

  // Apply theme: follows system preference, or localStorage if user toggled manually
  applyTheme();

  // Create the editor
  editor = createEditor(editorContainer, () => {
    setDirty(true);
    const filename = currentFile ? currentFile.split("/").pop() : null;
    updateStatusBar(filename, true, editor);
  });

  // Initialize toolbar: formatting buttons first, then Open/Save prepended
  initToolbar(toolbar, editor);
  addToolbarOpenButton();

  // Initialize status bar
  initStatusBar(statusBar);

  // Initialize find/replace
  initFindReplace(editor);

  // Initialize source view
  initSourceView(editor, editorContainer);

  // Initialize zoom
  initZoom();

  // Set up keyboard shortcuts
  setupKeyboardShortcuts();

  // Listen for native menu actions from Rust
  setupMenuListener();
}

//============================================
function setupMenuListener() {
  /**
   * Handle native macOS menu bar events from Rust.
   */
  listen("menu-action", (event) => {
    const action = event.payload;
    switch (action) {
      case "open_file":
        openFile();
        break;
      case "open_project":
        openProject();
        break;
      case "save":
        saveCurrentChapter();
        break;
      case "export":
        if (currentFile) {
          invoke("export_chapter", { filePath: currentFile });
        }
        break;
      case "close_window":
        getCurrentWindow().close();
        break;
      case "undo":
        editor.chain().focus().undo().run();
        break;
      case "redo":
        editor.chain().focus().redo().run();
        break;
      case "find":
        toggleFindReplace();
        break;
      case "source_view":
        toggleSourceView();
        break;
      case "zoom_in":
        zoomIn();
        break;
      case "zoom_out":
        zoomOut();
        break;
      case "zoom_reset":
        zoomReset();
        break;
      case "next_chapter":
        navigateChapter(1);
        break;
      case "prev_chapter":
        navigateChapter(-1);
        break;
      // Format menu actions
      case "underline":
        editor.chain().focus().toggleUnderline().run();
        break;
      case "subscript":
        editor.chain().focus().toggleSubscript().run();
        break;
      case "superscript":
        editor.chain().focus().toggleSuperscript().run();
        break;
      case "highlight":
        editor.chain().focus().toggleHighlight().run();
        break;
      case "align_left":
        editor.chain().focus().setTextAlign("left").run();
        break;
      case "align_center":
        editor.chain().focus().setTextAlign("center").run();
        break;
      case "align_right":
        editor.chain().focus().setTextAlign("right").run();
        break;
      case "align_justify":
        editor.chain().focus().setTextAlign("justify").run();
        break;
      // Insert menu actions
      case "horizontal_rule":
        editor.chain().focus().setHorizontalRule().run();
        break;
      case "insert_image": {
        const url = window.prompt("Enter image URL:");
        if (url) {
          editor.chain().focus().setImage({ src: url }).run();
        }
        break;
      }
      case "insert_table":
        editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
        break;
      case "code_block":
        editor.chain().focus().toggleCodeBlock().run();
        break;
      // View menu actions
      case "fullscreen":
        toggleFullscreen();
        break;
      case "dark_theme":
        toggleTheme();
        break;
      // Markdown import/export
      case "import_markdown":
        importMarkdown();
        break;
      case "export_markdown":
        exportMarkdown();
        break;
    }
  });
}

// Start when DOM is ready
document.addEventListener("DOMContentLoaded", init);
