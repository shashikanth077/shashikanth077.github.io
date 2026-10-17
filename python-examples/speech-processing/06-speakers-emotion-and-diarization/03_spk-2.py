# -*- coding: utf-8 -*-
# ==========================================================================
# Verification scores, thresholds and EER [speech-processing / Speakers,
# emotion and diarization]
# ==========================================================================
# WHAT IT IS
# A verification system outputs a similarity; the threshold decides the
# trade-off between two errors: false rejection (genuine user refused) and
# false acceptance (impostor accepted). Raising the threshold lowers false
# acceptance and raises false rejection. The equal error rate (EER) is the
# operating point where both are equal — a single summary number (lower is
# better; state-of-the-art systems reach 1% or less on benchmarks). Example:
# genuine scores (0.8, 0.7, 0.9, 0.6) and impostor scores (0.2, 0.4, 0.65,
# 0.1): at threshold 0.62 the false-rejection rate is 1/4 (0.6 rejected) and
# false acceptance 1/4 (0.65 accepted): EER ≈ 25% for this toy data.
#
# WHERE YOU USE IT
# Pick the deployment threshold from the cost of each error, not from the EER
# point.
#
# RUN IT:  python 03_spk-2.py
#

import numpy as np

genuine = np.array([0.8, 0.7, 0.9, 0.6])
impostor = np.array([0.2, 0.4, 0.65, 0.1])
for th in (0.3, 0.5, 0.62, 0.75):
    print(th, float((genuine < th).mean()), float((impostor >= th).mean()))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 0.3 0.0 0.5
# 0.5 0.0 0.25
# 0.62 0.25 0.25
# 0.75 0.5 0.0
