# -*- coding: utf-8 -*-
# ==========================================================================
# Learning from human feedback (RLHF) [reinforcement-learning / Models,
# rewards, multi-agent and RLHF]
# ==========================================================================
# WHAT IT IS
# When the goal cannot be written as a formula ("be helpful"), learn the
# reward from people. Collect pairs of answers and which one a human
# preferred; fit a reward model r(x) with the Bradley–Terry model P(A
# preferred) = σ(r_A − r_B): scores 2 and 0 give P = 0.881. Then fine-tune the
# language model with an RL algorithm (usually PPO) to maximise the reward
# model's score, with a KL penalty β·KL(π ‖ π_ref) that keeps it close to the
# original model so it cannot drift into reward-hacking gibberish. Variants
# (DPO and others) skip the explicit RL loop.
#
# WHERE YOU USE IT
# The reward model is a proxy: optimise it too hard and quality degrades.
# Human preferences also carry the labelers' biases.
#
# RUN IT:  python 04_adv-3.py
#

import numpy as np

sigmoid = lambda z: 1 / (1 + np.exp(-z))
print(round(float(sigmoid(2.0 - 0.0)), 3), round(float(sigmoid(0.5 - 0.0)), 3))
reward, kl, beta = 1.2, 0.8, 0.5
print(round(reward - beta * kl, 2))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 0.881 0.622
# 0.8
