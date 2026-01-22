import React, { useEffect, useRef } from 'react';
import hljs from 'highlight.js';
import 'highlight.js/styles/github-dark.css';

export default function CodeEditor({ value, onChange }) {
  const codeRef     = useRef(null);
  const textareaRef = useRef(null);

  // Highlight whenever the passed-in `value` changes
  useEffect(() => {
    if (codeRef.current) {
      codeRef.current.innerHTML = hljs.highlightAuto(value).value;
    }
  }, [value]);

  // Sync scroll between layers
  const syncScroll = () => {
    codeRef.current.scrollTop  = textareaRef.current.scrollTop;
    codeRef.current.scrollLeft = textareaRef.current.scrollLeft;
  };

  return (
    <div className="relative h-full w-full font-mono text-sm bg-transparent">
      {/* Highlighted read‑only layer */}
      <pre
        ref={codeRef}
        className="hljs overflow-auto pointer-events-none absolute inset-0 p-4"
      />
      {/* Transparent textarea for editing */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={e => onChange(e.target.value)}
        onScroll={syncScroll}
        className="absolute inset-0 w-full h-full p-4 bg-transparent text-transparent caret-white resize-none focus:outline-none"
        spellCheck="false"
      />
    </div>
  );
}
