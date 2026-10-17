# -*- coding: utf-8 -*-
# ==========================================================================
# GANs: generator versus discriminator [neural-networks / Autoencoders, VAEs
# and GANs]
# ==========================================================================
# WHAT IT IS
# A GAN has two networks with opposing goals. The generator G turns random
# noise z into fake samples; the discriminator D outputs the probability that
# a sample is real. They train alternately: D learns to tell real from fake, G
# learns to fool D. The classic objective is the minimax game min_G max_D
# E[log D(x)] + E[log(1 − D(G(z)))]. Practical training is delicate:
# oscillation, vanishing gradients and mode collapse (G repeats a few outputs)
# can occur, so intuition scores on a page are only intuition.
#
# WHERE YOU USE IT
# A GAN has no reconstruction target: the only teacher is the other network.
#
# RUN IT:  python 07_gen-6.py
#

import numpy as np

d_real, d_fake = 0.9, 0.2
d_loss = -(np.log(d_real) + np.log(1 - d_fake))
g_loss = -np.log(d_fake)
print(round(float(d_loss), 4), round(float(g_loss), 4))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 0.3285 1.6094
