import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react";

/* ------------------------------------------------------------------ */
/* Tool frame                                                           */
/* ------------------------------------------------------------------ */

export function ToolFrame({
  title,
  tagline,
  children,
}: {
  title: string;
  tagline: string;
  children: ReactNode;
}) {
  return (
    <div className="dt-tool">
      <header className="dt-tool__head">
        <h1 className="dt-tool__title">{title}</h1>
        <p className="dt-tool__tagline">{tagline}</p>
        <span className="dt-tool__privacy" title="This tool runs entirely in your browser.">
          Runs locally — nothing is uploaded
        </span>
      </header>
      {children}
    </div>
  );
}

export function Panel({
  title,
  actions,
  flush,
  children,
}: {
  title?: string;
  actions?: ReactNode;
  flush?: boolean;
  children: ReactNode;
}) {
  return (
    <section className="dt-panel">
      {(title || actions) && (
        <div className="dt-panel__head">
          {title ? <h2 className="dt-panel__title">{title}</h2> : <span />}
          {actions ? <div className="dt-row">{actions}</div> : null}
        </div>
      )}
      <div className={flush ? "dt-panel__body dt-panel__body--flush" : "dt-panel__body"}>{children}</div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Buttons                                                              */
/* ------------------------------------------------------------------ */

type ButtonVariant = "primary" | "ghost" | "quiet" | "danger";

export function Button({
  variant = "ghost",
  className = "",
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant }) {
  return <button type="button" className={`dt-btn dt-btn--${variant} ${className}`.trim()} {...rest} />;
}

/**
 * Copy-to-clipboard with inline confirmation.
 *
 * navigator.clipboard is unavailable on insecure origins and can be blocked by
 * permissions policy, so failure is reported rather than swallowed — a button
 * that silently does nothing is worse than one that says it couldn't.
 */
export function CopyButton({
  value,
  label = "Copy",
  disabled,
}: {
  value: string;
  label?: string;
  disabled?: boolean;
}) {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  const copy = useCallback(async () => {
    clearTimeout(timer.current);
    try {
      await navigator.clipboard.writeText(value);
      setState("copied");
    } catch {
      setState("failed");
    }
    timer.current = setTimeout(() => setState("idle"), 1800);
  }, [value]);

  return (
    <Button variant="quiet" onClick={copy} disabled={disabled || !value} aria-live="polite">
      {state === "copied" ? "Copied" : state === "failed" ? "Copy blocked" : label}
    </Button>
  );
}

export function DownloadButton({
  data,
  filename,
  mime = "text/plain",
  label = "Download",
  disabled,
}: {
  data: string | Blob;
  filename: string;
  mime?: string;
  label?: string;
  disabled?: boolean;
}) {
  const download = useCallback(() => {
    const blob = typeof data === "string" ? new Blob([data], { type: mime }) : data;
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    // Revoking immediately can cancel the download in some browsers; one tick is enough.
    setTimeout(() => URL.revokeObjectURL(url), 0);
  }, [data, filename, mime]);

  return (
    <Button variant="quiet" onClick={download} disabled={disabled}>
      {label}
    </Button>
  );
}

/* ------------------------------------------------------------------ */
/* Fields                                                               */
/* ------------------------------------------------------------------ */

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: (id: string) => ReactNode;
}) {
  const id = useId();
  return (
    <div className="dt-field">
      <label className="dt-label" htmlFor={id}>
        {label}
      </label>
      {children(id)}
      {hint ? <span className="dt-hint">{hint}</span> : null}
    </div>
  );
}

/**
 * `softWrap` is deliberately not called `wrap`: TextareaHTMLAttributes already
 * declares the real HTML `wrap` attribute as a string ("hard" | "soft" | "off"),
 * and intersecting a boolean over it collapses the type to never.
 */
export function TextArea({
  invalid,
  softWrap,
  className = "",
  ...rest
}: TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean; softWrap?: boolean }) {
  return (
    <textarea
      spellCheck={false}
      autoComplete="off"
      autoCorrect="off"
      autoCapitalize="off"
      className={[
        "dt-textarea",
        softWrap ? "dt-textarea--wrap" : "",
        invalid ? "dt-textarea--invalid" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...rest}
    />
  );
}

export function TextInput({
  invalid,
  className = "",
  ...rest
}: InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }) {
  return (
    <input
      spellCheck={false}
      autoComplete="off"
      className={["dt-input", invalid ? "dt-input--invalid" : "", className].filter(Boolean).join(" ")}
      {...rest}
    />
  );
}

export function Select({ className = "", ...rest }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={`dt-select ${className}`.trim()} {...rest} />;
}

export function Checkbox({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <label className="dt-checkbox">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      {label}
    </label>
  );
}

/* ------------------------------------------------------------------ */
/* Feedback                                                             */
/* ------------------------------------------------------------------ */

export function Note({
  kind = "info",
  children,
}: {
  kind?: "info" | "error" | "warning" | "success";
  children: ReactNode;
}) {
  return (
    <div className={`dt-note dt-note--${kind}`} role={kind === "error" ? "alert" : undefined}>
      <div className="dt-note__body">{children}</div>
    </div>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return <p className="dt-empty">{children}</p>;
}

export function KeyValue({ rows }: { rows: Array<{ key: string; value: ReactNode }> }) {
  return (
    <dl className="dt-kv">
      {rows.map((row) => (
        <div key={row.key} style={{ display: "contents" }}>
          <dt className="dt-kv__key">{row.key}</dt>
          <dd className="dt-kv__value" style={{ margin: 0 }}>
            {row.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

export function StatRow({ items }: { items: Array<{ label: string; value: string | number }> }) {
  return (
    <div className="dt-stat-row">
      {items.map((item) => (
        <span key={item.label}>
          {item.label} <b>{item.value}</b>
        </span>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Spinner / page loader                                                */
/* ------------------------------------------------------------------ */

export function Spinner({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="dt-spinner" role="status">
      <svg className="dt-spinner__ring" viewBox="0 0 50 50" aria-hidden="true">
        <circle cx="25" cy="25" r="20" fill="none" strokeWidth="4" stroke="var(--line-strong)" />
        <circle
          className="dt-spinner__arc"
          cx="25"
          cy="25"
          r="20"
          fill="none"
          strokeWidth="4"
          strokeLinecap="round"
        />
      </svg>
      <span className="dt-spinner__label">{label}</span>
    </div>
  );
}

/**
 * Debounces a value so expensive work (schema compilation, barcode rendering)
 * doesn't run on every keystroke.
 */
export function useDebounced<T>(value: T, delay = 250): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}
