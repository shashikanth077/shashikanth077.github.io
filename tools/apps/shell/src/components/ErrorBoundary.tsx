import { Component, type ErrorInfo, type ReactNode } from "react";

/**
 * Scoped error boundary.
 *
 * The main runtime payoff of loading remotes at runtime is containment: if the
 * utility-tools bundle fails to fetch or throws while mounting, only that route
 * degrades. Without a boundary here, one bad remote blanks the whole shell —
 * which would make the micro-frontend split actively worse than a monolith.
 */

interface Props {
  children: ReactNode;
  /** Shown in the fallback so the user knows what broke. */
  label: string;
  /** Changing this resets the boundary — pass the route so navigation clears a stuck error. */
  resetKey?: string;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  override state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  override componentDidUpdate(prev: Props): void {
    if (prev.resetKey !== this.props.resetKey && this.state.error) {
      this.setState({ error: null });
    }
  }

  override componentDidCatch(error: Error, info: ErrorInfo): void {
    // No telemetry backend on a static host, so the console is the only sink.
    console.error(`[${this.props.label}] failed to render`, error, info.componentStack);
  }

  override render(): ReactNode {
    const { error } = this.state;
    if (!error) return this.props.children;

    const isLoadFailure =
      /Failed to fetch|dynamically imported module|Loading chunk|NetworkError/i.test(error.message);

    return (
      <div className="dt-note dt-note--error" role="alert" style={{ maxWidth: "48rem" }}>
        <div className="dt-note__body">
          <p style={{ fontWeight: 650, marginBottom: "0.5rem" }}>
            {isLoadFailure ? `Couldn't load ${this.props.label}.` : `${this.props.label} hit an error.`}
          </p>
          <p style={{ marginBottom: "0.75rem" }}>
            {isLoadFailure
              ? "The module didn't download. Check your connection and try again — the rest of the site still works."
              : error.message}
          </p>
          <button className="dt-btn dt-btn--ghost" type="button" onClick={() => this.setState({ error: null })}>
            Try again
          </button>
        </div>
      </div>
    );
  }
}
