# -*- coding: utf-8 -*-
# ==========================================================================
# Optimisation: AdamW, warm-up and cosine decay [generative-ai / How large
# models are trained]
# ==========================================================================
# WHAT IT IS
# LLMs are trained with AdamW (Adam with decoupled weight decay) at a learning
# rate that follows a schedule: a short linear warm-up (e.g. 1,000 steps from
# 0 to 3×10⁻⁴) because early updates are unreliable, then a cosine decay
# towards a small value: lr(t) = lr_max · ½(1 + cos(π (t − t_w)/(T − t_w))).
# With lr_max = 3×10⁻⁴, warm-up 1,000, total 10,000: lr(100) = 3×10⁻⁵,
# lr(1,000) = 3×10⁻⁴, lr(5,000) = 1.76×10⁻⁴, lr(10,000) = 0. Gradient clipping
# (norm ≤ 1) tames loss spikes. Batches are huge (millions of tokens),
# assembled by gradient accumulation across many GPUs.
#
# WHERE YOU USE IT
# Loss spikes are normal at scale: keep checkpoints, and be ready to restart
# from before a spike with a lower learning rate.
#
# RUN IT:  python 04_train-3.py
#

import numpy as np

def lr(step, peak=3e-4, warm=1000, total=10000):
    if step < warm:
        return peak * step / warm
    return peak * 0.5 * (1 + np.cos(np.pi * (step - warm) / (total - warm)))

print([round(float(lr(s)), 6) for s in (0, 100, 1000, 5000, 10000)])

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# [0.0, 3e-05, 0.0003, 0.000176, 0.0]
