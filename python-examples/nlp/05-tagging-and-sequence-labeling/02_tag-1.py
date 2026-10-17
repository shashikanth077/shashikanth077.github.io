# -*- coding: utf-8 -*-
# ==========================================================================
# Hidden Markov models: tags as hidden states [nlp / Tagging and sequence
# labeling]
# ==========================================================================
# WHAT IT IS
# An HMM tagger treats the tags as hidden states that generate the words. It
# needs: start probabilities π (how likely a tag begins a sentence),
# transition probabilities A (tag → next tag, e.g. D → N is likely) and
# emission probabilities B (tag → word, e.g. N emits "dog"). The probability
# of a tagged sentence is π(t₁)B(w₁|t₁) × Π A(tᵢ₋₁→tᵢ) B(wᵢ|tᵢ). For "the dog
# barks" tagged D N V: 0.6×0.8 × 0.9×0.4 × 0.6×0.3 = 0.0311.
#
# WHERE YOU USE IT
# HMMs make the Markov assumption: a tag depends only on the previous tag.
# That is why richer models (CRFs, neural taggers) beat them.
#
# RUN IT:  python 02_tag-1.py
#

import numpy as np

states = ["D", "N", "V"]
pi = np.array([0.6, 0.3, 0.1])
A = np.array([[0.05, 0.9, 0.05], [0.1, 0.3, 0.6], [0.5, 0.3, 0.2]])
B = {"D": {"the": 0.8}, "N": {"dog": 0.4, "barks": 0.05}, "V": {"dog": 0.01, "barks": 0.3}}
p = pi[0] * B["D"]["the"] * A[0, 1] * B["N"]["dog"] * A[1, 2] * B["V"]["barks"]
print(round(float(p), 5))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 0.0311
