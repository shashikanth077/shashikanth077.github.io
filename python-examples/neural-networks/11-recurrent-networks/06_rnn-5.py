# -*- coding: utf-8 -*-
# ==========================================================================
# GRU: fewer gates, one state [neural-networks / Recurrent networks]
# ==========================================================================
# WHAT IT IS
# A GRU merges cell and hidden state into one and uses two gates: reset r (how
# much of the old state to use when proposing new content) and update z (how
# much of the candidate to blend in). With the convention used here, z scales
# the candidate: hₜ = (1 − z)·hₜ₋₁ + z·h̃ₜ (other texts swap z and 1 − z).
# Example: h₍ₜ₋₁₎ = 0.8, candidate h̃ = 0.716, z = 0.3 → h = 0.7×0.8 +
# 0.3×0.716 = 0.775. Fewer parameters than an LSTM and often just as accurate.
#
# WHERE YOU USE IT
# Check each library's z convention before comparing equations.
#
# RUN IT:  python 06_rnn-5.py
#

h_prev, cand, z = 0.8, 0.716, 0.3
print(round((1 - z) * h_prev + z * cand, 4))
for z in (0.0, 0.5, 1.0):
    print(z, round((1 - z) * h_prev + z * cand, 4))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 0.7748
# 0.0 0.8
# 0.5 0.758
# 1.0 0.716
