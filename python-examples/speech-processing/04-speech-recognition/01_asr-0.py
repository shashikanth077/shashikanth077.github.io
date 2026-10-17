# -*- coding: utf-8 -*-
# ==========================================================================
# Automatic speech recognition: the problem [speech-processing / Speech
# recognition]
# ==========================================================================
# WHAT IT IS
# ASR finds the word sequence W that best explains the audio X: Ŵ = argmax P(W
# | X) = argmax P(X | W) P(W). The acoustic model P(X | W) says how likely
# this sound is for those words; the language model P(W) says how likely those
# words are as text. Classic systems add a pronunciation dictionary linking
# words to phonemes ("cat" → k æ t). Hard because the same word sounds
# different for every speaker, accent, microphone and room; because words blur
# together with no gaps; and because many phrases sound alike ("recognise
# speech" / "wreck a nice beach") — the language model breaks the ties.
#
# WHERE YOU USE IT
# Deep end-to-end systems fold the three components into one network but still
# learn the same trade-off.
#
# RUN IT:  python 01_asr-0.py
#

import numpy as np

hyps = {"recognise speech": (0.40, 0.020), "wreck a nice beach": (0.45, 0.001)}
for h, (acoustic, lm) in hyps.items():
    print(f"{h:20s} score {acoustic * lm:.5f}")

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# recognise speech     score 0.00800
# wreck a nice beach   score 0.00045
