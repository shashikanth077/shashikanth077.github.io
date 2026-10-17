# -*- coding: utf-8 -*-
# ==========================================================================
# MFCCs: cepstral coefficients [speech-processing / Speech features]
# ==========================================================================
# WHAT IT IS
# MFCCs go one step further: apply a discrete cosine transform (DCT) to the
# log-mel energies and keep the first 12–13 coefficients. The DCT decorrelates
# neighbouring bands and separates the smooth spectral envelope (the filter —
# low coefficients) from fine detail such as pitch harmonics (high
# coefficients), which are discarded. For log-mel values (2, 1, 0.5, 0.25) the
# DCT-II is (3.75, 1.81, 0.53, 0.21): c₀ is the overall energy, c₁ the tilt,
# and so on. MFCCs dominated classic GMM–HMM recognisers; neural models
# usually take log-mel directly because they can learn their own
# decorrelation.
#
# WHERE YOU USE IT
# MFCCs remain handy for small models, keyword spotting and speaker features.
#
# RUN IT:  python 06_feat-5.py
#

import numpy as np

def dct2(x):
    N = len(x)
    return np.array([sum(x[n] * np.cos(np.pi / N * (n + 0.5) * k) for n in range(N)) for k in range(N)])

logmel = np.array([2.0, 1.0, 0.5, 0.25])
print(dct2(logmel).round(3).tolist())

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# [3.75, 1.808, 0.53, 0.208]
