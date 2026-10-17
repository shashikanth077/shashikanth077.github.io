# -*- coding: utf-8 -*-
# ==========================================================================
# Supervised fine-tuning for instructions [generative-ai / Adapting models:
# LoRA, quantisation, alignment]
# ==========================================================================
# WHAT IT IS
# A pretrained model continues text; to make it an assistant, train on
# (instruction, ideal response) pairs — supervised fine-tuning (SFT). The loss
# is the usual next-token cross-entropy, but computed only on the response
# tokens (the prompt is masked). A few thousand high-quality, diverse examples
# already change behaviour dramatically; quality matters far more than
# quantity. Typical data: human-written answers, curated public sets, or
# model-generated answers filtered for quality. Hold out an evaluation set,
# train for 1–3 epochs at a small learning rate (10⁻⁵) and watch for the model
# forgetting general skills.
#
# WHERE YOU USE IT
# Template exactly the same chat format (special tokens for roles) at training
# and inference.
#
# RUN IT:  python 02_adapt-1.py
#

import numpy as np

tokens = ["<user>", "What", "is", "2+2", "?", "<assistant>", "It", "is", "4", "."]
is_response = np.array([0, 0, 0, 0, 0, 0, 1, 1, 1, 1])
nll = np.array([2.1, 1.9, 1.2, 3.0, 0.8, 1.0, 0.9, 0.4, 0.3, 0.2])
print(float((nll * is_response).sum() / is_response.sum()), float(nll.mean()))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 0.45 1.18
