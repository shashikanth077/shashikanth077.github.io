# -*- coding: utf-8 -*-
# ==========================================================================
# Emotion, language and paralinguistics [speech-processing / Speakers, emotion
# and diarization]
# ==========================================================================
# WHAT IT IS
# Speech carries more than words: emotion, health, age, accent, language.
# Speech emotion recognition predicts categories (anger, joy, sadness,
# neutral) or dimensions (arousal: calm → excited; valence: negative →
# positive) from prosody and spectral features; arousal is recognised far more
# reliably from audio than valence. Language identification decides which
# language is spoken within a second or two. Typical cues: higher pitch and
# louder speech for high arousal. Caveats: emotion labels are subjective
# (annotators agree only moderately), acted corpora differ from natural
# speech, and recognising emotion raises ethical questions — be transparent
# about its use and limits.
#
# WHERE YOU USE IT
# Do not use emotion predictions for high-stakes decisions about people.
#
# RUN IT:  python 05_spk-4.py
#

import numpy as np

calm = np.array([110, 112, 109, 111.0])
excited = np.array([160, 190, 150, 200.0])
print(round(float(calm.mean()), 1), round(float(calm.std()), 1), round(float(excited.mean()), 1), round(float(excited.std()), 1))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 110.5 1.1 175.0 20.6
