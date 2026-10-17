# -*- coding: utf-8 -*-
# ==========================================================================
# Neural acoustic models [speech-processing / Speech recognition]
# ==========================================================================
# WHAT IT IS
# Deep networks replaced the GMM: given a window of log-mel frames, predict
# which phoneme state (or character, or word piece) is being spoken.
# Architectures progressed from feed-forward networks to recurrent (LSTM) and
# convolutional models, and now transformers and Conformers (convolution for
# local patterns plus attention for global context). The encoder usually
# downsamples time by 4×–8×: 100 frames per second become 25–12 label steps
# per second, since a word piece lasts several frames. Training needs hundreds
# to hundreds of thousands of hours; data augmentation (SpecAugment: mask
# random time and frequency stripes) is standard.
#
# WHERE YOU USE IT
# SpecAugment is almost free and often gives the biggest single accuracy gain
# for small datasets.
#
# RUN IT:  python 04_asr-3.py
#

import numpy as np

frames = np.arange(100)
for factor in (1, 4, 8):
    print(factor, len(frames[::factor]), "steps per second")
S = np.ones((20, 10))
S[5:8, :] = 0
S[:, 2:4] = 0
print(int((S == 0).sum()), "masked cells of", S.size)

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 1 100 steps per second
# 4 25 steps per second
# 8 13 steps per second
# 64 masked cells of 200
