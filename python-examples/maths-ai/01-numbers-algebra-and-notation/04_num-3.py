# -*- coding: utf-8 -*-
# ==========================================================================
# Powers and roots [maths-ai / Numbers, algebra and notation]
# ==========================================================================
# WHAT IT IS
# A power repeats multiplication: x³ = x · x · x. A root undoes it: √9 = 3
# because 3² = 9. Negative powers mean "one over": 10⁻² = 1/100. The curve xⁿ
# bends upward faster as n grows.
#
# WHERE YOU USE IT
# Squared errors, variances (σ²) and learning-rate decay are powers; norms and
# standard deviations are roots.
#
# RUN IT:  python 04_num-3.py
#

import math
print(2 ** 3, 9 ** 0.5, math.sqrt(16))
print(10 ** -2, (-2) ** 2)

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 8 3.0 4.0
# 0.01 4
