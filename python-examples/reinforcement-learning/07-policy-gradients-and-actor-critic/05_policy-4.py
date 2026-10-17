# -*- coding: utf-8 -*-
# ==========================================================================
# Generalised advantage estimation [reinforcement-learning / Policy gradients
# and actor–critic]
# ==========================================================================
# WHAT IT IS
# How to estimate the advantage? One-step TD is low-variance but biased; Monte
# Carlo is unbiased but noisy. GAE(λ) blends them: with δₜ = rₜ + γV(sₜ₊₁) −
# V(sₜ), Âₜ = δₜ + γλ δₜ₊₁ + (γλ)² δₜ₊₂ + …. Rewards (1, 0, 1), values (0.5,
# 0.4, 0.6, 0), γ = 0.9, λ = 0.8: δ = (0.86, 0.14, 0.40) and Â = (1.168,
# 0.428, 0.400). λ = 0 gives plain δ; λ = 1 gives the Monte Carlo advantage. λ
# ≈ 0.95 is common in PPO.
#
# WHERE YOU USE IT
# Compute it with a backward loop: Â ← δ + γλ Â_next.
#
# RUN IT:  python 05_policy-4.py
#

rewards = [1.0, 0.0, 1.0]
values = [0.5, 0.4, 0.6, 0.0]
gamma, lam = 0.9, 0.8
deltas = [rewards[t] + gamma * values[t + 1] - values[t] for t in range(3)]
adv, running = [0.0] * 3, 0.0
for t in reversed(range(3)):
    running = deltas[t] + gamma * lam * running
    adv[t] = running
print([round(d, 3) for d in deltas], [round(a, 4) for a in adv])

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# [0.86, 0.14, 0.4] [1.1682, 0.428, 0.4]
