import { invoke } from "@tauri-apps/api/core";
import { createEditor } from "./editor.js";
import { initSidebar } from "./sidebar.js";
import { initToolbar } from "./toolbar.js";
import { initStatusBar, updateStatusBar } from "./status_bar.js";
import { injectCSS } from "./css_injector.js";
import { setDirty, getDirty, guardNavigation } from "./dirty_guard.js";
import { initFindReplace, toggleFindReplace } from "./find_replace.js";
import { initSourceView, toggleSourceView, isInSourceMode } from "./source_view.js";
import { initZoom } from "./zoom.js";

// Application state
let editor = null;
let projectDir = null;
let currentFile = null;
let originalHead = null;
let isFragment = false;
let chapters = [];

//============================================
async function openProject() {
  /**
   * Open a project folder via native dialog and load chapters.
   */
  const dir = await invoke("open_project");
  projectDir = dir;

  // List chapters in the project
  chapters = await invoke("list_chapters", { projectDir: dir });

  // Populate sidebar
  const sidebar = document.querySelector("#sidebar");
  initSidebar(sidebar, chapters, (chapter) => {
    loadChapter(chapter);
  });
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

    // Cmd+O: Open project
    if (isMod && e.key === "o") {
      e.preventDefault();
      openProject();
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

  const openBtn = document.createElement("button");
  openBtn.textContent = "Open";
  openBtn.title = "Open Project Folder (Cmd+O)";
  openBtn.addEventListener("click", openProject);
  toolbar.appendChild(openBtn);

  // Add a separator
  const sep = document.createElement("span");
  sep.style.width = "1px";
  sep.style.height = "20px";
  sep.style.background = "#ccc";
  sep.style.margin = "0 6px";
  toolbar.appendChild(sep);

  // Save button
  const saveBtn = document.createElement("button");
  saveBtn.textContent = "Save";
  saveBtn.title = "Save (Cmd+S)";
  saveBtn.addEventListener("click", saveCurrentChapter);
  toolbar.appendChild(saveBtn);

  // Another separator
  const sep2 = document.createElement("span");
  sep2.style.width = "1px";
  sep2.style.height = "20px";
  sep2.style.background = "#ccc";
  sep2.style.margin = "0 6px";
  toolbar.appendChild(sep2);
}

//============================================
function init() {
  /**
   * Application entry point.
   */
  const editorContainer = document.querySelector("#editor-container");
  const toolbar = document.querySelector("#toolbar");
  const statusBar = document.querySelector("#status-bar");

  // Add Open/Save buttons first
  addToolbarOpenButton();

  // Create the editor
  editor = createEditor(editorContainer, () => {
    setDirty(true);
    const filename = currentFile ? currentFile.split("/").pop() : null;
    updateStatusBar(filename, true, editor);
  });

  // Initialize toolbar formatting buttons
  initToolbar(toolbar, editor);

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
}

// Start when DOM is ready
document.addEventListener("DOMContentLoaded", init);
