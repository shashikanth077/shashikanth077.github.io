import type { Plugin } from "vite";

/**
 * Inlines extracted CSS into the remote's remoteEntry.js so Module Federation
 * actually delivers it.
 *
 * Without this, Vite extracts per-remote CSS into a standalone .css file that
 * nothing ever loads — the shell only links its own stylesheet, and the MF
 * runtime only fetches JS chunks from remotes. The CSS silently vanishes.
 *
 * Fix: after the bundle is generated, find every CSS asset, concatenate it,
 * delete the files, and prepend a self-executing style-injection snippet to
 * the remoteEntry chunk. A data-attribute guard prevents double-injection.
 */
export function mfCssPlugin(remoteName: string): Plugin {
  return {
    name: "devtools:mf-css-inject",
    apply: "build",
    enforce: "post",
    generateBundle(_, bundle) {
      const cssContents: string[] = [];

      for (const [fileName, chunk] of Object.entries(bundle)) {
        if (chunk.type === "asset" && fileName.endsWith(".css")) {
          cssContents.push(String(chunk.source));
          delete bundle[fileName];
        }
      }

      if (!cssContents.length) return;

      for (const chunk of Object.values(bundle)) {
        if (chunk.type === "chunk" && chunk.fileName.includes("remoteEntry")) {
          const css = cssContents
            .join("\n")
            .replace(/\\/g, "\\\\")
            .replace(/`/g, "\\`")
            .replace(/\$/g, "\\$");

          chunk.code =
            `(()=>{const k="data-mf-css";const n="${remoteName}";` +
            `if(!document.querySelector(\`style[\${k}="\${n}"]\`)){` +
            `const s=document.createElement("style");` +
            `s.setAttribute(k,n);` +
            `s.textContent=\`${css}\`;` +
            `document.head.appendChild(s)}})();\n` +
            chunk.code;
          break;
        }
      }
    },
  };
}
