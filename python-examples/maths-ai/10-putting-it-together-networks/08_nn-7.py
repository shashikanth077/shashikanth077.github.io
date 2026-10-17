# -*- coding: utf-8 -*-
# ==========================================================================
# Convolution: a sliding filter [maths-ai / Putting it together: networks]
# ==========================================================================
# WHAT IT IS
# A convolution slides a small filter (kernel) along the input and takes a dot
# product at every position. The filter [1, 0, −1] responds to changes, an
# edge detector. The same few weights are reused everywhere, which is why CNNs
# need far fewer parameters than dense layers. Output size: (n − f + 2p) / s +
# 1.
#
# WHERE YOU USE IT
# CNNs detect edges, textures and shapes with sliding filters; the same idea
# works on time series and audio.
#
# RUN IT:  python 08_nn-7.py
#

x = [1, 2, 3, 4, 5]
k = [1, 0, -1]
out = [sum(x[i + j] * k[j] for j in range(3)) for i in range(len(x) - 2)]
print(out)
n, f, p, s = 5, 3, 0, 1
print((n - f + 2 * p) // s + 1)

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# [-2, -2, -2]
# 3
