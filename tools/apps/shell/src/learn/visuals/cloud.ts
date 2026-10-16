/**
 * Pure logic behind the cloud labs (no React), so scripts/visuals-check.mjs can
 * test it: IAM policy evaluation, CIDR maths and the auto scaling simulation.
 */
import type { IamStatement, IamVisual, ScaleVisual } from "./types.js";

/* ---------------- IAM ---------------- */

/** IAM-style wildcard match: `*` = any run of characters, `?` = one character. Actions are case-insensitive. */
export function globMatch(pattern: string, value: string, ignoreCase = false) {
  const esc = pattern.replace(/[.+^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*").replace(/\?/g, ".");
  return new RegExp(`^${esc}$`, ignoreCase ? "i" : "").test(value);
}

const covers = (s: IamStatement, action: string, resource: string) =>
  s.actions.some((a) => globMatch(a, action, true)) && s.resources.some((r) => globMatch(r, resource));

export type StageResult = "allow" | "deny" | "pass" | "skip" | "none";
export interface IamStage { key: string; label: string; result: StageResult; detail: string }
export interface IamDecision { allowed: boolean; stages: IamStage[]; reason: string }

/**
 * Same-account evaluation for an IAM role session whose resource policies name the
 * role ARN (the usual case for an application role), following the order in the
 * IAM user guide: any explicit Deny wins; SCPs must allow; then an Allow from an
 * identity OR a resource-based policy; a permissions boundary and a session policy,
 * when present, must also allow (they limit resource-policy grants to a role ARN too).
 */
export function evaluateIam(v: Pick<IamVisual, "policies">, on: boolean[], action: string, resource: string): IamDecision {
  const active = v.policies.filter((_, i) => on[i]);
  const of = (kind: IamVisual["policies"][number]["kind"]) => active.filter((p) => p.kind === kind);
  const allows = (ps: typeof active) => ps.some((p) => p.statements.some((s) => s.effect === "Allow" && covers(s, action, resource)));
  const stages: IamStage[] = [];

  const denier = active.find((p) => p.statements.some((s) => s.effect === "Deny" && covers(s, action, resource)));
  stages.push({ key: "deny", label: "Explicit deny?", result: denier ? "deny" : "pass", detail: denier ? `“${denier.name}” has a Deny that matches` : "No Deny statement matches" });
  if (denier) return { allowed: false, stages, reason: `Explicit deny in “${denier.name}” — nothing can override it.` };

  const scps = of("scp");
  if (!scps.length) stages.push({ key: "scp", label: "Organization SCPs", result: "skip", detail: "No SCP in play" });
  else if (!allows(scps)) {
    stages.push({ key: "scp", label: "Organization SCPs", result: "deny", detail: "No SCP allows this action" });
    return { allowed: false, stages, reason: "SCPs set the maximum for every principal in the account, and none allows this." };
  } else stages.push({ key: "scp", label: "Organization SCPs", result: "pass", detail: "An SCP allows it" });

  const idAllow = allows(of("identity"));
  const resAllow = allows(of("resource"));
  stages.push({ key: "resource", label: "Resource-based policy", result: of("resource").length ? (resAllow ? "allow" : "none") : "skip", detail: of("resource").length ? (resAllow ? "Grants it to this role" : "Does not mention this action") : "None attached to the resource" });
  stages.push({ key: "identity", label: "Identity-based policy", result: idAllow ? "allow" : "none", detail: idAllow ? "The role's policy allows it" : "No Allow on the role" });
  if (!idAllow && !resAllow) return { allowed: false, stages, reason: "Implicit deny: nothing allows this request." };

  const bounds = of("boundary");
  if (!bounds.length) stages.push({ key: "boundary", label: "Permissions boundary", result: "skip", detail: "No boundary set" });
  else if (!allows(bounds)) {
    stages.push({ key: "boundary", label: "Permissions boundary", result: "deny", detail: "The boundary does not allow it" });
    return { allowed: false, stages, reason: "The permissions boundary caps what the role can ever do — it blocks this even though a policy allows it." };
  } else stages.push({ key: "boundary", label: "Permissions boundary", result: "pass", detail: "Inside the boundary" });

  const sessions = of("session");
  if (!sessions.length) stages.push({ key: "session", label: "Session policy", result: "skip", detail: "No session policy passed" });
  else if (!allows(sessions)) {
    stages.push({ key: "session", label: "Session policy", result: "deny", detail: "The session policy does not allow it" });
    return { allowed: false, stages, reason: "The session policy narrows this session — it does not include this action." };
  } else stages.push({ key: "session", label: "Session policy", result: "pass", detail: "Allowed for this session" });

  return { allowed: true, stages, reason: idAllow ? "Allowed by the role's identity policy, and nothing narrower blocks it." : "Allowed by the resource-based policy, and nothing narrower blocks it." };
}

/* ---------------- CIDR ---------------- */

export function ipToInt(ip: string) {
  const p = ip.split(".").map(Number);
  if (p.length !== 4 || p.some((n) => !Number.isInteger(n) || n < 0 || n > 255)) throw new Error(`bad IPv4 address ${ip}`);
  return ((p[0] as number) * 2 ** 24) + ((p[1] as number) << 16) + ((p[2] as number) << 8) + (p[3] as number);
}
export const intToIp = (n: number) => [Math.floor(n / 2 ** 24) % 256, (n >>> 16) & 255, (n >>> 8) & 255, n & 255].join(".");

/** AWS keeps 5 addresses in every subnet: network, VPC router, DNS, future use, broadcast. */
export const AWS_RESERVED = 5;

export interface SubnetPlan {
  vpc: string;
  vpcSize: number;
  subnetSize: number;
  usable: number;
  available: number;
  needed: number;
  fits: boolean;
  subnets: { tier: string; az: number; cidr: string; first: string; last: string }[];
}

/** Lay out one subnet per tier per AZ, packed from the start of the VPC range. */
export function planSubnets(base: string, vpcPrefix: number, subnetPrefix: number, azs: number, tiers: string[]): SubnetPlan {
  const size = (p: number) => 2 ** (32 - p);
  const start = Math.floor(ipToInt(base) / size(vpcPrefix)) * size(vpcPrefix);
  const available = subnetPrefix >= vpcPrefix ? 2 ** (subnetPrefix - vpcPrefix) : 0;
  const needed = tiers.length * azs;
  const subnets: SubnetPlan["subnets"] = [];
  let k = 0;
  for (const tier of tiers) {
    for (let az = 0; az < azs; az++) {
      if (k < available) {
        const s = start + k * size(subnetPrefix);
        subnets.push({ tier, az, cidr: `${intToIp(s)}/${subnetPrefix}`, first: intToIp(s + 4), last: intToIp(s + size(subnetPrefix) - 2) });
      }
      k++;
    }
  }
  return { vpc: `${intToIp(start)}/${vpcPrefix}`, vpcSize: size(vpcPrefix), subnetSize: size(subnetPrefix), usable: size(subnetPrefix) - AWS_RESERVED, available, needed, fits: needed <= available, subnets };
}

/* ---------------- Auto scaling ---------------- */

export interface ScaleTick { t: number; traffic: number; ready: number; pending: number; desired: number; util: number; served: number; overload: number }

/**
 * Deterministic target-tracking simulation, one tick per minute. Scale-out is
 * immediate (new units become ready after `warmup` ticks); scale-in removes one
 * unit at a time and only after `cooldown` quiet ticks, like a real policy.
 */
export function simulateScaling(v: Pick<ScaleVisual, "capacityPer" | "pattern">, target: number, min: number, max: number, warmup: number, cooldown = 3): ScaleTick[] {
  const out: ScaleTick[] = [];
  let ready = min;
  let pending: number[] = []; // ready-at tick for each launching unit
  let quiet = 0;
  v.pattern.forEach((traffic, t) => {
    ready += pending.filter((at) => at <= t).length;
    pending = pending.filter((at) => at > t);
    const desired = Math.min(max, Math.max(min, Math.ceil(traffic / (v.capacityPer * (target / 100)))));
    const total = ready + pending.length;
    if (desired > total) {
      for (let i = total; i < desired; i++) pending.push(t + warmup);
      quiet = 0;
    } else if (desired < ready && !pending.length) {
      quiet++;
      if (quiet >= cooldown) { ready -= 1; quiet = 0; }
    } else quiet = 0;
    if (warmup === 0) { ready += pending.length; pending = []; }
    const cap = ready * v.capacityPer;
    const served = Math.min(traffic, cap);
    out.push({ t, traffic, ready, pending: pending.length, desired, util: cap ? Math.min(999, (traffic / cap) * 100) : 999, served, overload: traffic - served });
  });
  return out;
}
