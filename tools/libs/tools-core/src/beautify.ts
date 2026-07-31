/**
 * CSS and JavaScript beautifiers, backed by js-beautify.
 *
 * js-beautify is a mature library used by every "online beautifier" that
 * doesn't secretly send your code to a server. It handles minified,
 * uglified, and ordinary-messy inputs without corrupting them. We only
 * expose a small subset of its many options — the ones a developer
 * actually reaches for.
 */

import beautify from "js-beautify";

export interface BeautifyOptions {
  /** Indent width in spaces. Ignored when useTabs=true. */
  indentSize?: number;
  /** Tabs instead of spaces. */
  useTabs?: boolean;
  /** Preserve or collapse consecutive blank lines. */
  preserveNewlines?: boolean;
  /** Maximum blank lines to preserve between statements. */
  maxPreserveNewlines?: number;
}

const DEFAULTS: Required<BeautifyOptions> = {
  indentSize: 2,
  useTabs: false,
  preserveNewlines: true,
  maxPreserveNewlines: 2,
};

function commonOpts(options: BeautifyOptions): Record<string, unknown> {
  const merged = { ...DEFAULTS, ...options };
  return {
    indent_size: merged.indentSize,
    indent_char: merged.useTabs ? "\t" : " ",
    indent_with_tabs: merged.useTabs,
    preserve_newlines: merged.preserveNewlines,
    max_preserve_newlines: merged.maxPreserveNewlines,
    end_with_newline: true,
  };
}

/**
 * Format CSS. Handles minified inputs, mixed indentation, one-liner rules and
 * inline @media queries. Returns the input unchanged when it's empty rather
 * than throwing — the UI shows a hint instead.
 */
export function beautifyCss(input: string, options: BeautifyOptions = {}): string {
  if (!input.trim()) return "";
  const opts = {
    ...commonOpts(options),
    selector_separator_newline: true,
    newline_between_rules: true,
    space_around_selector_separator: false,
  };
  return beautify.css(input, opts);
}

/**
 * Format JavaScript, TypeScript or JSON. js-beautify parses source as JS so
 * TypeScript type annotations are preserved as-is (they're valid JS syntax
 * as far as the parser is concerned). JSX and Vue templates are not supported
 * — those need Prettier for correct results.
 */
export function beautifyJs(input: string, options: BeautifyOptions = {}): string {
  if (!input.trim()) return "";
  const opts = {
    ...commonOpts(options),
    // Common-sense defaults. Users who want a specific style pass their own.
    space_in_empty_paren: false,
    keep_array_indentation: false,
    brace_style: "collapse" as const,
    space_after_anon_function: false,
    space_after_named_function: false,
    jslint_happy: false,
    wrap_line_length: 0,
  };
  return beautify.js(input, opts);
}
