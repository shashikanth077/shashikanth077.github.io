# -*- coding: utf-8 -*-
# ==========================================================================
# Mask R-CNN: detection plus masks [computer-vision / Semantic and instance
# segmentation]
# ==========================================================================
# WHAT IT IS
# Mask R-CNN extends Faster R-CNN with a third branch. After the region
# proposal network and RoI alignment (which samples features at fractional
# positions with bilinear interpolation, avoiding the rounding of RoI
# pooling), each region gets (1) a class, (2) a refined box and (3) a small
# binary mask (e.g. 28 × 28) that is resized into the box. One mask per class
# is predicted and the one for the predicted class is used, so classes do not
# compete for pixels. It is the standard instance-segmentation baseline.
#
# WHERE YOU USE IT
# Mask quality depends on the RoI resolution; thin structures suffer from the
# 28 × 28 mask size.
#
# RUN IT:  python 04_sem-3.py
#

def bilinear(x, y, tl=10, tr=20, bl=30, br=40):
    return (1 - x) * (1 - y) * tl + x * (1 - y) * tr + (1 - x) * y * bl + x * y * br

print(bilinear(0.3, 0.6), round(0.3 * 7))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 24.999999999999996 2
