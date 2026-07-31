import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { federation } from "@module-federation/vite";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { mfCssPlugin } from "../../scripts/vite-plugin-mf-css";

const here = dirname(fileURLToPath(import.meta.url));
const lib = (name: string) => resolve(here, `../../libs/${name}/src`);

export const REMOTE_PORT = 5003;

export default defineConfig(({ command }) => ({
  base: command === "build" ? "/tools/image-tools/" : "/",

  resolve: {
    alias: {
      "@devtools/tools-core": resolve(lib("tools-core"), "index.ts"),
      "@devtools/shell-contract": resolve(lib("shell-contract"), "index.ts"),
      // Trailing slash first so any subpath resolves generically — see shell config.
      "@devtools/ui/": `${lib("ui")}/`,
      "@devtools/ui": resolve(lib("ui"), "index.ts"),
    },
  },

  server: { port: REMOTE_PORT, strictPort: true, cors: true },
  preview: { port: REMOTE_PORT, strictPort: true },

  plugins: [
    react(),
    mfCssPlugin("image_tools"),
    federation({
      name: "image_tools",
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
