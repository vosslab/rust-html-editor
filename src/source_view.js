let editor = null;
let editorContainer = null;
let textarea = null;
let isSourceMode = false;

/**
 * Initialize source view toggle.
 *
 * @param {Editor} editorInstance - The TipTap editor.
 * @param {HTMLElement} container - The editor container element.
 */
//============================================
export function initSourceView(editorInstance, container) {
  editor = editorInstance;
  editorContainer = container;

  // Create the textarea for source editing
  textarea = document.createElement("textarea");
  textarea.className = "source-textarea";
  textarea.style.display = "none";
  textarea.style.width = "100%";
  textarea.style.height = "100%";
  textarea.style.fontFamily = "monospace";
  textarea.style.fontSize = "13px";
  textarea.style.padding = "20px";
  textarea.style.border = "none";
  textarea.style.outline = "none";
  textarea.style.resize = "none";
  textarea.style.whiteSpace = "pre-wrap";
  textarea.style.tabSize = "2";

  container.appendChild(textarea);
}

/**
 * Toggle between WYSIWYG and source view.
 *
 * @returns {boolean} True if now in source mode.
 */
//============================================
export function toggleSourceView() {
  if (isSourceMode) {
    // Switch from source to WYSIWYG
    switchToWysiwyg();
  } else {
    // Switch from WYSIWYG to source
    switchToSource();
  }

  isSourceMode = !isSourceMode;
  return isSourceMode;
}

/**
 * Check if currently in source mode.
 *
 * @returns {boolean}
 */
//============================================
export function isInSourceMode() {
  return isSourceMode;
}

/**
 * Switch to source (raw HTML) view.
 */
//============================================
function switchToSource() {
  // Get current HTML from editor
  const html = editor.getHTML();
  textarea.value = html;

  // Hide the TipTap editor, show textarea
  const tiptapEl = editorContainer.querySelector(".tiptap");
  if (tiptapEl) {
    tiptapEl.style.display = "none";
  }
  textarea.style.display = "block";
  textarea.focus();
}

/**
 * Switch back to WYSIWYG view, applying source changes.
 */
//============================================
function switchToWysiwyg() {
  // Get edited HTML from textarea
  const html = textarea.value;

  // Set it back into the editor
  editor.commands.setContent(html);

  // Show TipTap, hide textarea
  textarea.style.display = "none";
  const tiptapEl = editorContainer.querySelector(".tiptap");
  if (tiptapEl) {
    tiptapEl.style.display = "block";
  }
  editor.commands.focus();
}
