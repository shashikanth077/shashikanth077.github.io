import { buildStack } from "../author/build.js";
import { api } from "../author/claude/api.js";
import { cc, sdk } from "../author/claude/code.js";
import { copilot, dev, models } from "../author/claude/copilot.js";
import { codeLab, drills, glance, lists, materials, questions } from "../author/claude/practice.js";
import outputs from "./building-with-claude.outputs.json";

/**
 * Building with Claude and GitHub Copilot — hand-authored; the examples are plain Python that
 * builds requests, scripts responses and validates agent / skill files, so the "Output" panels
 * come from RUNNING the code:  npm run outputs -- building-with-claude
 * Facts were checked against the official documentation on 2026-10-16 (see the Materials tab).
 */
const built = buildStack({
  areas: [
    ["api", "The Claude API", "Claude API"],
    ["sdk", "SDKs and platforms", "SDKs"],
    ["cc", "Claude Code: skills, subagents, hooks", "Claude Code"],
    ["copilot", "GitHub Copilot: instructions, agents, skills, sub-agents", "Copilot"],
    ["models", "Providers, portability and GitHub Models", "Providers"],
    ["dev", "Using assistants in development and research", "In practice"],
  ],
  concepts: { api, sdk, cc, copilot, models, dev },
  questions,
  drills,
  codeLab,
  glance,
  lists,
  materials,
  outputs: outputs as Record<string, string>,
});

export const content = built.content;
export const visuals = built.visuals;
