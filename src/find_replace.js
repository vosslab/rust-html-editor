import { TextSelection } from "@tiptap/pm/state";

let panel = null;
let editor = null;
let matches = [];
let currentMatchIndex = -1;

/**
 * Initialize find/replace with a TipTap editor instance.
 *
 * @param {Editor} editorInstance - The TipTap editor.
 */
//============================================
export function initFindReplace(editorInstance) {
  editor = editorInstance;
  createPanel();
}

/**
 * Toggle the find/replace panel visibility.
 */
//============================================
export function toggleFindReplace() {
  if (!panel) return;
  const isVisible = panel.style.display !== "none";
  panel.style.display = isVisible ? "none" : "flex";
  if (!isVisible) {
    // Focus the search input when opening
    const input = panel.querySelector(".find-input");
    if (input) input.focus();
  }
}

/**
 * Create the floating find/replace panel DOM.
 */
//============================================
function createPanel() {
  panel = document.createElement("div");
  panel.className = "find-replace-panel";
  panel.style.display = "none";

  panel.innerHTML = [
    '<div class="find-row">',
    '  <input type="text" class="find-input" placeholder="Find..." />',
    '  <button class="find-prev-btn" title="Previous (Shift+Enter)">Prev</button>',
    '  <button class="find-next-btn" title="Next (Enter)">Next</button>',
    '  <span class="find-count">0/0</span>',
    '  <button class="find-close-btn" title="Close (Esc)">X</button>',
    '</div>',
    '<div class="replace-row">',
    '  <input type="text" class="replace-input" placeholder="Replace..." />',
    '  <button class="replace-btn">Replace</button>',
    '  <button class="replace-all-btn">Replace All</button>',
    '</div>',
  ].join("\n");

  document.body.appendChild(panel);

  // Wire up events
  const findInput = panel.querySelector(".find-input");
  const replaceInput = panel.querySelector(".replace-input");

  findInput.addEventListener("input", () => findAll(findInput.value));

  findInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (e.shiftKey) {
        findPrevious();
      } else {
        findNext();
      }
    }
    if (e.key === "Escape") {
      toggleFindReplace();
    }
  });

  replaceInput.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      toggleFindReplace();
    }
  });

  panel.querySelector(".find-next-btn").addEventListener("click", findNext);
  panel.querySelector(".find-prev-btn").addEventListener("click", findPrevious);
  panel.querySelector(".find-close-btn").addEventListener("click", toggleFindReplace);
  panel.querySelector(".replace-btn").addEventListener("click", replaceCurrent);
  panel.querySelector(".replace-all-btn").addEventListener("click", replaceAll);
}

/**
 * Find all occurrences of the search term in the document.
 *
 * @param {string} term - The search string.
 */
//============================================
function findAll(term) {
  matches = [];
  currentMatchIndex = -1;

  if (!term || !editor) {
    updateCount();
    return;
  }

  const lowerTerm = term.toLowerCase();

  // Walk through all text nodes in the ProseMirror document
  editor.state.doc.descendants((node, pos) => {
    if (!node.isText) return;

    const text = node.text.toLowerCase();
    let index = 0;

    while (index < text.length) {
      const found = text.indexOf(lowerTerm, index);
      if (found === -1) break;

      matches.push({
        from: pos + found,
        to: pos + found + term.length,
      });
      index = found + 1;
    }
  });

  updateCount();

  // Jump to first match if any
  if (matches.length > 0) {
    currentMatchIndex = 0;
    selectMatch(currentMatchIndex);
  }
}

/**
 * Move to the next match.
 */
//============================================
function findNext() {
  if (matches.length === 0) return;
  currentMatchIndex = (currentMatchIndex + 1) % matches.length;
  selectMatch(currentMatchIndex);
}

/**
 * Move to the previous match.
 */
//============================================
function findPrevious() {
  if (matches.length === 0) return;
  currentMatchIndex = (currentMatchIndex - 1 + matches.length) % matches.length;
  selectMatch(currentMatchIndex);
}

/**
 * Select a match in the editor.
 *
 * @param {number} index - Index into the matches array.
 */
//============================================
function selectMatch(index) {
  if (index < 0 || index >= matches.length) return;
  const match = matches[index];

  // Create a text selection at the match position
  const { tr } = editor.state;
  tr.setSelection(TextSelection.create(editor.state.doc, match.from, match.to));
  tr.scrollIntoView();
  editor.view.dispatch(tr);

  updateCount();
}

/**
 * Replace the current match with the replacement text.
 */
//============================================
function replaceCurrent() {
  if (currentMatchIndex < 0 || currentMatchIndex >= matches.length) return;

  const replaceInput = panel.querySelector(".replace-input");
  const replaceText = replaceInput.value;
  const match = matches[currentMatchIndex];

  // Replace in a single transaction
  editor.chain()
    .focus()
    .command(({ tr }) => {
      tr.replaceWith(match.from, match.to,
        editor.state.schema.text(replaceText));
      return true;
    })
    .run();

  // Re-run find to update matches
  const findInput = panel.querySelector(".find-input");
  findAll(findInput.value);
}

/**
 * Replace all matches with the replacement text.
 */
//============================================
function replaceAll() {
  if (matches.length === 0) return;

  const replaceInput = panel.querySelector(".replace-input");
  const replaceText = replaceInput.value;

  // Replace all in a single transaction (iterate in reverse to preserve positions)
  editor.chain()
    .focus()
    .command(({ tr }) => {
      // Process matches in reverse order so positions stay valid
      for (let i = matches.length - 1; i >= 0; i--) {
        const match = matches[i];
        tr.replaceWith(match.from, match.to,
          editor.state.schema.text(replaceText));
      }
      return true;
    })
    .run();

  // Re-run find (should find 0 matches now)
  const findInput = panel.querySelector(".find-input");
  findAll(findInput.value);
}

/**
 * Update the match count display.
 */
//============================================
function updateCount() {
  const countEl = panel.querySelector(".find-count");
  if (matches.length === 0) {
    countEl.textContent = "0/0";
  } else {
    countEl.textContent = `${currentMatchIndex + 1}/${matches.length}`;
  }
}
