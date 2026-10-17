# -*- coding: utf-8 -*-
# ==========================================================================
# Hypothesis testing: the four steps [machine-learning / Statistics you need]
# ==========================================================================
# WHAT IT IS
# A hypothesis test asks whether the data give enough evidence against
# "nothing is happening". Step 1: state H₀ (no difference, no effect) and Hₐ
# (there is a difference). Step 2: choose the significance level α, usually
# 0.05. Step 3: compute a test statistic and its p-value — the chance of a
# result at least this extreme if H₀ were true. Step 4: if p &lt; α, reject
# H₀; otherwise do not reject it. Failing to reject is not proof that H₀ is
# true.
#
# WHERE YOU USE IT
# Say "the sample did not give enough evidence against H₀", never "H₀ is
# true". A tiny effect in a huge sample can be significant but unimportant.
#
# RUN IT:  python 05_stats-5.py
#

alpha = 0.05
for p in (0.03, 0.057):
    decision = "reject H0" if p < alpha else "do not reject H0"
    print(p, decision)

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 0.03 reject H0
# 0.057 do not reject H0
