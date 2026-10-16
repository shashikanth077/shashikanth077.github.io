import { py, type DrillDef, type QuestionDef } from "../build.js";

export const questions: QuestionDef[] = [
  /* signals */
  ["sig", 1, "What do frequency and amplitude correspond to perceptually?", "Frequency to pitch, amplitude to loudness."],
  ["sig", 1, "What is the Nyquist frequency at fs = 16 kHz?", "fs/2 = 8 kHz: the highest representable frequency."],
  ["sig", 2, "A 5 kHz tone is sampled at 8 kHz. What do you see and how do you prevent it?", "It aliases to |5000 − 8000| = 3 kHz; use an analogue low-pass (anti-aliasing) filter before sampling and filter before downsampling."],
  ["sig", 1, "How many dB does doubling the amplitude add?", "20 log₁₀ 2 = 6.02 dB."],
  ["sig", 1, "SNR of 16-bit quantization for a full-scale sine?", "6.02 × 16 + 1.76 ≈ 98.1 dB."],
  ["sig", 2, "Why μ-law companding?", "It gives quiet samples finer steps: μ-law(0.1) = 0.591, μ-law(0.01) = 0.228, so 8 bits sound much better than linear 8-bit."],
  ["sig", 1, "Why split speech data by speaker?", "Otherwise test speakers appear in training and accuracy is over-estimated."],
  /* frequency analysis */
  ["freq", 2, "Compute the DFT of (1, 2, 3, 4).", "(10, −2 + 2i, −2, −2 − 2i)."],
  ["freq", 2, "Operations for the DFT versus the FFT at N = 512?", "N² = 262,144 versus about N log₂ N = 4,608."],
  ["freq", 2, "What is spectral leakage and how does windowing help?", "A tone that does not fit a whole number of cycles in the frame has edge discontinuities; a smooth window tapers the edges and cuts far leakage (3.4% → 0.02% in the example)."],
  ["freq", 1, "Frames in 1 s of 16 kHz audio with 25 ms frames and a 10 ms hop?", "1 + (16000 − 400)//160 = 98."],
  ["freq", 1, "How many bins and what spacing for a 512-point FFT at 16 kHz?", "257 bins, 31.25 Hz apart."],
  ["freq", 2, "State the time–frequency trade-off and the resolution of a 25 ms window.", "Longer windows resolve frequency finer but blur time; Δf = 1/window = 40 Hz for 25 ms."],
  ["freq", 2, "Estimate f₀ from an autocorrelation peak at lag 80 with fs = 8 kHz.", "f₀ = fs/lag = 100 Hz."],
  /* features */
  ["feat", 1, "Describe the source–filter model.", "Vocal folds (or turbulence) are the source setting pitch and voicing; the vocal tract is a filter whose formants shape vowels and consonants."],
  ["feat", 1, "Why pre-emphasis?", "Speech energy falls with frequency; y[n] = x[n] − 0.97x[n−1] boosts the highs so they are not lost."],
  ["feat", 1, "Convert 4000 Hz to mel.", "2595 log₁₀(1 + 4000/700) ≈ 2146 mel."],
  ["feat", 2, "Why mel filters narrow at low frequencies and wide at high ones?", "The mel scale is ≈ linear below 1 kHz and logarithmic above, matching the ear's critical bands."],
  ["feat", 2, "What shape is a log-mel matrix of 1 s with 80 bands and a 10 ms hop?", "About 98 × 80."],
  ["feat", 2, "What do the MFCC coefficients represent?", "DCT of the log-mel energies: c₀ overall energy, low coefficients the smooth envelope (filter), high ones fine detail like pitch, which is dropped."],
  ["feat", 1, "Delta at the middle frame of 1, 2, 4? Normalise 3, 5, 7.", "Δ = (4 − 1)/2 = 1.5; CMVN gives (−1.22, 0, 1.22)."],
  /* ASR */
  ["asr", 1, "Write the Bayes decomposition of ASR.", "Ŵ = argmax P(X | W) P(W): acoustic model times language model."],
  ["asr", 1, "WER for reference 'the cat sat on the mat' and hypothesis 'the cat sit on mat'?", "One substitution + one deletion over 6 words = 33.3%."],
  ["asr", 2, "Expected duration of an HMM state with self-loop 0.8 and 10 ms frames?", "1/(1 − 0.8) = 5 frames = 50 ms."],
  ["asr", 2, "Collapse the CTC path 'hh-e-ll-ll-oo'.", "hello (merge repeats, then delete blanks)."],
  ["asr", 2, "CTC paths of length 3 spelling 'a'?", "6: a−−, −a−, −−a, aa−, −aa, aaa."],
  ["asr", 2, "CTC versus attention encoder–decoder versus RNN-T?", "CTC: independent frame outputs, streaming; attention enc–dec: accurate but offline; RNN-T: conditions on previous tokens and streams."],
  ["asr", 2, "What is shallow fusion?", "Adding a weighted language-model log-probability (and a length bonus) to the acoustic score during beam search."],
  ["asr", 1, "How do you measure a wake-word detector?", "False accepts per hour at a fixed false-reject rate, latency and footprint."],
  /* TTS */
  ["tts", 1, "Name the stages of neural TTS.", "Text analysis (normalisation, phonemes), acoustic model (mel spectrogram), vocoder (waveform)."],
  ["tts", 1, "Why is text normalisation needed? Give an example.", "Written text is ambiguous when spoken: '1984' (year or quantity), 'St.' (Saint or Street), 'read' (two pronunciations)."],
  ["tts", 2, "Expand phonemes A, B, C with durations (3, 5, 2).", "AAA BBBBB CC: 10 mel frames."],
  ["tts", 2, "Compare Griffin–Lim, WaveNet and GAN vocoders.", "Griffin–Lim fast but buzzy; WaveNet excellent but sample-by-sample slow; GAN vocoders fast in parallel with near-WaveNet quality."],
  ["tts", 1, "MOS of ratings 4, 5, 4, 3, 5?", "4.2."],
  /* speaker */
  ["spk", 1, "Identification versus verification?", "Identification chooses who among enrolled speakers; verification decides whether the claimed identity is true."],
  ["spk", 2, "What does statistics pooling do?", "Computes the mean and standard deviation over time, turning a variable-length frame sequence into one fixed-size vector."],
  ["spk", 2, "Define EER.", "The operating point where false-accept and false-reject rates are equal."],
  ["spk", 2, "DER for 100 s of speech with 4 s missed, 2 s false alarm, 6 s confusion?", "12%."],
  ["spk", 1, "Why is arousal easier than valence to recognise from audio?", "Arousal changes pitch, loudness and rate in measurable ways; valence is carried more by words and context."],
  /* enhancement */
  ["enh", 2, "Spectral subtraction with noise 2 on magnitudes (5, 3, 1)?", "(3, 1, 0): negative results are floored at zero."],
  ["enh", 2, "Ideal ratio mask for |S| = 4, |N| = 1?", "4/(4 + 1) = 0.8."],
  ["enh", 2, "Delay between two microphones 5 cm apart for a source at 30°?", "0.05 × sin 30°/343 = 72.9 µs (1.17 samples at 16 kHz)."],
  ["enh", 2, "SNR gain of a delay-and-sum array of 4 microphones?", "10 log₁₀ 4 ≈ 6 dB."],
  ["enh", 2, "State the NLMS update used in echo cancellation.", "h ← h + μ e x /(‖x‖² + ε) with e = mic − hᵀx."],
  /* apps */
  ["app", 1, "Bit rate of 16-bit mono audio at 16 kHz?", "256 kbit/s (1.92 MB per minute)."],
  ["app", 2, "Two privacy-protecting choices for a voice assistant?", "On-device wake-word detection and short retention of raw audio; consent, minimisation and deletion on request."],
  ["app", 1, "Recommend an approach for transcribing customer calls that mention product names.", "A large pretrained ASR model with a custom vocabulary or prompt; evaluate WER on your own audio with speaker-disjoint splits."],
];

export const drills: DrillDef[] = [
  {
    t: "Decibels",
    q: "What does this print?",
    code: py`
import numpy as np
print(round(20 * np.log10(2), 2), round(20 * np.log10(0.1), 1))`,
    opts: [["6.02 -20.0", true, "Doubling adds 6 dB; a tenth is −20 dB."], ["3.01 -10.0", false, "That is 10 log₁₀ — the power formula, not amplitude."], ["6.02 20.0", false, "A smaller amplitude is negative in dB."]],
    path: ["20 log₁₀ 2 = 6.02.", "20 log₁₀ 0.1 = −20."],
    why: "Amplitude ratios use 20 log₁₀.",
    watch: "Power ratios use 10 log₁₀.",
    remember: "×2 → +6 dB, ×10 → +20 dB.",
  },
  {
    t: "Aliasing",
    q: "What does this print?",
    code: py`
fs, f = 8000, 5000
print(abs(f - fs))`,
    opts: [["3000", true, "5 kHz folds around fs to 3 kHz."], ["5000", false, "Above Nyquist (4 kHz) it cannot appear at 5 kHz."], ["13000", false, "Aliasing subtracts multiples of fs."]],
    path: ["Nyquist = 4000 Hz < 5000 Hz.", "Apparent frequency = |5000 − 8000| = 3000."],
    why: "Frequencies above fs/2 fold back.",
    watch: "Filter before sampling.",
    remember: "f_alias = |f − k·fs|.",
  },
  {
    t: "Quantization SNR",
    q: "What does this print?",
    code: py`
print(round(6.02 * 16 + 1.76, 1), round(6.02 * 8 + 1.76, 1))`,
    opts: [["98.1 49.9", true, "6.02 dB per bit plus 1.76."], ["96.0 48.0", false, "Do not forget the 1.76 dB term."], ["16.0 8.0", false, "SNR is in dB, not bits."]],
    path: ["16 bits: 96.32 + 1.76 = 98.08.", "8 bits: 48.16 + 1.76 = 49.92."],
    why: "Each bit doubles the number of levels: +6 dB.",
    watch: "The formula assumes a full-scale sine.",
    remember: "SNR ≈ 6.02b + 1.76 dB.",
  },
  {
    t: "Frames per second",
    q: "What does this print?",
    code: py`
fs, frame, hop = 16000, 400, 160
print(1 + (fs - frame) // hop)`,
    opts: [["98", true, "Floor((16000 − 400)/160) + 1."], ["100", false, "The last frames do not fit a full window."], ["40", false, "That would be a 25 ms hop."]],
    path: ["16000 − 400 = 15600.", "15600 // 160 = 97.", "+ 1 = 98."],
    why: "Only whole frames count.",
    watch: "Padding the signal changes the count.",
    remember: "n = 1 + (N − frame)//hop.",
  },
  {
    t: "Mel scale",
    q: "What does this print?",
    code: py`
import numpy as np
print(round(2595 * np.log10(1 + 4000 / 700), 1))`,
    opts: [["2146.1", true, "The scale compresses high frequencies."], ["4000.0", false, "The mel value is not the Hz value."], ["1000.0", false, "That is the mel value of 1000 Hz."]],
    path: ["1 + 4000/700 = 6.714.", "log₁₀ = 0.827.", "× 2595 = 2146."],
    why: "Mel is roughly logarithmic above 1 kHz.",
    watch: "Use log base 10 in this formula.",
    remember: "mel = 2595 log₁₀(1 + f/700).",
  },
  {
    t: "DFT magnitude",
    q: "What does this print?",
    code: py`
import numpy as np
X = np.fft.fft([1, 2, 3, 4])
print(round(float(abs(X[1])), 2), float(X[0].real))`,
    opts: [["2.83 10.0", true, "|−2 + 2i| = 2.83 and X[0] is the sum."], ["2.0 10.0", false, "Take the magnitude of the complex number."], ["2.83 2.5", false, "X[0] is the sum, not the mean."]],
    path: ["X[0] = 1 + 2 + 3 + 4 = 10.", "X[1] = −2 + 2i, magnitude √8 = 2.83."],
    why: "The DFT sums samples times complex exponentials.",
    watch: "np.fft.fft returns complex numbers.",
    remember: "X[0] = Σx.",
  },
  {
    t: "Word error rate",
    q: "What does this print?",
    code: py`
ref, hyp = "the cat sat on the mat".split(), "the cat sit on mat".split()
D = [[i + j if i * j == 0 else 0 for j in range(len(hyp) + 1)] for i in range(len(ref) + 1)]
for i in range(1, len(ref) + 1):
    for j in range(1, len(hyp) + 1):
        D[i][j] = min(D[i - 1][j] + 1, D[i][j - 1] + 1, D[i - 1][j - 1] + (ref[i - 1] != hyp[j - 1]))
print(D[-1][-1], round(D[-1][-1] / len(ref), 3))`,
    opts: [["2 0.333", true, "One substitution and one deletion over six words."], ["1 0.167", false, "A word was also dropped."], ["2 0.4", false, "Divide by the reference length, 6."]],
    path: ["sat → sit: substitution.", "second 'the' missing: deletion.", "WER = 2/6."],
    why: "WER is the normalised edit distance on words.",
    watch: "Normalise punctuation and case first.",
    remember: "WER = (S + D + I)/N.",
  },
  {
    t: "CTC collapse",
    q: "What does this print?",
    code: py`
def collapse(p):
    out, prev = [], None
    for c in p:
        if c != prev and c != "-":
            out.append(c)
        prev = c
    return "".join(out)
print(collapse("hh-e-ll-ll-oo"), collapse("hhelllo"))`,
    opts: [["hello helo", true, "The blank separates repeated letters."], ["hello hello", false, "Without a blank the l's merge: 'helo'."], ["hheellllloo helo", false, "Repeats are merged before blanks are removed."]],
    path: ["hh→h, e, ll→l, blank, ll→l, oo→o → hello.", "hhelllo → h e l o (the l-run merges)."],
    why: "Merge repeats first, then delete blanks.",
    watch: "Double letters need a blank between them.",
    remember: "merge repeats, drop blanks.",
  },
  {
    t: "Pitch from lag",
    q: "What does this print?",
    code: py`
fs, lag = 8000, 80
print(fs / lag)`,
    opts: [["100.0", true, "f₀ = fs / period in samples."], ["640000.0", false, "Divide, do not multiply."], ["10.0", false, "8000/80 = 100."]],
    path: ["Period = 80 samples = 10 ms.", "f₀ = 1/0.01 s = 100 Hz."],
    why: "Pitch is the inverse of the period.",
    watch: "Restrict the lag search range.",
    remember: "f₀ = fs/lag.",
  },
  {
    t: "Ideal ratio mask",
    q: "What does this print?",
    code: py`
S, N = 4.0, 1.0
print(S / (S + N), 1.0 / (1.0 + 4.0))`,
    opts: [["0.8 0.2", true, "Speech-dominated bins pass, noise-dominated bins are attenuated."], ["4.0 0.25", false, "That is S/N, not the mask."], ["0.2 0.8", false, "These are swapped."]],
    path: ["4/(4 + 1) = 0.8.", "1/(1 + 4) = 0.2."],
    why: "The mask is the speech share of the energy.",
    watch: "Masks lie between 0 and 1.",
    remember: "M = |S|/(|S| + |N|).",
  },
  {
    t: "Microphone delay",
    q: "What does this print?",
    code: py`
import numpy as np
print(round(0.05 * np.sin(np.radians(30)) / 343 * 1e6, 1))`,
    opts: [["72.9", true, "Delay in microseconds."], ["0.0729", false, "That is in milliseconds."], ["145.8", false, "Use sin 30° = 0.5, not 1."]],
    path: ["d sin θ = 0.05 × 0.5 = 0.025 m.", "/ 343 m/s = 72.9 µs."],
    why: "Path difference over the speed of sound.",
    watch: "Check units: metres and microseconds.",
    remember: "τ = d sin θ / c.",
  },
  {
    t: "Diarization error rate",
    q: "What does this print?",
    code: py`
missed, false_alarm, confusion, total = 4, 2, 6, 100
print((missed + false_alarm + confusion) / total)`,
    opts: [["0.12", true, "12 s of error in 100 s of speech."], ["0.06", false, "All three error types count."], ["0.1", false, "Do not drop the false-alarm time."]],
    path: ["4 + 2 + 6 = 12.", "12/100 = 0.12."],
    why: "DER sums missed, false-alarm and confusion time.",
    watch: "The denominator is total speech time.",
    remember: "DER = (miss + FA + confusion)/speech.",
  },
];

export const codeLab: [string, string, string][] = [
  ["Generate and analyse a tone", "Create a 440 Hz tone and find its frequency with the FFT.", py`
import numpy as np

fs = 8000
t = np.arange(fs) / fs
x = np.sin(2 * np.pi * 440 * t)
X = np.abs(np.fft.rfft(x))
print(float(np.fft.rfftfreq(len(x), 1 / fs)[X.argmax()]))`],
  ["A log-mel spectrogram from scratch", "Frame, window, FFT and apply a mel filterbank.", py`
import numpy as np

fs, nfft, n_mels = 16000, 512, 20
t = np.arange(fs) / fs
x = np.sin(2 * np.pi * 1000 * t)
frame, hop = 400, 160
n = 1 + (len(x) - frame) // hop
S = np.abs(np.stack([np.fft.rfft(x[i * hop:i * hop + frame] * np.hamming(frame), nfft) for i in range(n)])) ** 2
mel = lambda f: 2595 * np.log10(1 + f / 700)
inv = lambda m: 700 * (10 ** (m / 2595) - 1)
edges = inv(np.linspace(mel(0), mel(fs / 2), n_mels + 2))
bins = np.floor((nfft + 1) * edges / fs).astype(int)
fb = np.zeros((n_mels, nfft // 2 + 1))
for m in range(1, n_mels + 1):
    for k in range(bins[m - 1], bins[m]):
        fb[m - 1, k] = (k - bins[m - 1]) / max(bins[m] - bins[m - 1], 1)
    for k in range(bins[m], bins[m + 1]):
        fb[m - 1, k] = (bins[m + 1] - k) / max(bins[m + 1] - bins[m], 1)
logmel = np.log(S @ fb.T + 1e-10)
print(logmel.shape, int(logmel[0].argmax()))`],
  ["Pitch tracker", "Estimate the pitch of a 150 Hz tone by autocorrelation.", py`
import numpy as np

fs = 8000
t = np.arange(800) / fs
x = np.sin(2 * np.pi * 150 * t)
ac = np.correlate(x, x, "full")[len(x) - 1:]
lo, hi = fs // 400, fs // 60
lag = int(np.argmax(ac[lo:hi])) + lo
print(lag, round(fs / lag, 1))`],
  ["Word error rate", "Compute the WER of two transcripts.", py`
def wer(ref, hyp):
    r, h = ref.split(), hyp.split()
    D = [[i + j if i * j == 0 else 0 for j in range(len(h) + 1)] for i in range(len(r) + 1)]
    for i in range(1, len(r) + 1):
        for j in range(1, len(h) + 1):
            D[i][j] = min(D[i - 1][j] + 1, D[i][j - 1] + 1, D[i - 1][j - 1] + (r[i - 1] != h[j - 1]))
    return D[-1][-1] / len(r)

print(round(wer("turn the lights off in the kitchen", "turn lights of in the kitchen"), 3))`],
  ["Greedy CTC decoding", "Decode per-frame probabilities into text.", py`
import numpy as np

alphabet = ["-", "c", "a", "t"]
probs = np.array([[0.1, 0.8, 0.05, 0.05], [0.1, 0.7, 0.1, 0.1], [0.8, 0.1, 0.05, 0.05], [0.1, 0.1, 0.7, 0.1], [0.1, 0.1, 0.7, 0.1], [0.7, 0.1, 0.1, 0.1], [0.1, 0.1, 0.1, 0.7]])
best = [alphabet[i] for i in probs.argmax(axis=1)]
out, prev = [], None
for c in best:
    if c != prev and c != "-":
        out.append(c)
    prev = c
print("".join(best), "".join(out))`],
  ["Spectral subtraction", "Remove a noise estimate from a noisy spectrum.", py`
import numpy as np

rng = np.random.default_rng(0)
clean = np.abs(np.fft.rfft(np.sin(2 * np.pi * 10 * np.arange(256) / 256)))
noise = np.abs(np.fft.rfft(0.3 * rng.standard_normal(256)))
noisy = clean + noise
est = np.full_like(noisy, noise.mean())
out = np.maximum(noisy - est, 0)
print(round(float(np.abs(noisy - clean).mean()), 3), round(float(np.abs(out - clean).mean()), 3))`],
  ["Cosine speaker scoring", "Verify a speaker with embedding cosine similarity.", py`
import numpy as np

enrol = np.array([0.9, 0.3, 0.1])
same = np.array([0.85, 0.35, 0.15])
other = np.array([0.1, 0.2, 0.95])
cos = lambda a, b: float(a @ b / np.linalg.norm(a) / np.linalg.norm(b))
print(round(cos(enrol, same), 3), round(cos(enrol, other), 3))`],
  ["Delay-and-sum beamformer", "Align two channels and add them.", py`
import numpy as np

rng = np.random.default_rng(0)
s = np.sin(2 * np.pi * 300 * np.arange(400) / 8000)
delay = 3
ch1 = s + 0.5 * rng.standard_normal(400)
ch2 = np.roll(s, delay) + 0.5 * rng.standard_normal(400)
beam = (ch1 + np.roll(ch2, -delay)) / 2
snr = lambda y: 10 * np.log10(np.sum(s ** 2) / np.sum((y - s) ** 2))
print(round(float(snr(ch1)), 1), round(float(snr(beam)), 1))`],
];

export const glance: [string, string][] = [
  ["Sampling", "Nyquist fs/2 · alias |f − k·fs| · dB = 20 log₁₀ ratio · SNR ≈ 6.02b + 1.76 dB · μ-law ln(1 + μ|x|)/ln(1 + μ)"],
  ["DFT / FFT", "X[k] = Σ x[n]e^(−2πikn/N) · bin k = k·fs/N · DFT N² vs FFT N log₂ N"],
  ["Frames", "frames = 1 + (N − L)//hop · 25 ms / 10 ms · Δf = 1/window · pitch f₀ = fs/lag"],
  ["Windows", "Hann 0.5 − 0.5 cos(2πn/(N − 1)) · Hamming 0.54 − 0.46 cos(…)"],
  ["Features", "pre-emphasis y = x − 0.97x₋₁ · mel = 2595 log₁₀(1 + f/700) · log-mel · MFCC = DCT(log-mel) · Δc = (c₊₁ − c₋₁)/2"],
  ["ASR", "Ŵ = argmax P(X|W)P(W) · WER = (S + D + I)/N · CTC collapse: merge repeats, delete blanks · fusion log P_ac + λ log P_LM + β·len"],
  ["TTS", "text → phonemes → mel (durations: repeat) → vocoder · MOS = mean rating · mel upsampling = hop"],
  ["Speaker", "cosine = a·b/(‖a‖‖b‖) · EER: FAR = FRR · DER = (miss + FA + confusion)/speech"],
  ["Enhancement", "spectral subtraction max(|Y| − |N|, 0) · IRM = |S|/(|S| + |N|) · τ = d sin θ/c · array gain 10 log₁₀ M · NLMS h += μ e x/(‖x‖² + ε)"],
];

export const lists: [string, string[]][] = [
  ["Habits for reliable speech work", ["Listen to a hundred recordings before building anything", "Resample to the model's rate with a proper low-pass filter", "Split data by speaker and by recording session", "Normalise transcripts the same way for training and scoring", "Report WER per condition: clean, noisy, accent, microphone", "Keep the raw audio, features and model versions together"]],
  ["Debugging a recogniser that fails", ["Check the sampling rate, channel count and bit depth of every file", "Listen: clipping, silence, music and other speakers are common culprits", "Plot the spectrogram of failing examples", "Compare greedy and beam decoding with and without the language model", "Look at errors by speaker and by word type (names, numbers)", "Test the same audio through a pretrained baseline"]],
  ["Explaining your answer in an exam", ["Write the formula, substitute the numbers, compute, interpret", "State the units (Hz, ms, samples, dB)", "Say which assumptions hold: stationarity within a frame, independence in CTC", "Mention the trade-off: time against frequency resolution, accuracy against latency"]],
];

export const materials: [string, [string, string][]][] = [
  ["Free books and courses", [["Speech and Language Processing — Jurafsky and Martin (speech chapters)", "https://web.stanford.edu/~jurafsky/slp3/"], ["Hugging Face audio course", "https://huggingface.co/learn/audio-course"], ["Stanford CS224S: spoken language processing", "https://web.stanford.edu/class/cs224s/"]]],
  ["Libraries and tools", [["librosa", "https://librosa.org/doc/latest/"], ["torchaudio", "https://pytorch.org/audio/stable/"], ["Kaldi", "https://kaldi-asr.org/"], ["Whisper", "https://github.com/openai/whisper"]]],
];
