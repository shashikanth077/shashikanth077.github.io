# -*- coding: utf-8 -*-
# ==========================================================================
# How speech is made: the source–filter model [speech-processing / Speech
# features]
# ==========================================================================
# WHAT IT IS
# Speech production separates into a source and a filter. For voiced sounds
# (vowels, "m", "z") the vocal folds vibrate at the pitch f₀ and produce a
# buzz rich in harmonics; for unvoiced sounds ("s", "f") air rushes through a
# constriction and produces noise. The vocal tract — throat, mouth, nose, lips
# — then acts as a filter whose resonances, the formants F1, F2, F3, boost
# certain frequencies. The vowel /a/ has F1 ≈ 700 Hz, F2 ≈ 1,200 Hz; /i/ has
# F1 ≈ 300 Hz, F2 ≈ 2,300 Hz. Pitch says who and how (melody); formants say
# which vowel.
#
# WHERE YOU USE IT
# ASR features try to keep the filter (what was said) and discard the source
# (who said it, at what pitch).
#
# RUN IT:  python 01_feat-0.py
#

import numpy as np

f0 = 120
harmonics = np.arange(1, 8) * f0
formants = {"a": (700, 1200), "i": (300, 2300)}
gain = lambda f, F, bw=150: 1 / (1 + ((f - F) / bw) ** 2)
for v, (f1, f2) in formants.items():
    spec = [round(float(gain(h, f1) + gain(h, f2)), 2) for h in harmonics]
    print(v, harmonics.tolist(), spec)

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# a [120, 240, 360, 480, 600, 720, 840] [0.08, 0.12, 0.19, 0.36, 0.75, 1.07, 0.68]
# i [120, 240, 360, 480, 600, 720, 840] [0.41, 0.87, 0.87, 0.42, 0.21, 0.12, 0.08]
