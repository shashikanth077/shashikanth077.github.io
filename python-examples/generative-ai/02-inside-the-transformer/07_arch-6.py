# -*- coding: utf-8 -*-
# ==========================================================================
# Compute: FLOPs per token and mixture of experts [generative-ai / Inside the
# transformer]
# ==========================================================================
# WHAT IT IS
# Generating one token costs about 2N floating-point operations for a dense
# model with N parameters (one multiply and one add per weight); training
# costs about 6N per token (forward + backward). A 7 B model generates at ≈ 14
# GFLOP/token. A mixture of experts (MoE) replaces the MLP by several expert
# MLPs and a router that sends each token to the best k: with 8 experts and k
# = 2, only a quarter of the expert weights are active, so a model of 47 B
# total parameters can run with ≈ 13 B active — more knowledge for the compute
# of a smaller model, at the cost of memory for all experts.
#
# WHERE YOU USE IT
# Quote both numbers for an MoE: total parameters (memory) and active
# parameters (speed).
#
# RUN IT:  python 07_arch-6.py
#

N = 7e9
print(2 * N / 1e9, "GFLOP per token,", 6 * N / 1e9, "GFLOP per token to train")
experts, k = 8, 2
print(k / experts)
shared, per_expert = 1.5e9, 5.7e9
print((shared + experts * per_expert) / 1e9, (shared + k * per_expert) / 1e9)

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 14.0 GFLOP per token, 42.0 GFLOP per token to train
# 0.25
# 47.1 12.9
