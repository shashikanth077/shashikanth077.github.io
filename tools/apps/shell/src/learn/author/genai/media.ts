import { P, bars, cells, compare, curve, hline, par, plot, pt, seg, vline } from "../../visuals/kit.js";
import { py, type ConceptDef } from "../build.js";
import { table } from "../ml/data.js";
import { rowflow } from "../nlp/util.js";

/* Every code example is plain Python/NumPy and is RUN by `npm run outputs -- generative-ai`. */

export const diff: ConceptDef[] = [
  {
    t: "Diffusion models: create by removing noise",
    lv: 1,
    s: `A {{diffusion model}} learns to reverse a gradual corruption. Forward process: take a real image and add a little Gaussian noise, again and again, until only noise is left (a few hundred to a thousand steps). Reverse process: a neural network is trained to predict the noise in a noisy image; starting from pure random noise and removing the predicted noise step by step produces a new image. Because the network only has to make small, local denoising decisions, training is stable and produces diverse, high-quality results — the basis of Stable Diffusion, DALL·E and video generators.`,
    r: `Unlike a GAN, a diffusion model does not need an adversary, and it covers the whole data distribution rather than a few modes.`,
    i: `Describe the forward and the reverse process of diffusion.`,
    c: py`
import numpy as np

rng = np.random.default_rng(0)
x = np.array([1.0, -1.0, 0.5, 0.0])
for step in range(1, 4):
    x = np.sqrt(0.9) * x + np.sqrt(0.1) * rng.standard_normal(4)
    print(step, x.round(2).tolist())`,
    v: rowflow("Diffusion.", ["Real image x₀", "Add noise (forward)", "Pure noise x_T", "Network predicts noise", "Remove noise (reverse)", "New image"], [
      "A training example.",
      "Gradually destroy the image.",
      "Nothing left but randomness.",
      "Trained to predict ε at every step.",
      "Many small denoising steps.",
      "A sample that never existed.",
    ]),
  },
  {
    t: "The forward process in one formula",
    lv: 2,
    s: `Noise can be added in one jump: {{x_t = √ᾱ_t · x₀ + √(1 − ᾱ_t) · ε}}, ε ~ N(0, I), where ᾱ_t falls from ≈ 1 (clean) to ≈ 0 (pure noise) along the {{noise schedule}}. With ᾱ = 0.5, x₀ = 1 and noise ε = 0.5: x_t = 0.707 × 1 + 0.707 × 0.5 = 1.061 — signal and noise equally strong, signal-to-noise ratio ᾱ/(1 − ᾱ) = 1. A linear schedule with β from 10⁻⁴ to 0.02 over T = 1,000 steps gives ᾱ₁ = 0.9999, ᾱ₅₀₀ = 0.079, ᾱ₁₀₀₀ = 4×10⁻⁵. Training picks a random t, forms x_t from a real image and asks the network to predict ε.`,
    r: `Schedules (linear, cosine) decide how fast the image is destroyed; cosine keeps more signal in the early steps.`,
    i: `Compute x_t for ᾱ = 0.5, x₀ = 1, ε = 0.5.`,
    c: py`
import numpy as np

ab, x0, eps = 0.5, 1.0, 0.5
print(round(float(np.sqrt(ab) * x0 + np.sqrt(1 - ab) * eps), 3), ab / (1 - ab))
beta = np.linspace(1e-4, 0.02, 1000)
abar = np.cumprod(1 - beta)
print(float(abar[0]), round(float(abar[499]), 4), float(abar[-1]))`,
    v: plot("How much signal and noise the noisy image contains: coefficients √ᾱ and √(1 − ᾱ).", {
      x: [0, 1], y: [0, 1.05], labels: ["ᾱ (1 = clean, 0 = pure noise)", "coefficient"],
      params: [par("a", "ᾱ", 0, 1, 0.05, 0.5)],
      readout: ["x_t = {sqrt(a):3}·x₀ + {sqrt(1-a):3}·ε; signal-to-noise = {a/(1-a+0.000001):2}"],
      steps: [["ᾱ = 0.5: equal signal and noise.", { a: 0.5 }], ["ᾱ = 0.05: almost all noise.", { a: 0.05 }]],
    }, [curve("sqrt(x)", { c: "good", label: "signal √ᾱ" }), curve("sqrt(1-x)", { c: "bad", label: "noise √(1−ᾱ)" }), vline("a", { c: "muted" })]),
  },
  {
    t: "Training and sampling",
    lv: 2,
    s: `Training is simple regression: sample an image x₀, a step t and noise ε; build x_t; the network ε_θ(x_t, t) is trained to minimise ‖ε − ε_θ(x_t, t)‖². One sentence of code, millions of images. Sampling reverses it: start at x_T ~ N(0, I) and for t = T…1 predict the noise, subtract a scaled amount, add a little fresh noise (DDPM) or none (deterministic DDIM). Fewer steps are faster: 1,000 steps (original DDPM) take about 1,000 network passes per image; modern samplers and distillation get good images in 20–50 steps, and consistency/distilled models in 1–4. Quality versus speed is a dial.`,
    r: `Sampler and step count change image quality and speed: expose them as settings and test your defaults.`,
    i: `What loss is used to train a diffusion model and how many network passes does an image need?`,
    c: py`
import numpy as np

rng = np.random.default_rng(0)
x0 = np.array([1.0, 0.5])
ab = 0.3
eps = rng.standard_normal(2)
xt = np.sqrt(ab) * x0 + np.sqrt(1 - ab) * eps
eps_hat = eps + 0.1 * rng.standard_normal(2)
print(round(float(((eps - eps_hat) ** 2).mean()), 4))
for steps in (1000, 50, 4):
    print(steps, "network passes per image")`,
    v: compare("Sampling steps and quality.", ["Network passes", "Quality / speed"], [
      ["DDPM", "≈ 1,000", "high quality, slow"],
      ["DDIM / DPM-solver", "20 – 50", "near-identical quality, 20–50× faster"],
      ["Distilled / consistency models", "1 – 4", "real-time, slight quality loss"],
    ]),
  },
  {
    t: "Conditioning and classifier-free guidance",
    lv: 2,
    s: `To obey a text prompt the network gets the prompt as an extra input (the embedding of a text encoder, injected through cross-attention): ε_θ(x_t, t, c). {{Classifier-free guidance}} makes the image follow the prompt more strongly by extrapolating from the unconditional prediction towards the conditional one: ε̂ = ε_uncond + w (ε_cond − ε_uncond). With ε_uncond = 0.1, ε_cond = 0.3 and guidance scale w = 7.5: ε̂ = 0.1 + 7.5 × 0.2 = 1.6. w = 1 is the plain conditional model; larger w gives stronger prompt adherence and less diversity (and, if too large, saturated or distorted images). Typical scales: 5–9. A negative prompt replaces the unconditional branch to steer away from unwanted content.`,
    r: `The guidance scale is the main creative dial in text-to-image tools.`,
    i: `Compute the guided noise estimate for ε_uncond = 0.1, ε_cond = 0.3 and w = 7.5.`,
    c: py`
eps_u, eps_c = 0.1, 0.3
for w in (1.0, 3.0, 7.5, 15.0):
    print(w, round(eps_u + w * (eps_c - eps_u), 3))`,
    v: plot("Guided noise estimate against the guidance scale.", {
      x: [0, 15], y: [0, 3.2], labels: ["guidance scale w", "ε̂ = ε_u + w(ε_c − ε_u)"],
      params: [par("w", "guidance scale w", 0, 15, 0.5, 7.5)],
      readout: ["ε̂ = 0.1 + {w}·0.2 = {0.1+w*0.2:2}"],
      steps: [["w = 1: the plain conditional model.", { w: 1 }], ["w = 7.5: strong prompt adherence.", { w: 7.5 }]],
    }, [curve("0.1+x*0.2", { c: "accent" }), pt("w", "0.1+w*0.2", { c: "bad" })]),
  },
  {
    t: "Latent diffusion: work in a compressed space",
    lv: 2,
    s: `Denoising a 512 × 512 × 3 image directly means 786,432 numbers per step. {{Latent diffusion}} first compresses images with an autoencoder (a VAE) into a small latent — 64 × 64 × 4 = 16,384 numbers, 48 times fewer — runs the diffusion there, and decodes the final latent back to pixels. That is why Stable Diffusion runs on a consumer GPU. The pipeline has three networks: a text encoder (prompt → embeddings), a U-Net or transformer denoiser (works on latents, conditioned through cross-attention) and the VAE decoder. Video and 3-D generators extend the latent with a time dimension.`,
    r: `Fine details such as small text and faces are limited by the autoencoder's reconstruction quality.`,
    i: `By what factor does the latent shrink the data for a 512×512 RGB image with a 64×64×4 latent?`,
    c: py`
pixels = 512 * 512 * 3
latent = 64 * 64 * 4
print(pixels, latent, pixels / latent)
print(512 / 64, "x downsampling per side")`,
    v: bars("Numbers processed per denoising step (thousands).", [["pixel space 512×512×3", "786.432"], ["latent space 64×64×4", "16.384"]], {
      max: 800,
    }),
  },
  {
    t: "Controlling image generation",
    lv: 1,
    s: `Beyond the prompt, generators accept further controls. {{Image-to-image}}: start from a noised version of an input image instead of pure noise; the amount of noise (strength) decides how much changes. {{Inpainting}}: regenerate a masked region only. {{ControlNet}}-style conditioning: guide with edges, depth or pose. {{LoRA}} adapters: a few MB teach a style or a character. {{Seeds}}: fixing the random seed reproduces an image. Responsible use: filter prompts and outputs, label synthetic images (watermarks, provenance metadata), respect the rights of artists and the likeness of people.`,
    r: `Record the seed, sampler, steps, scale and model version of every generated asset: otherwise it cannot be reproduced.`,
    i: `What does the strength parameter control in image-to-image generation?`,
    c: py`
steps, strength = 50, 0.6
print(int(steps * strength), "denoising steps run on the noised input image")
for s in (0.2, 0.6, 1.0):
    print(s, "keeps", round(1 - s, 1), "of the original structure (roughly)")`,
    v: compare("Controls for image generation.", ["What it does"], [
      ["Strength (image-to-image)", "how far the result may move from the input"],
      ["Inpainting mask", "regenerate only the selected region"],
      ["ControlNet", "follow edges, depth or pose"],
      ["Seed", "reproduce the same image"],
      ["LoRA", "add a style or subject"],
    ]),
  },
];

/* ------------------------------------------------------------------ */
export const multi: ConceptDef[] = [
  {
    t: "Multimodal models",
    lv: 1,
    s: `A {{multimodal}} model accepts or produces several kinds of data. The common design turns each modality into tokens or embeddings in a shared space: an image encoder (a vision transformer) cuts an image into patches and maps each to a vector that is fed to the language model like words. A 336 × 336 image with 14 × 14 patches becomes 24 × 24 = 576 visual tokens — comparable to several paragraphs of text in the context window. Audio is handled with a spectrogram encoder, video as a sequence of frames. Uses: describing images, reading charts and documents, answering questions about screenshots, transcription and spoken dialogue.`,
    r: `Count image tokens in your budget: a single high-resolution image can cost as much as a page of text.`,
    i: `How many visual tokens does a 336×336 image give with 14×14 patches?`,
    c: py`
size, patch = 336, 14
n = (size // patch) ** 2
print(n)
for side in (224, 336, 672):
    print(side, (side // patch) ** 2)`,
    v: rowflow("An image-language model.", ["Image", "Patches", "Vision encoder", "Projection to token space", "Language model", "Text answer"], [
      "A photo or screenshot.",
      "Cut into 14 × 14 pixel tiles.",
      "A vision transformer makes one vector per patch.",
      "Vectors are mapped to the language model's embedding size.",
      "Patches and text tokens are processed together.",
      "A description or an answer.",
    ]),
  },
  {
    t: "Text, audio and video generation",
    lv: 1,
    s: `The same ideas reach other media. {{Speech}}: a language model over audio tokens (codec tokens) or a diffusion/flow model turns text into voice. {{Music}}: models predict audio tokens or denoise spectrogram latents. {{Video}}: diffusion over space-time latents — a 5-second 24 fps clip is 120 frames, so efficient compression and temporal consistency are the hard parts. {{Code}}: language models trained on repositories complete, explain and test programs. {{3-D}}: models produce meshes or neural scenes. Quality improves quickly, but cost, consistency over long durations and the control of fine detail remain open problems.`,
    r: `Always disclose and label synthetic media in public-facing work.`,
    i: `How many frames are in a 5-second, 24 fps video clip?`,
    c: py`
print(5 * 24, "frames")
latent_per_frame = 64 * 64 * 4
print(5 * 24 * latent_per_frame / 1e6, "million latent numbers for the clip")`,
    v: compare("Modalities and how they are generated.", ["Typical approach"], [
      ["Text / code", "autoregressive transformer"],
      ["Images", "latent diffusion or autoregressive tokens"],
      ["Speech and music", "codec-token language models, diffusion"],
      ["Video", "diffusion over space-time latents"],
    ]),
  },
  {
    t: "Vision-language tasks in practice",
    lv: 1,
    s: `Typical uses of image-understanding models: {{captioning}}, {{visual question answering}} ("how many people are in the photo?"), {{document understanding}} (invoices, forms, tables, charts), {{OCR-free reading}} and {{UI/screenshot analysis}}. Practical advice: crop or tile large images so small text is legible; ask for structured output; verify numbers read from charts; and remember that models can miss small objects, miscount and misread unusual layouts. Do not use them for identity recognition of people and be careful with sensitive images (medical, children, private documents) — check the provider's data handling and your legal obligations.`,
    r: `Always keep a human review step for decisions based on images, such as medical or legal ones.`,
    i: `Give two precautions when extracting numbers from a chart image.`,
    c: py`
chart_values = {"Q1": 12, "Q2": 18, "Q3": 15}
model_reading = {"Q1": 12, "Q2": 19, "Q3": 15}
errors = {k: abs(chart_values[k] - model_reading[k]) for k in chart_values}
print(errors, max(errors.values()))`,
    v: compare("Vision-language tasks and cautions.", ["Caution"], [
      ["Captioning", "may invent details; check important claims"],
      ["Visual Q&A, counting", "counts are error-prone"],
      ["Documents and tables", "crop for small text; validate fields"],
      ["Charts", "verify read-out numbers"],
    ]),
  },
];

void [P, bars, cells, compare, curve, hline, par, plot, pt, seg, vline, table, rowflow];
