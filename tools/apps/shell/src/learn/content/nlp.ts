import { buildStack } from "../author/build.js";
import { qa, now, lm, s2s } from "../author/nlp/models.js";
import { codeLab, drills, glance, lists, materials, questions } from "../author/nlp/practice.js";
import { cls, tag } from "../author/nlp/tasks.js";
import { prep, repr, src } from "../author/nlp/text.js";
import outputs from "./nlp.outputs.json";

/**
 * Natural Language Processing — written by hand from a course outline. Every example is plain
 * Python/NumPy, so the "Output" panels come from RUNNING the code:
 *
 *     npm run outputs -- nlp
 */
const built = buildStack({
  areas: [
    ["src", "Text sources and retrieval", "Retrieval"],
    ["prep", "Preprocessing and tokenization", "Preprocess"],
    ["repr", "Text representations", "Representations"],
    ["cls", "Sentiment and text classification", "Classify"],
    ["tag", "Tagging and sequence labeling", "Tagging"],
    ["lm", "Language models and generation", "Language models"],
    ["s2s", "Sequence-to-sequence and transformers", "Seq2seq"],
    ["qa", "Question answering and dialog", "QA and dialog"],
    ["now", "LLMs, responsibility and trends", "Today"],
  ],
  concepts: { src, prep, repr, cls, tag, lm, s2s, qa, now },
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
