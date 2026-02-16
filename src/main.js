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
   * Add an "Open Project" button to the toolbar.
   */
  const toolbar = document.querySelector("#toolbar");

  // Build elements in reverse order for prepending
  const firstChild = toolbar.firstChild;

  // Separator after Save
  const sep2 = document.createElement("span");
  sep2.style.width = "1px";
  sep2.style.height = "20px";
  sep2.style.background = "#ccc";
  sep2.style.margin = "0 6px";
  toolbar.insertBefore(sep2, firstChild);

  // Save button
  const saveBtn = document.createElement("button");
  saveBtn.textContent = "Save";
  saveBtn.title = "Save (Cmd+S)";
  saveBtn.addEventListener("click", saveCurrentChapter);
  toolbar.insertBefore(saveBtn, firstChild);

  // Separator between Open and Save
  const sep = document.createElement("span");
  sep.style.width = "1px";
  sep.style.height = "20px";
  sep.style.background = "#ccc";
  sep.style.margin = "0 6px";
  toolbar.insertBefore(sep, firstChild);

  // Open button (leftmost)
  const openBtn = document.createElement("button");
  openBtn.textContent = "Open";
  openBtn.title = "Open File (Cmd+O)";
  openBtn.addEventListener("click", openFile);
  toolbar.insertBefore(openBtn, firstChild);
}

//============================================
function init() {
  /**
   * Application entry point.
   */
  const editorContainer = document.querySelector("#editor-container");
  const toolbar = document.querySelector("#toolbar");
  const statusBar = document.querySelector("#status-bar");

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
    }
  });
}

// Start when DOM is ready
document.addEventListener("DOMContentLoaded", init);
