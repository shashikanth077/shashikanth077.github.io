# -*- coding: utf-8 -*-
# ==========================================================================
# Stride and padding: the output size formula [neural-networks / Convolutional
# networks]
# ==========================================================================
# WHAT IT IS
# Stride is how far the filter jumps; padding adds border zeros. Output size =
# floor((n + 2p − k)/s) + 1. n = 6, k = 3: valid (p = 0), stride 1 → 4; stride
# 2 → floor(3/2)+1 = 2. "Same" padding (p = 1 for k = 3) keeps 6 at stride 1;
# at stride 2 it gives ceil(6/2) = 3, not 6. Move the sliders: each setting
# changes how many positions fit.
#
# WHERE YOU USE IT
# "Same" keeps the size only when stride is 1.
#
# RUN IT:  python 06_cnn-5.py
#

import math

def out_size(n, k, p=0, s=1):
    return (n + 2 * p - k) // s + 1

print(out_size(6, 3), out_size(6, 3, 0, 2), out_size(6, 3, 1, 1), out_size(6, 3, 1, 2), math.ceil(6 / 2))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 4 2 6 3 3
