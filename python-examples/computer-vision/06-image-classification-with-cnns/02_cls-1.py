# -*- coding: utf-8 -*-
# ==========================================================================
# Receptive fields: what a neuron can see [computer-vision / Image
# classification with CNNs]
# ==========================================================================
# WHAT IT IS
# The receptive field of a unit is the patch of the input that can influence
# it. Stacking convolutions grows it: r_new = r + (k − 1) × j where j is the
# distance between neighbouring units in input pixels (the "jump"), and
# strides or pooling multiply j. Network 3×3 conv → 2×2 pool → 3×3 conv → 2×2
# pool → 3×3 conv: after the first conv r = 3 (j = 1); after pooling r = 4, j
# = 2; after the second conv r = 8; after pooling r = 10, j = 4; after the
# third conv r = 18. Deep layers therefore see large context — enough to
# recognise a whole object.
#
# WHERE YOU USE IT
# If the receptive field is smaller than the object, the network cannot see
# the whole thing: add depth, pooling or dilation.
#
# RUN IT:  python 02_cls-1.py
#

layers = [("conv", 3, 1), ("pool", 2, 2), ("conv", 3, 1), ("pool", 2, 2), ("conv", 3, 1)]
r, j = 1, 1
for name, k, s in layers:
    r = r + (k - 1) * j
    j = j * s
    print(name, "receptive field", r, "jump", j)

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# conv receptive field 3 jump 1
# pool receptive field 4 jump 2
# conv receptive field 8 jump 2
# pool receptive field 10 jump 4
# conv receptive field 18 jump 4
