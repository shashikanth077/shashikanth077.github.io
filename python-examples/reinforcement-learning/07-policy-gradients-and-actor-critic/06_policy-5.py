# -*- coding: utf-8 -*-
# ==========================================================================
# PPO: clip the update [reinforcement-learning / Policy gradients and
# actor–critic]
# ==========================================================================
# WHAT IT IS
# Big policy updates can wreck performance. Proximal Policy Optimisation
# limits them with the ratio r = π_new(a | s) / π_old(a | s) and the clipped
# objective L = min( r·A, clip(r, 1 − ε, 1 + ε)·A ), ε ≈ 0.2. If A = 2 and the
# new policy already makes the action 1.5 times likelier (r = 1.5), the
# objective is min(3.0, 1.2 × 2) = 2.4: the gain is capped, so there is no
# incentive to move further. If A = −1 and r = 0.5, the objective is min(−0.5,
# 0.8 × −1) = −0.8: the pessimistic value is used. PPO is simple, stable and
# the default policy-gradient method.
#
# WHERE YOU USE IT
# PPO is also the optimiser behind most RLHF fine-tuning of language models.
#
# RUN IT:  python 06_policy-5.py
#

import numpy as np

def ppo(ratio, adv, eps=0.2):
    return min(ratio * adv, float(np.clip(ratio, 1 - eps, 1 + eps)) * adv)

print(ppo(1.5, 2.0), ppo(0.5, -1.0), ppo(1.1, 2.0))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 2.4 -0.8 2.2
