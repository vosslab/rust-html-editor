import defaultCSS from "./styles/default_book.css?raw";

const STYLE_ID = "book-css";

/**
 * Inject CSS text into the document, scoped to the .tiptap editor area.
 * Replaces any previously injected book CSS.
 * Falls back to default_book.css when no project CSS is provided.
 *
 * @param {string} cssText - Raw CSS from the project's book.css file (may be empty).
 */
//============================================
export function injectCSS(cssText) {
  // Remove existing book CSS
  removeCSS();

  // Use the default stylesheet if no project CSS is available
  const css = (cssText && cssText.trim()) ? cssText : defaultCSS;

  // Scope all rules to .tiptap so they only affect the editor content
  const scopedCSS = scopeRules(css);

  // Create and insert style element
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = scopedCSS;
  document.head.appendChild(style);
}

/**
 * Remove the injected book CSS.
 */
//============================================
export function removeCSS() {
  const existing = document.getElementById(STYLE_ID);
  if (existing) {
    existing.remove();
  }
}

/**
 * Prefix each CSS rule selector with .tiptap to scope it.
 * Simple approach: prepend .tiptap to each rule block.
 *
 * @param {string} cssText - Raw CSS text.
 * @returns {string} Scoped CSS text.
 */
//============================================
function scopeRules(cssText) {
  // Match rule blocks: selector { ... }
  // This handles most common cases (not @media, @keyframes)
  return cssText.replace(
    /([^{}@]+)\{/g,
    (match, selectors) => {
      // Skip if it looks like a media query or keyframe inner
      const trimmed = selectors.trim();
      if (!trimmed || trimmed.startsWith("@") || trimmed.startsWith("from") ||
          trimmed.startsWith("to") || /^\d+%/.test(trimmed)) {
        return match;
      }

      // Prefix each comma-separated selector with .tiptap
      const scoped = trimmed
        .split(",")
        .map((s) => `.tiptap ${s.trim()}`)
        .join(", ");

      return `${scoped} {`;
    }
  );
}
