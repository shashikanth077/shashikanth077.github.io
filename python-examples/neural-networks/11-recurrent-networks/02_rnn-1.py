# -*- coding: utf-8 -*-
# ==========================================================================
# Unrolling an RNN through time [neural-networks / Recurrent networks]
# ==========================================================================
# WHAT IT IS
# One recurrent neuron computes hₜ = tanh(wₓ·xₜ + wₕ·hₜ₋₁ + b): current input
# plus remembered previous state, squashed to −1…+1. Example weights wₓ = 0.8,
# wₕ = 0.6, b = 0.1 and h₀ = 0. For inputs x = 1, 0.5, −1, 0.8 the states are
# h₁ = tanh(0.9) = 0.716, h₂ = tanh(0.8×0.5 + 0.6×0.716 + 0.1) = 0.731, h₃ =
# −0.256, h₄ = 0.527. Unrolling draws one copy of the neuron per step — all
# copies share the same three numbers.
#
# WHERE YOU USE IT
# The state mixes old and new information in the same few numbers; that is
# both the strength and the weakness of a plain RNN.
#
# RUN IT:  python 02_rnn-1.py
#

import numpy as np

wx, wh, b = 0.8, 0.6, 0.1
h = 0.0
for t, x in enumerate([1, 0.5, -1, 0.8], 1):
    h = np.tanh(wx * x + wh * h + b)
    print(t, x, round(float(h), 4))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 1 1 0.7163
# 2 0.5 0.7305
# 3 -1 -0.2559
# 4 0.8 0.5273
