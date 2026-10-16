import { P, bars, cells, compare, curve, hline, par, plot, pt, seg, vline } from "../../visuals/kit.js";
import { py, type ConceptDef } from "../build.js";
import { table } from "../ml/data.js";
import { rowflow } from "../nlp/util.js";

/* Every code example is plain Python/NumPy and is RUN by `npm run outputs -- speech-processing`. */

export const sig: ConceptDef[] = [
  {
    t: "Sound is a pressure wave",
    lv: 1,
    s: `Speech starts as tiny, rapid changes in air pressure produced by the vocal folds and shaped by the mouth. A microphone turns them into a voltage that varies over time. Two numbers describe a pure tone: {{frequency}} f (cycles per second, Hz — heard as pitch) and {{amplitude}} A (size of the swing — heard as loudness). A tone is x(t) = A sin(2πft). An adult male voice has a fundamental frequency near 100–120 Hz, an adult female voice near 200 Hz; the information that makes vowels and consonants distinguishable lies mostly between 100 Hz and 8 kHz.`,
    r: `Everything in speech technology — recognition, synthesis, enhancement — works on a waveform or on a transformation of it.`,
    i: `What do frequency and amplitude correspond to perceptually?`,
    c: py`
import numpy as np

fs = 8000
t = np.arange(0, 0.01, 1 / fs)
x = 0.5 * np.sin(2 * np.pi * 200 * t)
print(len(t), round(float(x.max()), 3), round(float(1 / 200 * 1000), 1), "ms per cycle")`,
    v: plot("A pure tone: x(t) = A sin(2πft) over 10 ms.", {
      x: [0, 10], y: [-1.1, 1.1], labels: ["time (ms)", "amplitude"],
      params: [par("f", "frequency (Hz)", 100, 500, 50, 200), par("A", "amplitude", 0.1, 1, 0.1, 0.5)],
      readout: ["period = 1000/{f} = {1000/f:2} ms; {f/100:1} cycles per 10 ms"],
      steps: [["200 Hz: two cycles in 10 ms.", { f: 200, A: 0.5 }], ["400 Hz: higher pitch, four cycles.", { f: 400, A: 0.5 }], ["Louder at the same pitch.", { f: 200, A: 1 }]],
    }, [curve("A*sin(2*3.14159265*f*x/1000)", { c: "accent" })]),
  },
  {
    t: "Sampling and the Nyquist limit",
    lv: 1,
    s: `A computer stores the wave as numbers measured fs times per second (the {{sampling rate}}). To capture a frequency f you need more than two samples per cycle: the highest representable frequency is the {{Nyquist frequency}} fs/2. Telephones use fs = 8 kHz (up to 4 kHz — enough for intelligibility, not for the "s" and "f" detail), wideband speech 16 kHz (8 kHz), music CDs 44.1 kHz (22.05 kHz). Speech recognition models are usually trained at 16 kHz; audio recorded at another rate must be resampled first.`,
    r: `Resample with a low-pass filter before downsampling: simply dropping samples causes aliasing.`,
    i: `What is the highest frequency represented at fs = 16 kHz?`,
    c: py`
for fs in (8000, 16000, 44100):
    print(fs, "Hz ->", fs / 2, "Hz Nyquist")
print(16000 * 2 * 60 / 1e6, "MB per minute of 16-bit mono at 16 kHz")`,
    v: bars("Nyquist frequency for common sampling rates.", [["8 kHz (telephone)", "4000"], ["16 kHz (wideband speech)", "8000"], ["44.1 kHz (CD)", "22050"], ["48 kHz (video)", "24000"]], {
      max: 25000,
    }),
  },
  {
    t: "Aliasing: when sampling is too slow",
    lv: 2,
    s: `A frequency above fs/2 does not vanish — it folds back and masquerades as a lower one: an input of f appears at |f − k·fs| for the integer k that brings it into 0…fs/2. A 5 kHz tone sampled at 8 kHz appears at |5000 − 8000| = 3,000 Hz, exactly the same samples as a genuine 3 kHz tone, and nothing in the data reveals the difference. Hence every ADC places an analogue {{anti-aliasing low-pass filter}} before sampling, and every downsampler filters first. Aliasing cannot be repaired afterwards.`,
    r: `If a spectrogram shows odd mirrored lines near the top, suspect aliasing from careless resampling.`,
    i: `At what frequency does a 5 kHz tone appear when sampled at 8 kHz?`,
    c: py`
import numpy as np

fs = 8000
t = np.arange(64) / fs
x5 = np.cos(2 * np.pi * 5000 * t)
x3 = np.cos(2 * np.pi * 3000 * t)
print(bool(np.allclose(x5, x3)), abs(5000 - fs))
freqs = np.fft.rfftfreq(64, 1 / fs)
print(float(freqs[np.abs(np.fft.rfft(x5)).argmax()]))`,
    v: plot("Apparent frequency of an input tone when sampling at 8 kHz.", {
      x: [0, 8000], y: [0, 4200], labels: ["true frequency (Hz)", "frequency seen after sampling (Hz)"],
      params: [par("f", "tone frequency (Hz)", 500, 8000, 500, 5000)],
      readout: ["{f} Hz appears at {abs(f-8000*floor(f/8000+0.5))} Hz"],
      steps: [["3 kHz: below Nyquist, reported correctly.", { f: 3000 }], ["5 kHz: folds to 3 kHz.", { f: 5000 }]],
    }, [curve("abs(x-8000*floor(x/8000+0.5))", { c: "accent" }), pt("f", "abs(f-8000*floor(f/8000+0.5))", { c: "bad" })]),
  },
  {
    t: "Amplitude, decibels and loudness",
    lv: 1,
    s: `Hearing is logarithmic, so level is given in {{decibels}}: dB = 20 log₁₀(A/A_ref) for amplitudes (10 log₁₀ for power). Doubling the amplitude adds 6.02 dB; a factor of 10 adds 20 dB; 0.1 subtracts 20. A signal of amplitude 1,000 over noise of amplitude 10 has an SNR of 20 log₁₀(100) = 40 dB. Digital audio is limited at ±1 (full scale, 0 dBFS); quieter levels are negative dBFS. Normalising loudness before training or recognition removes a nuisance factor — recordings of the same speech at different volumes should give the same transcript.`,
    r: `Clipping (values forced to ±1) destroys information and cannot be undone: leave headroom when recording.`,
    i: `How many dB does doubling the amplitude add, and what is the SNR of amplitude 1000 over noise 10?`,
    c: py`
import numpy as np

print(round(20 * np.log10(2), 2), round(20 * np.log10(10), 1), round(20 * np.log10(0.5), 2))
print(round(20 * np.log10(1000 / 10), 1))
x = np.array([0.5, -0.25, 0.1])
print(round(float(20 * np.log10(np.sqrt(np.mean(x ** 2)))), 1))`,
    v: plot("Level in dB for an amplitude ratio.", {
      x: [0.01, 4], y: [-45, 15], labels: ["amplitude ratio", "dB"],
      params: [par("a", "amplitude ratio", 0.01, 4, 0.01, 2)],
      readout: ["ratio {a} → {20*log10(a):2} dB"],
      steps: [["Double the amplitude: +6 dB.", { a: 2 }], ["Half: −6 dB.", { a: 0.5 }], ["One tenth: −20 dB.", { a: 0.1 }]],
    }, [curve("20*log10(x)", { c: "accent" }), pt("a", "20*log10(a)", { c: "bad" }), hline("0", { c: "muted", dash: true })]),
  },
  {
    t: "Quantization and bit depth",
    lv: 1,
    s: `Each sample is rounded to one of 2^b levels. The rounding error is {{quantization noise}}; for a full-scale sine the signal-to-noise ratio is about {{6.02 b + 1.76 dB}}: 8 bits ≈ 49.9 dB, 16 bits ≈ 98.1 dB, 24 bits ≈ 146 dB. Every extra bit buys 6 dB. 16-bit audio is the standard for speech and CDs; 8-bit telephone audio uses non-linear {{μ-law}} or A-law companding, which gives quiet sounds finer steps: μ-law maps x to sign(x) · ln(1 + 255|x|)/ln 256, so 0.1 becomes 0.591 and 0.01 becomes 0.228.`,
    r: `Neural models typically take float32 samples scaled to [−1, 1]; keep the conversion consistent between training and serving.`,
    i: `What SNR does 16-bit quantization give for a full-scale sine?`,
    c: py`
import numpy as np

for b in (8, 16, 24):
    print(b, round(6.02 * b + 1.76, 1))
mu = 255
f = lambda x: np.sign(x) * np.log1p(mu * np.abs(x)) / np.log1p(mu)
print(round(float(f(0.1)), 3), round(float(f(0.01)), 3))`,
    v: plot("Quantization SNR against bit depth.", {
      x: [1, 24], y: [0, 150], labels: ["bits per sample b", "SNR (dB)"],
      params: [par("b", "bits b", 1, 24, 1, 16)],
      readout: ["{b} bits → {6.02*b+1.76:1} dB"],
      steps: [["8 bits: about 50 dB.", { b: 8 }], ["16 bits: about 98 dB.", { b: 16 }]],
    }, [curve("6.02*x+1.76", { c: "accent" }), pt("b", "6.02*b+1.76", { c: "bad" })]),
  },
  {
    t: "Sources of data: speech corpora and recording",
    lv: 1,
    s: `A speech system is only as good as its data. Corpora pair audio with transcripts (LibriSpeech: 1,000 hours of read books; Common Voice: crowd-sourced in many languages; telephone and meeting corpora for conversational speech). Differences that matter: read versus spontaneous speech, microphone and room, noise, accent, age, domain vocabulary. For a new application collect speech from the real users and devices, with consent; label carefully (normalise numbers and punctuation consistently); and split train/validation/test by {{speaker}}, never by utterance, or the test set leaks the voices of the training set.`,
    r: `Speaker-disjoint splits are as important in speech as patient-disjoint splits are in medicine.`,
    i: `Why must a speech test set contain different speakers from the training set?`,
    c: py`
import numpy as np

rng = np.random.default_rng(0)
speakers = [f"spk{i}" for i in range(10)]
rng.shuffle(speakers)
train, val, test = speakers[:7], speakers[7:8], speakers[8:]
print(train, val, test, set(train) & set(test))`,
    v: compare("Typical speech data and its quirks.", ["Style", "Challenge"], [
      ["Read speech (audiobooks)", "clean, scripted", "unlike real conversations"],
      ["Telephone", "8 kHz, compressed", "narrow bandwidth, noise"],
      ["Meetings", "overlapping speakers", "far-field, reverberation"],
      ["Crowd-sourced", "many accents and devices", "variable quality"],
    ]),
  },
  {
    t: "The speech chain and its applications",
    lv: 1,
    s: `Speech technology maps between sound and text, or between sound and sound. {{Automatic speech recognition (ASR)}}: speech → text (dictation, captions, voice assistants). {{Text-to-speech (TTS)}}: text → speech (navigation, screen readers). {{Speaker recognition}}: who is speaking? {{Diarization}}: who spoke when? {{Speech enhancement}}: make noisy speech cleaner. {{Speech translation}}, {{emotion recognition}}, {{keyword spotting}} ("hey assistant") and voice conversion round out the field. Almost all share the same front end: a waveform turned into a time–frequency picture.`,
    r: `Choose the task definition carefully: a keyword spotter must run in milliseconds on a tiny chip, a transcription service can use a large model in the cloud.`,
    i: `Match each task to its input and output.`,
    c: py`
tasks = {
    "ASR": ("speech", "text"),
    "TTS": ("text", "speech"),
    "speaker verification": ("two utterances", "same person? yes/no"),
    "diarization": ("meeting audio", "speaker label per time segment"),
    "enhancement": ("noisy speech", "clean speech"),
}
for name, (i, o) in tasks.items():
    print(f"{name:20s} {i} -> {o}")`,
    v: compare("Main speech tasks.", ["Output"], [
      ["Speech recognition (ASR)", "text"],
      ["Text-to-speech (TTS)", "a waveform"],
      ["Speaker verification", "same speaker or not"],
      ["Diarization", "who spoke when"],
      ["Enhancement", "a cleaner waveform"],
    ]),
  },
];

/* ------------------------------------------------------------------ */
export const freq: ConceptDef[] = [
  {
    t: "The Fourier transform: finding the frequencies",
    lv: 2,
    s: `A voice is a sum of sine waves. The {{discrete Fourier transform}} finds how much of each frequency a block of N samples contains: X[k] = Σₙ x[n] e^(−2πi kn/N). For the four samples (1, 2, 3, 4): X = (10, −2 + 2i, −2, −2 − 2i). X[0] = 10 is the sum (the DC component); the magnitudes |X[k]| are the strengths of the frequencies k·fs/N. For real signals the second half mirrors the first, so only N/2 + 1 values are kept (rfft). The magnitude gives "how much", the phase "when in the cycle".`,
    r: `Always know the frequency of each bin: bin k of an N-point FFT at rate fs is k·fs/N Hz.`,
    i: `Compute the DFT of (1, 2, 3, 4).`,
    c: py`
import numpy as np

x = np.array([1.0, 2.0, 3.0, 4.0])
X = np.fft.fft(x)
print(X.round(3).tolist())
print(np.abs(X).round(3).tolist(), np.fft.rfftfreq(4, 1 / 8000).tolist())`,
    v: cells("DFT of the four samples (1, 2, 3, 4).", table(["k", "frequency (fs = 8 kHz)", "X[k]", "|X[k]|"], [["0", "0 Hz", "10", "10"], ["1", "2000 Hz", "−2 + 2i", "2.83"], ["2", "4000 Hz", "−2", "2"], ["3", "mirror of k = 1", "−2 − 2i", "2.83"]]), [
      ["N = 4 samples give 4 frequency bins spaced fs/N = 2 kHz."],
      ["X[0] is the sum of the samples.", [[1, 3, 3]]],
      ["Bin 3 mirrors bin 1 for a real input.", [[4, 2, 3]]],
    ]),
  },
  {
    t: "FFT: why it is fast",
    lv: 2,
    s: `The direct DFT needs N² multiplications; the {{FFT}} splits the sum into even- and odd-indexed halves recursively and needs only about N log₂ N. For N = 512: 262,144 versus 4,608 operations — 57 times fewer; for N = 4,096 the ratio is over 340. That makes real-time spectral analysis possible on a phone. The FFT is fastest for N a power of two, which is why frame lengths are padded to 256, 512 or 1024 samples. Zero-padding does not add information but interpolates the spectrum between bins, giving a smoother picture.`,
    r: `In code use np.fft.rfft (real input) and let the library handle the algorithm.`,
    i: `How many operations do the direct DFT and the FFT need for N = 512?`,
    c: py`
import numpy as np

for N in (64, 512, 4096):
    print(N, N * N, int(N * np.log2(N)), round(N * N / (N * np.log2(N))))
x = np.random.default_rng(0).standard_normal(8)
direct = np.array([sum(x[n] * np.exp(-2j * np.pi * k * n / 8) for n in range(8)) for k in range(8)])
print(bool(np.allclose(direct, np.fft.fft(x))))`,
    v: plot("Operation counts: direct DFT versus FFT.", {
      x: [8, 1024], y: [0, 60000], labels: ["N (samples)", "operations"],
      params: [par("n", "N", 8, 1024, 8, 512)],
      readout: ["N = {n}: DFT {n*n}, FFT ≈ {n*log2(n):1}"],
      steps: [["N = 512: 262,144 versus ≈ 4,608.", { n: 512 }]],
    }, [curve("x*x", { c: "bad", label: "DFT N²" }), curve("x*log2(x)", { c: "good", label: "FFT N log N" })]),
  },
  {
    t: "Windowing and spectral leakage",
    lv: 2,
    s: `The FFT assumes the block repeats forever. If a tone does not complete a whole number of cycles in the block, the repetition has a jump at the edge and the energy {{leaks}} into neighbouring bins. A 64-sample block containing exactly 8 cycles gives a single clean peak of magnitude 32; at 8.5 cycles the peak falls to 20.8 and leakage spreads out, with far bins at about 3.4% of the peak. Multiplying the block by a smooth {{window}} (Hann: 0.5 − 0.5 cos(2πn/(N−1)), Hamming: 0.54 − 0.46 cos…) tapers the edges to zero and cuts the far leakage to about 0.02%, at the price of a slightly wider main peak.`,
    r: `Speech analysis nearly always applies a Hamming or Hann window to every frame.`,
    i: `Why does an off-bin tone leak and how does a window help?`,
    c: py`
import numpy as np

n = 64
t = np.arange(n)
on = np.sin(2 * np.pi * 8 * t / n)
off = np.sin(2 * np.pi * 8.5 * t / n)
for name, s in (("on-bin", on), ("off-bin", off), ("off-bin + Hann", off * np.hanning(n))):
    m = np.abs(np.fft.rfft(s))
    print(name, int(m.argmax()), round(float(m.max()), 2), round(float(m[20:].max() / m.max()), 4))
print(np.hanning(5).round(3).tolist(), np.hamming(5).round(3).tolist())`,
    v: plot("Hann and Hamming windows over one frame.", {
      x: [0, 1], y: [0, 1.05], labels: ["position in the frame", "weight"],
      params: [par("a", "Hamming α (0.5 = Hann)", 0.5, 0.54, 0.04, 0.54)],
      readout: ["w(n) = {a} − {1-a:2} cos(2πn/(N−1)); edge weight {a-(1-a):2}"],
      steps: [["Hamming: edges at 0.08.", { a: 0.54 }], ["Hann: edges at 0.", { a: 0.5 }]],
    }, [curve("a-(1-a)*cos(2*3.14159265*x)", { c: "accent" })]),
  },
  {
    t: "Frames: short pieces of nearly stationary sound",
    lv: 1,
    s: `A whole sentence is not stationary — the mouth keeps moving — but over 20–30 ms the sound is almost constant. So cut the signal into overlapping {{frames}}: typically 25 ms long (400 samples at 16 kHz) shifted by a {{hop}} of 10 ms (160 samples). One second of audio gives 1 + (16000 − 400) // 160 = 98 frames. Each frame is windowed and transformed separately. The overlap makes sure nothing falls on a frame boundary; the hop sets the time resolution of everything that follows (about 100 feature vectors per second).`,
    r: `A 10 ms hop is a de-facto standard: fast enough for phonemes (50–200 ms), slow enough to be cheap.`,
    i: `How many frames does 1 s of 16 kHz audio give with 25 ms frames and a 10 ms hop?`,
    c: py`
import numpy as np

fs, frame, hop = 16000, 400, 160
x = np.zeros(fs)
n = 1 + (len(x) - frame) // hop
frames = np.stack([x[i * hop:i * hop + frame] for i in range(n)])
print(n, frames.shape, frame / fs * 1000, hop / fs * 1000)`,
    v: plot("Number of frames per second against the hop size (25 ms frames).", {
      x: [5, 25], y: [0, 200], labels: ["hop (ms)", "frames per second"],
      params: [par("h", "hop (ms)", 5, 25, 1, 10)],
      readout: ["hop {h} ms → {floor(1+(1000-25)/h)} frames in 1 s"],
      steps: [["10 ms hop: about 98 frames.", { h: 10 }], ["5 ms hop: twice as many.", { h: 5 }]],
    }, [curve("1+(1000-25)/x", { c: "accent" }), pt("h", "1+(1000-25)/h", { c: "bad" })]),
  },
  {
    t: "The spectrogram",
    lv: 1,
    s: `Apply a window and an FFT to each frame and stack the magnitudes side by side: time runs along one axis, frequency along the other, brightness shows energy — a {{spectrogram}} (short-time Fourier transform, STFT). Vowels appear as horizontal bands, the {{formants}} (resonances of the vocal tract); fricatives like "s" as broadband noise at high frequencies; plosives as short vertical bursts; the pitch as evenly spaced harmonics. We usually plot 20 log₁₀|X| because energy spans many orders of magnitude. A 16 kHz, 512-point FFT gives 257 frequency bins 31.25 Hz apart.`,
    r: `Spectrograms turn audio into an image: CNNs and vision transformers can then be used, which is how many audio classifiers work.`,
    i: `How many frequency bins and what spacing does a 512-point FFT at 16 kHz give?`,
    c: py`
import numpy as np

fs = 16000
t = np.arange(fs) / fs
x = np.sin(2 * np.pi * (200 + 600 * t) * t)
frame, hop, nfft = 400, 160, 512
n = 1 + (len(x) - frame) // hop
win = np.hanning(frame)
S = np.abs(np.stack([np.fft.rfft(x[i * hop:i * hop + frame] * win, nfft) for i in range(n)]))
print(S.shape, fs / nfft)
print(int(S[0].argmax()) * fs / nfft, int(S[-1].argmax()) * fs / nfft)`,
    v: compare("What you see in a spectrogram.", ["Appearance", "Cause"], [
      ["Vowel", "horizontal bands (formants)", "vocal-tract resonances"],
      ["Voiced sound", "evenly spaced harmonics", "vocal-fold vibration (pitch)"],
      ["Fricative (s, sh)", "diffuse high-frequency noise", "turbulent airflow"],
      ["Plosive (p, t, k)", "silence then a vertical burst", "sudden release of air"],
    ]),
  },
  {
    t: "Time–frequency trade-off",
    lv: 2,
    s: `A longer window resolves frequencies more finely but blurs timing, and vice versa — an uncertainty principle: frequency resolution Δf = fs/N = 1/(window duration). A 25 ms window has Δf = 40 Hz (enough to separate pitch harmonics of a 100 Hz voice only barely) and 25 ms of time blur; a 5 ms window gives Δf = 200 Hz but sharper timing; a 100 ms window gives 10 Hz. {{Wide-band}} spectrograms (short windows, ≈ 5 ms) show vertical glottal pulses and smooth formants; {{narrow-band}} ones (long windows, ≈ 40 ms) show individual harmonics. Pick the window to match what you need to see.`,
    r: `Wavelets and constant-Q transforms trade resolution differently across frequency; speech mostly uses the plain STFT.`,
    i: `What frequency resolution does a 25 ms window give?`,
    c: py`
for ms in (5, 25, 100):
    print(ms, "ms window ->", 1000 / ms, "Hz resolution")`,
    v: plot("Frequency resolution against the window length.", {
      x: [5, 100], y: [0, 220], labels: ["window length (ms)", "resolution Δf (Hz)"],
      params: [par("w", "window (ms)", 5, 100, 5, 25)],
      readout: ["{w} ms → Δf = {1000/w:1} Hz"],
      steps: [["25 ms: 40 Hz.", { w: 25 }], ["5 ms: coarse, 200 Hz.", { w: 5 }], ["100 ms: fine, 10 Hz.", { w: 100 }]],
    }, [curve("1000/x", { c: "accent" }), pt("w", "1000/w", { c: "bad" })]),
  },
  {
    t: "Pitch from autocorrelation",
    lv: 2,
    s: `Voiced speech repeats every pitch period, so a frame correlates strongly with a copy of itself shifted by exactly that period. The {{autocorrelation}} r[τ] = Σₙ x[n]x[n+τ] therefore peaks at τ = T₀. A 100 Hz tone at fs = 8 kHz repeats every 80 samples: r peaks at lag 80, giving f₀ = fs/τ = 8000/80 = 100 Hz. Search only the plausible lags (50–400 Hz → fs/400 … fs/50) and apply a voiced/unvoiced decision — unvoiced sounds have no clear peak. Modern trackers (YIN, pYIN, CREPE) refine this to avoid octave errors, where the detector reports half or double the true pitch.`,
    r: `Pitch carries intonation, emotion and tone in tonal languages; many TTS systems and speech tools need a good F₀ track.`,
    i: `Estimate f₀ from an autocorrelation peak at lag 80 with fs = 8 kHz.`,
    c: py`
import numpy as np

fs, f0 = 8000, 100
t = np.arange(800) / fs
x = np.sin(2 * np.pi * f0 * t)
ac = np.correlate(x, x, "full")[len(x) - 1:]
lo, hi = fs // 400, fs // 50
lag = int(np.argmax(ac[lo:hi])) + lo
print(lag, fs / lag)`,
    v: plot("Autocorrelation of a 100 Hz tone (fs = 8 kHz): peaks at multiples of the 80-sample period.", {
      x: [0, 320], y: [-1.1, 1.1], labels: ["lag (samples)", "normalised autocorrelation"],
      params: [par("f", "pitch f₀ (Hz)", 80, 250, 10, 100)],
      readout: ["first peak at lag fs/f₀ = 8000/{f} = {8000/f:1} samples"],
      steps: [["100 Hz: lag 80.", { f: 100 }], ["200 Hz: lag 40.", { f: 200 }]],
    }, [curve("cos(2*3.14159265*x*f/8000)", { c: "accent" }), vline("8000/f", { c: "bad", dash: true })]),
  },
];

void [P, bars, cells, compare, curve, hline, par, plot, pt, seg, vline, table, rowflow];
