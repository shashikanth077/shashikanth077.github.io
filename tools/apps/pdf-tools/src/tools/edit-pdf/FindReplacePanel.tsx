import { useEffect, useRef } from "react";
import { Button } from "@devtools/ui";

export interface FindReplacePanelProps {
  query: string;
  onQueryChange: (q: string) => void;
  replacement: string;
  onReplacementChange: (r: string) => void;
  matchCount: number;
  currentIndex: number;
  onNext: () => void;
  onPrev: () => void;
  onReplace: () => void;
  onReplaceAll: () => void;
  onClose: () => void;
}

export function FindReplacePanel(props: FindReplacePanelProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") props.onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [props]);

  const hasMatches = props.matchCount > 0;

  return (
    <div className="pdfed__findbar" onClick={(e) => e.stopPropagation()}>
      <input
        ref={inputRef}
        type="text"
        className="pdfed__findbar-input"
        placeholder="Find in this document…"
        value={props.query}
        onChange={(e) => props.onQueryChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") (e.shiftKey ? props.onPrev : props.onNext)();
        }}
      />
      <span className="pdfed__findbar-count">
        {hasMatches ? `${props.currentIndex + 1} of ${props.matchCount}` : props.query ? "No matches" : ""}
      </span>
      <button type="button" className="pdfed__iconbtn" onClick={props.onPrev} disabled={!hasMatches} aria-label="Previous match">
        ↑
      </button>
      <button type="button" className="pdfed__iconbtn" onClick={props.onNext} disabled={!hasMatches} aria-label="Next match">
        ↓
      </button>

      <input
        type="text"
        className="pdfed__findbar-input"
        placeholder="Replace with…"
        value={props.replacement}
        onChange={(e) => props.onReplacementChange(e.target.value)}
      />
      <Button variant="ghost" onClick={props.onReplace} disabled={!hasMatches}>
        Replace
      </Button>
      <Button variant="ghost" onClick={props.onReplaceAll} disabled={!hasMatches}>
        Replace all
      </Button>

      <button type="button" className="pdfed__findbar-close" onClick={props.onClose} aria-label="Close find and replace">
        ✕
      </button>
    </div>
  );
}
