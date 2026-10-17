# -*- coding: utf-8 -*-
# ==========================================================================
# Scaling laws and the compute budget [generative-ai / How large models are
# trained]
# ==========================================================================
# WHAT IT IS
# Loss falls smoothly and predictably as parameters N, data D (tokens) and
# compute C grow — a power law, so each 10× in compute gives a smaller but
# steady improvement. The Chinchilla study found that for a fixed compute
# budget models were too big and under-trained: the best ratio is about 20
# training tokens per parameter. A 70 B model wants ≈ 1.4 T tokens. Training
# compute ≈ 6 N D FLOPs: 6 × 7×10¹⁰ × 1.4×10¹² = 5.9×10²³. Since inference
# cost scales with N while training cost is paid once, today's models are
# often trained on far more than 20 tokens per parameter to make a smaller
# model that is cheap to serve.
#
# WHERE YOU USE IT
# Scaling laws help plan experiments: train small models, fit the curve, then
# predict the large one.
#
# RUN IT:  python 02_train-1.py
#

N = 70e9
D = 20 * N
print(D / 1e12, "T tokens")
print(f"{6 * N * D:.2e} FLOPs")
gpu = 3e14 * 0.4
print(round(6 * N * D / gpu / 86400 / 1000), "days on 1000 GPUs at 40% utilisation")

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 1.4 T tokens
# 5.88e+23 FLOPs
# 57 days on 1000 GPUs at 40% utilisation
