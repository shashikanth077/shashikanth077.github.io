# -*- coding: utf-8 -*-
# ==========================================================================
# LSTM: a gated memory cell [neural-networks / Recurrent networks]
# ==========================================================================
# WHAT IT IS
# An LSTM adds a cell state c running alongside h, and three sigmoid gates
# (values 0–1, "how much"): forget f, input i, output o, plus a tanh candidate
# g. cₜ = fₜ ⊙ cₜ₋₁ + iₜ ⊙ gₜ, hₜ = oₜ ⊙ tanh(cₜ). Example: f = 0.9, i = 0.5,
# g = 0.6, o = 0.8, previous c = 2.0 → c = 0.9×2.0 + 0.5×0.6 = 2.1 and h = 0.8
# × tanh(2.1) = 0.776. Setting f≈1 lets information (and gradient) flow along
# the cell state almost unchanged — the cure for vanishing gradients. The
# gates themselves are computed from [hₜ₋₁, xₜ] with learned weights.
#
# WHERE YOU USE IT
# Keep the important detail of a long complaint, discard filler phrases: that
# is what the gates learn.
#
# RUN IT:  python 05_rnn-4.py
#

import numpy as np

f, i, o, g, c_prev = 0.9, 0.5, 0.8, 0.6, 2.0
c = f * c_prev + i * g
h = o * np.tanh(c)
print(round(c, 3), round(float(h), 4))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 2.1 0.7764
