import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { federation } from "@module-federation/vite";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { mfCssPlugin } from "../../scripts/vite-plugin-mf-css";

const here = dirname(fileURLToPath(import.meta.url));
const lib = (name: string) => resolve(here, `../../libs/${name}/src`);

export const REMOTE_PORT = 5004;

export default defineConfig(({ command }) => ({
  base: command === "build" ? "/tools/media-tools/" : "/",

  resolve: {
    alias: {
      "@devtools/tools-core": resolve(lib("tools-core"), "index.ts"),
      "@devtools/shell-contract": resolve(lib("shell-contract"), "index.ts"),
      "@devtools/ui/": `${lib("ui")}/`,
      "@devtools/ui": resolve(lib("ui"), "index.ts"),
    },
  },

  server: { port: REMOTE_PORT, strictPort: true, cors: true },
  preview: { port: REMOTE_PORT, strictPort: true },

  // ffmpeg.wasm ships pre-bundled — Vite doesn't need to pre-transform it, and
  // trying to would attempt to inline the multi-MB WASM binary as an asset.
  optimizeDeps: {
    exclude: ["@ffmpeg/ffmpeg", "@ffmpeg/util"],
  },

  plugins: [
    react(),
    mfCssPlugin("media_tools"),
    federation({
      name: "media_tools",
      filename: "remoteEntry.js",
      dts: false,
      exposes: { "./ToolRoutes": "./src/expose/ToolRoutes.tsx" },
      shared: {
        react: { singleton: true, strictVersion: true, requiredVersion: "^19.0.0" },
        "react-dom": { singleton: true, strictVersion: true, requiredVersion: "^19.0.0" },
        "react-router-dom": { singleton: true, strictVersion: true, requiredVersion: "^7.0.0" },
      },
    }),
  ],

  build: { target: "chrome89", cssCodeSplit: false, outDir: "dist", emptyOutDir: true },
}));
