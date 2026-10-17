# -*- coding: utf-8 -*-
# ==========================================================================
# Diarization: who spoke when [speech-processing / Speakers, emotion and
# diarization]
# ==========================================================================
# WHAT IT IS
# In a meeting recording we want labelled segments: "Speaker A 0:00–0:12, B
# 0:12–0:20 …". Diarization typically (1) finds speech with VAD, (2) cuts it
# into short windows (1–2 s), (3) computes a speaker embedding for each, (4)
# clusters the embeddings (agglomerative or spectral clustering) so each
# cluster is one speaker, (5) smooths the labels over time. Overlapped speech
# and short turns are the hardest cases; end-to-end neural diarization handles
# overlaps directly. It is scored by the diarization error rate: missed speech
# + false alarm + speaker confusion, divided by the total speech time. With
# 100 s of speech and 4 s missed, 2 s false alarm, 6 s confused: DER = 12%.
#
# WHERE YOU USE IT
# Combine diarization with ASR to produce speaker-attributed transcripts
# (minutes of a meeting).
#
# RUN IT:  python 04_spk-3.py
#

import numpy as np

emb = np.array([[1.0, 0.1], [0.9, 0.2], [0.1, 1.0], [0.2, 0.9], [0.95, 0.15]])
labels = np.array([0 if e[0] > e[1] else 1 for e in emb])
print(labels.tolist())
print((4 + 2 + 6) / 100)

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# [0, 0, 1, 1, 0]
# 0.12
