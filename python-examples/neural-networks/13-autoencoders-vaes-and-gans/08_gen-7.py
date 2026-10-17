# -*- coding: utf-8 -*-
# ==========================================================================
# The GAN losses in numbers [neural-networks / Autoencoders, VAEs and GANs]
# ==========================================================================
# WHAT IT IS
# The discriminator's loss is −[log D(x) + log(1 − D(G(z)))]; the
# (non-saturating) generator loss is −log D(G(z)). If D says 0.9 for the real
# image and 0.2 for the fake: D-loss = −(ln 0.9 + ln 0.8) = 0.328, G-loss =
# −ln 0.2 = 1.609. As G improves, D(G(z)) rises towards 0.5 — D can no longer
# tell — and G-loss falls to ln 2 = 0.693. At that balance D is guessing: the
# equilibrium of the game.
#
# WHERE YOU USE IT
# A discriminator that wins too easily gives the generator no useful gradient;
# keep the two roughly matched.
#
# RUN IT:  python 08_gen-7.py
#

import numpy as np

for d_fake in (0.05, 0.2, 0.5):
    print(d_fake, round(float(-np.log(d_fake)), 4))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 0.05 2.9957
# 0.2 1.6094
# 0.5 0.6931
