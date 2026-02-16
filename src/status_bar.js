let statusBarElement = null;
let debounceTimer = null;

/**
 * Initialize the status bar module.
 *
 * @param {HTMLElement} element - The status bar DOM element.
 */
//============================================
export function initStatusBar(element) {
  statusBarElement = element;
  statusBarElement.textContent = "No file | 0 words";
}

/**
 * Update the status bar display with debounced word count.
 *
 * @param {string} filename - Current file name (or null).
 * @param {boolean} isDirty - Whether the editor has unsaved changes.
 * @param {Editor} editor - The TipTap editor instance.
 */
//============================================
export function updateStatusBar(filename, isDirty, editor) {
  if (!statusBarElement) return;

  // Debounce word count calculation (300ms)
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    const displayName = filename || "No file";
    const dirtyMark = isDirty ? " *" : "";
    const wordCount = countWords(editor);
    statusBarElement.textContent = `${displayName}${dirtyMark} | ${wordCount} words`;
  }, 300);
}

/**
 * Count words in the editor content.
 *
 * @param {Editor} editor - The TipTap editor instance.
 * @returns {number} Word count.
 */
//============================================
function countWords(editor) {
  if (!editor) return 0;
  const text = editor.state.doc.textContent;
  if (!text.trim()) return 0;
  return text.trim().split(/\s+/).length;
}
