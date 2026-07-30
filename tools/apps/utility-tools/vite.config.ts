import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { federation } from "@module-federation/vite";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const lib = (name: string) => resolve(here, `../../libs/${name}/src`);

export const REMOTE_PORT = 5001;

export default defineConfig(({ command }) => ({
  // In production the remote is served from /tools/utility-tools/ so its own
  // chunk URLs must carry that prefix. In dev it is served from its port root.
  base: command === "build" ? "/tools/utility-tools/" : "/",

  resolve: {
    alias: {
      // Point workspace packages at their TypeScript source. Without this Vite
      // tries to pre-bundle the symlinked package and chokes on raw .ts/.tsx.
      "@devtools/tools-core": resolve(lib("tools-core"), "index.ts"),
      "@devtools/shell-contract": resolve(lib("shell-contract"), "index.ts"),
      // Trailing slash first so any subpath resolves generically — see shell config.
      "@devtools/ui/": `${lib("ui")}/`,
      "@devtools/ui": resolve(lib("ui"), "index.ts"),
    },
  },

  server: {
    port: REMOTE_PORT,
    strictPort: true,
    // The shell runs on a different port in dev and fetches remoteEntry.js
    // cross-origin, which needs CORS.
    cors: true,
  },
  preview: { port: REMOTE_PORT, strictPort: true },

  plugins: [
    react(),
    federation({
      name: "utility_tools",
      filename: "remoteEntry.js",
      // See the matching note in apps/shell/vite.config.ts — the shell declares
      // this remote's types by hand, so there is nothing to publish here.
      dts: false,
      exposes: {
        "./ToolRoutes": "./src/expose/ToolRoutes.tsx",
      },
      shared: {
        // singleton + strictVersion so a version drift fails loudly at load
        // time rather than surfacing later as "Invalid hook call" mid-render.
        react: { singleton: true, strictVersion: true, requiredVersion: "^19.0.0" },
        "react-dom": { singleton: true, strictVersion: true, requiredVersion: "^19.0.0" },
        "react-router-dom": { singleton: true, strictVersion: true, requiredVersion: "^7.0.0" },
      },
    }),
  ],

  build: {
    // Module Federation emits top-level await; chrome89 is the baseline that
    // supports it. Anything lower makes the build fail.
    target: "chrome89",
    cssCodeSplit: false,
    outDir: "dist",
    emptyOutDir: true,
  },
}));
