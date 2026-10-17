# -*- coding: utf-8 -*-
# ==========================================================================
# Putting it together: image stitching [computer-vision / Features and
# matching]
# ==========================================================================
# WHAT IT IS
# A panorama combines every idea of this area: detect keypoints and
# descriptors in two overlapping photos; match them with the ratio test;
# estimate the homography with RANSAC; warp one image into the other's frame
# with interpolation; blend the overlap to hide seams and exposure
# differences. Each step can fail in its own way (too few features in a blank
# sky, parallax from a moving camera, moving people), so the pipeline checks
# the number of inliers and refuses to stitch when it is too low.
#
# WHERE YOU USE IT
# The same pipeline underlies visual odometry, image registration and
# augmented reality.
#
# RUN IT:  python 06_feat-5.py
#

steps = ["detect keypoints", "describe", "match + ratio test", "RANSAC homography", "warp + interpolate", "blend"]
fails = ["blank regions", "lighting change", "repeated texture", "too few inliers", "parallax", "visible seams"]
for s, f in zip(steps, fails):
    print(f"{s:20s} -> {f}")

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# detect keypoints     -> blank regions
# describe             -> lighting change
# match + ratio test   -> repeated texture
# RANSAC homography    -> too few inliers
# warp + interpolate   -> parallax
# blend                -> visible seams
