import { P, bars, cells, compare, curve, hline, par, plot, pt, seg, vline } from "../../visuals/kit.js";
import { py, type ConceptDef } from "../build.js";
import { table } from "../ml/data.js";
import { rowflow } from "../nlp/util.js";

/* Every code example is plain Python/NumPy and is RUN by `npm run outputs -- speech-processing`. */

export const asr: ConceptDef[] = [
  {
    t: "Automatic speech recognition: the problem",
    lv: 1,
    s: `ASR finds the word sequence W that best explains the audio X: {{Ŵ = argmax P(W | X) = argmax P(X | W) P(W)}}. The {{acoustic model}} P(X | W) says how likely this sound is for those words; the {{language model}} P(W) says how likely those words are as text. Classic systems add a pronunciation dictionary linking words to phonemes ("cat" → k æ t). Hard because the same word sounds different for every speaker, accent, microphone and room; because words blur together with no gaps; and because many phrases sound alike ("recognise speech" / "wreck a nice beach") — the language model breaks the ties.`,
    r: `Deep end-to-end systems fold the three components into one network but still learn the same trade-off.`,
    i: `Write the Bayes decomposition of speech recognition and name its two factors.`,
    c: py`
import numpy as np

hyps = {"recognise speech": (0.40, 0.020), "wreck a nice beach": (0.45, 0.001)}
for h, (acoustic, lm) in hyps.items():
    print(f"{h:20s} score {acoustic * lm:.5f}")`,
    v: bars("Acoustic likelihood alone prefers the wrong words; the language model fixes it.", [["acoustic only: 'recognise speech'", "0.40"], ["acoustic only: 'wreck a nice beach'", "0.45"], ["acoustic × LM ×100: 'recognise speech'", "0.40*0.02*100"], ["acoustic × LM ×100: 'wreck a nice beach'", "0.45*0.001*100"]], {
      max: 1,
    }),
  },
  {
    t: "Word error rate",
    lv: 1,
    s: `ASR is scored by {{word error rate}}: WER = (S + D + I) / N, the minimum number of substituted, deleted and inserted words (found by the same edit-distance table used for spelling) divided by the number of reference words. Reference "the cat sat on the mat" (N = 6) and hypothesis "the cat sit on mat": one substitution (sat → sit) and one deletion (the) give WER = 2/6 = 33.3%. WER can exceed 100% if there are many insertions. Related: character error rate for languages without spaces. Normalise case, punctuation and numbers before scoring or you will measure formatting, not recognition.`,
    r: `A 5% WER on read speech may be 30% on a noisy phone call: always quote the test set.`,
    i: `Compute the WER for the reference and hypothesis above.`,
    c: py`
def wer(ref, hyp):
    r, h = ref.split(), hyp.split()
    D = [[i + j if i * j == 0 else 0 for j in range(len(h) + 1)] for i in range(len(r) + 1)]
    for i in range(1, len(r) + 1):
        for j in range(1, len(h) + 1):
            D[i][j] = min(D[i - 1][j] + 1, D[i][j - 1] + 1, D[i - 1][j - 1] + (r[i - 1] != h[j - 1]))
    return D[-1][-1] / len(r)

print(round(wer("the cat sat on the mat", "the cat sit on mat"), 3))
print(wer("hello world", "hello world"), wer("hi", "oh hi there you"))`,
    v: cells("Aligning reference and hypothesis.", [P("reference", ["the", "cat", "sat", "on", "the", "mat"]), P("hypothesis", ["the", "cat", "sit", "on", "—", "mat"]), P("error", ["ok", "ok", "S", "ok", "D", "ok"])], [
      ["Align the two word sequences with minimum edit distance."],
      ["'sat' became 'sit': a substitution.", [[2, 2, 2]]],
      ["The second 'the' is missing: a deletion. WER = (1 + 1)/6 = 0.333.", [[2, 4, 4]]],
    ]),
  },
  {
    t: "Classic ASR: HMMs with Gaussian mixtures",
    lv: 2,
    s: `Before deep learning, each phoneme was modelled by a short left-to-right {{hidden Markov model}} (typically 3 states: onset, middle, offset), and each state emitted MFCC vectors from a {{Gaussian mixture model}} (GMM). A word is a chain of its phonemes' HMMs; a sentence a chain of words. {{Decoding}} uses the Viterbi algorithm to find the most probable state path through the combined network, weighting acoustic scores with the language model. Self-loops let a state last several frames: with a self-loop probability of 0.8 the expected duration is 1/(1 − 0.8) = 5 frames = 50 ms.`,
    r: `The HMM structure still appears inside hybrid and CTC/transducer systems as the notion of alignment between frames and labels.`,
    i: `What is the expected duration of an HMM state with self-loop probability 0.8 and a 10 ms frame step?`,
    c: py`
import numpy as np

p_stay = 0.8
print(1 / (1 - p_stay), 1 / (1 - p_stay) * 10, "ms")
rng = np.random.default_rng(0)
durations = [int(rng.geometric(1 - p_stay)) for _ in range(20000)]
print(round(float(np.mean(durations)), 2))`,
    v: plot("Expected state duration against the self-loop probability (10 ms frames).", {
      x: [0, 0.95], y: [0, 200], labels: ["self-loop probability", "expected duration (ms)"],
      params: [par("p", "self-loop p", 0.1, 0.95, 0.05, 0.8)],
      readout: ["p = {p} → {10/(1-p):1} ms"],
      steps: [["0.8: 50 ms.", { p: 0.8 }], ["0.95: 200 ms — long sounds like vowels.", { p: 0.95 }]],
    }, [curve("10/(1-x)", { c: "accent" }), pt("p", "10/(1-p)", { c: "bad" })]),
  },
  {
    t: "Neural acoustic models",
    lv: 2,
    s: `Deep networks replaced the GMM: given a window of log-mel frames, predict which phoneme state (or character, or word piece) is being spoken. Architectures progressed from feed-forward networks to {{recurrent}} (LSTM) and {{convolutional}} models, and now {{transformers}} and {{Conformers}} (convolution for local patterns plus attention for global context). The encoder usually downsamples time by 4×–8×: 100 frames per second become 25–12 label steps per second, since a word piece lasts several frames. Training needs hundreds to hundreds of thousands of hours; data augmentation (SpecAugment: mask random time and frequency stripes) is standard.`,
    r: `SpecAugment is almost free and often gives the biggest single accuracy gain for small datasets.`,
    i: `Why does the encoder reduce the frame rate?`,
    c: py`
import numpy as np

frames = np.arange(100)
for factor in (1, 4, 8):
    print(factor, len(frames[::factor]), "steps per second")
S = np.ones((20, 10))
S[5:8, :] = 0
S[:, 2:4] = 0
print(int((S == 0).sum()), "masked cells of", S.size)`,
    v: cells("SpecAugment: masked stripes in a tiny spectrogram (X = masked).", [P("frequency 3", ["·", "·", "X", "X", "·", "·"]), P("frequency 2", ["X", "X", "X", "X", "X", "X"]), P("frequency 1", ["·", "·", "X", "X", "·", "·"])], [
      ["Time runs left to right, frequency bottom to top."],
      ["A frequency band is masked for all time.", [[1, 0, 5]]],
      ["A time band is masked for all frequencies.", [[0, 2, 3], [2, 2, 3]]],
    ]),
  },
  {
    t: "CTC: learning without alignments",
    lv: 2,
    s: `Transcripts say what was spoken but not when. {{Connectionist temporal classification (CTC)}} lets the network output one symbol per frame from the alphabet plus a special {{blank}} (−), then {{collapses}} the sequence: merge repeated symbols, then delete blanks. "hh−e−ll−ll−oo" → "hello" (the blank between the two l-groups keeps the double "l"); "hhelllo" → "helo". Many frame-level paths give the same text: for T = 3 frames and the single label "a" there are 6 paths (a−−, −a−, −−a, aa−, −aa, aaa); for "ab" with T = 4 there are 15. The CTC loss sums the probabilities of all valid paths and training maximises it, using dynamic programming.`,
    r: `CTC assumes outputs are independent given the input; a language model on top fixes that.`,
    i: `Collapse "hh-e-ll-ll-oo" and count the CTC paths of length 3 that spell "a".`,
    c: py`
import itertools

def collapse(path):
    out, prev = [], None
    for c in path:
        if c != prev and c != "-":
            out.append(c)
        prev = c
    return "".join(out)

print(collapse("hh-e-ll-ll-oo"), collapse("hhelllo"))
print(sum(collapse(p) == "a" for p in itertools.product("a-", repeat=3)))
print(sum(collapse(p) == "ab" for p in itertools.product("ab-", repeat=4)))`,
    v: rowflow("Collapsing a CTC path.", ["h h − e − l l − l l − o o", "merge repeats", "h − e − l − l − o", "remove blanks", "hello"], [
      "One symbol per frame.",
      "Repeated neighbours join.",
      "The blank kept the two l-groups apart.",
      "Delete the blank symbols.",
      "The final transcript.",
    ]),
  },
  {
    t: "Attention encoder–decoder and transducers",
    lv: 2,
    s: `Two other end-to-end designs avoid CTC's independence assumption. {{Attention encoder–decoder}} (Listen, Attend and Spell; the transformer ASR family): the encoder maps audio to hidden vectors, the decoder emits text token by token, attending to the encoder at each step and conditioning on its own previous tokens — like machine translation, from sound to text. It is accurate but needs the whole utterance, so it is awkward for live captions. The {{RNN-Transducer (RNN-T)}} adds a prediction network over previous tokens and a joint network, emitting tokens as audio arrives — the common choice for streaming on devices.`,
    r: `Streaming needs a small look-ahead (a few hundred ms) trading accuracy for latency.`,
    i: `Why is an RNN-T better suited to live captions than an attention encoder–decoder?`,
    c: py`
latency = {"CTC (streaming encoder)": 0.2, "RNN-T": 0.3, "attention enc-dec (offline)": 2.5}
for k, v in latency.items():
    print(f"{k:30s} ~{v} s after the speaker finishes a word")`,
    v: compare("End-to-end ASR families.", ["Streaming?", "Notes"], [
      ["CTC", "yes", "simple, independent outputs"],
      ["RNN-Transducer", "yes", "outputs depend on previous tokens"],
      ["Attention encoder–decoder", "hard", "very accurate, offline"],
    ]),
  },
  {
    t: "Decoding with a language model",
    lv: 2,
    s: `A network gives per-step probabilities; {{decoding}} turns them into text. {{Greedy}} decoding takes the best symbol at each step and collapses. {{Beam search}} keeps the B best partial transcripts and, with {{shallow fusion}}, adds a weighted language-model score: score = log P_acoustic + λ log P_LM + β·length. The language model fixes homophones and rare words ("wreck a nice beach"); λ ≈ 0.3–0.7 and a length bonus β stop it from preferring short outputs. Domain vocabulary (names, product terms) is added with custom language models or hot-word boosting.`,
    r: `Tune λ and β on a development set from the target domain, not on the test set.`,
    i: `Compute the fused score for log P_ac = −4.0, log P_LM = −6.0, λ = 0.5 and 2 words with β = 1.`,
    c: py`
lam, beta = 0.5, 1.0
cands = {"recognise speech": (-4.0, -6.0, 2), "wreck a nice beach": (-3.8, -12.0, 4)}
for text, (ac, lm, n) in cands.items():
    print(f"{text:20s}", ac + lam * lm + beta * n)`,
    v: plot("Fused score of a 2-word hypothesis as the LM weight λ grows (log P_ac = −4, log P_LM = −6).", {
      x: [0, 1.5], y: [-14, 0], labels: ["LM weight λ", "fused score"],
      params: [par("b", "length bonus β (per word)", 0, 2, 0.5, 1)],
      readout: ["λ = 0.5: −4 + 0.5·(−6) + {b}·2 = {-4-3+2*b:1}"],
      steps: [["β = 1: the bonus offsets part of the LM penalty: −5.", { b: 1 }], ["β = 0: no length bonus, score −7 at λ = 0.5.", { b: 0 }]],
    }, [curve("-4+x*(-6)+2*b", { c: "accent" })]),
  },
  {
    t: "Large multilingual models such as Whisper",
    lv: 1,
    s: `Whisper-style models are transformers trained on hundreds of thousands of hours of weakly labelled web audio in about a hundred languages. The encoder reads a 30-second log-mel spectrogram (80 × 3,000 frames); the decoder produces tokens conditioned on special task tokens — language, transcribe or translate, timestamps. Strengths: robust to accents and noise with no fine-tuning, punctuation and casing included, one model for many languages. Weaknesses: can hallucinate fluent text on silence or music, slower than small streaming models, limited vocabulary control. Always check on your own audio and add a VAD in front.`,
    r: `Chunking long audio into 30 s windows needs overlap handling or timestamps will drift.`,
    i: `How many mel frames does 30 s of audio give at a 10 ms hop?`,
    c: py`
print(30 * 100, (80, 30 * 100))
chunks = [(s, min(s + 30, 100)) for s in range(0, 100, 30)]
print(chunks)`,
    v: compare("Small streaming model versus a large offline model.", ["Streaming on-device", "Large offline (Whisper-style)"], [
      ["Latency", "≈ 0.3 s", "seconds"],
      ["Languages", "usually one", "about 100"],
      ["Robustness", "tuned to its domain", "broad"],
      ["Risk", "limited accuracy", "hallucination on silence"],
    ]),
  },
  {
    t: "Keyword spotting and wake words",
    lv: 1,
    s: `A wake word ("hey assistant") must be detected continuously, on a battery, with almost no false alarms. A tiny network (20–500 KB, a few million operations per frame) listens to log-mel features of a sliding one-second window and outputs P(keyword). Two numbers matter: {{false rejects}} (the user spoke and nothing happened) and {{false accepts}} (it woke up on the TV). One false accept per 24 hours of audio is a typical requirement. Triggering lets a bigger recogniser start only when needed — privacy and power savings. Train with many speakers, accents and noise, and with lots of hard negatives (similar-sounding words).`,
    r: `Report the false-accept rate per hour at a fixed false-reject rate, not accuracy.`,
    i: `If a detector gives 5 false accepts in 100 hours of background audio, what is its rate per day?`,
    c: py`
fa, hours = 5, 100
print(fa / hours * 24, "false accepts per 24 h")
window, hop = 1.0, 0.1
print(int((60 - window) / hop) + 1, "windows per minute")`,
    v: compare("Metrics for a wake-word system.", ["Meaning", "Target"], [
      ["False reject rate", "user speaks, no response", "below 5–10%"],
      ["False accepts per hour", "wakes up by mistake", "about 1 per day or less"],
      ["Latency", "delay after the word ends", "under ≈ 300 ms"],
      ["Footprint", "memory and compute", "tens to hundreds of KB"],
    ]),
  },
];

/* ------------------------------------------------------------------ */
export const tts: ConceptDef[] = [
  {
    t: "Text-to-speech: the pipeline",
    lv: 1,
    s: `A TTS system converts text into a waveform in stages: {{text analysis}} (normalise "Dr. Smith paid $5" into words, convert to phonemes, mark stress and phrase breaks), an {{acoustic model}} that predicts a mel spectrogram (and pitch, duration) from the phoneme sequence, and a {{vocoder}} that turns the spectrogram into audio samples. Older systems concatenated recorded units (concatenative) or generated parameters with HMMs (parametric); modern ones are neural end to end (Tacotron, FastSpeech, VITS) and sound nearly human.`,
    r: `The hardest part in practice is not the neural network but the text front end: numbers, abbreviations, names and foreign words.`,
    i: `Name the three stages of a neural TTS system.`,
    c: py`
text = "Dr. Smith paid $5 on 3/4"
normalised = "Doctor Smith paid five dollars on March fourth"
phonemes = "D AA1 K T ER0   S M IH1 TH ..."
print(text, "->", normalised)
print(len(normalised.split()), "words")`,
    v: rowflow("A neural TTS pipeline.", ["Text", "Normalise + phonemes", "Acoustic model", "Mel spectrogram", "Vocoder", "Waveform"], [
      "The sentence to speak.",
      "Expand numbers and abbreviations, map to phonemes.",
      "Predict spectrogram, pitch and duration.",
      "Time–frequency picture of the speech.",
      "Convert the spectrogram into samples.",
      "The audio.",
    ]),
  },
  {
    t: "Text normalisation and phonemes",
    lv: 1,
    s: `Written text is ambiguous when read aloud. "1984" is a year (nineteen eighty-four) or a quantity (one thousand nine hundred eighty-four); "St." is Saint or Street; "read" has two pronunciations; "lead" too. {{Text normalisation}} expands such tokens with rules or learned models. A {{grapheme-to-phoneme}} (G2P) step then maps spellings to sounds using a pronunciation dictionary (CMUdict has ≈ 134,000 words) and a neural fallback for unknown words. English has about 40 phonemes; spelling is a poor guide ("though", "through", "tough"), so G2P is necessary even for English. Stress marks (1 = primary) carry rhythm.`,
    r: `Maintain a custom lexicon for brand and person names; mispronounced names are the commonest user complaint.`,
    i: `Give two reasons "1984" cannot be spoken without context.`,
    c: py`
lexicon = {"cat": "K AE1 T", "read": ["R EH1 D", "R IY1 D"], "though": "DH OW1", "tough": "T AH1 F"}
for w, p in lexicon.items():
    print(f"{w:8s} {p}")
print(sum(isinstance(v, list) for v in lexicon.values()), "ambiguous word(s)")`,
    v: compare("Tokens that need normalisation.", ["Reading 1", "Reading 2"], [
      ["1984", "nineteen eighty-four (year)", "one thousand nine hundred eighty-four"],
      ["St.", "Saint", "Street"],
      ["read", "reed (present)", "red (past)"],
      ["Dr.", "Doctor", "Drive"],
    ]),
  },
  {
    t: "Acoustic models: Tacotron and FastSpeech",
    lv: 2,
    s: `{{Tacotron}} is an attention-based encoder–decoder: phonemes in, mel frames out, one step at a time, with attention learning the alignment. It sounds natural but can skip or repeat words and is slow. {{FastSpeech}} removes attention: a {{duration predictor}} says how many frames each phoneme lasts, the phoneme representations are repeated accordingly (a "length regulator") and all mel frames are generated in parallel. For phonemes with durations (3, 5, 2) frames the output has 3 + 5 + 2 = 10 frames. Predicted pitch and energy are added for prosody; changing durations speeds the voice up or down without changing its pitch.`,
    r: `Non-autoregressive models are robust (no skipped words) and fast enough for real-time synthesis on a CPU.`,
    i: `Expand the phoneme sequence A, B, C with durations (3, 5, 2) frames.`,
    c: py`
import numpy as np

phonemes = ["A", "B", "C"]
durations = [3, 5, 2]
expanded = np.repeat(phonemes, durations)
print(expanded.tolist(), len(expanded))
print(len(np.repeat(phonemes, [int(round(d * 1.5)) for d in durations])))`,
    v: cells("The length regulator copies each phoneme for its duration.", [P("phonemes", ["A", "B", "C"]), P("durations (frames)", ["3", "5", "2"]), P("expanded", ["A A A", "B B B B B", "C C"])], [
      ["Each phoneme vector is repeated duration times."],
      ["3 + 5 + 2 = 10 mel frames are generated in parallel.", [[2, 0, 2]]],
    ]),
  },
  {
    t: "Vocoders: from spectrogram to waveform",
    lv: 2,
    s: `A mel spectrogram has magnitudes but no phase, and has only 80 numbers per 10 ms while the waveform needs 160 samples at 16 kHz. A {{vocoder}} fills in the missing detail. {{Griffin–Lim}} estimates phase iteratively — fast but buzzy. {{WaveNet}} generates one sample at a time conditioned on the spectrogram — superb quality, painfully slow (16,000 steps per second of audio). {{GAN vocoders}} (HiFi-GAN) generate the whole waveform in parallel with a generator trained against discriminators — near-WaveNet quality at hundreds of times real time. Rate check: 1 s of 22.05 kHz audio is 22,050 samples from only 86 mel frames, so the vocoder upsamples about 256× in time.`,
    r: `A mismatch between the acoustic model's spectrograms and the vocoder's training data causes artefacts: train or fine-tune them together.`,
    i: `By what factor does a vocoder upsample time if it turns 86 mel frames into 22,050 samples?`,
    c: py`
fs, hop = 22050, 256
frames = fs // hop
print(frames, frames * hop, hop)
for name, steps in {"WaveNet (autoregressive)": fs, "HiFi-GAN (parallel)": 1}.items():
    print(f"{name:26s} sequential steps per second: {steps}")`,
    v: compare("Vocoder families.", ["Speed", "Quality"], [
      ["Griffin–Lim", "fast", "buzzy, artefacts"],
      ["WaveNet", "very slow (sample by sample)", "excellent"],
      ["GAN (HiFi-GAN)", "very fast (parallel)", "near-WaveNet"],
      ["Diffusion vocoders", "medium", "excellent"],
    ]),
  },
  {
    t: "Prosody, expressiveness and voice cloning",
    lv: 2,
    s: `{{Prosody}} — pitch contour, rhythm, loudness, pauses — carries emphasis, questions and emotion. Flat prosody sounds robotic. Models add controls: speaker embeddings (voice identity), style tokens, reference audio, or explicit pitch and duration. {{Zero-shot voice cloning}} conditions on a few seconds of a target speaker's audio and generates new text in that voice. It enables accessibility tools (restoring a patient's voice) and creative uses, but also fraud and impersonation: use consent, watermark generated audio, and detect synthetic speech. Rising pitch at the end of a sentence turns "It works." into "It works?".`,
    r: `Clone only with documented consent; disclose synthetic voices in public-facing products.`,
    i: `Name two risks of voice cloning and one safeguard.`,
    c: py`
import numpy as np

t = np.linspace(0, 1, 5)
statement = 120 - 20 * t
question = 120 + 40 * t
print(statement.round(0).tolist(), question.round(0).tolist())`,
    v: plot("Pitch contours: a statement falls, a question rises at the end.", {
      x: [0, 1], y: [80, 180], labels: ["time through the sentence", "pitch f₀ (Hz)"],
    }, [curve("120-20*x", { c: "info", label: "statement" }), curve("120+40*x*x", { c: "warn", label: "question" })]),
  },
  {
    t: "Evaluating synthetic speech",
    lv: 1,
    s: `No formula says whether speech sounds good. The standard is the {{Mean Opinion Score (MOS)}}: listeners rate naturalness from 1 (bad) to 5 (excellent) and the ratings are averaged, with a confidence interval. Ratings 4, 5, 4, 3, 5 give MOS = 4.2. Good TTS reaches 4.3–4.6, recorded human speech about 4.5–4.7. Other checks: intelligibility (have listeners or an ASR system transcribe the output and compute WER), speaker similarity (cosine of speaker embeddings), and objective measures such as mel-cepstral distortion. Use enough listeners and sentences: 20 × 20 ratings is a minimum for a stable comparison.`,
    r: `Automatic MOS predictors save time during development, but final decisions need human listening tests.`,
    i: `Compute the MOS of the ratings 4, 5, 4, 3, 5.`,
    c: py`
import numpy as np

r = np.array([4, 5, 4, 3, 5])
mos = r.mean()
ci = 1.96 * r.std(ddof=1) / np.sqrt(len(r))
print(float(mos), round(float(ci), 2))`,
    v: compare("Ways to evaluate TTS.", ["Measures", "Cost"], [
      ["MOS listening test", "perceived naturalness", "high (people needed)"],
      ["ASR round trip (WER)", "intelligibility", "low"],
      ["Speaker embedding cosine", "similarity to the target voice", "low"],
      ["Mel-cepstral distortion", "spectral distance to a reference", "low"],
    ]),
  },
];

/* ------------------------------------------------------------------ */
export const spk: ConceptDef[] = [
  {
    t: "Speaker recognition: identification and verification",
    lv: 1,
    s: `Voices differ because of the vocal-tract length and shape and speaking habits. {{Speaker identification}} picks who is speaking from N enrolled people (closed set; or "none of them": open set). {{Speaker verification}} answers a yes/no question: is this the person they claim to be? It compares the test utterance with an enrolment voiceprint and accepts if the similarity exceeds a threshold. The text may be fixed (a pass-phrase, text-dependent) or free (text-independent). Differences between sessions, microphones, health and emotion make this harder than it sounds.`,
    r: `Voice biometrics should be one factor among several; recordings and synthetic speech can fool a single-factor system.`,
    i: `Contrast speaker identification and verification.`,
    c: py`
import numpy as np

enrolled = {"ann": np.array([1.0, 0.1]), "bob": np.array([0.1, 1.0])}
test = np.array([0.9, 0.2])
cos = lambda a, b: float(a @ b / (np.linalg.norm(a) * np.linalg.norm(b)))
scores = {k: round(cos(v, test), 3) for k, v in enrolled.items()}
print(scores, max(scores, key=scores.get))`,
    v: compare("Two speaker tasks.", ["Question", "Output"], [
      ["Identification", "who among N is speaking?", "a name (or 'unknown')"],
      ["Verification", "is this really Ann?", "accept or reject"],
    ]),
  },
  {
    t: "Speaker embeddings: i-vectors and x-vectors",
    lv: 2,
    s: `To compare voices we need a fixed-size summary of an utterance of any length. The classic {{i-vector}} is derived from GMM statistics. The modern {{x-vector}} is the output of a deep network trained to classify thousands of training speakers: frame-level layers process the features, a {{statistics pooling}} layer computes the mean and standard deviation over time (turning T frames into one vector), and later layers produce a 192–512-dimensional embedding. Two utterances are compared with {{cosine similarity}}: the same person typically scores 0.6–0.9, different people 0.0–0.3. Newer ECAPA-TDNN and ResNet models improve this further.`,
    r: `Embeddings also carry information about accent, gender and emotion: treat them as personal data.`,
    i: `What does statistics pooling do and why is it needed?`,
    c: py`
import numpy as np

rng = np.random.default_rng(0)
frames = rng.normal(size=(120, 8))
pooled = np.concatenate([frames.mean(axis=0), frames.std(axis=0)])
print(frames.shape, pooled.shape)
a, b = np.array([0.9, 0.3, 0.1]), np.array([0.8, 0.4, 0.2])
print(round(float(a @ b / np.linalg.norm(a) / np.linalg.norm(b)), 3))`,
    v: rowflow("An x-vector extractor.", ["Frames of features", "Frame-level layers", "Statistics pooling (mean + std)", "Segment layers", "Speaker embedding"], [
      "T × 80 log-mel features.",
      "Convolutions over a few frames of context.",
      "T frames become one vector.",
      "Dense layers.",
      "A 192–512 number voiceprint.",
    ]),
  },
  {
    t: "Verification scores, thresholds and EER",
    lv: 2,
    s: `A verification system outputs a similarity; the threshold decides the trade-off between two errors: {{false rejection}} (genuine user refused) and {{false acceptance}} (impostor accepted). Raising the threshold lowers false acceptance and raises false rejection. The {{equal error rate (EER)}} is the operating point where both are equal — a single summary number (lower is better; state-of-the-art systems reach 1% or less on benchmarks). Example: genuine scores (0.8, 0.7, 0.9, 0.6) and impostor scores (0.2, 0.4, 0.65, 0.1): at threshold 0.62 the false-rejection rate is 1/4 (0.6 rejected) and false acceptance 1/4 (0.65 accepted): EER ≈ 25% for this toy data.`,
    r: `Pick the deployment threshold from the cost of each error, not from the EER point.`,
    i: `Compute the false-reject and false-accept rates at threshold 0.62 for the scores above.`,
    c: py`
import numpy as np

genuine = np.array([0.8, 0.7, 0.9, 0.6])
impostor = np.array([0.2, 0.4, 0.65, 0.1])
for th in (0.3, 0.5, 0.62, 0.75):
    print(th, float((genuine < th).mean()), float((impostor >= th).mean()))`,
    v: plot("False-reject and false-accept rates against the threshold (toy scores).", {
      x: [0, 1], y: [0, 1.05], labels: ["threshold", "error rate"],
      params: [par("t", "threshold", 0.1, 0.95, 0.01, 0.62)],
      readout: ["threshold {t}: false-reject = {step(t-0.6)+step(t-0.7)+step(t-0.8)+step(t-0.9)}/4"],
    }, [vline("t", { c: "muted" }), curve("(step(x-0.6)+step(x-0.7)+step(x-0.8)+step(x-0.9))/4", { c: "bad", label: "false reject" })]),
  },
  {
    t: "Diarization: who spoke when",
    lv: 2,
    s: `In a meeting recording we want labelled segments: "Speaker A 0:00–0:12, B 0:12–0:20 …". {{Diarization}} typically (1) finds speech with VAD, (2) cuts it into short windows (1–2 s), (3) computes a speaker embedding for each, (4) {{clusters}} the embeddings (agglomerative or spectral clustering) so each cluster is one speaker, (5) smooths the labels over time. Overlapped speech and short turns are the hardest cases; end-to-end neural diarization handles overlaps directly. It is scored by the {{diarization error rate}}: missed speech + false alarm + speaker confusion, divided by the total speech time. With 100 s of speech and 4 s missed, 2 s false alarm, 6 s confused: DER = 12%.`,
    r: `Combine diarization with ASR to produce speaker-attributed transcripts (minutes of a meeting).`,
    i: `Compute the DER for 100 s of speech with 4 s missed, 2 s false alarm and 6 s confusion.`,
    c: py`
import numpy as np

emb = np.array([[1.0, 0.1], [0.9, 0.2], [0.1, 1.0], [0.2, 0.9], [0.95, 0.15]])
labels = np.array([0 if e[0] > e[1] else 1 for e in emb])
print(labels.tolist())
print((4 + 2 + 6) / 100)`,
    v: cells("Window-level speaker labels from clustering embeddings.", [P("time (s)", ["0–2", "2–4", "4–6", "6–8", "8–10"]), P("speaker", ["A", "A", "B", "B", "A"])], [
      ["Each window gets an embedding and is assigned to a cluster."],
      ["Windows 1–2: speaker A.", [[1, 0, 1]]],
      ["Windows 3–4: speaker B; then A speaks again.", [[1, 2, 3], [1, 4, 4]]],
    ]),
  },
  {
    t: "Emotion, language and paralinguistics",
    lv: 1,
    s: `Speech carries more than words: emotion, health, age, accent, language. {{Speech emotion recognition}} predicts categories (anger, joy, sadness, neutral) or dimensions (arousal: calm → excited; valence: negative → positive) from prosody and spectral features; arousal is recognised far more reliably from audio than valence. {{Language identification}} decides which language is spoken within a second or two. Typical cues: higher pitch and louder speech for high arousal. Caveats: emotion labels are subjective (annotators agree only moderately), acted corpora differ from natural speech, and recognising emotion raises ethical questions — be transparent about its use and limits.`,
    r: `Do not use emotion predictions for high-stakes decisions about people.`,
    i: `Which emotional dimension is easiest to recognise from audio and why?`,
    c: py`
import numpy as np

calm = np.array([110, 112, 109, 111.0])
excited = np.array([160, 190, 150, 200.0])
print(round(float(calm.mean()), 1), round(float(calm.std()), 1), round(float(excited.mean()), 1), round(float(excited.std()), 1))`,
    v: compare("Cues for arousal in speech.", ["Calm", "Excited"], [
      ["Mean pitch", "lower", "higher"],
      ["Pitch variation", "small", "large"],
      ["Loudness", "soft", "loud"],
      ["Speaking rate", "slower", "faster"],
    ]),
  },
];

/* ------------------------------------------------------------------ */
export const enh: ConceptDef[] = [
  {
    t: "Noise and speech enhancement",
    lv: 1,
    s: `Real speech arrives with noise (traffic, fans, other talkers) and {{reverberation}} (echoes from the room). {{Speech enhancement}} improves quality and intelligibility, for calls, hearing aids and as a front end for ASR. Quality is measured by SNR improvement and perceptual scores (PESQ, STOI). The classical approach works in the spectrogram: estimate the noise from non-speech frames and subtract it ({{spectral subtraction}}): with a noise estimate of 2, magnitudes (5, 3, 1) become (3, 1, max(1 − 2, 0) = 0). Negative values are floored at zero; the remaining random "musical noise" is its main artefact.`,
    r: `Enhancement for ASR can help or hurt: neural recognisers trained on noisy data sometimes do better without enhancement.`,
    i: `Apply spectral subtraction with a noise estimate of 2 to the magnitudes (5, 3, 1).`,
    c: py`
import numpy as np

mag = np.array([5.0, 3.0, 1.0])
noise = 2.0
print(np.maximum(mag - noise, 0).tolist())
rng = np.random.default_rng(0)
clean = np.sin(2 * np.pi * 200 * np.arange(800) / 8000)
noisy = clean + 0.3 * rng.standard_normal(800)
snr = 10 * np.log10(np.sum(clean ** 2) / np.sum((noisy - clean) ** 2))
print(round(float(snr), 1))`,
    v: bars("Spectral subtraction: magnitudes before and after removing a noise estimate of 2.", [["bin 1 before", "5"], ["bin 1 after", "max(5-n,0)"], ["bin 2 before", "3"], ["bin 2 after", "max(3-n,0)"], ["bin 3 before", "1"], ["bin 3 after", "max(1-n,0)"]], {
      max: 6,
      params: [par("n", "noise estimate", 0, 4, 0.5, 2)],
      readout: ["after subtraction: {max(5-n,0)}, {max(3-n,0)}, {max(1-n,0)}"],
      steps: [["Noise 2: the weakest bin is wiped out.", { n: 2 }], ["Over-subtraction (4) removes speech too.", { n: 4 }]],
    }),
  },
  {
    t: "Time–frequency masking and neural enhancement",
    lv: 2,
    s: `Instead of subtracting, estimate a {{mask}} M(t, f) between 0 and 1 and multiply the noisy spectrogram by it. The ideal ratio mask is M = |S|/(|S| + |N|): where speech dominates M ≈ 1, where noise dominates M ≈ 0. For |S| = 4, |N| = 1 the mask is 0.8; for |S| = 1, |N| = 4 it is 0.2. A neural network learns to predict M from the noisy features, trained on clean speech mixed with many noises at random SNRs. Modern models work directly on the waveform or predict complex masks, and also handle separation of overlapping talkers (the cocktail-party problem).`,
    r: `Always include real recordings in testing: models trained on synthetic mixtures can disappoint in the wild.`,
    i: `Compute the ideal ratio mask for |S| = 4 and |N| = 1.`,
    c: py`
import numpy as np

S = np.array([4.0, 1.0, 3.0])
N = np.array([1.0, 4.0, 3.0])
M = S / (S + N)
print(M.round(2).tolist(), (M * (S + N)).round(2).tolist())`,
    v: bars("Ideal ratio mask for the chosen speech and noise magnitudes.", [["mask M = S/(S+N)", "s/(s+n)"], ["noisy magnitude", "(s+n)/10"], ["masked output", "s/(s+n)*(s+n)/10"]], {
      max: 1,
      params: [par("s", "speech magnitude", 0, 9, 1, 4), par("n", "noise magnitude", 0.5, 9, 0.5, 1)],
      readout: ["M = {s}/({s}+{n}) = {s/(s+n):2}"],
      steps: [["Speech dominates: M = 0.8.", { s: 4, n: 1 }], ["Noise dominates: M = 0.2.", { s: 1, n: 4 }]],
    }),
  },
  {
    t: "Beamforming with a microphone array",
    lv: 2,
    s: `Two or more microphones give spatial information. A wave from direction θ reaches microphones d apart with a delay τ = d sin θ / c (c = 343 m/s). With d = 5 cm and θ = 30°: τ = 0.05 × 0.5 / 343 = 72.9 µs, 1.17 samples at 16 kHz. {{Delay-and-sum beamforming}} delays each channel to line up sound from the wanted direction and adds them: the target adds coherently (amplitude × M for M microphones) while noise from other directions adds incoherently (× √M), improving SNR by 10 log₁₀ M dB — about 6 dB for four microphones. Smart speakers use 4–8 microphones plus neural post-filters.`,
    r: `Spatial aliasing limits the microphone spacing: keep d below half the shortest wavelength of interest.`,
    i: `Compute the inter-microphone delay for d = 5 cm and θ = 30°, and the SNR gain of a four-microphone array.`,
    c: py`
import numpy as np

d, theta, c, fs = 0.05, np.radians(30), 343.0, 16000
tau = d * np.sin(theta) / c
print(round(tau * 1e6, 1), round(tau * fs, 2))
print(round(10 * np.log10(4), 2), round(10 * np.log10(8), 2))`,
    v: plot("Inter-microphone delay against the arrival angle (d = 5 cm).", {
      x: [0, 90], y: [0, 160], labels: ["angle θ (degrees)", "delay (µs)"],
      params: [par("a", "angle θ", 0, 90, 5, 30), par("d", "spacing d (cm)", 2, 10, 1, 5)],
      readout: ["τ = {d/100*sin(a*3.14159265/180)/343*1000000:1} µs"],
      steps: [["30°, 5 cm: 72.9 µs.", { a: 30, d: 5 }], ["Broadside (0°): no delay.", { a: 0, d: 5 }]],
    }, [curve("d/100*sin(x*3.14159265/180)/343*1000000", { c: "accent" }), pt("a", "d/100*sin(a*3.14159265/180)/343*1000000", { c: "bad" })]),
  },
  {
    t: "Echo cancellation and reverberation",
    lv: 2,
    s: `In a call the far-end voice plays from the loudspeaker and re-enters the microphone as an echo. {{Acoustic echo cancellation (AEC)}} models the loudspeaker-to-microphone path with an adaptive filter h and subtracts the predicted echo: e[n] = mic[n] − hᵀ x[n]. The filter is updated by the NLMS rule h ← h + μ e[n] x[n] / (‖x‖² + ε). Starting from h = 0 with x = (1, 0), true echo path 0.5 and μ = 1: error 0.5 at first, then h = 0.5 and the error vanishes. {{Dereverberation}} removes the room's long decay (RT60 = time for the sound to fall 60 dB); typical offices have RT60 ≈ 0.3–0.6 s.`,
    r: `Double-talk (both sides speaking) is the hard case: adaptation must pause or the filter diverges.`,
    i: `Do one NLMS update from h = 0 with x = (1, 0), microphone value 0.5, μ = 1.`,
    c: py`
import numpy as np

h = np.zeros(2)
x = np.array([1.0, 0.0])
mic = 0.5 * x[0]
e = mic - h @ x
h = h + 1.0 * e * x / (x @ x + 1e-8)
print(round(float(e), 3), h.round(3).tolist(), round(float(mic - h @ x), 6))`,
    v: rowflow("Acoustic echo cancellation.", ["Far-end signal x", "Loudspeaker → room → microphone", "Adaptive filter predicts echo", "Subtract the prediction", "Near-end speech only"], [
      "What the other person says.",
      "It leaks into the microphone.",
      "ĥ estimates the room path.",
      "Error e = mic − ĥ·x.",
      "Filter updates to shrink the error.",
    ]),
  },
];

/* ------------------------------------------------------------------ */
export const app: ConceptDef[] = [
  {
    t: "Audio compression and codecs",
    lv: 1,
    s: `Raw 16-bit, 16 kHz mono audio is 256 kbit/s (1.92 MB per minute). Codecs shrink it. Speech codecs exploit the source–filter model: transmit the filter coefficients and a few source parameters instead of samples (AMR-WB: 6.6–23 kbit/s, Opus: 6–510 kbit/s, adaptive). {{Perceptual}} codecs (MP3, AAC) drop what the ear cannot hear (masked components). {{Lossless}} codecs (FLAC) compress to about half with perfect reconstruction. For ASR training prefer uncompressed or lossless data; lossy compression changes features slightly and a model trained on clean audio may degrade on heavily compressed calls.`,
    r: `Match the codec of your training data to the deployment channel, or augment with codec simulation.`,
    i: `How many kbit/s is 16-bit mono audio at 16 kHz?`,
    c: py`
bits_per_s = 16000 * 16
print(bits_per_s / 1000, "kbit/s", bits_per_s * 60 / 8 / 1e6, "MB per minute")
for name, kbps in {"AMR-WB": 12.65, "Opus (speech)": 24, "FLAC (approx)": 128}.items():
    print(name, round(bits_per_s / 1000 / kbps, 1), "x smaller")`,
    v: bars("Bit rate (kbit/s) of the same speech.", [["raw PCM 16 kHz", "256"], ["FLAC (lossless, ≈)", "128"], ["Opus speech", "24"], ["AMR-WB", "12.65"]], {
      max: 270,
    }),
  },
  {
    t: "Privacy, consent and deepfakes",
    lv: 1,
    s: `A voice is personal data: it identifies, reveals health and emotion, and can be cloned. Good practice: obtain consent and say what is recorded and why; minimise (process on the device, discard raw audio, keep transcripts only if needed); protect storage and transmission; allow deletion; evaluate fairness across accents, ages and genders (ASR error rates differ widely between groups — measure and report them). Synthetic speech enables fraud ("vishing"); countermeasures are liveness checks, multi-factor authentication, watermarking and anti-spoofing detectors trained on current generators — and they are an arms race.`,
    r: `Treat accuracy gaps between groups as bugs to fix with data, not as acceptable noise.`,
    i: `Give two privacy-protecting design choices for a voice assistant.`,
    c: py`
wer_by_group = {"group A": 0.06, "group B": 0.11, "group C": 0.19}
worst, best = max(wer_by_group.values()), min(wer_by_group.values())
print(wer_by_group, round(worst / best, 2))`,
    v: compare("Risks and mitigations.", ["Mitigation"], [
      ["Always-on recording", "on-device wake word, indicator light, short retention"],
      ["Unequal accuracy", "evaluate and train across accents and demographics"],
      ["Voice cloning fraud", "consent, watermarking, anti-spoofing, multi-factor auth"],
      ["Data leakage", "encrypt, minimise, delete on request"],
    ]),
  },
  {
    t: "Choosing an approach for a speech project",
    lv: 1,
    s: `A decision guide. Need transcripts of recorded audio (batch) → a large pretrained model (Whisper-style), then fix domain words with prompts or a custom vocabulary. Live captions or on-device commands → a streaming RNN-T/CTC model. Few fixed commands → keyword spotting or a small classifier on log-mel features. Speech synthesis for an application → a pretrained neural TTS with a custom lexicon; voice cloning only with consent. Identify speakers → x-vector embeddings and cosine scoring. Always start from a pretrained model, measure WER (or the task metric) on your own audio, split by speaker, and inspect errors by group and by noise condition.`,
    r: `Most gains come from audio quality, microphone placement and domain data, not from a bigger architecture.`,
    i: `Recommend an approach for transcribing recorded customer calls with product names.`,
    c: py`
guide = {
    "batch transcription": "large pretrained model + custom vocabulary",
    "live captions": "streaming RNN-T or CTC",
    "voice commands (10 words)": "keyword spotting on log-mel",
    "speak text": "pretrained neural TTS + lexicon",
    "who is speaking": "x-vectors + cosine / diarization",
}
for k, v in guide.items():
    print(f"{k:26s} -> {v}")`,
    v: compare("Need → first approach.", ["First choice"], [
      ["Transcribe recordings", "large pretrained ASR"],
      ["Live captions / on-device", "streaming RNN-T or CTC"],
      ["A few fixed commands", "keyword spotting"],
      ["Speak text aloud", "neural TTS with custom lexicon"],
      ["Identify or separate speakers", "x-vectors, diarization"],
    ]),
  },
];

void [P, bars, cells, compare, curve, hline, par, plot, pt, seg, vline, table, rowflow];
