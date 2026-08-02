import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import { federation } from "@module-federation/vite";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { toolRoutes } from "../../libs/tools-core/src/routes";

const here = dirname(fileURLToPath(import.meta.url));
const lib = (name: string) => resolve(here, `../../libs/${name}/src`);

/**
 * Emits the route manifest as JSON alongside the bundle.
 *
 * scripts/postbuild.mjs needs the routes to prerender a page per tool, but it
 * is plain Node and cannot import the TypeScript source. Vite already compiles
 * this config, so it can serialise the manifest here — keeping routes.ts the
 * single source of truth instead of maintaining a second copy for the script.
 */
function emitRoutesJson(): Plugin {
  return {
    name: "devtools:emit-routes-json",
    apply: "build",
    generateBundle() {
      this.emitFile({
        type: "asset",
        fileName: "routes.json",
        source: JSON.stringify(toolRoutes, null, 2),
      });
    },
  };
}

const SHELL_PORT = 5000;

/** Remote name → dev port and production sub-path. Keep in step with each remote's vite.config. */
const REMOTES = [
  { name: "utility_tools", dir: "utility-tools", port: 5001 },
  { name: "pdf_tools", dir: "pdf-tools", port: 5002 },
  { name: "image_tools", dir: "image-tools", port: 5003 },
  { name: "media_tools", dir: "media-tools", port: 5004 },
] as const;

export default defineConfig(({ command }) => {
  const isBuild = command === "build";

  return {
    // Same base in dev and build so the dev server mirrors production exactly
    // (http://localhost:5000/tools/). Diverging here hides basename bugs until
    // deploy — every in-app link is router-relative and only works if the
    // basename matches what production actually serves.
    base: "/tools/",

    resolve: {
      alias: {
        "@devtools/tools-core": resolve(lib("tools-core"), "index.ts"),
        "@devtools/shell-contract": resolve(lib("shell-contract"), "index.ts"),
        // Trailing slash first so any subpath (tokens.css, files.css, …)
        // resolves generically. Without it the bare "@devtools/ui" prefix wins
        // and produces paths like ".../index.ts/files.css".
        "@devtools/ui/": `${lib("ui")}/`,
        "@devtools/ui": resolve(lib("ui"), "index.ts"),
      },
    },

    server: { port: SHELL_PORT, strictPort: true },
    preview: { port: SHELL_PORT, strictPort: true },

    plugins: [
      react(),
      emitRoutesJson(),
      federation({
        name: "shell",
        // Automatic type-sharing is off deliberately. It expects a tsconfig.json
        // inside every app directory (this workspace has one at the root), and it
        // makes the shell's dev server depend on fetching @mf-types.zip from the
        // remote — an unhandled rejection there takes the whole server down.
        // The remote's shape is declared explicitly in src/remotes.d.ts instead,
        // so a prop change breaks the build loudly at compile time.
        dts: false,
        // Build: same-origin sibling directories. Dev: each remote's own server.
        remotes: Object.fromEntries(
          REMOTES.map((remote) => [
            remote.name,
            {
              type: "module",
              name: remote.name,
              entry: isBuild
                ? `/tools/${remote.dir}/remoteEntry.js`
                : `http://localhost:${remote.port}/remoteEntry.js`,
            },
          ]),
        ),
        shared: {
          react: { singleton: true, strictVersion: true, requiredVersion: "^19.0.0" },
          "react-dom": { singleton: true, strictVersion: true, requiredVersion: "^19.0.0" },
          "react-router-dom": { singleton: true, strictVersion: true, requiredVersion: "^7.0.0" },
        },
      }),
    ],

    build: {
      // Module Federation emits top-level await.
      target: "chrome89",
      outDir: "dist",
      emptyOutDir: true,
    },
  };
});
