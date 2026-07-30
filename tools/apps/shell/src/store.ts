import { configureStore, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { ThemeName } from "@devtools/shell-contract";

/**
 * Client state only.
 *
 * There is no server in this platform, so nothing here is cached server data —
 * which is exactly the boundary that keeps Redux useful. If a tool ever fetches
 * something remote (a WASM binary, say), that belongs in TanStack Query, not here.
 */

const THEME_KEY = "devtools.theme";
const RECENT_KEY = "devtools.recent";
const MAX_RECENT = 6;

function readTheme(): ThemeName | "system" {
  try {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored === "light" || stored === "dark" || stored === "system") return stored;
  } catch {
    // Private mode or blocked storage — fall through to the default.
  }
  return "system";
}

function readRecent(): string[] {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((s): s is string => typeof s === "string") : [];
  } catch {
    return [];
  }
}

function persist(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, typeof value === "string" ? value : JSON.stringify(value));
  } catch {
    // Storage full or unavailable; preference simply won't survive a reload.
  }
}

interface PreferencesState {
  theme: ThemeName | "system";
  recentSlugs: string[];
  sidebarOpen: boolean;
}

const preferences = createSlice({
  name: "preferences",
  initialState: (): PreferencesState => ({
    theme: readTheme(),
    recentSlugs: readRecent(),
    sidebarOpen: false,
  }),
  reducers: {
    setTheme(state, action: PayloadAction<ThemeName | "system">) {
      state.theme = action.payload;
      persist(THEME_KEY, action.payload);
    },
    recordVisit(state, action: PayloadAction<string>) {
      const next = [action.payload, ...state.recentSlugs.filter((s) => s !== action.payload)].slice(
        0,
        MAX_RECENT,
      );
      state.recentSlugs = next;
      persist(RECENT_KEY, next);
    },
    toggleSidebar(state, action: PayloadAction<boolean | undefined>) {
      state.sidebarOpen = action.payload ?? !state.sidebarOpen;
    },
  },
});

export const { setTheme, recordVisit, toggleSidebar } = preferences.actions;

export const store = configureStore({
  reducer: { preferences: preferences.reducer },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
