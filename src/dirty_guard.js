let dirty = false;

/**
 * Mark the editor as having unsaved changes.
 */
//============================================
export function setDirty(value) {
  dirty = value;
}

/**
 * Check whether the editor has unsaved changes.
 *
 * @returns {boolean}
 */
//============================================
export function getDirty() {
  return dirty;
}

/**
 * Guard a navigation action when the editor is dirty.
 * Shows a Save/Discard/Cancel dialog if there are unsaved changes.
 *
 * @param {Function} onSave - Async callback to save the current file.
 * @param {Function} onProceed - Callback to proceed with navigation.
 * @returns {Promise<boolean>} True if navigation should proceed.
 */
//============================================
export async function guardNavigation(onSave, onProceed) {
  if (!dirty) {
    // No unsaved changes, proceed directly
    onProceed();
    return true;
  }

  // Show a simple dialog
  const choice = window.confirm(
    "You have unsaved changes. Click OK to discard, or Cancel to stay."
  );

  if (choice) {
    // User chose to discard
    dirty = false;
    onProceed();
    return true;
  }

  // User chose to stay
  return false;
}
