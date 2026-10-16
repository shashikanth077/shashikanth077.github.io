import { P, bars, cells, compare, curve, hline, par, plot, pt, seg, vline } from "../../visuals/kit.js";
import { py, type ConceptDef } from "../build.js";
import { table } from "../ml/data.js";
import { rowflow } from "../nlp/util.js";

/* Every code example is plain Python/NumPy and is RUN by `npm run outputs -- speech-processing`. */

export const feat: ConceptDef[] = [
  {
    t: "How speech is made: the source–filter model",
    lv: 1,
    s: `Speech production separates into a {{source}} and a {{filter}}. For voiced sounds (vowels, "m", "z") the vocal folds vibrate at the pitch f₀ and produce a buzz rich in harmonics; for unvoiced sounds ("s", "f") air rushes through a constriction and produces noise. The vocal tract — throat, mouth, nose, lips — then acts as a filter whose resonances, the {{formants}} F1, F2, F3, boost certain frequencies. The vowel /a/ has F1 ≈ 700 Hz, F2 ≈ 1,200 Hz; /i/ has F1 ≈ 300 Hz, F2 ≈ 2,300 Hz. Pitch says who and how (melody); formants say which vowel.`,
    r: `ASR features try to keep the filter (what was said) and discard the source (who said it, at what pitch).`,
    i: `Which part of the model carries the vowel identity and which the pitch?`,
    c: py`
import numpy as np

f0 = 120
harmonics = np.arange(1, 8) * f0
formants = {"a": (700, 1200), "i": (300, 2300)}
gain = lambda f, F, bw=150: 1 / (1 + ((f - F) / bw) ** 2)
for v, (f1, f2) in formants.items():
    spec = [round(float(gain(h, f1) + gain(h, f2)), 2) for h in harmonics]
    print(v, harmonics.tolist(), spec)`,
    v: compare("Source and filter.", ["Source (vocal folds)", "Filter (vocal tract)"], [
      ["Role", "makes the raw sound", "shapes it with resonances"],
      ["Controls", "pitch f₀, voiced / unvoiced", "vowel and consonant identity"],
      ["In the spectrum", "harmonic comb or noise", "smooth envelope with formant peaks"],
      ["Mostly needed for", "prosody, speaker identity", "recognising words"],
    ]),
  },
  {
    t: "Pre-emphasis: boosting the highs",
    lv: 1,
    s: `Speech energy falls with frequency (about −6 dB per octave), so high-frequency details such as "s" and "t" are weak and easily lost. A simple first-order high-pass filter {{y[n] = x[n] − α x[n−1]}} with α ≈ 0.97 flattens the spectrum before analysis. A constant (DC) signal (1, 1, 1) becomes (1, 0.03, 0.03): slow components are suppressed, rapid changes survive. The filter also removes the DC offset that some microphones add. It is a cheap first step in classical front ends; neural models can learn it, but it is still common.`,
    r: `Pre-emphasis amplifies high-frequency noise too, so apply it only when the signal-to-noise ratio is reasonable.`,
    i: `Apply pre-emphasis with α = 0.97 to the constant signal (1, 1, 1).`,
    c: py`
import numpy as np

x = np.array([1.0, 1.0, 1.0])
print(np.round(x[1:] - 0.97 * x[:-1], 2).tolist())
y = np.array([0.0, 1.0, 0.0, 1.0, 0.0])
print(np.round(y[1:] - 0.97 * y[:-1], 2).tolist())`,
    v: plot("Frequency response of the pre-emphasis filter |1 − α e^(−jω)|.", {
      x: [0, 3.1416], y: [0, 2], labels: ["frequency ω (0 … Nyquist = π)", "gain"],
      params: [par("a", "α", 0.5, 1, 0.01, 0.97)],
      readout: ["DC gain 1 − α = {1-a:2}; Nyquist gain 1 + α = {1+a:2}"],
      steps: [["α = 0.97: lows cut, highs boosted.", { a: 0.97 }], ["α = 0.5: a gentle tilt.", { a: 0.5 }]],
    }, [curve("sqrt(1+a*a-2*a*cos(x))", { c: "accent" })]),
  },
  {
    t: "The mel scale: how we hear pitch",
    lv: 1,
    s: `Humans resolve low frequencies finely and high ones coarsely: the step from 100 to 200 Hz sounds large, from 7,000 to 7,100 Hz hardly at all. The {{mel scale}} warps frequency to match: mel = 2595 log₁₀(1 + f/700). It is nearly linear below 1 kHz and logarithmic above: 100 Hz → 150.5 mel, 1,000 Hz → 1,000 mel, 4,000 Hz → 2,146 mel, 8,000 Hz → 2,840 mel. Using mel-spaced bands gives the recogniser fine detail where speech carries most information and coarse detail where it does not, and matches the ear's critical bands.`,
    r: `Other perceptual scales exist (Bark, ERB); mel is the standard in speech and audio models.`,
    i: `Convert 4000 Hz to mel.`,
    c: py`
import numpy as np

mel = lambda f: 2595 * np.log10(1 + np.asarray(f, float) / 700)
inv = lambda m: 700 * (10 ** (np.asarray(m, float) / 2595) - 1)
print(mel([100, 1000, 4000, 8000]).round(1).tolist())
print(round(float(inv(mel(1234.0))), 1))`,
    v: plot("Mel value of a frequency.", {
      x: [0, 8000], y: [0, 3000], labels: ["frequency (Hz)", "mel"],
      params: [par("f", "frequency (Hz)", 0, 8000, 100, 1000)],
      readout: ["{f} Hz = {2595*log10(1+f/700):1} mel"],
      steps: [["1000 Hz = 1000 mel by construction.", { f: 1000 }], ["8000 Hz: the scale flattens.", { f: 8000 }]],
    }, [curve("2595*log10(1+x/700)", { c: "accent" }), pt("f", "2595*log10(1+f/700)", { c: "bad" })]),
  },
  {
    t: "Mel filterbank",
    lv: 2,
    s: `Group the FFT bins into a few bands with overlapping {{triangular filters}} spaced evenly on the mel scale. To build a bank of M filters between 0 and 8 kHz: convert the range to mel, take M + 2 equally spaced points, convert back to Hz — these are the filter edges and centres. For M = 4 the edges are 0, 459, 1,218, 2,475, 4,556 and 8,000 Hz: narrow filters at low frequency, one 3.5 kHz wide at the top. Each filter outputs the weighted sum of the power spectrum under its triangle. Typical systems use 40–80 filters: a 257-bin spectrum becomes a compact 40-number description.`,
    r: `Number of mel bands is a hyper-parameter: 80 is common for neural ASR and TTS, 23–40 for classic MFCC systems.`,
    i: `Why are the filters narrow at low frequencies and wide at high frequencies?`,
    c: py`
import numpy as np

mel = lambda f: 2595 * np.log10(1 + f / 700)
inv = lambda m: 700 * (10 ** (m / 2595) - 1)
edges = inv(np.linspace(mel(0), mel(8000), 6))
print(edges.round(0).tolist())
print(np.diff(edges).round(0).tolist())`,
    v: bars("Width (Hz) of each of the four mel filters between 0 and 8 kHz.", [["filter 1 (0–1218)", "1218"], ["filter 2 (459–2475)", "2016"], ["filter 3 (1218–4556)", "3338"], ["filter 4 (2475–8000)", "5525"]], {
      max: 6000,
    }),
  },
  {
    t: "Log-mel spectrograms",
    lv: 2,
    s: `The standard front end of modern speech models: frame the signal, window, FFT, power spectrum |X|², mel filterbank, then take the {{logarithm}}: log-mel = log(mel energy + ε). The logarithm matches loudness perception, compresses the huge dynamic range (energies vary by a factor of a million) and turns multiplicative effects such as the microphone's gain into simple additions. Result: a matrix of shape (frames × mel bands), e.g. 98 × 80 for one second. Per-utterance or global mean–variance normalisation then removes level and channel differences.`,
    r: `Add a small floor (10⁻¹⁰) before the log to avoid −∞ in silence.`,
    i: `What shape is the log-mel matrix of 1 s of audio with 80 bands and a 10 ms hop?`,
    c: py`
import numpy as np

energy = np.array([1e-6, 1e-3, 1.0, 1e3])
print(np.log(energy + 1e-10).round(2).tolist())
gain = 10.0
print(bool(np.allclose(np.log(gain * energy), np.log(energy) + np.log(gain))))
frames, bands = 98, 80
print((frames, bands), frames * bands)`,
    v: rowflow("From waveform to log-mel features.", ["Waveform", "Frames + window", "FFT power", "Mel filterbank", "Log", "(frames × bands) matrix"], [
      "16 kHz samples.",
      "25 ms frames every 10 ms.",
      "|X|² of each frame.",
      "Group into 80 mel bands.",
      "Compress the dynamic range.",
      "The input of the neural network.",
    ]),
  },
  {
    t: "MFCCs: cepstral coefficients",
    lv: 2,
    s: `{{MFCCs}} go one step further: apply a {{discrete cosine transform}} (DCT) to the log-mel energies and keep the first 12–13 coefficients. The DCT decorrelates neighbouring bands and separates the smooth spectral envelope (the filter — low coefficients) from fine detail such as pitch harmonics (high coefficients), which are discarded. For log-mel values (2, 1, 0.5, 0.25) the DCT-II is (3.75, 1.81, 0.53, 0.21): c₀ is the overall energy, c₁ the tilt, and so on. MFCCs dominated classic GMM–HMM recognisers; neural models usually take log-mel directly because they can learn their own decorrelation.`,
    r: `MFCCs remain handy for small models, keyword spotting and speaker features.`,
    i: `What do the first and the later MFCC coefficients describe?`,
    c: py`
import numpy as np

def dct2(x):
    N = len(x)
    return np.array([sum(x[n] * np.cos(np.pi / N * (n + 0.5) * k) for n in range(N)) for k in range(N)])

logmel = np.array([2.0, 1.0, 0.5, 0.25])
print(dct2(logmel).round(3).tolist())`,
    v: cells("DCT of four log-mel energies.", table(["", "band 1", "band 2", "band 3", "band 4"], [["log-mel", "2", "1", "0.5", "0.25"], ["MFCC c₀ … c₃", "3.75", "1.81", "0.53", "0.21"]]), [
      ["The DCT turns band energies into shape coefficients."],
      ["c₀ is the sum: the overall level.", [[2, 1, 1]]],
      ["Higher coefficients (fine spectral detail) are small and can be dropped.", [[2, 3, 4]]],
    ]),
  },
  {
    t: "Deltas, energy and zero-crossings",
    lv: 1,
    s: `Speech is about change, so add the {{delta}} (velocity) of each feature: Δc[t] = (c[t+1] − c[t−1]) / 2, and the delta-delta (acceleration). A rising feature sequence 1, 2, 4 has deltas 1.5 at the middle frame. Two cheap per-frame measures: {{short-time energy}} Σx² (loud or quiet) and the {{zero-crossing rate}} (how often the sign changes): voiced sounds have high energy and a low rate, fricatives like "s" low energy and a high rate, silence both low. Together they give a crude voice-activity detector. A 3-feature × 3 stack (static, delta, delta-delta) is the classic 39-dimensional MFCC vector.`,
    r: `Neural models with temporal context (convolutions, recurrence, attention) learn their own deltas.`,
    i: `Compute the delta at the middle frame of the sequence 1, 2, 4.`,
    c: py`
import numpy as np

c = np.array([1.0, 2.0, 4.0])
print((c[2] - c[0]) / 2)
fs = 8000
t = np.arange(400) / fs
voiced = np.sin(2 * np.pi * 120 * t)
noise = np.random.default_rng(0).standard_normal(400) * 0.3
zcr = lambda x: float(np.mean(np.abs(np.diff(np.sign(x))) > 0))
print(round(zcr(voiced), 3), round(zcr(noise), 3), round(float(np.mean(voiced ** 2)), 3), round(float(np.mean(noise ** 2)), 3))`,
    v: compare("Cheap frame measures.", ["Voiced (vowel)", "Fricative (s)", "Silence"], [
      ["Energy", "high", "low–medium", "very low"],
      ["Zero-crossing rate", "low", "high", "low / random"],
    ]),
  },
  {
    t: "Voice activity detection and normalisation",
    lv: 1,
    s: `Most recordings contain silence. {{Voice activity detection (VAD)}} marks the frames that contain speech so that silence is skipped (saves compute), endpoints are found (where does the command end?) and the transcriber does not hallucinate words from noise. A simple VAD thresholds the frame energy relative to the noise floor; modern ones are small neural networks. {{Cepstral mean and variance normalisation (CMVN)}} subtracts the per-utterance mean and divides by the standard deviation of each feature, removing constant channel effects: features (3, 5, 7) become (−1.22, 0, 1.22). Together, VAD + CMVN make features comparable across microphones and rooms.`,
    r: `Set VAD hangover (keep a few frames after speech) so word endings are not clipped.`,
    i: `Apply mean–variance normalisation to the feature values 3, 5, 7.`,
    c: py`
import numpy as np

x = np.array([3.0, 5.0, 7.0])
print(((x - x.mean()) / x.std()).round(2).tolist())
energy = np.array([0.001, 0.002, 0.5, 0.9, 0.7, 0.003, 0.001])
floor = np.median(energy)
print((energy > 5 * floor).astype(int).tolist())`,
    v: rowflow("Cleaning up features.", ["Frame energies", "Estimate noise floor", "Threshold → speech frames", "Hangover smoothing", "CMVN on speech frames"], [
      "One value per frame.",
      "Median or minimum of the energies.",
      "Energy ≫ floor means speech.",
      "Keep a few extra frames at word ends.",
      "Zero mean, unit variance per utterance.",
    ]),
  },
];

void [P, bars, cells, compare, curve, hline, par, plot, pt, seg, vline, table, rowflow];
