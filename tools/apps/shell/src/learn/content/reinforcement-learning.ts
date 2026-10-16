import { buildStack } from "../author/build.js";
import { adv, policy } from "../author/rl/policy.js";
import { approx, td } from "../author/rl/td.js";
import { bandit, basics } from "../author/rl/basics.js";
import { mc, mdp } from "../author/rl/dp.js";
import { codeLab, drills, glance, lists, materials, questions } from "../author/rl/practice.js";
import outputs from "./reinforcement-learning.outputs.json";

/**
 * Reinforcement Learning — hand-authored; every example is plain Python/NumPy, so the "Output"
 * panels come from RUNNING the code:  npm run outputs -- reinforcement-learning
 */
const built = buildStack({
  areas: [
    ["basics", "The reinforcement learning problem", "Basics"],
    ["bandit", "Bandits and exploration", "Bandits"],
    ["mdp", "Markov decision processes and dynamic programming", "MDPs"],
    ["mc", "Monte Carlo methods", "Monte Carlo"],
    ["td", "Temporal-difference learning", "TD learning"],
    ["approx", "Function approximation and deep RL", "Deep RL"],
    ["policy", "Policy gradients and actor–critic", "Policy gradient"],
    ["adv", "Models, rewards, multi-agent and RLHF", "Beyond"],
  ],
  concepts: { basics, bandit, mdp, mc, td, approx, policy, adv },
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
