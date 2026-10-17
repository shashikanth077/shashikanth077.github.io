# -*- coding: utf-8 -*-
# ==========================================================================
# The policy gradient and REINFORCE [reinforcement-learning / Policy gradients
# and actor–critic]
# ==========================================================================
# WHAT IT IS
# The policy gradient theorem gives ∇J(θ) = E[ Gₜ ∇log π(aₜ | sₜ; θ) ]: make
# actions that were followed by high returns more likely, in proportion to the
# return. REINFORCE samples an episode and does θ ← θ + α Gₜ ∇log π(aₜ | sₜ).
# For a softmax policy ∇log π(a) = onehot(a) − π. With logits (1, 0) (π =
# 0.731, 0.269), action 1 taken and return G = 2: the gradient is 2 × (1 −
# 0.731, 0 − 0.269) = (0.538, −0.538), pushing the logit of the chosen action
# up and the other down. A negative return would push the other way.
#
# WHERE YOU USE IT
# REINFORCE is unbiased but noisy; every practical policy-gradient method adds
# a baseline.
#
# RUN IT:  python 02_policy-1.py
#

import numpy as np

theta = np.array([1.0, 0.0])
pi = np.exp(theta) / np.exp(theta).sum()
a, G = 0, 2.0
grad_logp = np.eye(2)[a] - pi
print(pi.round(3).tolist(), (G * grad_logp).round(3).tolist())
theta = theta + 0.5 * G * grad_logp
print(theta.round(3).tolist(), (np.exp(theta) / np.exp(theta).sum()).round(3).tolist())

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# [0.731, 0.269] [0.538, -0.538]
# [1.269, -0.269] [0.823, 0.177]
