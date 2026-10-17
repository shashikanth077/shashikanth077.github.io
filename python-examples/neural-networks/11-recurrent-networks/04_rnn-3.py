# -*- coding: utf-8 -*-
# ==========================================================================
# Backpropagation through time and vanishing gradients [neural-networks /
# Recurrent networks]
# ==========================================================================
# WHAT IT IS
# The same weights appear at every step, so the gradient from a late output
# flows back through every step, multiplying by a factor each time. If that
# factor is 0.65, then after 5 steps it is 0.116, after 10 steps 0.0135, after
# 20 steps 0.00018 — early words stop influencing learning (vanishing
# gradients). A factor of 1.2 explodes: 1.2²⁰ ≈ 38 (exploding gradients).
# Gradient clipping tames explosions but does not by itself give long-term
# memory. That is why gated networks (LSTM, GRU) exist.
#
# WHERE YOU USE IT
# Illustrative constant factor, not a trained model; real factors depend on
# weights and the activation slopes.
#
# RUN IT:  python 04_rnn-3.py
#

for factor in (0.65, 1.0, 1.2):
    print(factor, [round(factor ** n, 5) for n in (1, 5, 10, 20)])

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 0.65 [0.65, 0.11603, 0.01346, 0.00018]
# 1.0 [1.0, 1.0, 1.0, 1.0]
# 1.2 [1.2, 2.48832, 6.19174, 38.3376]
