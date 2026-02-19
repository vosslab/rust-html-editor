import {
  toolbarGroups,
  activeStateChecks,
  specialHandlers,
  conditionalGroups,
} from "./generated_toolbar_data.js";

/**
 * Initialize the toolbar with ribbon-style grouped formatting buttons.
 *
 * @param {HTMLElement} container - The toolbar DOM element.
 * @param {Editor} editor - The TipTap editor instance.
 */
//============================================
export function initToolbar(container, editor) {
  container.innerHTML = "";

  toolbarGroups.forEach((group, index) => {
    // Add divider between groups (but not before the first)
    if (index > 0) {
      const divider = document.createElement("span");
      divider.className = "ribbon-divider";
      if (group.id) {
        divider.setAttribute("data-for-group", group.id);
      }
      container.appendChild(divider);
    }

    // Create group container
    const groupEl = document.createElement("div");
    groupEl.className = "ribbon-group";
    if (group.id) {
      groupEl.id = group.id;
    }

    // Button row
    const btnRow = document.createElement("div");
    btnRow.className = "ribbon-buttons";

    group.buttons.forEach((btn) => {
      const button = document.createElement("button");
      button.textContent = btn.label;
      button.title = btn.title || btn.label;
      button.addEventListener("click", () => {
        handleToolbarClick(editor, btn);
      });
      btnRow.appendChild(button);
    });

    groupEl.appendChild(btnRow);

    // Group label
    const label = document.createElement("span");
    label.className = "ribbon-label";
    label.textContent = group.name;
    groupEl.appendChild(label);

    container.appendChild(groupEl);
  });

  // Track active states on transaction
  editor.on("transaction", () => {
    updateActiveStates(container, editor);
  });
}

/**
 * Handle a toolbar button click using generated special handlers or default chain.
 */
//============================================
function handleToolbarClick(editor, btn) {
  // Check for special handlers from generated data
  const special = specialHandlers[btn.command];
  if (special) {
    if (special.type === "prompt_url") {
      const url = window.prompt(special.promptText);
      if (url) {
        const args = {};
        args[special.argsKey] = url;
        editor.chain().focus()[special.editorCommand](args).run();
      }
      return;
    }
    if (special.type === "insert_table") {
      editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
      return;
    }
  }

  // Text alignment: pass direction string as argument
  if (btn.command === "setTextAlign") {
    editor.chain().focus().setTextAlign(btn.args).run();
    return;
  }

  // Default: run the chain command
  const chain = editor.chain().focus();
  if (btn.args) {
    chain[btn.command](btn.args).run();
  } else {
    chain[btn.command]().run();
  }
}

/**
 * Update button active states based on current editor selection.
 * Uses generated activeStateChecks array instead of a hardcoded switch.
 */
//============================================
function updateActiveStates(container, editor) {
  const buttons = container.querySelectorAll("button");

  // Build a lookup from label to active check
  const checkMap = {};
  activeStateChecks.forEach((entry) => {
    checkMap[entry.label] = entry;
  });

  buttons.forEach((button) => {
    const label = button.textContent;
    const entry = checkMap[label];
    let isActive = false;

    if (entry) {
      if (entry.checkAttr) {
        // Attribute-style check: editor.isActive({ textAlign: "left" })
        isActive = editor.isActive(entry.checkAttr);
      } else if (entry.args) {
        // Check with args: editor.isActive("heading", { level: 1 })
        isActive = editor.isActive(entry.check, entry.args);
      } else {
        // Simple check: editor.isActive("bold")
        isActive = editor.isActive(entry.check);
      }
    }

    button.classList.toggle("is-active", isActive);
  });

  // Show/hide conditional groups
  conditionalGroups.forEach((cg) => {
    let visible = false;
    if (cg.condition === "in_table") {
      visible = editor.isActive("table");
    }
    const groupEl = container.querySelector("#" + cg.domId);
    const divider = container.querySelector('[data-for-group="' + cg.domId + '"]');
    if (groupEl) {
      groupEl.style.display = visible ? "" : "none";
    }
    if (divider) {
      divider.style.display = visible ? "" : "none";
    }
  });
}
