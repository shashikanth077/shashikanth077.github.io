# -*- coding: utf-8 -*-
# ==========================================================================
# Sources of data: speech corpora and recording [speech-processing / Sound,
# sampling and speech data]
# ==========================================================================
# WHAT IT IS
# A speech system is only as good as its data. Corpora pair audio with
# transcripts (LibriSpeech: 1,000 hours of read books; Common Voice:
# crowd-sourced in many languages; telephone and meeting corpora for
# conversational speech). Differences that matter: read versus spontaneous
# speech, microphone and room, noise, accent, age, domain vocabulary. For a
# new application collect speech from the real users and devices, with
# consent; label carefully (normalise numbers and punctuation consistently);
# and split train/validation/test by speaker, never by utterance, or the test
# set leaks the voices of the training set.
#
# WHERE YOU USE IT
# Speaker-disjoint splits are as important in speech as patient-disjoint
# splits are in medicine.
#
# RUN IT:  python 06_sig-5.py
#

import numpy as np

rng = np.random.default_rng(0)
speakers = [f"spk{i}" for i in range(10)]
rng.shuffle(speakers)
train, val, test = speakers[:7], speakers[7:8], speakers[8:]
print(train, val, test, set(train) & set(test))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# ['spk4', 'spk6', 'spk2', 'spk7', 'spk3', 'spk5', 'spk9'] ['spk0'] ['spk8', 'spk1'] set()
