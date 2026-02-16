/**
 * Initialize the toolbar with formatting buttons.
 *
 * @param {HTMLElement} container - The toolbar DOM element.
 * @param {Editor} editor - The TipTap editor instance.
 */
//============================================
export function initToolbar(container, editor) {
  container.innerHTML = "";

  // Define toolbar buttons
  const buttons = [
    { label: "B", command: "toggleBold", title: "Bold (Cmd+B)" },
    { label: "I", command: "toggleItalic", title: "Italic (Cmd+I)" },
    { label: "S", command: "toggleStrike", title: "Strikethrough" },
    { type: "separator" },
    { label: "H1", command: "toggleHeading", args: { level: 1 }, title: "Heading 1" },
    { label: "H2", command: "toggleHeading", args: { level: 2 }, title: "Heading 2" },
    { label: "H3", command: "toggleHeading", args: { level: 3 }, title: "Heading 3" },
    { label: "P", command: "setParagraph", title: "Paragraph" },
    { type: "separator" },
    { label: "UL", command: "toggleBulletList", title: "Bullet List" },
    { label: "OL", command: "toggleOrderedList", title: "Ordered List" },
    { label: "BQ", command: "toggleBlockquote", title: "Blockquote" },
    { label: "Code", command: "toggleCode", title: "Inline Code" },
    { type: "separator" },
    { label: "Link", command: "setLink", title: "Insert Link" },
    { type: "separator" },
    { label: "Undo", command: "undo", title: "Undo (Cmd+Z)" },
    { label: "Redo", command: "redo", title: "Redo (Cmd+Shift+Z)" },
  ];

  buttons.forEach((btn) => {
    if (btn.type === "separator") {
      const sep = document.createElement("span");
      sep.style.width = "1px";
      sep.style.height = "20px";
      sep.style.background = "#ccc";
      sep.style.margin = "0 4px";
      container.appendChild(sep);
      return;
    }

    const button = document.createElement("button");
    button.textContent = btn.label;
    button.title = btn.title || btn.label;

    button.addEventListener("click", () => {
      handleToolbarClick(editor, btn);
    });

    container.appendChild(button);
  });

  // Track active states on transaction
  editor.on("transaction", () => {
    updateActiveStates(container, editor);
  });
}

/**
 * Handle a toolbar button click.
 */
//============================================
function handleToolbarClick(editor, btn) {
  if (btn.command === "setLink") {
    // Prompt for URL
    const url = window.prompt("Enter URL:");
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
    return;
  }

  // Run the chain command
  const chain = editor.chain().focus();
  if (btn.args) {
    chain[btn.command](btn.args).run();
  } else {
    chain[btn.command]().run();
  }
}

/**
 * Update button active states based on current editor selection.
 */
//============================================
function updateActiveStates(container, editor) {
  const buttons = container.querySelectorAll("button");

  buttons.forEach((button) => {
    const label = button.textContent;
    let isActive = false;

    switch (label) {
      case "B":
        isActive = editor.isActive("bold");
        break;
      case "I":
        isActive = editor.isActive("italic");
        break;
      case "S":
        isActive = editor.isActive("strike");
        break;
      case "H1":
        isActive = editor.isActive("heading", { level: 1 });
        break;
      case "H2":
        isActive = editor.isActive("heading", { level: 2 });
        break;
      case "H3":
        isActive = editor.isActive("heading", { level: 3 });
        break;
      case "UL":
        isActive = editor.isActive("bulletList");
        break;
      case "OL":
        isActive = editor.isActive("orderedList");
        break;
      case "BQ":
        isActive = editor.isActive("blockquote");
        break;
      case "Code":
        isActive = editor.isActive("code");
        break;
      case "Link":
        isActive = editor.isActive("link");
        break;
    }

    button.classList.toggle("is-active", isActive);
  });
}
