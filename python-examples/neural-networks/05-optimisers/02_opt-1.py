# -*- coding: utf-8 -*-
# ==========================================================================
# Momentum: remember the direction [neural-networks / Optimisers]
# ==========================================================================
# WHAT IT IS
# Momentum keeps a running "velocity": v ← βv + g, then w ← w − η v. When
# successive gradients agree, the velocity builds up and steps grow; when they
# flip sign, the velocity cancels, damping zig-zags. With a constant gradient
# of 1 and β = 0.9 the velocity is 1, 1.9, 2.71, 3.44, 4.10 …, approaching 10:
# the effective step becomes ten times larger along a consistent slope. It is
# optional in SGD and a building block for Adam.
#
# WHERE YOU USE IT
# A typical β is 0.9. Too much momentum overshoots minima; it interacts with
# the learning rate, so tune them together.
#
# RUN IT:  python 02_opt-1.py
#

beta, v = 0.9, 0.0
speeds = []
for g in [1.0] * 5:
    v = beta * v + g
    speeds.append(round(v, 3))
print(speeds, round(1 / (1 - beta), 1))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# [1.0, 1.9, 2.71, 3.439, 4.095] 10.0
