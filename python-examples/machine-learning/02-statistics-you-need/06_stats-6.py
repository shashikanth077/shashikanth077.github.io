# -*- coding: utf-8 -*-
# ==========================================================================
# A t-test by hand [machine-learning / Statistics you need]
# ==========================================================================
# WHAT IT IS
# A new routing model is claimed to beat the old average of 10 minutes. In 25
# tickets the mean is 8.8 with sample standard deviation 3. The one-sample
# statistic is t = (x̄ − μ₀) / (s / √n) = (8.8 − 10) / (3 / 5) = −2.0 with df
# = n − 1 = 24. The p-value is the area in the tails of the t distribution
# beyond |t|. Drag t: the shaded tails shrink as the evidence grows.
#
# WHERE YOU USE IT
# With t = −2 the two-sided p is about 0.057 (not significant at 0.05) and the
# one-sided p about 0.028 (significant). Choose one- or two-sided BEFORE
# looking at the data.
#
# RUN IT:  python 06_stats-6.py
#

import math
import numpy as np

n, mean, s, mu0 = 25, 8.8, 3.0, 10.0
t = (mean - mu0) / (s / math.sqrt(n))
df = n - 1
print(round(t, 2), df)

def t_pdf(x, df):
    c = math.gamma((df + 1) / 2) / (math.sqrt(df * math.pi) * math.gamma(df / 2))
    return c * (1 + x * x / df) ** (-(df + 1) / 2)

xs = np.linspace(abs(t), 60, 200001)
tail = np.trapezoid([t_pdf(x, df) for x in xs], xs)
print(round(float(2 * tail), 3), round(float(tail), 3))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# -2.0 24
# 0.057 0.028
