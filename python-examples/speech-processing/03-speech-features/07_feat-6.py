# -*- coding: utf-8 -*-
# ==========================================================================
# Deltas, energy and zero-crossings [speech-processing / Speech features]
# ==========================================================================
# WHAT IT IS
# Speech is about change, so add the delta (velocity) of each feature: Δc[t] =
# (c[t+1] − c[t−1]) / 2, and the delta-delta (acceleration). A rising feature
# sequence 1, 2, 4 has deltas 1.5 at the middle frame. Two cheap per-frame
# measures: short-time energy Σx² (loud or quiet) and the zero-crossing rate
# (how often the sign changes): voiced sounds have high energy and a low rate,
# fricatives like "s" low energy and a high rate, silence both low. Together
# they give a crude voice-activity detector. A 3-feature × 3 stack (static,
# delta, delta-delta) is the classic 39-dimensional MFCC vector.
#
# WHERE YOU USE IT
# Neural models with temporal context (convolutions, recurrence, attention)
# learn their own deltas.
#
# RUN IT:  python 07_feat-6.py
#

import numpy as np

c = np.array([1.0, 2.0, 4.0])
print((c[2] - c[0]) / 2)
fs = 8000
t = np.arange(400) / fs
voiced = np.sin(2 * np.pi * 120 * t)
noise = np.random.default_rng(0).standard_normal(400) * 0.3
zcr = lambda x: float(np.mean(np.abs(np.diff(np.sign(x))) > 0))
print(round(zcr(voiced), 3), round(zcr(noise), 3), round(float(np.mean(voiced ** 2)), 3), round(float(np.mean(noise ** 2)), 3))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 1.5
# 0.03 0.516 0.5 0.089
