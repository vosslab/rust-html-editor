/**
 * Initialize the sidebar with a list of chapter files.
 * Groups chapters by subdirectory with collapsible folder headers.
 *
 * @param {HTMLElement} container - The sidebar DOM element.
 * @param {Array} chapters - Array of {filename, path, relative_path} objects.
 * @param {Function} onSelect - Callback when a chapter is clicked: onSelect(chapter).
 */
//============================================
export function initSidebar(container, chapters, onSelect) {
  // Clear existing content
  container.innerHTML = "";

  // Add header
  const header = document.createElement("div");
  header.className = "sidebar-header";
  header.textContent = "Chapters";
  container.appendChild(header);

  // Group chapters by subdirectory
  const groups = groupByDirectory(chapters);

  // Render each group
  for (const [dirName, dirChapters] of groups) {
    // Add folder header if there are subdirectories
    if (dirName) {
      const folderHeader = document.createElement("div");
      folderHeader.className = "sidebar-folder";
      folderHeader.textContent = dirName;
      container.appendChild(folderHeader);
    }

    // Add chapter items
    dirChapters.forEach((chapter) => {
      const item = document.createElement("div");
      item.className = "chapter-item";
      // Indent items that are in subdirectories
      if (dirName) {
        item.style.paddingLeft = "24px";
      }
      item.textContent = chapter.filename;
      item.dataset.path = chapter.path;

      item.addEventListener("click", () => {
        // Remove active class from all items
        container.querySelectorAll(".chapter-item").forEach((el) => {
          el.classList.remove("active");
        });
        // Mark this item active
        item.classList.add("active");
        // Notify the callback
        onSelect(chapter);
      });

      container.appendChild(item);
    });
  }
}

/**
 * Group chapters by their parent directory.
 *
 * @param {Array} chapters - Array of chapter objects with relative_path.
 * @returns {Array} Array of [dirName, chapters] pairs in order.
 */
//============================================
function groupByDirectory(chapters) {
  const groups = new Map();

  chapters.forEach((chapter) => {
    // Extract directory from relative path
    const relPath = chapter.relative_path || chapter.filename;
    const lastSlash = relPath.lastIndexOf("/");
    const dirName = lastSlash > 0 ? relPath.substring(0, lastSlash) : "";

    if (!groups.has(dirName)) {
      groups.set(dirName, []);
    }
    groups.get(dirName).push(chapter);
  });

  return Array.from(groups.entries());
}

/**
 * Set the active chapter in the sidebar by file path.
 *
 * @param {HTMLElement} container - The sidebar DOM element.
 * @param {string} filePath - Path of the chapter to mark active.
 */
//============================================
export function setActiveChapter(container, filePath) {
  container.querySelectorAll(".chapter-item").forEach((el) => {
    if (el.dataset.path === filePath) {
      el.classList.add("active");
    } else {
      el.classList.remove("active");
    }
  });
}
