import { CopyButton } from "@devtools/ui";

/** Handbook text marks inline code as {{code}}; render those spans as <code>. */
export function Rich({ text }: { text: string }) {
  const parts = text.split(/\{\{(.+?)\}\}/g);
  return <>{parts.map((part, i) => (i % 2 ? <code key={i}>{part.trim()}</code> : part))}</>;
}

export const plain = (text: string) => text.replace(/\{\{(.+?)\}\}/g, (_, s: string) => s.trim());

export function CodeBlock({ code, label = "Code" }: { code: string; label?: string }) {
  return (
    <figure className="lp-code">
      <figcaption>
        <span>{label}</span>
        <CopyButton value={code} />
      </figcaption>
      <pre tabIndex={0}><code>{code}</code></pre>
    </figure>
  );
}
