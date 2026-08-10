/**
 * Shared form fields for the page-stamping tools (Watermark, Page Numbers,
 * Header & Footer, Bates Numbering) — all four configure the same handful
 * of things (where on the page, what font) on top of their own specific
 * text, so this keeps that part in one place instead of four near-copies.
 */

import { Field, Select, TextInput } from "@devtools/ui";
import type { StampFontFamily, StampPosition } from "@devtools/tools-core";

export const POSITION_OPTIONS: Array<{ value: StampPosition; label: string }> = [
  { value: "top-left", label: "Header left" },
  { value: "top-center", label: "Header center" },
  { value: "top-right", label: "Header right" },
  { value: "bottom-left", label: "Footer left" },
  { value: "bottom-center", label: "Footer center" },
  { value: "bottom-right", label: "Footer right" },
  { value: "center", label: "Center of page" },
];

export function PositionField({
  value,
  onChange,
  options = POSITION_OPTIONS,
}: {
  value: StampPosition;
  onChange: (v: StampPosition) => void;
  options?: typeof POSITION_OPTIONS;
}) {
  return (
    <Field label="Position on page">
      {(id) => (
        <Select id={id} value={value} onChange={(e) => onChange(e.target.value as StampPosition)}>
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </Select>
      )}
    </Field>
  );
}

const FONT_SIZES = [8, 9, 10, 11, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 60, 72];

export function FontFamilyField({ value, onChange }: { value: StampFontFamily; onChange: (v: StampFontFamily) => void }) {
  return (
    <Field label="Font">
      {(id) => (
        <Select id={id} value={value} onChange={(e) => onChange(e.target.value as StampFontFamily)}>
          <option value="Helvetica">Helvetica</option>
          <option value="Times">Times New Roman</option>
          <option value="Courier">Courier</option>
        </Select>
      )}
    </Field>
  );
}

export function FontSizeField({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <Field label="Size">
      {(id) => (
        <Select id={id} value={value} onChange={(e) => onChange(Number(e.target.value))}>
          {FONT_SIZES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </Select>
      )}
    </Field>
  );
}

export function ColorField({ value, onChange, label = "Color" }: { value: string; onChange: (v: string) => void; label?: string }) {
  return (
    <Field label={label}>
      {(id) => (
        <input
          id={id}
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="dt-input"
          style={{ padding: "0.2rem", height: "2.25rem", cursor: "pointer" }}
        />
      )}
    </Field>
  );
}

export function PageRangeField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <Field label="Pages" hint="e.g. 1,3,5-10 — leave blank for every page">
      {(id) => <TextInput id={id} value={value} onChange={(e) => onChange(e.target.value)} placeholder="All pages" />}
    </Field>
  );
}
