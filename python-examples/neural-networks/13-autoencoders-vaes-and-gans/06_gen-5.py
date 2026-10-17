# -*- coding: utf-8 -*-
# ==========================================================================
# The VAE loss and the KL term [neural-networks / Autoencoders, VAEs and GANs]
# ==========================================================================
# WHAT IT IS
# The loss has two parts: L = reconstruction + β·KL(q(z|x) ‖ N(0,I)). KL for a
# diagonal Gaussian is −½ Σ(1 + log σ² − μ² − σ²). It is zero when μ = 0 and σ
# = 1 and grows as the encoder drifts from the standard normal prior — which
# keeps the latent space compact and sample-able. Example μ = 0.5, log σ² =
# −0.4: −½(1 − 0.4 − 0.25 − 0.670) = 0.160. β balances reconstruction against
# regularity; the choice of mean vs sum in the reconstruction term changes the
# scale, so compare loss terms carefully.
#
# WHERE YOU USE IT
# After training, sample z ~ N(0,I) and decode it to generate new digits.
#
# RUN IT:  python 06_gen-5.py
#

import numpy as np

mu, logvar = 0.5, -0.4
kl = -0.5 * (1 + logvar - mu ** 2 - np.exp(logvar))
print(round(float(kl), 4))
print(-0.5 * (1 + 0 - 0 - 1))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 0.1602
# -0.0
