# -*- coding: utf-8 -*-
# ==========================================================================
# A complete CNN and its parameter count [neural-networks / Convolutional
# networks]
# ==========================================================================
# WHAT IT IS
# The lecture's MNIST model: 28×28×1 → Conv2D(32, 3×3, same) → MaxPool(2) →
# Conv2D(64, 3×3, same) → MaxPool(2) → Flatten → Dense(100, ReLU) → Dense(10,
# softmax). Shapes: 28×28×32 → 14×14×32 → 14×14×64 → 7×7×64 → 3136 → 100 → 10.
# Parameters: 320 + 18,496 + (3136×100+100 = 313,700) + 1,010 = 333,526. The
# dense layer dominates — one reason modern CNNs replace Flatten with global
# average pooling. Convolution and pooling extract and compress features;
# dense layers combine them; softmax gives probabilities.
#
# WHERE YOU USE IT
# The dense hidden layer holds more than 94% of the parameters of this model.
#
# RUN IT:  python 09_cnn-8.py
#

conv = lambda k, c, f: k * k * c * f + f
flat = 7 * 7 * 64
layers_ = [conv(3, 1, 32), conv(3, 32, 64), flat * 100 + 100, 100 * 10 + 10]
print(flat, layers_, sum(layers_))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 3136 [320, 18496, 313700, 1010] 333526
