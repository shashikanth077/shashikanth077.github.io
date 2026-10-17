# -*- coding: utf-8 -*-
# ==========================================================================
# Voice activity detection and normalisation [speech-processing / Speech
# features]
# ==========================================================================
# WHAT IT IS
# Most recordings contain silence. Voice activity detection (VAD) marks the
# frames that contain speech so that silence is skipped (saves compute),
# endpoints are found (where does the command end?) and the transcriber does
# not hallucinate words from noise. A simple VAD thresholds the frame energy
# relative to the noise floor; modern ones are small neural networks. Cepstral
# mean and variance normalisation (CMVN) subtracts the per-utterance mean and
# divides by the standard deviation of each feature, removing constant channel
# effects: features (3, 5, 7) become (−1.22, 0, 1.22). Together, VAD + CMVN
# make features comparable across microphones and rooms.
#
# WHERE YOU USE IT
# Set VAD hangover (keep a few frames after speech) so word endings are not
# clipped.
#
# RUN IT:  python 08_feat-7.py
#

import numpy as np

x = np.array([3.0, 5.0, 7.0])
print(((x - x.mean()) / x.std()).round(2).tolist())
energy = np.array([0.001, 0.002, 0.5, 0.9, 0.7, 0.003, 0.001])
floor = np.median(energy)
print((energy > 5 * floor).astype(int).tolist())

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# [-1.22, 0.0, 1.22]
# [0, 0, 1, 1, 1, 0, 0]
