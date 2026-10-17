# -*- coding: utf-8 -*-
# ==========================================================================
# Choosing an approach for a speech project [speech-processing / Codecs,
# privacy and choosing an approach]
# ==========================================================================
# WHAT IT IS
# A decision guide. Need transcripts of recorded audio (batch) → a large
# pretrained model (Whisper-style), then fix domain words with prompts or a
# custom vocabulary. Live captions or on-device commands → a streaming
# RNN-T/CTC model. Few fixed commands → keyword spotting or a small classifier
# on log-mel features. Speech synthesis for an application → a pretrained
# neural TTS with a custom lexicon; voice cloning only with consent. Identify
# speakers → x-vector embeddings and cosine scoring. Always start from a
# pretrained model, measure WER (or the task metric) on your own audio, split
# by speaker, and inspect errors by group and by noise condition.
#
# WHERE YOU USE IT
# Most gains come from audio quality, microphone placement and domain data,
# not from a bigger architecture.
#
# RUN IT:  python 03_app-2.py
#

guide = {
    "batch transcription": "large pretrained model + custom vocabulary",
    "live captions": "streaming RNN-T or CTC",
    "voice commands (10 words)": "keyword spotting on log-mel",
    "speak text": "pretrained neural TTS + lexicon",
    "who is speaking": "x-vectors + cosine / diarization",
}
for k, v in guide.items():
    print(f"{k:26s} -> {v}")

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# batch transcription        -> large pretrained model + custom vocabulary
# live captions              -> streaming RNN-T or CTC
# voice commands (10 words)  -> keyword spotting on log-mel
# speak text                 -> pretrained neural TTS + lexicon
# who is speaking            -> x-vectors + cosine / diarization
