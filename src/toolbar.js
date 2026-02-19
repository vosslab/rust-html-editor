/**
 * Initialize the toolbar with ribbon-style grouped formatting buttons.
 *
 * @param {HTMLElement} container - The toolbar DOM element.
 * @param {Editor} editor - The TipTap editor instance.
 */
//============================================
export function initToolbar(container, editor) {
  container.innerHTML = "";

  // Define ribbon groups: each group has a label and a list of buttons
  const groups = [
    {
      name: "History",
      buttons: [
        { label: "Undo", command: "undo", title: "Undo (Cmd+Z)" },
        { label: "Redo", command: "redo", title: "Redo (Cmd+Shift+Z)" },
      ],
    },
    {
      name: "Text",
      buttons: [
        { label: "B", command: "toggleBold", title: "Bold (Cmd+B)" },
        { label: "I", command: "toggleItalic", title: "Italic (Cmd+I)" },
        { label: "U", command: "toggleUnderline", title: "Underline (Cmd+U)" },
        { label: "S", command: "toggleStrike", title: "Strikethrough" },
        { label: "Sub", command: "toggleSubscript", title: "Subscript" },
        { label: "Sup", command: "toggleSuperscript", title: "Superscript" },
        { label: "Hi", command: "toggleHighlight", title: "Highlight" },
      ],
    },
    {
      name: "Heading",
      buttons: [
        { label: "P", command: "setParagraph", title: "Paragraph" },
        { label: "H1", command: "toggleHeading", args: { level: 1 }, title: "Heading 1" },
        { label: "H2", command: "toggleHeading", args: { level: 2 }, title: "Heading 2" },
        { label: "H3", command: "toggleHeading", args: { level: 3 }, title: "Heading 3" },
        { label: "H4", command: "toggleHeading", args: { level: 4 }, title: "Heading 4" },
        { label: "H5", command: "toggleHeading", args: { level: 5 }, title: "Heading 5" },
        { label: "H6", command: "toggleHeading", args: { level: 6 }, title: "Heading 6" },
      ],
    },
    {
      name: "Align",
      buttons: [
        { label: "Left", command: "setTextAlign", args: "left", title: "Align Left" },
        { label: "Center", command: "setTextAlign", args: "center", title: "Align Center" },
        { label: "Right", command: "setTextAlign", args: "right", title: "Align Right" },
        { label: "Justify", command: "setTextAlign", args: "justify", title: "Justify" },
      ],
    },
    {
      name: "Lists",
      buttons: [
        { label: "UL", command: "toggleBulletList", title: "Bullet List" },
        { label: "OL", command: "toggleOrderedList", title: "Ordered List" },
        { label: "BQ", command: "toggleBlockquote", title: "Blockquote" },
      ],
    },
    {
      name: "Code",
      buttons: [
        { label: "Code", command: "toggleCode", title: "Inline Code" },
        { label: "CB", command: "toggleCodeBlock", title: "Code Block" },
      ],
    },
    {
      name: "Insert",
      buttons: [
        { label: "Link", command: "setLink", title: "Insert Link" },
        { label: "HR", command: "setHorizontalRule", title: "Horizontal Rule" },
        { label: "Img", command: "insertImage", title: "Insert Image" },
        { label: "Table", command: "insertTable", title: "Insert Table (3x3)" },
      ],
    },
    {
      name: "Table",
      id: "ribbon-table-group",
      buttons: [
        { label: "+Row", command: "addRowAfter", title: "Add Row After" },
        { label: "-Row", command: "deleteRow", title: "Delete Row" },
        { label: "+Col", command: "addColumnAfter", title: "Add Column After" },
        { label: "-Col", command: "deleteColumn", title: "Delete Column" },
        { label: "DelTbl", command: "deleteTable", title: "Delete Table" },
      ],
    },
  ];

  groups.forEach((group, index) => {
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

  // Show/hide Table editing group based on cursor position
  const inTable = editor.isActive("table");
  const tableGroup = container.querySelector("#ribbon-table-group");
  const tableDivider = container.querySelector('[data-for-group="ribbon-table-group"]');
  if (tableGroup) {
    tableGroup.style.display = inTable ? "" : "none";
  }
  if (tableDivider) {
    tableDivider.style.display = inTable ? "" : "none";
  }
}
