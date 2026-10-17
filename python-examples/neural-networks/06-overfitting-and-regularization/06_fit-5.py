# -*- coding: utf-8 -*-
# ==========================================================================
# Batch normalization, step by step [neural-networks / Overfitting and
# regularization]
# ==========================================================================
# WHAT IT IS
# A layer's activations can have wildly different scales. BatchNorm
# standardises each feature over the mini-batch and then lets the network
# re-scale it: μ = mean(x), σ² = mean((x−μ)²), x̂ = (x−μ)/√(σ²+ε), y = γx̂ +
# β, with γ, β learnable. Four activations 2, 4, 6, 8: μ = 5, σ² = 5, x̂ =
# −1.342, −0.447, 0.447, 1.342. With γ = 1, β = 0 these are the outputs;
# changing γ and β lets the network undo the normalisation if that helps. In
# inference, running statistics from training replace the batch statistics.
#
# WHERE YOU USE IT
# BatchNorm of hidden activations is not the same as z-scoring the input data,
# and it behaves differently in train and eval modes.
#
# RUN IT:  python 06_fit-5.py
#

import numpy as np

x = np.array([2.0, 4.0, 6.0, 8.0])
mu, var, eps = x.mean(), x.var(), 1e-5
xhat = (x - mu) / np.sqrt(var + eps)
gamma, beta = 1.5, 0.2
print(mu, var, xhat.round(3).tolist(), (gamma * xhat + beta).round(3).tolist())

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 5.0 5.0 [-1.342, -0.447, 0.447, 1.342] [-1.812, -0.471, 0.871, 2.212]
