import { Editor } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";

/**
 * Create and return a TipTap editor instance.
 *
 * @param {HTMLElement} element - DOM element to mount the editor into.
 * @param {Function} onUpdate - Callback fired on every content change.
 * @returns {Editor} The TipTap editor instance.
 */
//============================================
export function createEditor(element, onUpdate) {
  const editor = new Editor({
    element: element,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Link.configure({
        openOnClick: false,
      }),
    ],
    content: "<p>Open a project folder to begin editing.</p>",
    onUpdate: ({ editor }) => {
      if (onUpdate) {
        onUpdate(editor);
      }
    },
  });

  return editor;
}
