/** JSON formatting, minification and JSON Schema validation. */

import Ajv2020Import from "ajv/dist/2020.js";
import addFormatsImport from "ajv-formats";
import type { ErrorObject } from "ajv";

/**
 * Ajv and ajv-formats ship CJS with both `module.exports` and `.default` set.
 * Depending on how the bundler applies interop, the imported binding is either
 * the constructor itself or a namespace wrapping it under `.default`. Unwrapping
 * defensively avoids the classic "Ajv2020 is not a constructor" runtime crash.
 */
function interop<T>(mod: T): T {
  return (mod as { default?: T }).default ?? mod;
}

const Ajv2020 = interop(Ajv2020Import);
const addFormats = interop(addFormatsImport);

export interface JsonParseError {
  message: string;
  /** 1-indexed, for the editor gutter. Null when the position can't be recovered. */
  line: number | null;
  column: number | null;
}

/**
 * `JSON.parse` errors differ per engine and none of them give you a line number.
 * V8 reports "... at position N", which we convert into line/column.
 */
export function describeParseError(error: unknown, source: string): JsonParseError {
  const message = error instanceof Error ? error.message : String(error);
  const match = /at position (\d+)/.exec(message);
  if (!match?.[1]) return { message, line: null, column: null };

  const position = Number(match[1]);
  const before = source.slice(0, position);
  const line = before.split("\n").length;
  const lastNewline = before.lastIndexOf("\n");
  return { message, line, column: position - lastNewline };
}

function sortValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortValue);
  if (value !== null && typeof value === "object") {
    return Object.fromEntries(
      Object.keys(value as Record<string, unknown>)
        .sort()
        .map((key) => [key, sortValue((value as Record<string, unknown>)[key])]),
    );
  }
  return value;
}

export interface FormatOptions {
  /** Spaces per level, or "tab". */
  indent?: number | "tab";
  sortKeys?: boolean;
}

export function formatJson(source: string, options: FormatOptions = {}): string {
  const { indent = 2, sortKeys = false } = options;
  const parsed: unknown = JSON.parse(source);
  const value = sortKeys ? sortValue(parsed) : parsed;
  return JSON.stringify(value, null, indent === "tab" ? "\t" : indent);
}

export function minifyJson(source: string): string {
  return JSON.stringify(JSON.parse(source));
}

/** Rough byte saving from minification — shown as a "you saved X" hint. */
export function minificationSaving(source: string): { before: number; after: number; percent: number } {
  const before = new TextEncoder().encode(source).length;
  const after = new TextEncoder().encode(minifyJson(source)).length;
  return {
    before,
    after,
    percent: before === 0 ? 0 : Math.round(((before - after) / before) * 100),
  };
}

/* ------------------------------------------------------------------ */
/* Schema validation                                                    */
/* ------------------------------------------------------------------ */

export interface ValidationIssue {
  /** JSON Pointer to the offending value, e.g. "/user/email". "" means the root. */
  path: string;
  message: string;
  keyword: string;
}

export interface ValidationResult {
  valid: boolean;
  issues: ValidationIssue[];
}

function toIssue(error: ErrorObject): ValidationIssue {
  // `additionalProperties` reports the parent path, which is confusing on its
  // own — append the offending property so the pointer lands where the user looks.
  const extra =
    error.keyword === "additionalProperties" && typeof error.params["additionalProperty"] === "string"
      ? `/${error.params["additionalProperty"]}`
      : "";
  return {
    path: `${error.instancePath}${extra}` || "(root)",
    message: error.message ?? "is invalid",
    keyword: error.keyword,
  };
}

/**
 * Validates `data` against `schema`, both as raw strings.
 * Throws only when one of the two documents is not parseable JSON — a failed
 * validation is a returned result, not an exception.
 */
export function validateAgainstSchema(dataSource: string, schemaSource: string): ValidationResult {
  let schema: unknown;
  let data: unknown;

  try {
    schema = JSON.parse(schemaSource);
  } catch (error) {
    throw new Error(`Schema is not valid JSON: ${describeParseError(error, schemaSource).message}`);
  }
  try {
    data = JSON.parse(dataSource);
  } catch (error) {
    throw new Error(`Document is not valid JSON: ${describeParseError(error, dataSource).message}`);
  }

  const ajv = new Ajv2020({ allErrors: true, strict: false });
  addFormats(ajv);

  let validate;
  try {
    validate = ajv.compile(schema as object);
  } catch (error) {
    throw new Error(`Schema could not be compiled: ${error instanceof Error ? error.message : String(error)}`);
  }

  const valid = validate(data);
  return {
    valid: Boolean(valid),
    issues: (validate.errors ?? []).map(toIssue),
  };
}
