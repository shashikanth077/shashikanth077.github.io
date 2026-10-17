# -*- coding: utf-8 -*-
# ==========================================================================
# Stereo vision and depth from disparity [computer-vision / Geometry and
# cameras]
# ==========================================================================
# WHAT IT IS
# Two cameras a distance B (the baseline) apart see the same point at slightly
# different horizontal positions; the difference is the disparity d.
# Triangulation gives Z = f·B / d. With f = 700 px, B = 0.1 m and d = 14 px: Z
# = 700 × 0.1 / 14 = 5 m. Nearby points have large disparity, far ones small,
# so depth precision falls quickly with distance: at d = 1 px the depth is 70
# m, and an error of one pixel there is enormous. Finding which pixel matches
# which (stereo matching) is the hard part; textureless or repeated regions
# are ambiguous.
#
# WHERE YOU USE IT
# A wider baseline improves far-range accuracy but makes matching harder and
# the rig bulkier.
#
# RUN IT:  python 05_geom-4.py
#

f, B = 700.0, 0.1
for d in (50, 14, 7, 1):
    print(d, round(f * B / d, 2))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 50 1.4
# 14 5.0
# 7 10.0
# 1 70.0
