"use client";

import { useEffect, useRef, useState } from "react";
import { Bold, Italic, Underline, List, ListOrdered, Link as LinkIcon, Heading2, Eraser } from "lucide-react";

export default function RichTextEditor({
  value = "",
  onChange,
  placeholder = "Write here...",
  className = "",
}) {
  const editorRef = useRef(null);
  const [html, setHtml] = useState(value || "");

  useEffect(() => {
    setHtml(value || "");
  }, [value]);

  const exec = (cmd, arg = null) => {
    document.execCommand(cmd, false, arg);
    handleInput();
  };

  const handleLink = () => {
    const url = prompt("Enter URL:", "https://");
    if (!url) return;
    exec("createLink", url);
  };

  const handleInput = () => {
    const next = editorRef.current?.innerHTML || "";
    setHtml(next);
    onChange && onChange(next);
  };

  const clearFormatting = () => {
    exec("removeFormat");
  };

  return (
    <div className={className}>
      <div className="flex flex-wrap items-center gap-1 mb-2">
        <button type="button" onClick={() => exec("bold")} className="p-2 rounded border bg-white hover:bg-gray-50">
          <Bold className="w-4 h-4" />
        </button>
        <button type="button" onClick={() => exec("italic")} className="p-2 rounded border bg-white hover:bg-gray-50">
          <Italic className="w-4 h-4" />
        </button>
        <button type="button" onClick={() => exec("underline")} className="p-2 rounded border bg-white hover:bg-gray-50">
          <Underline className="w-4 h-4" />
        </button>
        <span className="mx-1 w-px h-6 bg-gray-200" />
        <button type="button" onClick={() => exec("formatBlock", "<h2>")} className="p-2 rounded border bg-white hover:bg-gray-50">
          <Heading2 className="w-4 h-4" />
        </button>
        <button type="button" onClick={() => exec("insertUnorderedList")} className="p-2 rounded border bg-white hover:bg-gray-50">
          <List className="w-4 h-4" />
        </button>
        <button type="button" onClick={() => exec("insertOrderedList")} className="p-2 rounded border bg-white hover:bg-gray-50">
          <ListOrdered className="w-4 h-4" />
        </button>
        <button type="button" onClick={handleLink} className="p-2 rounded border bg-white hover:bg-gray-50">
          <LinkIcon className="w-4 h-4" />
        </button>
        <span className="mx-1 w-px h-6 bg-gray-200" />
        <button type="button" onClick={clearFormatting} className="p-2 rounded border bg-white hover:bg-gray-50">
          <Eraser className="w-4 h-4" />
        </button>
      </div>
      <div
        ref={editorRef}
        className="min-h-[160px] h-auto w-full px-3 py-2 border rounded bg-white focus:outline-none focus:ring-2 focus:ring-[#03215F] prose prose-sm max-w-none"
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onBlur={handleInput}
        dangerouslySetInnerHTML={{ __html: html || "" }}
        data-placeholder={placeholder}
      />
      <style jsx>{`
        [contenteditable][data-placeholder]:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
        }
      `}</style>
    </div>
  );
}


