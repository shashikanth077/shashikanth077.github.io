# -*- coding: utf-8 -*-
# ==========================================================================
# Sound is a pressure wave [speech-processing / Sound, sampling and speech
# data]
# ==========================================================================
# WHAT IT IS
# Speech starts as tiny, rapid changes in air pressure produced by the vocal
# folds and shaped by the mouth. A microphone turns them into a voltage that
# varies over time. Two numbers describe a pure tone: frequency f (cycles per
# second, Hz — heard as pitch) and amplitude A (size of the swing — heard as
# loudness). A tone is x(t) = A sin(2πft). An adult male voice has a
# fundamental frequency near 100–120 Hz, an adult female voice near 200 Hz;
# the information that makes vowels and consonants distinguishable lies mostly
# between 100 Hz and 8 kHz.
#
# WHERE YOU USE IT
# Everything in speech technology — recognition, synthesis, enhancement —
# works on a waveform or on a transformation of it.
#
# RUN IT:  python 01_sig-0.py
#

import numpy as np

fs = 8000
t = np.arange(0, 0.01, 1 / fs)
x = 0.5 * np.sin(2 * np.pi * 200 * t)
print(len(t), round(float(x.max()), 3), round(float(1 / 200 * 1000), 1), "ms per cycle")

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 80 0.5 5.0 ms per cycle
