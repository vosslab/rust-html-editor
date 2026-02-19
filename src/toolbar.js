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
    { label: "U", command: "toggleUnderline", title: "Underline (Cmd+U)" },
    { label: "Sub", command: "toggleSubscript", title: "Subscript" },
    { label: "Sup", command: "toggleSuperscript", title: "Superscript" },
    { label: "Hi", command: "toggleHighlight", title: "Highlight" },
    { type: "separator" },
    { label: "H1", command: "toggleHeading", args: { level: 1 }, title: "Heading 1" },
    { label: "H2", command: "toggleHeading", args: { level: 2 }, title: "Heading 2" },
    { label: "H3", command: "toggleHeading", args: { level: 3 }, title: "Heading 3" },
    { label: "H4", command: "toggleHeading", args: { level: 4 }, title: "Heading 4" },
    { label: "H5", command: "toggleHeading", args: { level: 5 }, title: "Heading 5" },
    { label: "H6", command: "toggleHeading", args: { level: 6 }, title: "Heading 6" },
    { label: "P", command: "setParagraph", title: "Paragraph" },
    { type: "separator" },
    { label: "Left", command: "setTextAlign", args: "left", title: "Align Left" },
    { label: "Center", command: "setTextAlign", args: "center", title: "Align Center" },
    { label: "Right", command: "setTextAlign", args: "right", title: "Align Right" },
    { label: "Justify", command: "setTextAlign", args: "justify", title: "Justify" },
    { type: "separator" },
    { label: "UL", command: "toggleBulletList", title: "Bullet List" },
    { label: "OL", command: "toggleOrderedList", title: "Ordered List" },
    { label: "BQ", command: "toggleBlockquote", title: "Blockquote" },
    { label: "Code", command: "toggleCode", title: "Inline Code" },
    { label: "CB", command: "toggleCodeBlock", title: "Code Block" },
    { type: "separator" },
    { label: "HR", command: "setHorizontalRule", title: "Horizontal Rule" },
    { label: "Img", command: "insertImage", title: "Insert Image" },
    { label: "Table", command: "insertTable", title: "Insert Table (3x3)" },
    { label: "+Row", command: "addRowAfter", title: "Add Row After" },
    { label: "-Row", command: "deleteRow", title: "Delete Row" },
    { label: "+Col", command: "addColumnAfter", title: "Add Column After" },
    { label: "-Col", command: "deleteColumn", title: "Delete Column" },
    { label: "DelTbl", command: "deleteTable", title: "Delete Table" },
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
  // Link: prompt for URL
  if (btn.command === "setLink") {
    const url = window.prompt("Enter URL:");
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
    return;
  }

  // Image: prompt for URL
  if (btn.command === "insertImage") {
    const url = window.prompt("Enter image URL:");
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
    return;
  }

  // Table: insert 3x3 with header row
  if (btn.command === "insertTable") {
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
    return;
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
      case "U":
        isActive = editor.isActive("underline");
        break;
      case "Sub":
        isActive = editor.isActive("subscript");
        break;
      case "Sup":
        isActive = editor.isActive("superscript");
        break;
      case "Hi":
        isActive = editor.isActive("highlight");
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
      case "H4":
        isActive = editor.isActive("heading", { level: 4 });
        break;
      case "H5":
        isActive = editor.isActive("heading", { level: 5 });
        break;
      case "H6":
        isActive = editor.isActive("heading", { level: 6 });
        break;
      case "Left":
        isActive = editor.isActive({ textAlign: "left" });
        break;
      case "Center":
        isActive = editor.isActive({ textAlign: "center" });
        break;
      case "Right":
        isActive = editor.isActive({ textAlign: "right" });
        break;
      case "Justify":
        isActive = editor.isActive({ textAlign: "justify" });
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
      case "CB":
        isActive = editor.isActive("codeBlock");
        break;
      case "Link":
        isActive = editor.isActive("link");
        break;
    }

    button.classList.toggle("is-active", isActive);
  });
}
