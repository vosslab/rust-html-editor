let statusBarElement = null;
let debounceTimer = null;

// Word count threshold for warning display
const WORD_COUNT_WARNING = 5000;

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

    // Apply warning style when word count exceeds threshold
    if (wordCount > WORD_COUNT_WARNING) {
      statusBarElement.classList.add("word-count-warning");
    } else {
      statusBarElement.classList.remove("word-count-warning");
    }
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
