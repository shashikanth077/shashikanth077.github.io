# -*- coding: utf-8 -*-
# ==========================================================================
# Geometric transforms: translate, scale, rotate [computer-vision / Geometry
# and cameras]
# ==========================================================================
# WHAT IT IS
# Moving, resizing or turning an image maps every point (x, y) to a new place.
# Translation: (x + tₓ, y + t_y). Scaling: (sₓx, s_yy). Rotation by θ: (x cos
# θ − y sin θ, x sin θ + y cos θ); the point (1, 0) rotated by 30° lands at
# (0.866, 0.5). Rigid transforms (rotation + translation) preserve lengths and
# angles; similarity adds uniform scale; affine adds shear and non-uniform
# scale and keeps parallel lines parallel; projective (homography) does not
# even keep parallelism.
#
# WHERE YOU USE IT
# In image coordinates y points down, so a "counter-clockwise" formula appears
# clockwise on screen.
#
# RUN IT:  python 01_geom-0.py
#

import numpy as np

t = np.radians(30)
R = np.array([[np.cos(t), -np.sin(t)], [np.sin(t), np.cos(t)]])
print((R @ [1, 0]).round(3).tolist(), round(float(np.linalg.det(R)), 3))
print(np.linalg.norm(R @ [3, 4]))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# [0.866, 0.5] 1.0
# 5.0
