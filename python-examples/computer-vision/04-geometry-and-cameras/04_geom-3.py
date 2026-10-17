# -*- coding: utf-8 -*-
# ==========================================================================
# The pinhole camera model [computer-vision / Geometry and cameras]
# ==========================================================================
# WHAT IT IS
# A camera maps the 3-D world onto the image plane. In the pinhole model a
# point (X, Y, Z) in camera coordinates projects to x = f·X/Z, y = f·Y/Z:
# distant objects (large Z) appear smaller. With focal length f = 800 pixels,
# a point 2 m to the side at depth 10 m lands 160 pixels from the centre; at
# depth 5 m it lands 320 pixels away. Adding the principal point (c_x, c_y)
# gives pixel coordinates u = f X/Z + c_x, v = f Y/Z + c_y; (1, 0.5, 5) with c
# = (320, 240) projects to (480, 320). Real lenses add distortion that
# calibration removes.
#
# WHERE YOU USE IT
# Depth is lost in projection: one image cannot tell a small near object from
# a large far one.
#
# RUN IT:  python 04_geom-3.py
#

import numpy as np

f, cx, cy = 800.0, 320.0, 240.0
K = np.array([[f, 0, cx], [0, f, cy], [0, 0, 1]])
P = np.array([1.0, 0.5, 5.0])
u = K @ P
print((u[:2] / u[2]).tolist())
print(f * 2 / 10, f * 2 / 5)

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# [480.0, 320.0]
# 160.0 320.0
