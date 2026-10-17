# -*- coding: utf-8 -*-
# ==========================================================================
# Time–frequency masking and neural enhancement [speech-processing /
# Enhancement and microphone arrays]
# ==========================================================================
# WHAT IT IS
# Instead of subtracting, estimate a mask M(t, f) between 0 and 1 and multiply
# the noisy spectrogram by it. The ideal ratio mask is M = |S|/(|S| + |N|):
# where speech dominates M ≈ 1, where noise dominates M ≈ 0. For |S| = 4, |N|
# = 1 the mask is 0.8; for |S| = 1, |N| = 4 it is 0.2. A neural network learns
# to predict M from the noisy features, trained on clean speech mixed with
# many noises at random SNRs. Modern models work directly on the waveform or
# predict complex masks, and also handle separation of overlapping talkers
# (the cocktail-party problem).
#
# WHERE YOU USE IT
# Always include real recordings in testing: models trained on synthetic
# mixtures can disappoint in the wild.
#
# RUN IT:  python 02_enh-1.py
#

import numpy as np

S = np.array([4.0, 1.0, 3.0])
N = np.array([1.0, 4.0, 3.0])
M = S / (S + N)
print(M.round(2).tolist(), (M * (S + N)).round(2).tolist())

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# [0.8, 0.2, 0.5] [4.0, 1.0, 3.0]
