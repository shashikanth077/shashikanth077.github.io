import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BASE_PATH } from "@devtools/tools-core";
import App from "./App.js";
import { store } from "./store.js";

import "@devtools/ui/tokens.css";
import "@devtools/ui/components.css";
import "@devtools/ui/files.css";
import "./shell.css";

/**
 * TanStack Query is wired but genuinely idle in this slice — the platform has
 * no server, so there is no server state to cache. It earns its place once a
 * tool fetches something remote (a WASM binary for the PDF remote, most likely).
 * Keeping it here now means that tool doesn't have to touch the shell later.
 */
const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 5 * 60_000, retry: 1 } },
});

const container = document.getElementById("root");
if (!container) throw new Error("#root is missing from index.html");

createRoot(container).render(
  <StrictMode>
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        {/* Vite serves the dev server under /tools/ too, so this basename is
            correct in both modes and in-app links stay router-relative. */}
        <BrowserRouter basename={BASE_PATH}>
          <App />
        </BrowserRouter>
      </QueryClientProvider>
    </Provider>
  </StrictMode>,
);
