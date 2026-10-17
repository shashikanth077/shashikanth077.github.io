# -*- coding: utf-8 -*-
# ==========================================================================
# Pass@k for code and tasks with checkers [generative-ai / Evaluating
# generative systems]
# ==========================================================================
# WHAT IT IS
# When an automatic checker exists (unit tests), sample n solutions and count
# c that pass. pass@k estimates the probability that at least one of k samples
# is correct: pass@k = 1 − C(n − c, k)/C(n, k). With n = 10, c = 3: pass@1 =
# 0.30; pass@5 = 1 − C(7,5)/C(10,5) = 1 − 21/252 = 0.917. The gap shows what
# sampling several candidates and verifying them can buy: a 30% model becomes
# a 92% system with a good checker. The metric needs the same temperature and
# prompt every time and tests that really verify behaviour — weak tests
# inflate it.
#
# WHERE YOU USE IT
# Verification is the lever: wherever you can check an answer cheaply,
# generate several and pick.
#
# RUN IT:  python 02_evalu-1.py
#

from math import comb

def pass_at_k(n, c, k):
    return 1 - comb(n - c, k) / comb(n, k) if n - c >= k else 1.0

print([round(pass_at_k(10, 3, k), 3) for k in (1, 3, 5, 10)])

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# [0.3, 0.708, 0.917, 1.0]
