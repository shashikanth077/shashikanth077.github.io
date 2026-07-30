/**
 * @devtools/ui — shared primitives and design tokens.
 *
 * Consumers must import the stylesheets once at their entry point:
 *   import "@devtools/ui/tokens.css";
 *   import "@devtools/ui/components.css";
 *
 * The shell does this for the whole app; each remote does it too so it still
 * renders correctly when run standalone on its own dev port.
 */

export * from "./components.js";
