# -*- coding: utf-8 -*-
# ==========================================================================
# Evaluating synthetic speech [speech-processing / Speech synthesis]
# ==========================================================================
# WHAT IT IS
# No formula says whether speech sounds good. The standard is the Mean Opinion
# Score (MOS): listeners rate naturalness from 1 (bad) to 5 (excellent) and
# the ratings are averaged, with a confidence interval. Ratings 4, 5, 4, 3, 5
# give MOS = 4.2. Good TTS reaches 4.3–4.6, recorded human speech about
# 4.5–4.7. Other checks: intelligibility (have listeners or an ASR system
# transcribe the output and compute WER), speaker similarity (cosine of
# speaker embeddings), and objective measures such as mel-cepstral distortion.
# Use enough listeners and sentences: 20 × 20 ratings is a minimum for a
# stable comparison.
#
# WHERE YOU USE IT
# Automatic MOS predictors save time during development, but final decisions
# need human listening tests.
#
# RUN IT:  python 06_tts-5.py
#

import numpy as np

r = np.array([4, 5, 4, 3, 5])
mos = r.mean()
ci = 1.96 * r.std(ddof=1) / np.sqrt(len(r))
print(float(mos), round(float(ci), 2))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 4.2 0.73
