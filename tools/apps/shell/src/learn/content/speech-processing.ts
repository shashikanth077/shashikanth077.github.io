import { buildStack } from "../author/build.js";
import { feat } from "../author/speech/features.js";
import { app, asr, enh, spk, tts } from "../author/speech/models.js";
import { codeLab, drills, glance, lists, materials, questions } from "../author/speech/practice.js";
import { freq, sig } from "../author/speech/signal.js";
import outputs from "./speech-processing.outputs.json";

/**
 * Speech Processing — hand-authored; every example is plain Python/NumPy, so the "Output"
 * panels come from RUNNING the code:  npm run outputs -- speech-processing
 */
const built = buildStack({
  areas: [
    ["sig", "Sound, sampling and speech data", "Signals"],
    ["freq", "Frequency analysis and spectrograms", "Spectra"],
    ["feat", "Speech features", "Features"],
    ["asr", "Speech recognition", "ASR"],
    ["tts", "Speech synthesis", "TTS"],
    ["spk", "Speakers, emotion and diarization", "Speakers"],
    ["enh", "Enhancement and microphone arrays", "Enhancement"],
    ["app", "Codecs, privacy and choosing an approach", "In practice"],
  ],
  concepts: { sig, freq, feat, asr, tts, spk, enh, app },
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
