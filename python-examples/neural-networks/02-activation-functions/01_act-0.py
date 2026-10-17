# -*- coding: utf-8 -*-
# ==========================================================================
# Why activations must be non-linear [neural-networks / Activation functions]
# ==========================================================================
# WHAT IT IS
# Without an activation function, stacking layers gains nothing: a linear
# layer followed by another linear layer is just one bigger linear layer,
# W₂(W₁x) = (W₂W₁)x. A network of such layers can only draw straight lines. A
# non-linear activation between layers breaks this and lets the network bend
# its decision boundaries and model curved relationships. The activation does
# not "learn" by itself; the weights around it do.
#
# WHERE YOU USE IT
# "Add a hidden layer" only helps if there is a non-linearity in it. That is
# the first thing to check when a deep model behaves like logistic regression.
#
# RUN IT:  python 01_act-0.py
#

import numpy as np

rng = np.random.default_rng(0)
x = rng.normal(size=3)
W1, W2 = rng.normal(size=(4, 3)), rng.normal(size=(2, 4))
two_layers = W2 @ (W1 @ x)
one_layer = (W2 @ W1) @ x
print(bool(np.allclose(two_layers, one_layer)))
relu_two = W2 @ np.maximum(0, W1 @ x)
print(bool(np.allclose(relu_two, one_layer)))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# True
# False
