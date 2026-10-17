# -*- coding: utf-8 -*-
# ==========================================================================
# Latent space: not every point decodes to something real [neural-networks /
# Autoencoders, VAEs and GANs]
# ==========================================================================
# WHAT IT IS
# A plain autoencoder only learned to reconstruct the training images; it
# makes no promise that a random point in latent space decodes to a realistic
# sample. Codes of one digit class form clusters with gaps between them; a
# point in a gap decodes to a blurry or meaningless image. Dense regions are
# the places where reconstruction is trustworthy. That is why we cannot simply
# "sample the latent space" of an ordinary autoencoder to generate new data.
#
# WHERE YOU USE IT
# The 2-D map is illustrative; real latent spaces have tens of dimensions.
#
# RUN IT:  python 04_gen-3.py
#

import numpy as np

centres = np.array([[-2.0, 0.0], [2.0, 0.0]])
points = np.array([[-1.8, 0.2], [0.0, 0.0], [2.1, -0.3]])
for p in points:
    d = np.linalg.norm(centres - p, axis=1).min()
    print(p.tolist(), round(float(d), 2), "ok" if d < 1 else "gap")

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# [-1.8, 0.2] 0.28 ok
# [0.0, 0.0] 2.0 gap
# [2.1, -0.3] 0.32 ok
