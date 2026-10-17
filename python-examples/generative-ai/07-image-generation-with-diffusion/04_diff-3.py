# -*- coding: utf-8 -*-
# ==========================================================================
# Conditioning and classifier-free guidance [generative-ai / Image generation
# with diffusion]
# ==========================================================================
# WHAT IT IS
# To obey a text prompt the network gets the prompt as an extra input (the
# embedding of a text encoder, injected through cross-attention): ε_θ(x_t, t,
# c). Classifier-free guidance makes the image follow the prompt more strongly
# by extrapolating from the unconditional prediction towards the conditional
# one: ε̂ = ε_uncond + w (ε_cond − ε_uncond). With ε_uncond = 0.1, ε_cond =
# 0.3 and guidance scale w = 7.5: ε̂ = 0.1 + 7.5 × 0.2 = 1.6. w = 1 is the
# plain conditional model; larger w gives stronger prompt adherence and less
# diversity (and, if too large, saturated or distorted images). Typical
# scales: 5–9. A negative prompt replaces the unconditional branch to steer
# away from unwanted content.
#
# WHERE YOU USE IT
# The guidance scale is the main creative dial in text-to-image tools.
#
# RUN IT:  python 04_diff-3.py
#

eps_u, eps_c = 0.1, 0.3
for w in (1.0, 3.0, 7.5, 15.0):
    print(w, round(eps_u + w * (eps_c - eps_u), 3))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 1.0 0.3
# 3.0 0.7
# 7.5 1.6
# 15.0 3.1
