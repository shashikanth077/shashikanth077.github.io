# -*- coding: utf-8 -*-
# ==========================================================================
# Classic ASR: HMMs with Gaussian mixtures [speech-processing / Speech
# recognition]
# ==========================================================================
# WHAT IT IS
# Before deep learning, each phoneme was modelled by a short left-to-right
# hidden Markov model (typically 3 states: onset, middle, offset), and each
# state emitted MFCC vectors from a Gaussian mixture model (GMM). A word is a
# chain of its phonemes' HMMs; a sentence a chain of words. Decoding uses the
# Viterbi algorithm to find the most probable state path through the combined
# network, weighting acoustic scores with the language model. Self-loops let a
# state last several frames: with a self-loop probability of 0.8 the expected
# duration is 1/(1 − 0.8) = 5 frames = 50 ms.
#
# WHERE YOU USE IT
# The HMM structure still appears inside hybrid and CTC/transducer systems as
# the notion of alignment between frames and labels.
#
# RUN IT:  python 03_asr-2.py
#

import numpy as np

p_stay = 0.8
print(1 / (1 - p_stay), 1 / (1 - p_stay) * 10, "ms")
rng = np.random.default_rng(0)
durations = [int(rng.geometric(1 - p_stay)) for _ in range(20000)]
print(round(float(np.mean(durations)), 2))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 5.000000000000001 50.00000000000001 ms
# 4.96
