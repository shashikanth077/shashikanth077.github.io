/**
 * A tiny, safe formula evaluator for the maths diagrams (no eval / Function).
 *
 *   compile("w * x + b")  →  (scope) => number
 *
 * Supports numbers, names, + - * / ^ (right-associative), unary minus,
 * parentheses, and a fixed list of functions. Unknown names throw at compile
 * time so mistakes in a diagram spec are caught by `npm test`, not by learners.
 */

type Scope = Record<string, number>;
export type Compiled = { (scope: Scope): number; names: string[] };

/** Error function (Abramowitz & Stegun 7.1.26, |error| < 1.5e-7). */
const erf = (x: number) => {
  const t = 1 / (1 + 0.3275911 * Math.abs(x));
  const y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x);
  return x >= 0 ? y : -y;
};

const FUNCS: Record<string, (...a: number[]) => number> = {
  sin: Math.sin,
  cos: Math.cos,
  tan: Math.tan,
  exp: Math.exp,
  ln: Math.log,
  log10: Math.log10,
  log2: Math.log2,
  sqrt: Math.sqrt,
  abs: Math.abs,
  tanh: Math.tanh,
  floor: Math.floor,
  round: Math.round,
  sign: Math.sign,
  max: Math.max,
  min: Math.min,
  pow: Math.pow,
  atan: Math.atan,
  acos: Math.acos,
  asin: Math.asin,
  atan2: Math.atan2,
  sigmoid: (z) => 1 / (1 + Math.exp(-z)),
  relu: (z) => Math.max(0, z),
  /** n choose k */
  comb: (n, k) => {
    if (k < 0 || k > n) return 0;
    let r = 1;
    for (let i = 1; i <= k; i++) r = (r * (n - k + i)) / i;
    return Math.round(r);
  },
  /** normal probability density: norm(x, mean, sd) */
  norm: (x, m, s) => Math.exp(-0.5 * ((x - m) / s) ** 2) / (s * Math.sqrt(2 * Math.PI)),
  erf,
  /** normal cumulative distribution: ncdf(x, mean, sd) = P(X <= x) */
  ncdf: (x, m, s) => 0.5 * (1 + erf((x - m) / (s * Math.SQRT2))),
  /** 1 when the condition is positive, else 0 — handy for visibility switches */
  step: (x) => (x > 0 ? 1 : 0),
};

const CONSTS: Scope = { pi: Math.PI, e: Math.E };

type Tok = { t: "num"; v: number } | { t: "id"; v: string } | { t: "op"; v: string };

function tokenize(src: string): Tok[] {
  const out: Tok[] = [];
  const re = /\s*(?:(\d+\.?\d*(?:e[+-]?\d+)?|\.\d+)|([A-Za-z_][A-Za-z0-9_]*)|([-+*/^(),]))/gy;
  let m: RegExpExecArray | null;
  let last = 0;
  while ((m = re.exec(src))) {
    last = re.lastIndex;
    if (m[1] !== undefined) out.push({ t: "num", v: Number(m[1]) });
    else if (m[2] !== undefined) out.push({ t: "id", v: m[2] });
    else out.push({ t: "op", v: m[3] as string });
  }
  if (src.slice(last).trim() !== "") throw new Error(`unexpected character in "${src}" near "${src.slice(last).trim().slice(0, 8)}"`);
  return out;
}

type Node = (s: Scope) => number;

export function compile(src: string, known: Iterable<string> = []): Compiled {
  const toks = tokenize(src);
  const names = new Set<string>();
  const knownSet = new Set(known);
  let pos = 0;
  const peek = () => toks[pos];
  const eat = (v?: string) => {
    const t = toks[pos++];
    if (!t || (v !== undefined && !(t.t === "op" && t.v === v))) throw new Error(`expected "${v}" in "${src}"`);
    return t;
  };

  const primary = (): Node => {
    const t = toks[pos++];
    if (!t) throw new Error(`unexpected end of "${src}"`);
    if (t.t === "num") {
      const v = t.v;
      return () => v;
    }
    if (t.t === "op") {
      if (t.v === "(") {
        const inner = expr();
        eat(")");
        return inner;
      }
      if (t.v === "-") {
        const inner = unary();
        return (s) => -inner(s);
      }
      if (t.v === "+") return unary();
      throw new Error(`unexpected "${t.v}" in "${src}"`);
    }
    const id = t.v;
    const next = peek();
    if (next && next.t === "op" && next.v === "(") {
      const fn = FUNCS[id];
      if (!fn) throw new Error(`unknown function "${id}" in "${src}"`);
      eat("(");
      const args: Node[] = [];
      if (!(peek()?.t === "op" && (peek() as { v: string }).v === ")")) {
        args.push(expr());
        while (peek()?.t === "op" && (peek() as { v: string }).v === ",") {
          eat(",");
          args.push(expr());
        }
      }
      eat(")");
      return (s) => fn(...args.map((a) => a(s)));
    }
    if (id in CONSTS && !knownSet.has(id)) {
      const v = CONSTS[id] as number;
      return () => v;
    }
    if (!knownSet.has(id)) throw new Error(`unknown name "${id}" in "${src}"`);
    names.add(id);
    return (s) => {
      const v = s[id];
      return v === undefined ? NaN : v;
    };
  };

  const power = (): Node => {
    const base = primary();
    if (peek()?.t === "op" && (peek() as { v: string }).v === "^") {
      eat("^");
      const exp = unary(); // right-associative, and allows 2^-x
      return (s) => Math.pow(base(s), exp(s));
    }
    return base;
  };
  const unary = (): Node => {
    const t = peek();
    if (t?.t === "op" && t.v === "-") {
      eat("-");
      const inner = unary();
      return (s) => -inner(s);
    }
    if (t?.t === "op" && t.v === "+") {
      eat("+");
      return unary();
    }
    return power();
  };
  const term = (): Node => {
    let left = unary();
    while (peek()?.t === "op" && ["*", "/"].includes((peek() as { v: string }).v)) {
      const op = (eat() as { v: string }).v;
      const l = left;
      const r = unary();
      left = op === "*" ? (s) => l(s) * r(s) : (s) => l(s) / r(s);
    }
    return left;
  };
  const expr = (): Node => {
    let left = term();
    while (peek()?.t === "op" && ["+", "-"].includes((peek() as { v: string }).v)) {
      const op = (eat() as { v: string }).v;
      const l = left;
      const r = term();
      left = op === "+" ? (s) => l(s) + r(s) : (s) => l(s) - r(s);
    }
    return left;
  };

  const root = expr();
  if (pos !== toks.length) throw new Error(`unexpected trailing input in "${src}"`);
  const fn = ((scope: Scope) => root(scope)) as Compiled;
  fn.names = [...names];
  return fn;
}

/** Evaluate `defs` in order (each may use earlier ones) on top of `base`. */
export function evalDefs(defs: [string, Compiled][], base: Scope): Scope {
  const scope: Scope = { ...base };
  for (const [name, fn] of defs) scope[name] = fn(scope);
  return scope;
}

/** Format a number for readouts: trims trailing zeros, switches to exponent for tiny/huge values. */
export function fmt(n: number, digits = 2): string {
  if (!Number.isFinite(n)) return Number.isNaN(n) ? "undefined" : n > 0 ? "∞" : "−∞";
  if (n !== 0 && (Math.abs(n) >= 1e6 || Math.abs(n) < 1e-4)) return n.toExponential(2).replace("-", "−");
  const s = n.toFixed(digits).replace(/\.?0+$/, "");
  return (s === "-0" ? "0" : s).replace("-", "−");
}

/** Replace {expr} / {expr:3} placeholders in a template using the scope. */
export function template(src: string, scope: Scope, cache: Map<string, Compiled>): string {
  return src.replace(/\{([^{}]+)\}/g, (_, body: string) => {
    const [e = "", d] = body.split(/:(?=\d+$)/);
    let fn = cache.get(e);
    if (!fn) {
      fn = compile(e, Object.keys(scope));
      cache.set(e, fn);
    }
    return fmt(fn(scope), d === undefined ? 2 : Number(d));
  });
}
