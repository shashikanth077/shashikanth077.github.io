# -*- coding: utf-8 -*-
# ==========================================================================
# Speaker embeddings: i-vectors and x-vectors [speech-processing / Speakers,
# emotion and diarization]
# ==========================================================================
# WHAT IT IS
# To compare voices we need a fixed-size summary of an utterance of any
# length. The classic i-vector is derived from GMM statistics. The modern
# x-vector is the output of a deep network trained to classify thousands of
# training speakers: frame-level layers process the features, a statistics
# pooling layer computes the mean and standard deviation over time (turning T
# frames into one vector), and later layers produce a 192–512-dimensional
# embedding. Two utterances are compared with cosine similarity: the same
# person typically scores 0.6–0.9, different people 0.0–0.3. Newer ECAPA-TDNN
# and ResNet models improve this further.
#
# WHERE YOU USE IT
# Embeddings also carry information about accent, gender and emotion: treat
# them as personal data.
#
# RUN IT:  python 02_spk-1.py
#

import numpy as np

rng = np.random.default_rng(0)
frames = rng.normal(size=(120, 8))
pooled = np.concatenate([frames.mean(axis=0), frames.std(axis=0)])
print(frames.shape, pooled.shape)
a, b = np.array([0.9, 0.3, 0.1]), np.array([0.8, 0.4, 0.2])
print(round(float(a @ b / np.linalg.norm(a) / np.linalg.norm(b)), 3))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# (120, 8) (16,)
# 0.984
