# -*- coding: utf-8 -*-
# ==========================================================================
# The chain rule [maths-ai / Calculus: change and slope]
# ==========================================================================
# WHAT IT IS
# When functions are chained, multiply their slopes: dy/dx = (dy/du) ·
# (du/dx). Like gears: if one gear multiplies speed by 3 and the next by 2,
# the pair multiplies it by 6. With u = 3x + 1 and y = u² at x = 2: dy/du = 2u
# = 14, du/dx = 3, so dy/dx = 42.
#
# WHERE YOU USE IT
# Backpropagation IS the chain rule: it walks the network from the loss
# backwards, multiplying local slopes so every weight learns how it affected
# the loss.
#
# RUN IT:  python 05_calc-4.py
#

x = 2
u = 3 * x + 1
du_dx = 3
dy_du = 2 * u
print(u, u ** 2, dy_du * du_dx)
h = 1e-6
print(round(((3 * (x + h) + 1) ** 2 - (3 * x + 1) ** 2) / h, 2))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 7 49 42
# 42.0
