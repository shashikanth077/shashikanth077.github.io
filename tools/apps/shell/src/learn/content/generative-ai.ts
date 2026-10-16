import { buildStack } from "../author/build.js";
import { arch, tok } from "../author/genai/core.js";
import { diff, multi } from "../author/genai/media.js";
import { evalu, ops } from "../author/genai/ops.js";
import { codeLab, drills, glance, lists, materials, questions } from "../author/genai/practice.js";
import { adapt, train } from "../author/genai/training.js";
import { prompt, rag } from "../author/genai/usage.js";
import outputs from "./generative-ai.outputs.json";

/**
 * Generative AI — hand-authored; every example is plain Python/NumPy, so the "Output" panels
 * come from RUNNING the code:  npm run outputs -- generative-ai
 * (No model is called: the arithmetic of attention, sizes, costs, retrieval, LoRA, diffusion…)
 */
const built = buildStack({
  areas: [
    ["tok", "Tokens, embeddings and context", "Tokens"],
    ["arch", "Inside the transformer", "Architecture"],
    ["train", "How large models are trained", "Training"],
    ["adapt", "Adapting models: LoRA, quantisation, alignment", "Adapting"],
    ["prompt", "Prompting and structured outputs", "Prompting"],
    ["rag", "Retrieval-augmented generation", "RAG"],
    ["diff", "Image generation with diffusion", "Diffusion"],
    ["multi", "Multimodal and other media", "Multimodal"],
    ["evalu", "Evaluating generative systems", "Evaluation"],
    ["ops", "Cost, latency, safety and shipping", "Operations"],
  ],
  concepts: { tok, arch, train, adapt, prompt, rag, diff, multi, evalu, ops },
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
