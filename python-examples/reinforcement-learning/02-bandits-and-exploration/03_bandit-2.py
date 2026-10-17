# -*- coding: utf-8 -*-
# ==========================================================================
# Non-stationary problems: a constant step size [reinforcement-learning /
# Bandits and exploration]
# ==========================================================================
# WHAT IT IS
# If arm values drift over time, old rewards should fade. A constant step α
# gives Qₙ₊₁ = (1 − α)ⁿQ₁ + Σ α(1 − α)ⁿ⁻ⁱ Rᵢ: an exponential moving average
# where a reward k steps ago has weight α(1 − α)ᵏ. With α = 0.1 the latest
# reward weighs 0.100, the one before 0.090, then 0.081 — the effective memory
# is about 1/α = 10 steps. A large α reacts fast but is noisy; a small α is
# smooth but slow to follow change.
#
# WHERE YOU USE IT
# Pick α from how quickly the world changes, not from habit; 1/n is right only
# for stationary problems.
#
# RUN IT:  python 03_bandit-2.py
#

alpha = 0.1
print([round(alpha * (1 - alpha) ** k, 4) for k in range(5)])
print(round(sum(alpha * (1 - alpha) ** k for k in range(200)), 4))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# [0.1, 0.09, 0.081, 0.0729, 0.0656]
# 1.0
