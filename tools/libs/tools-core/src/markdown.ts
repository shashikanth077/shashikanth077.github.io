/**
 * Markdown rendering.
 *
 * `marked` emits raw HTML by design — Markdown permits inline HTML, so a
 * document containing `<img src=x onerror=alert(1)>` renders as a live element.
 * Every path out of this module is sanitised with DOMPurify. Nothing here
 * returns unsanitised HTML, so a caller cannot skip that step by accident.
 */

import { marked } from "marked";
import DOMPurify from "dompurify";

export interface RenderOptions {
  /** GitHub-flavoured line breaks: a single newline becomes <br>. */
  breaks?: boolean;
  /** Autolink bare URLs. */
  gfm?: boolean;
}

// Allow the tags Markdown can legitimately produce, plus basic tables.
const ALLOWED_TAGS = [
  "h1", "h2", "h3", "h4", "h5", "h6",
  "p", "br", "hr", "blockquote", "pre", "code",
  "ul", "ol", "li", "dl", "dt", "dd",
  "strong", "em", "del", "ins", "sub", "sup", "mark",
  "a", "img",
  "table", "thead", "tbody", "tfoot", "tr", "th", "td",
  "details", "summary", "span", "div",
];

const ALLOWED_ATTR = ["href", "src", "alt", "title", "align", "colspan", "rowspan", "class", "open"];

/** Renders Markdown to HTML that is safe to inject. */
export function renderMarkdown(source: string, options: RenderOptions = {}): string {
  const { breaks = true, gfm = true } = options;
  const raw = marked.parse(source, { breaks, gfm, async: false }) as string;

  // The config is passed inline so TypeScript picks the string-returning
  // overload of sanitize() rather than the DOM-returning union.
  return DOMPurify.sanitize(raw, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    // Block javascript:, data: and other script-bearing URL schemes.
    ALLOWED_URI_REGEXP: /^(?:https?|mailto|tel|ftp):|^[#/]/i,
  });
}

/**
 * Counts that make the editor useful. Word counting on Markdown source is
 * approximate by nature — syntax characters inflate it — so this strips the
 * most common markers first.
 */
export interface MarkdownStats {
  characters: number;
  words: number;
  lines: number;
  readingMinutes: number;
}

const WORDS_PER_MINUTE = 200;

export function markdownStats(source: string): MarkdownStats {
  const plain = source
    .replace(/```[\s\S]*?```/g, " ")   // fenced code
    .replace(/`[^`]*`/g, " ")           // inline code
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, "$1") // links and images → their text
    .replace(/[#>*_~\-]/g, " ");

  const words = plain.split(/\s+/).filter(Boolean).length;
  return {
    characters: source.length,
    words,
    lines: source === "" ? 0 : source.split("\n").length,
    readingMinutes: Math.max(1, Math.round(words / WORDS_PER_MINUTE)),
  };
}

/** Adds rel="noopener noreferrer" to any target="_blank" link, post-sanitise. */
export function hardenExternalLinks(container: HTMLElement): void {
  container.querySelectorAll("a[href]").forEach((anchor) => {
    const href = anchor.getAttribute("href") ?? "";
    if (/^https?:/i.test(href)) {
      anchor.setAttribute("target", "_blank");
      anchor.setAttribute("rel", "noopener noreferrer");
    }
  });
}
