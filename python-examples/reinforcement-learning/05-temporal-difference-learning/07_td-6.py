# -*- coding: utf-8 -*-
# ==========================================================================
# n-step returns and eligibility traces [reinforcement-learning /
# Temporal-difference learning]
# ==========================================================================
# WHAT IT IS
# Between TD(0) (look one step ahead) and Monte Carlo (look to the end) lie
# n-step returns: Gₜ⁽ⁿ⁾ = Rₜ₊₁ + … + γⁿ⁻¹Rₜ₊ₙ + γⁿV(Sₜ₊ₙ). TD(λ) averages all
# of them with weights (1 − λ)λⁿ⁻¹: with λ = 0.8 the 1-, 2-, 3-, 4-, 5-step
# returns get 0.200, 0.160, 0.128, 0.102, 0.082. λ = 0 is TD(0), λ = 1 is
# Monte Carlo. Eligibility traces implement this efficiently: each visited
# state keeps a decaying trace e ← γλe that determines how much of the current
# TD error it receives, spreading credit backwards to recent states.
#
# WHERE YOU USE IT
# Intermediate λ (0.8–0.95) often beats both extremes.
#
# RUN IT:  python 07_td-6.py
#

lam = 0.8
print([round((1 - lam) * lam ** (n - 1), 3) for n in range(1, 6)])
e, gamma = 1.0, 0.9
trace = []
for k in range(5):
    trace.append(round(e, 3))
    e *= gamma * lam
print(trace)

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# [0.2, 0.16, 0.128, 0.102, 0.082]
# [1.0, 0.72, 0.518, 0.373, 0.269]
