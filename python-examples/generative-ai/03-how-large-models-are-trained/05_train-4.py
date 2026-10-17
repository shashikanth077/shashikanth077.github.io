# -*- coding: utf-8 -*-
# ==========================================================================
# Memory for training: bytes per parameter [generative-ai / How large models
# are trained]
# ==========================================================================
# WHAT IT IS
# Training needs far more memory than the weights alone. With mixed precision
# and Adam, each parameter costs about 16 bytes: 2 (16-bit weights) + 2
# (16-bit gradients) + 4 (32-bit master weights) + 4 + 4 (Adam's two moment
# estimates). A 7 B model therefore needs 7×10⁹ × 16 ≈ 112 GB before counting
# activations — more than one 80 GB GPU, so the state is sharded across GPUs
# (ZeRO / FSDP), activations are recomputed instead of stored (checkpointing),
# and tensors are split across devices (tensor and pipeline parallelism).
# Inference needs only the weights (2 bytes each in 16-bit: 14 GB for 7 B)
# plus the KV cache.
#
# WHERE YOU USE IT
# Rule of thumb: fine-tuning a full model needs ≈ 16 bytes × parameters; LoRA
# and quantisation shrink that dramatically.
#
# RUN IT:  python 05_train-4.py
#

per_param = 2 + 2 + 4 + 4 + 4
N = 7e9
print(per_param, N * per_param / 1e9, "GB training state")
print(N * 2 / 1e9, "GB weights in 16-bit,", N * 0.5 / 1e9, "GB in 4-bit")

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 16 112.0 GB training state
# 14.0 GB weights in 16-bit, 3.5 GB in 4-bit
