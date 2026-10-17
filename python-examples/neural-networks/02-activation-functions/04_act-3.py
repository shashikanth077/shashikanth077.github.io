# -*- coding: utf-8 -*-
# ==========================================================================
# ReLU and its variants [neural-networks / Activation functions]
# ==========================================================================
# WHAT IT IS
# ReLU(z) = max(0, z): negative scores become 0 and positive scores pass
# through unchanged — ReLU(−3) = 0, ReLU(2) = 2. It is cheap, and on the
# positive side its slope is exactly 1, so gradients flow without the
# saturation of sigmoid and tanh. Its weakness: a neuron whose input stays
# negative has zero output AND zero gradient, and may "die". Leaky ReLU keeps
# a small slope α on the negative side to prevent that. ReLU is not a
# probability: it can exceed 1.
#
# WHERE YOU USE IT
# ReLU is the default hidden activation for dense and convolutional networks.
# Local derivative: 1 for z > 0, 0 for z < 0, and by convention 0 at exactly
# 0.
#
# RUN IT:  python 04_act-3.py
#

import numpy as np

z = np.array([-3.0, -0.5, 0.0, 2.0])
relu = np.maximum(0, z)
leaky = np.where(z > 0, z, 0.1 * z)
print(relu.tolist(), leaky.round(2).tolist())
print((z > 0).astype(int).tolist())

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# [0.0, 0.0, 0.0, 2.0] [-0.3, -0.05, 0.0, 2.0]
# [0, 0, 0, 1]
