import { buildStack } from "../author/build.js";
import { core } from "../author/agents/core.js";
import { codeLab, drills, glance, lists, materials, questions } from "../author/agents/practice.js";
import { build, safe } from "../author/agents/safety.js";
import { evalu, multi } from "../author/agents/systems.js";
import { mem, plan } from "../author/agents/planning.js";
import { tools } from "../author/agents/tools.js";
import outputs from "./agentic-ai.outputs.json";

/**
 * Agentic AI — hand-authored; every example is plain Python, so the "Output" panels come from
 * RUNNING the code:  npm run outputs -- agentic-ai
 * The "model" in the examples is a scripted stand-in, so loops, tools, memory and costs are
 * deterministic and no API is called.
 */
const built = buildStack({
  areas: [
    ["core", "What agents are", "Agents"],
    ["tools", "Tools and the Model Context Protocol", "Tools"],
    ["plan", "Planning, reasoning and search", "Planning"],
    ["mem", "Memory and state", "Memory"],
    ["multi", "Multi-agent systems", "Multi-agent"],
    ["evalu", "Evaluating agents", "Evaluation"],
    ["safe", "Safety, security and control", "Safety"],
    ["build", "Building and shipping agents", "Building"],
  ],
  concepts: { core, tools, plan, mem, multi, evalu, safe, build },
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
