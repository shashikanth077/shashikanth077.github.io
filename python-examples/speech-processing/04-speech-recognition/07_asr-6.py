# -*- coding: utf-8 -*-
# ==========================================================================
# Decoding with a language model [speech-processing / Speech recognition]
# ==========================================================================
# WHAT IT IS
# A network gives per-step probabilities; decoding turns them into text.
# Greedy decoding takes the best symbol at each step and collapses. Beam
# search keeps the B best partial transcripts and, with shallow fusion, adds a
# weighted language-model score: score = log P_acoustic + λ log P_LM +
# β·length. The language model fixes homophones and rare words ("wreck a nice
# beach"); λ ≈ 0.3–0.7 and a length bonus β stop it from preferring short
# outputs. Domain vocabulary (names, product terms) is added with custom
# language models or hot-word boosting.
#
# WHERE YOU USE IT
# Tune λ and β on a development set from the target domain, not on the test
# set.
#
# RUN IT:  python 07_asr-6.py
#

lam, beta = 0.5, 1.0
cands = {"recognise speech": (-4.0, -6.0, 2), "wreck a nice beach": (-3.8, -12.0, 4)}
for text, (ac, lm, n) in cands.items():
    print(f"{text:20s}", ac + lam * lm + beta * n)

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# recognise speech     -5.0
# wreck a nice beach   -5.800000000000001
