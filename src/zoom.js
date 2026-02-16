let currentZoom = 100;
const MIN_ZOOM = 50;
const MAX_ZOOM = 200;
const STEP = 10;

/**
 * Initialize zoom keyboard shortcuts.
 * Cmd+= zooms in, Cmd+- zooms out, Cmd+0 resets.
 */
//============================================
export function initZoom() {
  document.addEventListener("keydown", (e) => {
    // Only respond to Cmd (Mac) or Ctrl (other) key combos
    if (!e.metaKey && !e.ctrlKey) return;

    if (e.key === "=" || e.key === "+") {
      e.preventDefault();
      zoomIn();
    } else if (e.key === "-") {
      e.preventDefault();
      zoomOut();
    } else if (e.key === "0") {
      e.preventDefault();
      zoomReset();
    }
  });
}

/**
 * Zoom in by one step.
 */
//============================================
export function zoomIn() {
  currentZoom = Math.min(currentZoom + STEP, MAX_ZOOM);
  applyZoom();
}

/**
 * Zoom out by one step.
 */
//============================================
export function zoomOut() {
  currentZoom = Math.max(currentZoom - STEP, MIN_ZOOM);
  applyZoom();
}

/**
 * Reset zoom to 100%.
 */
//============================================
export function zoomReset() {
  currentZoom = 100;
  applyZoom();
}

/**
 * Apply the current zoom level to the editor container.
 */
//============================================
function applyZoom() {
  const container = document.querySelector("#editor-container");
  if (container) {
    container.style.fontSize = `${currentZoom}%`;
  }
}

/**
 * Get the current zoom percentage.
 *
 * @returns {number}
 */
//============================================
export function getZoom() {
  return currentZoom;
}
