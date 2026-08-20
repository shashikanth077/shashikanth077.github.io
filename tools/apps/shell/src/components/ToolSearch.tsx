import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { useNavigate } from "react-router-dom";
import { routerPath, searchTools, type ToolRoute } from "@devtools/tools-core";

/**
 * Site-wide tool search — the one navigation pattern Sejda/SmallPDF have that
 * this platform didn't: a way to jump straight to a tool by typing what you
 * want to do, instead of hunting through toolkit menus.
 *
 * Reused at three call sites (hero, header, mobile sidebar) with a `variant`
 * that only changes sizing/placement — the matching and keyboard behavior are
 * identical everywhere so results never surprise the user by context.
 */
export function ToolSearch({
  variant,
  placeholder,
  autoFocus,
  onNavigate,
}: {
  variant: "hero" | "header" | "sidebar";
  placeholder: string;
  autoFocus?: boolean;
  /** Fired after a successful pick — Header/sidebar use this to close their own chrome. */
  onNavigate?: () => void;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const navigate = useNavigate();
  const wrapRef = useRef<HTMLDivElement>(null);
  const inputId = useId();
  const listboxId = `${inputId}-listbox`;

  const matches = query.trim() ? searchTools(query, variant === "hero" ? 8 : 6) : [];

  useEffect(() => setActiveIndex(-1), [query]);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: PointerEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  function go(tool: ToolRoute) {
    navigate(routerPath(tool.slug));
    setQuery("");
    setOpen(false);
    onNavigate?.();
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Escape") {
      setOpen(false);
      return;
    }
    if (!open || matches.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % matches.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => (i - 1 + matches.length) % matches.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const pick = matches[activeIndex] ?? matches[0];
      if (pick) go(pick);
    }
  }

  return (
    <div className={`tool-search tool-search--${variant}`} ref={wrapRef}>
      <div className="tool-search__box">
        <svg className="tool-search__icon" width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" strokeWidth="2" />
          <path d="m20 20-3.5-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <input
          id={inputId}
          type="search"
          className="tool-search__input"
          placeholder={placeholder}
          value={query}
          autoFocus={autoFocus}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          role="combobox"
          aria-expanded={open && matches.length > 0}
          aria-controls={listboxId}
          aria-autocomplete="list"
          autoComplete="off"
        />
      </div>

      {open && matches.length > 0 && (
        <ul className="tool-search__menu" id={listboxId} role="listbox">
          {matches.map((tool, i) => (
            <li key={tool.slug} role="option" aria-selected={i === activeIndex}>
              <button
                type="button"
                className={`tool-search__item tk-${tool.toolkit}${
                  i === activeIndex ? " tool-search__item--active" : ""
                }`}
                onMouseEnter={() => setActiveIndex(i)}
                onClick={() => go(tool)}
              >
                <span className="tool-search__item-icon" aria-hidden="true">
                  {tool.icon}
                </span>
                <span className="tool-search__item-body">
                  <span className="tool-search__item-name">{tool.name}</span>
                  <span className="tool-search__item-desc">{tool.tagline}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {open && query.trim() && matches.length === 0 && (
        <p className="tool-search__empty">No tools match &ldquo;{query}&rdquo;.</p>
      )}
    </div>
  );
}
