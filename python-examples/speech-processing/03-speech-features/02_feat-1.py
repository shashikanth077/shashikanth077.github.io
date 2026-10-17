# -*- coding: utf-8 -*-
# ==========================================================================
# Pre-emphasis: boosting the highs [speech-processing / Speech features]
# ==========================================================================
# WHAT IT IS
# Speech energy falls with frequency (about −6 dB per octave), so
# high-frequency details such as "s" and "t" are weak and easily lost. A
# simple first-order high-pass filter y[n] = x[n] − α x[n−1] with α ≈ 0.97
# flattens the spectrum before analysis. A constant (DC) signal (1, 1, 1)
# becomes (1, 0.03, 0.03): slow components are suppressed, rapid changes
# survive. The filter also removes the DC offset that some microphones add. It
# is a cheap first step in classical front ends; neural models can learn it,
# but it is still common.
#
# WHERE YOU USE IT
# Pre-emphasis amplifies high-frequency noise too, so apply it only when the
# signal-to-noise ratio is reasonable.
#
# RUN IT:  python 02_feat-1.py
#

import numpy as np

x = np.array([1.0, 1.0, 1.0])
print(np.round(x[1:] - 0.97 * x[:-1], 2).tolist())
y = np.array([0.0, 1.0, 0.0, 1.0, 0.0])
print(np.round(y[1:] - 0.97 * y[:-1], 2).tolist())

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# [0.03, 0.03]
# [1.0, -0.97, 1.0, -0.97]
