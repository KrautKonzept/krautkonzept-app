import React, { useState, useRef, useEffect } from "react";

const TEAM = ["Emanuel", "Andrea", "Luc", "Dietrich", "Vincent"];

// Renders text with @mentions highlighted
export function MentionText({ text }) {
  if (!text) return null;
  const parts = text.split(/(@\w+)/g);
  return (
    <span>
      {parts.map((part, i) => {
        const name = part.slice(1);
        if (part.startsWith("@") && TEAM.includes(name)) {
          return (
            <span key={i} className="text-orange-600 font-bold bg-orange-50 rounded px-0.5">
              {part}
            </span>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </span>
  );
}

export default function MentionTextarea({ value, onChange, placeholder, rows = 3, className = "" }) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [mentionSearch, setMentionSearch] = useState("");
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });
  const textareaRef = useRef(null);
  const containerRef = useRef(null);

  const handleChange = (e) => {
    const val = e.target.value;
    onChange(val);

    // Detect @ trigger
    const cursor = e.target.selectionStart;
    const textBefore = val.slice(0, cursor);
    const atMatch = textBefore.match(/@(\w*)$/);
    if (atMatch) {
      setMentionSearch(atMatch[1]);
      setShowDropdown(true);
    } else {
      setShowDropdown(false);
    }
  };

  const insertMention = (name) => {
    const textarea = textareaRef.current;
    const cursor = textarea.selectionStart;
    const textBefore = value.slice(0, cursor);
    const textAfter = value.slice(cursor);
    // Replace the partial @... with @Name
    const replaced = textBefore.replace(/@(\w*)$/, `@${name} `);
    onChange(replaced + textAfter);
    setShowDropdown(false);
    setTimeout(() => {
      textarea.focus();
      const newCursor = replaced.length;
      textarea.setSelectionRange(newCursor, newCursor);
    }, 0);
  };

  const filtered = TEAM.filter((m) =>
    m.toLowerCase().startsWith(mentionSearch.toLowerCase())
  );

  useEffect(() => {
    const handleClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        rows={rows}
        className={`w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent ${className}`}
      />
      {showDropdown && filtered.length > 0 && (
        <div className="absolute z-50 bg-white border border-gray-200 rounded-lg shadow-lg mt-1 w-48 overflow-hidden">
          {filtered.map((name) => (
            <button
              key={name}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                insertMention(name);
              }}
              className="w-full text-left px-3 py-2 text-sm hover:bg-orange-50 hover:text-orange-600 flex items-center gap-2 transition-colors"
            >
              <span className="w-6 h-6 rounded-full bg-orange-100 text-orange-600 text-xs font-bold flex items-center justify-center flex-shrink-0">
                {name[0]}
              </span>
              {name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}