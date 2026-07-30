/**
 * @devtools/shell-contract
 *
 * The ONLY interface a remote may use to talk to the shell.
 *
 * Keep this surface deliberately small. Every capability added here becomes a
 * coupling point that every remote depends on, and a breaking change to this
 * file breaks all of them at runtime — which is precisely the failure mode
 * micro-frontends exist to prevent. If a remote needs something new, ask
 * whether it can own it locally first.
 *
 * There is no session here: the platform is entirely client-side and has no
 * accounts. If auth is ever added, this is where it lands.
 */

export type ThemeName = "light" | "dark";

export type ToastKind = "info" | "success" | "error";

export interface ShellContract {
  /** Client-side navigation. Paths are absolute and include the base, e.g. "/tools/jwt-decoder". */
  navigate: (path: string) => void;
  /** Transient message in the shell's toast region. */
  toast: (message: string, kind?: ToastKind) => void;
  /** Current theme, so a remote can adapt a canvas or syntax colours. */
  theme: ThemeName;
}

/**
 * Bumped whenever the interface above changes shape. The shell logs a warning
 * if a remote reports a different major — cheap early warning for the version
 * drift that otherwise shows up as a confusing runtime error.
 */
export const SHELL_CONTRACT_VERSION = 1;

/** Injected by the shell via React context; see apps/shell/src/shell-context.tsx. */
export interface ShellContextValue extends ShellContract {
  contractVersion: number;
}
