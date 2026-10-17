/**
 * Pure logic behind the live fraud stream lab (no React), so scripts/visuals-check.mjs can test it.
 * Everything is deterministic: transaction i is generated from a seed derived from i alone.
 */
import type { StreamVisual } from "./types.js";

/** Small fast seeded generator (mulberry32). */
export function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const normal = (r: () => number) => Math.sqrt(-2 * Math.log(1 - r())) * Math.cos(2 * Math.PI * r());
const sigmoid = (z: number) => 1 / (1 + Math.exp(-z));

export const MERCHANTS = ["Grocery", "Fuel", "Restaurant", "Online store", "Electronics", "Travel", "Pharmacy", "Gift cards", "Streaming", "Hotel"];

export interface Txn {
  id: number;
  amount: number;
  merchant: string;
  fraud: boolean;
  /** Model risk score, 0..1. */
  score: number;
  /** Does the human reviewer judge this one correctly? (fixed per transaction so the feed is stable) */
  reviewerRight: boolean;
}

/** Fraud is heavier on gift cards and electronics and involves bigger amounts; scores follow two overlapping bell curves. */
export function makeTxn(i: number, fraudRate: number, separation: number): Txn {
  const r = rng(Math.imul(i + 1, 2654435761) ^ 0x9e3779b9);
  const fraud = r() < fraudRate / 100;
  const amount = Math.round(Math.exp((fraud ? 4.7 : 3.5) + (fraud ? 0.6 : 0.8) * normal(r)) * 100) / 100;
  const risky = [3, 4, 5, 7]; // online store, electronics, travel, gift cards
  const pick = r();
  const merchant = MERCHANTS[fraud && pick < 0.7 ? (risky[Math.floor(r() * risky.length)] as number) : Math.floor(r() * MERCHANTS.length)] as string;
  // Real data overlaps: some genuine purchases look odd (a holiday, a big one-off) and some fraud is stealthy.
  const odd = r() < (fraud ? 0.15 : 0.06);
  const shift = fraud ? (odd ? 0.4 : 1) : odd ? 0.6 : 0;
  const z = -3 + shift * separation + normal(r);
  return { id: i + 1, amount, merchant, fraud, score: sigmoid(z), reviewerRight: r() < 0.9 };
}

export type Decision = "approve" | "review" | "decline";
export const decide = (score: number, reviewAt: number, declineAt: number): Decision => (score >= declineAt ? "decline" : score >= reviewAt ? "review" : "approve");

export interface Summary {
  n: number;
  fraud: number;
  approved: number;
  reviewed: number;
  declined: number;
  /** fraud stopped (declined, or approved-to-block by a reviewer) */
  caught: number;
  /** fraud that got through */
  missed: number;
  /** good customers turned away */
  falseDeclines: number;
  fraudLoss: number;
  falseDeclineLoss: number;
  reviewLoss: number;
  total: number;
  /** what the fraud would have cost with no model at all */
  baseline: number;
  approvalRate: number;
  recall: number;
  precision: number;
}

export function summarise(txns: Txn[], v: Pick<StreamVisual, "falseDeclineCost" | "reviewCost">, reviewAt: number, declineAt: number): Summary {
  const s = { n: txns.length, fraud: 0, approved: 0, reviewed: 0, declined: 0, caught: 0, missed: 0, falseDeclines: 0, fraudLoss: 0, baseline: 0 };
  let flagged = 0;
  for (const t of txns) {
    if (t.fraud) { s.fraud++; s.baseline += t.amount; }
    const d = decide(t.score, reviewAt, declineAt);
    if (d === "approve") s.approved++;
    else if (d === "review") s.reviewed++;
    else s.declined++;
    // a reviewer who judges right blocks fraud and lets good payments through; wrong is the reverse
    const blocked = d === "decline" || (d === "review" && (t.fraud ? t.reviewerRight : !t.reviewerRight));
    if (blocked) flagged++;
    if (t.fraud) {
      if (blocked) s.caught++;
      else { s.missed++; s.fraudLoss += t.amount; }
    } else if (blocked) s.falseDeclines++;
  }
  const falseDeclineLoss = s.falseDeclines * v.falseDeclineCost;
  const reviewLoss = s.reviewed * v.reviewCost;
  return {
    ...s,
    falseDeclineLoss,
    reviewLoss,
    total: s.fraudLoss + falseDeclineLoss + reviewLoss,
    approvalRate: s.n ? (s.n - flagged) / s.n : 1,
    recall: s.fraud ? s.caught / s.fraud : 1,
    precision: flagged ? s.caught / flagged : 1,
  };
}

/** Generate the first `count` transactions of the stream. */
export const feed = (count: number, fraudRate: number, separation: number) => Array.from({ length: count }, (_, i) => makeTxn(i, fraudRate, separation));
