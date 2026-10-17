# -*- coding: utf-8 -*-
# ==========================================================================
# Echo cancellation and reverberation [speech-processing / Enhancement and
# microphone arrays]
# ==========================================================================
# WHAT IT IS
# In a call the far-end voice plays from the loudspeaker and re-enters the
# microphone as an echo. Acoustic echo cancellation (AEC) models the
# loudspeaker-to-microphone path with an adaptive filter h and subtracts the
# predicted echo: e[n] = mic[n] − hᵀ x[n]. The filter is updated by the NLMS
# rule h ← h + μ e[n] x[n] / (‖x‖² + ε). Starting from h = 0 with x = (1, 0),
# true echo path 0.5 and μ = 1: error 0.5 at first, then h = 0.5 and the error
# vanishes. Dereverberation removes the room's long decay (RT60 = time for the
# sound to fall 60 dB); typical offices have RT60 ≈ 0.3–0.6 s.
#
# WHERE YOU USE IT
# Double-talk (both sides speaking) is the hard case: adaptation must pause or
# the filter diverges.
#
# RUN IT:  python 04_enh-3.py
#

import numpy as np

h = np.zeros(2)
x = np.array([1.0, 0.0])
mic = 0.5 * x[0]
e = mic - h @ x
h = h + 1.0 * e * x / (x @ x + 1e-8)
print(round(float(e), 3), h.round(3).tolist(), round(float(mic - h @ x), 6))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 0.5 [0.5, 0.0] 0.0
