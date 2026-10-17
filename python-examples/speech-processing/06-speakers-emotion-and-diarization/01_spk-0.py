# -*- coding: utf-8 -*-
# ==========================================================================
# Speaker recognition: identification and verification [speech-processing /
# Speakers, emotion and diarization]
# ==========================================================================
# WHAT IT IS
# Voices differ because of the vocal-tract length and shape and speaking
# habits. Speaker identification picks who is speaking from N enrolled people
# (closed set; or "none of them": open set). Speaker verification answers a
# yes/no question: is this the person they claim to be? It compares the test
# utterance with an enrolment voiceprint and accepts if the similarity exceeds
# a threshold. The text may be fixed (a pass-phrase, text-dependent) or free
# (text-independent). Differences between sessions, microphones, health and
# emotion make this harder than it sounds.
#
# WHERE YOU USE IT
# Voice biometrics should be one factor among several; recordings and
# synthetic speech can fool a single-factor system.
#
# RUN IT:  python 01_spk-0.py
#

import numpy as np

enrolled = {"ann": np.array([1.0, 0.1]), "bob": np.array([0.1, 1.0])}
test = np.array([0.9, 0.2])
cos = lambda a, b: float(a @ b / (np.linalg.norm(a) * np.linalg.norm(b)))
scores = {k: round(cos(v, test), 3) for k, v in enrolled.items()}
print(scores, max(scores, key=scores.get))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# {'ann': 0.993, 'bob': 0.313} ann
