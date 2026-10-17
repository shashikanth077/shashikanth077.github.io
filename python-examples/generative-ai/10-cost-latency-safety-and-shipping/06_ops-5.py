# -*- coding: utf-8 -*-
# ==========================================================================
# From prototype to product [generative-ai / Cost, latency, safety and
# shipping]
# ==========================================================================
# WHAT IT IS
# A reliable path: (1) write down the task, the users and what failure costs;
# (2) prototype with a strong model and a good prompt; (3) build a labelled
# evaluation set from real cases; (4) add retrieval or tools only where
# evaluation shows a gap; (5) measure quality, latency and cost per task; (6)
# try smaller or cheaper models and routing; (7) add guardrails, logging and a
# human fallback; (8) release gradually (internal, beta, canary) and monitor;
# (9) collect feedback and add failures to the evaluation set; (10)
# re-evaluate on every model or prompt change. Most of the work lies in steps
# 3, 7 and 9, not in the first demo.
#
# WHERE YOU USE IT
# The demo is 10% of the work: evaluation, monitoring and iteration are what
# make it a product.
#
# RUN IT:  python 06_ops-5.py
#

steps = ["define task and failure cost", "prototype", "build evaluation set", "add retrieval or tools if needed", "measure quality, latency, cost", "try cheaper models", "guardrails and fallback", "gradual release", "feedback loop", "re-evaluate on every change"]
for i, s in enumerate(steps, 1):
    print(i, s)

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 1 define task and failure cost
# 2 prototype
# 3 build evaluation set
# 4 add retrieval or tools if needed
# 5 measure quality, latency, cost
# 6 try cheaper models
# 7 guardrails and fallback
# 8 gradual release
# 9 feedback loop
# 10 re-evaluate on every change
