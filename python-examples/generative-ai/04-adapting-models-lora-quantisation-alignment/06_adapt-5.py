# -*- coding: utf-8 -*-
# ==========================================================================
# Preference tuning: RLHF and DPO [generative-ai / Adapting models: LoRA,
# quantisation, alignment]
# ==========================================================================
# WHAT IT IS
# After SFT, models are aligned with human preferences using pairs (chosen
# answer, rejected answer). RLHF trains a reward model on the pairs and
# optimises the policy against it with PPO under a KL penalty to the SFT
# model. DPO skips the reward model and RL loop: it directly raises the
# probability of the chosen answer relative to the rejected one, measured
# against a frozen reference model. Loss = −ln σ(β[(ln π(y_w) − ln π_ref(y_w))
# − (ln π(y_l) − ln π_ref(y_l))]). With log-ratios +2 for the chosen and −2
# for the rejected answer and β = 0.1: margin 4 → loss = −ln σ(0.4) = 0.513;
# at margin 0 the loss is 0.693; at margin −4 it is 0.913.
#
# WHERE YOU USE IT
# Preference data encodes what annotators prefer: write clear guidelines and
# check for biases such as favouring longer answers.
#
# RUN IT:  python 06_adapt-5.py
#

import numpy as np

sigmoid = lambda z: 1 / (1 + np.exp(-z))
beta = 0.1
for chosen, rejected in ((2.0, -2.0), (0.0, 0.0), (-2.0, 2.0)):
    margin = chosen - rejected
    print(margin, round(float(-np.log(sigmoid(beta * margin))), 3))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 4.0 0.513
# 0.0 0.693
# -4.0 0.913
