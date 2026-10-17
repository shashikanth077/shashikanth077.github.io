# -*- coding: utf-8 -*-
# ==========================================================================
# Channels, filters and counting convolution parameters [neural-networks /
# Convolutional networks]
# ==========================================================================
# WHAT IT IS
# One filter spans every input channel and produces ONE feature map; F filters
# give F maps stacked into the output tensor. Parameters = k × k × C_in × F +
# F. 3×3, 1 input channel, 32 filters: 9 × 32 + 32 = 320. 3×3, 32 → 64: 9 × 32
# × 64 + 64 = 18,496. 3×3 on RGB with 32 filters: 27 × 32 + 32 = 896. Note how
# few weights compared with a dense layer on the same image — and the count
# does not depend on image size.
#
# WHERE YOU USE IT
# Output depth equals the number of filters; kernel size and padding decide
# height and width.
#
# RUN IT:  python 07_cnn-6.py
#

def conv_params(k, c_in, f):
    return k * k * c_in * f + f

print(conv_params(3, 1, 32), conv_params(3, 32, 64), conv_params(3, 3, 32))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 320 18496 896
