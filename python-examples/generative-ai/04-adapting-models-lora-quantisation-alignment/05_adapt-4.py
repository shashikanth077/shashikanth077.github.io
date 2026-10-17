# -*- coding: utf-8 -*-
# ==========================================================================
# Distillation: a small student from a large teacher [generative-ai / Adapting
# models: LoRA, quantisation, alignment]
# ==========================================================================
# WHAT IT IS
# Distillation trains a small student to imitate a large teacher. Instead of
# one-hot labels the student matches the teacher's full output distribution,
# which carries more information ("dark knowledge": this is 70% cat, 25% dog,
# 5% car). The loss is the KL divergence between the teacher's and student's
# temperature-softened distributions. For teacher (0.7, 0.25, 0.05) and
# student (0.5, 0.4, 0.1): KL = 0.7 ln(0.7/0.5) + 0.25 ln(0.25/0.4) + 0.05
# ln(0.05/0.1) = 0.0834. Modern practice also uses teacher-generated text as
# training data for the student. Result: much cheaper inference at a modest
# quality loss.
#
# WHERE YOU USE IT
# Check the teacher's licence: some forbid training competing models on their
# outputs.
#
# RUN IT:  python 05_adapt-4.py
#

import numpy as np

t = np.array([0.7, 0.25, 0.05])
s = np.array([0.5, 0.4, 0.1])
print(round(float((t * np.log(t / s)).sum()), 4))
def soft(z, T):
    e = np.exp(np.array(z) / T)
    return (e / e.sum()).round(3).tolist()
print(soft([3, 1, 0], 1), soft([3, 1, 0], 3))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 0.0834
# [0.844, 0.114, 0.042] [0.532, 0.273, 0.196]
