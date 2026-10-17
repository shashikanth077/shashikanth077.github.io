# -*- coding: utf-8 -*-
# ==========================================================================
# Optical flow: motion between frames [computer-vision / Motion, video and
# tracking]
# ==========================================================================
# WHAT IT IS
# Optical flow estimates how each pixel moved between two frames. The
# brightness-constancy assumption gives one equation per pixel: Iₓu + I_yv +
# I_t = 0, with spatial gradients Iₓ, I_y, temporal change I_t and unknown
# velocity (u, v). One equation, two unknowns (the aperture problem) — so
# Lucas–Kanade assumes the whole window moves together and solves the
# least-squares system. Window values Iₓ = (1, 0, 1, 0), I_y = (0, 1, 0, 1),
# I_t = (−2, −1, −2, −1) give AᵀA = diag(2, 2) and Aᵀb = (4, 2): velocity (u,
# v) = (2, 1). Deep networks (RAFT) now give much better dense flow.
#
# WHERE YOU USE IT
# The system is solvable only where the window has gradients in two directions
# — corners, again.
#
# RUN IT:  python 01_video-0.py
#

import numpy as np

Ix, Iy, It = np.array([1.0, 0, 1, 0]), np.array([0, 1.0, 0, 1]), np.array([-2.0, -1, -2, -1])
A = np.stack([Ix, Iy], axis=1)
uv = np.linalg.lstsq(A, -It, rcond=None)[0]
print((A.T @ A).tolist(), uv.round(3).tolist())

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# [[2.0, 0.0], [0.0, 2.0]] [2.0, 1.0]
