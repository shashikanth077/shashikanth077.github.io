import { P, bars, cells, compare, curve, hline, par, plot, pt, seg, vline } from "../../visuals/kit.js";
import { py, type ConceptDef } from "../build.js";
import { table } from "../ml/data.js";
import { rowflow } from "../nlp/util.js";

/* Every code example is plain Python/NumPy and is RUN by `npm run outputs -- generative-ai`. Prices are illustrative. */

export const evalu: ConceptDef[] = [
  {
    t: "Why evaluating generative models is hard",
    lv: 1,
    s: `A classifier has one right answer; a generator has many acceptable ones. Two summaries can both be good and share no words, so exact-match scores undercount quality, and fluent nonsense can fool surface metrics. Evaluate at several levels: {{task success}} on your own cases (does the extraction match the ground truth? does the code pass its tests?), {{properties}} (faithfulness, safety, tone, format validity) and {{human preference}}. Public benchmarks (MMLU, GSM8K, HumanEval) compare models in general but may be contaminated by training data and rarely match your use case — your own evaluation set is the one that matters.`,
    r: `Start the evaluation set before the product: ten real cases beat a hundred imagined ones.`,
    i: `Why are public benchmarks not enough to choose a model for your application?`,
    c: py`
scores = {"model A": {"benchmark": 0.82, "my task": 0.71}, "model B": {"benchmark": 0.79, "my task": 0.84}}
best_public = max(scores, key=lambda m: scores[m]["benchmark"])
best_mine = max(scores, key=lambda m: scores[m]["my task"])
print(best_public, best_mine)`,
    v: compare("Evaluation levels.", ["Example", "Strength"], [
      ["Task success", "unit tests pass; extracted fields match", "objective, automatic"],
      ["Properties", "grounded? safe? valid JSON?", "scalable with rules or judges"],
      ["Human preference", "side-by-side ratings", "captures what users like"],
      ["Public benchmark", "MMLU, GSM8K, HumanEval", "comparable, but not your task"],
    ]),
  },
  {
    t: "Pass@k for code and tasks with checkers",
    lv: 2,
    s: `When an automatic checker exists (unit tests), sample n solutions and count c that pass. {{pass@k}} estimates the probability that at least one of k samples is correct: pass@k = 1 − C(n − c, k)/C(n, k). With n = 10, c = 3: pass@1 = 0.30; pass@5 = 1 − C(7,5)/C(10,5) = 1 − 21/252 = 0.917. The gap shows what sampling several candidates and verifying them can buy: a 30% model becomes a 92% system with a good checker. The metric needs the same temperature and prompt every time and tests that really verify behaviour — weak tests inflate it.`,
    r: `Verification is the lever: wherever you can check an answer cheaply, generate several and pick.`,
    i: `Compute pass@1 and pass@5 for n = 10 samples with c = 3 correct.`,
    c: py`
from math import comb

def pass_at_k(n, c, k):
    return 1 - comb(n - c, k) / comb(n, k) if n - c >= k else 1.0

print([round(pass_at_k(10, 3, k), 3) for k in (1, 3, 5, 10)])`,
    v: plot("Probability that at least one of k independent tries succeeds, 1 − (1 − p)^k.", {
      x: [1, 10], y: [0, 1.05], labels: ["k (samples tried)", "pass@k"],
      params: [par("p", "per-sample success rate", 0.1, 0.9, 0.05, 0.3)],
      readout: ["with success rate {p}: pass@1 = {p}, pass@5 ≈ {1-pow(1-p,5):3}"],
      steps: [["30% per sample: 92% with five tries (≈ 83% by the simple formula).", { p: 0.3 }], ["60% per sample: almost certain with five tries.", { p: 0.6 }]],
    }, [curve("1-pow(1-p,x)", { c: "accent" })]),
  },
  {
    t: "LLM-as-judge and its biases",
    lv: 2,
    s: `For open-ended outputs, a strong model can grade answers against a rubric or compare two answers. It is cheap and scalable, but biased: it favours longer answers ({{verbosity bias}}), the answer listed first ({{position bias}}) and text that resembles its own style. Mitigations: swap the order and average, give a precise rubric with examples, ask for a short justification before the score, and — crucially — measure agreement with humans on a sample. If judge and human agree on 85% of 100 items while chance agreement is 50%, Cohen's κ = (0.85 − 0.5)/(1 − 0.5) = 0.70: substantial but imperfect. Use judges to screen, humans to decide.`,
    r: `Periodically re-check the judge against fresh human labels: models and data drift.`,
    i: `Compute Cohen's κ for observed agreement 0.85 and chance agreement 0.5.`,
    c: py`
observed, chance = 0.85, 0.5
print(round((observed - chance) / (1 - chance), 2))
import numpy as np
a = np.array([1, 1, 0, 1, 0, 0, 1, 1, 0, 1])
b = np.array([1, 0, 0, 1, 0, 1, 1, 1, 0, 1])
print(float((a == b).mean()))`,
    v: bars("Cohen's κ for the chosen agreement (chance agreement 0.5).", [["observed agreement", "o"], ["κ", "(o-0.5)/0.5"]], {
      max: 1,
      params: [par("o", "observed agreement", 0.5, 1, 0.05, 0.85)],
      readout: ["κ = ({o} − 0.5)/(1 − 0.5) = {(o-0.5)/0.5:2}"],
      steps: [["85% agreement: κ = 0.70.", { o: 0.85 }], ["Chance-level agreement: κ = 0.", { o: 0.5 }]],
    }),
  },
  {
    t: "Hallucination: kinds and mitigation",
    lv: 1,
    s: `A model can state falsehoods fluently. Kinds: {{factual}} errors (a wrong date), {{fabrication}} (a citation or API that does not exist), {{unfaithfulness}} (a summary that adds claims not in the source), and {{reasoning}} slips. Causes: the training objective rewards plausible text, knowledge is compressed and incomplete, and the model rarely says "I don't know". Mitigations: ground answers in retrieved sources and require citations; ask the model to quote; allow and reward abstention; verify with tools (calculators, search, code execution); lower the temperature for facts; and check outputs automatically (does every cited URL exist?). Measure the rate on your own questions.`,
    r: `Design for the case where the model is wrong: confirmations, links to sources and easy human override.`,
    i: `Name two mitigations for fabricated citations and one automatic check.`,
    c: py`
answers = [("Paris is the capital", True), ("The treaty was signed in 1923", False), ("Water boils at 100 C at sea level", True), ("See doi:10.0000/xyz", False)]
rate = sum(not ok for _, ok in answers) / len(answers)
print(rate)
cited = ["doc1", "doc4"]
available = {"doc1", "doc2", "doc3"}
print([c for c in cited if c not in available])`,
    v: compare("Kinds of hallucination and what helps.", ["Example", "Mitigation"], [
      ["Factual error", "wrong date or figure", "retrieval, verification"],
      ["Fabrication", "a citation that does not exist", "check references automatically"],
      ["Unfaithful summary", "claims absent from the source", "quote-based answers, faithfulness checks"],
      ["Reasoning slip", "wrong arithmetic", "calculator or code tool"],
    ]),
  },
  {
    t: "Benchmarks, contamination and honest reporting",
    lv: 2,
    s: `Benchmark questions that appeared in training data inflate scores ({{contamination}}): a model memorises rather than solves. Defences: deduplicate and decontaminate training data against test sets, use fresh or private test sets, check whether a model reproduces the exact wording of questions, and prefer tasks that regenerate (new numbers each time). When you report results, give the model version, prompt, number of shots, sampling settings, the metric definition and the number of test cases with a confidence interval. A 2-point gap on a 100-question test (standard error ≈ 4 points) is noise.`,
    r: `Rerun evaluations on every model update: behaviour changes even when the name does not.`,
    i: `Is a 2-point difference on a 100-question benchmark meaningful at a score of 80%?`,
    c: py`
import numpy as np

n, p = 100, 0.8
se = np.sqrt(p * (1 - p) / n)
print(round(float(se), 3), round(float(1.96 * se), 3))
print(round(float(1.96 * np.sqrt(p * (1 - p) / 2000)), 3))`,
    v: plot("95% interval half-width of a benchmark score at 80% against the number of questions.", {
      x: [50, 2000], y: [0, 0.12], labels: ["number of questions", "± half-width"],
      params: [par("p", "score", 0.5, 0.95, 0.05, 0.8)],
      readout: ["100 questions: ± {1.96*sqrt(p*(1-p)/100):3}; 1,000: ± {1.96*sqrt(p*(1-p)/1000):3}"],
      steps: [["80% on 100 questions: about ±8 points.", { p: 0.8 }]],
    }, [curve("1.96*sqrt(p*(1-p)/x)", { c: "accent" })]),
  },
];

/* ------------------------------------------------------------------ */
export const ops: ConceptDef[] = [
  {
    t: "Cost: tokens in, tokens out",
    lv: 1,
    s: `LLM APIs bill per token, with output usually several times dearer than input (generation is sequential). Illustrative prices: 3 currency units per million input tokens and 15 per million output tokens. A request with 2,000 input and 500 output tokens costs 2,000/10⁶ × 3 + 500/10⁶ × 15 = 0.006 + 0.0075 = 0.0135; at 100,000 requests per day that is 1,350 per day. Levers: shorter prompts, caching the shared prefix, smaller models for easy requests (routing), limiting output length, batching offline work at a discount, and retrieving fewer but better chunks.`,
    r: `Estimate cost per successful task, not per request: retries and failures are part of the price.`,
    i: `Compute the cost of 2,000 input and 500 output tokens at 3 and 15 per million, and per day for 100,000 requests.`,
    c: py`
price_in, price_out = 3.0, 15.0
tin, tout = 2000, 500
cost = tin / 1e6 * price_in + tout / 1e6 * price_out
print(round(cost, 4), round(cost * 100000, 1))
print(round((tin * 0.2) / 1e6 * price_in + tin * 0.8 / 1e6 * price_in * 0.1 + tout / 1e6 * price_out, 4), "with 80% of the prompt cached at 10% price")`,
    v: bars("Cost of one request (×1,000 units) as the output length changes (2,000 input tokens).", [["input cost", "2000/1000000*3*1000"], ["output cost", "o/1000000*15*1000"]], {
      max: 25,
      params: [par("o", "output tokens", 0, 2000, 100, 500)],
      readout: ["cost = {2000/1000000*3+o/1000000*15:4} per request"],
      steps: [["500 output tokens: 0.0135.", { o: 500 }], ["2,000 output tokens: output dominates.", { o: 2000 }]],
    }),
  },
  {
    t: "Latency: time to first token and tokens per second",
    lv: 1,
    s: `Users feel two delays: the {{time to first token}} (TTFT — the prompt is processed in parallel, so it grows with prompt length) and the {{generation speed}} (tokens per second — sequential, one token at a time, limited by memory bandwidth). A 500-token answer at 50 tokens/s takes 10 s after a 0.8 s TTFT: 10.8 s in total. Streaming the answer as it is generated makes the wait feel short, because reading starts at once. Reduce latency with shorter outputs, a smaller or faster model, prompt caching, speculative decoding (a small model drafts, the big one verifies) and parallel calls for independent sub-tasks.`,
    r: `Report p50 and p95 latency; the slow tail is what users remember.`,
    i: `Compute the total time for 500 tokens at 50 tokens/s with a 0.8 s time to first token.`,
    c: py`
ttft, tps, n = 0.8, 50, 500
print(ttft + n / tps)
print(round(ttft + 100 / tps, 1), round(ttft + 1000 / tps, 1))`,
    v: plot("Total response time against the number of output tokens.", {
      x: [0, 1500], y: [0, 40], labels: ["output tokens", "seconds"],
      params: [par("s", "tokens per second", 10, 200, 10, 50), par("t", "time to first token (s)", 0.2, 3, 0.2, 0.8)],
      readout: ["500 tokens → {t+500/s:1} s"],
      steps: [["50 tokens/s: 10.8 s for 500 tokens.", { s: 50, t: 0.8 }], ["A 4× faster model: 2.8 s.", { s: 200, t: 0.8 }]],
    }, [curve("t+x/s", { c: "accent" })]),
  },
  {
    t: "Throughput, batching and rate limits",
    lv: 2,
    s: `GPUs are efficient when they serve many requests at once: {{batching}} turns a memory-bound sequential task into a more compute-efficient one, raising tokens per second per GPU several times at the price of some latency; modern servers use {{continuous batching}} (new requests join a running batch). Providers apply {{rate limits}} (requests and tokens per minute). A limit of 200,000 tokens/minute with 2,500-token requests allows 80 requests/minute ≈ 1.3 per second. Plan for bursts: queue and retry with exponential back-off (1 s, 2 s, 4 s, …) plus random jitter, and spread background work over time or use the provider's batch interface.`,
    r: `Handle 429 (rate limited) and 5xx errors gracefully: they are normal operating conditions.`,
    i: `How many requests per minute fit a 200,000 tokens/minute limit with 2,500-token requests?`,
    c: py`
limit, per_request = 200000, 2500
print(limit // per_request, round(limit / per_request / 60, 2), "per second")
import random
random.seed(0)
print([round(2 ** k + random.random(), 2) for k in range(5)])`,
    v: bars("Requests per minute allowed by a 200,000 tokens/minute limit.", [["tokens per request", "tpr"], ["requests per minute", "200000/tpr"]], {
      max: 400,
      params: [par("tpr", "tokens per request", 500, 5000, 500, 2500)],
      readout: ["{floor(200000/tpr)} requests/minute at {tpr} tokens each"],
      steps: [["2,500 tokens per request: 80 per minute.", { tpr: 2500 }], ["Half the tokens, twice the requests.", { tpr: 1250 }]],
    }),
  },
  {
    t: "Guardrails, moderation and safe use",
    lv: 1,
    s: `A production system surrounds the model with controls. {{Input checks}}: block or route abusive, off-topic or sensitive requests; detect prompt injection patterns. {{Output checks}}: moderation classifiers for harmful content, validators for format, PII detectors that mask personal data, a groundedness check against the sources. {{Policies}}: what the assistant must refuse, when to hand over to a human, and what is logged. {{Limits}}: rate limits, spending caps, least-privilege tools. Test with red-team prompts before launch and monitor in production; tune thresholds on both false blocks (annoying) and false allows (risky).`,
    r: `Safety is a system property: no single filter is enough, and none is permanent.`,
    i: `Name two input controls and two output controls for a customer-facing assistant.`,
    c: py`
import re

def mask_pii(text):
    text = re.sub(r"[\w.]+@[\w.]+", "<EMAIL>", text)
    return re.sub(r"\b\d{3}[- ]\d{3,4}\b", "<PHONE>", text)

print(mask_pii("Contact anna.k@example.com or call 555-1234."))`,
    v: rowflow("Layers around the model.", ["User input", "Input checks", "Model + tools", "Output checks", "Logging + review", "User"], [
      "Requests of every kind.",
      "Block abuse, detect injection, limit scope.",
      "The model with least-privilege tools.",
      "Moderation, PII masking, grounding, format validation.",
      "Monitor, sample and audit.",
      "A safe, useful answer.",
    ]),
  },
  {
    t: "Privacy, copyright and responsible use",
    lv: 1,
    s: `Know where data goes. Sending text to an API shares it with the provider: read the retention and training terms, use enterprise or zero-retention options for sensitive data, and mask personal information first (names, e-mails, ID numbers). Training data and generated text raise copyright and licence questions: check your provider's indemnities, avoid asking for verbatim reproduction, keep records of sources for retrieved content and respect robots and licences when you crawl. Be transparent with users that they are talking to an AI, give them a way to reach a human, and watch for bias: evaluate quality across languages, dialects and groups. Training and serving also consume energy — right-sizing the model is part of responsible design.`,
    r: `Involve legal, security and the affected users early, not after launch.`,
    i: `What should you check before sending customer data to a hosted model?`,
    c: py`
checklist = {
    "data retention terms reviewed": True,
    "personal data masked": True,
    "provider does not train on our data": False,
    "users told they talk to an AI": True,
}
print([k for k, ok in checklist.items() if not ok])`,
    v: compare("Responsible-use checklist.", ["Question to ask"], [
      ["Privacy", "where does the data go and how long is it kept?"],
      ["Copyright", "may the output and the sources be used this way?"],
      ["Transparency", "do users know it is an AI and how to reach a human?"],
      ["Fairness", "does quality hold across languages and groups?"],
      ["Environment", "is a smaller model enough?"],
    ]),
  },
  {
    t: "From prototype to product",
    lv: 1,
    s: `A reliable path: (1) write down the task, the users and what failure costs; (2) prototype with a strong model and a good prompt; (3) build a labelled evaluation set from real cases; (4) add retrieval or tools only where evaluation shows a gap; (5) measure quality, latency and cost per task; (6) try smaller or cheaper models and routing; (7) add guardrails, logging and a human fallback; (8) release gradually (internal, beta, canary) and monitor; (9) collect feedback and add failures to the evaluation set; (10) re-evaluate on every model or prompt change. Most of the work lies in steps 3, 7 and 9, not in the first demo.`,
    r: `The demo is 10% of the work: evaluation, monitoring and iteration are what make it a product.`,
    i: `List the first four steps of taking an LLM idea to production.`,
    c: py`
steps = ["define task and failure cost", "prototype", "build evaluation set", "add retrieval or tools if needed", "measure quality, latency, cost", "try cheaper models", "guardrails and fallback", "gradual release", "feedback loop", "re-evaluate on every change"]
for i, s in enumerate(steps, 1):
    print(i, s)`,
    v: rowflow("From idea to a monitored product.", ["Define", "Prototype", "Evaluate", "Improve", "Guard", "Release + monitor"], [
      "Task, users, cost of failure.",
      "A strong model and a careful prompt.",
      "A labelled set from real cases.",
      "Retrieval, tools, cheaper models where the numbers say so.",
      "Safety checks and a human fallback.",
      "Gradual rollout; failures feed the evaluation set.",
    ]),
  },
];

void [P, bars, cells, compare, curve, hline, par, plot, pt, seg, vline, table, rowflow];
