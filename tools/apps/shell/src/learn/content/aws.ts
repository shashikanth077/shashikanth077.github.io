import { buildStack } from "../author/build.js";
import { ai } from "../author/aws/ai.js";
import { arch_ } from "../author/aws/arch.js";
import { compute } from "../author/aws/compute.js";
import { data } from "../author/aws/data.js";
import { events } from "../author/aws/events.js";
import { iamArea } from "../author/aws/iam.js";
import { net } from "../author/aws/net.js";
import { ops } from "../author/aws/ops.js";
import { codeLab, drills, glance, lists, materials, questions } from "../author/aws/practice.js";
import { start } from "../author/aws/start.js";

/**
 * AWS for developers and AI developers — hand-authored around one example app
 * (ShopNest: React + Node.js/Express + MySQL). Diagrams are interactive labs:
 * clickable architecture maps, an IAM policy evaluator, a VPC subnet planner and
 * a scaling simulator (visuals/CloudLabs.tsx, logic in visuals/cloud.ts).
 * Code examples are reference code (Node.js SDK v3, CDK, CLI) — they call AWS, so
 * there are no generated outputs except where a snippet is pure JavaScript.
 * Facts, limits and prices were checked against the official documentation on 2026-10-17.
 */
const built = buildStack({
  areas: [
    ["start", "Start here: cloud basics and the ShopNest app", "Start here"],
    ["iam", "Identity and security", "IAM & security"],
    ["net", "Networking and content delivery", "Networking"],
    ["compute", "Compute: EC2, containers, Lambda", "Compute"],
    ["data", "Storage and databases", "Data"],
    ["events", "Serverless and integration", "Serverless"],
    ["ops", "DevOps, observability and cost", "DevOps & cost"],
    ["ai", "AI on AWS: Bedrock, RAG, agents", "AI on AWS"],
    ["arch", "Reference architectures", "Architectures"],
  ],
  concepts: { start, iam: iamArea, net, compute, data, events, ops, ai, arch: arch_ },
  questions,
  drills,
  codeLab,
  glance,
  lists,
  materials,
});

export const content = built.content;
export const visuals = built.visuals;
