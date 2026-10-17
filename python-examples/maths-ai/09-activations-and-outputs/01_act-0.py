# -*- coding: utf-8 -*-
# ==========================================================================
# Why networks need non-linear activations [maths-ai / Activations and
# outputs]
# ==========================================================================
# WHAT IT IS
# Stacking linear layers gives another linear layer: two steps of "multiply by
# w" collapse into one bigger multiplication. The network could never bend. A
# non-linear activation between layers (ReLU, sigmoid, tanh) breaks that
# collapse and lets many layers represent curved, complicated relationships.
#
# WHERE YOU USE IT
# Without activations a 100-layer network is no more powerful than a single
# linear model.
#
# RUN IT:  python 01_act-0.py
#

w1, w2 = 2, 3
x = 5
print(w2 * (w1 * x), (w2 * w1) * x)      # two layers = one layer
relu = lambda z: max(0, z)
print(w2 * relu(w1 * -x))                  # a ReLU breaks the collapse

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 30 30
# 0
