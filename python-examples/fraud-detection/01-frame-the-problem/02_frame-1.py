# -*- coding: utf-8 -*-
# ==========================================================================
# The latency budget [fraud-detection / Frame the problem]
# ==========================================================================
# WHAT IT IS
# Card networks expect an answer within a hard time limit, and the issuer's
# own approval path is only a part of it, so the fraud decision typically gets
# a budget of roughly 50–150 ms (the exact figure depends on the network and
# your contract — treat the numbers here as illustrative). Every step spends
# from it: the network hop, looking up the card's recent behaviour, computing
# features, running the model, applying rules and policy, writing the
# decision. p99 matters more than the average: if one request in a hundred
# takes 400 ms, thousands of customers a day see a timeout. So designs are
# driven by the slowest step: keep features pre-computed, models small, calls
# local, and always have a fallback (simple rules) for when something is slow.
#
# WHERE YOU USE IT
# Set a budget per stage, measure p50/p95/p99 of each, and alert on the sum.
# Never add a remote call to the hot path without a timeout and a fallback.
#
# RUN IT:  python 02_frame-1.py
#

budget_ms = 100
stages = {"network + gateway": 8, "feature lookup (cache)": 12, "model scoring": 6, "rules + policy": 3, "decision log (async)": 0}
used = sum(stages.values())
print("used:", used, "ms of", budget_ms)
print("headroom for p99 spikes:", budget_ms - used, "ms")
for name, ms in stages.items():
    print(f"{name:<24}{ms:>3} ms  {'#' * ms}")

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# used: 29 ms of 100
# headroom for p99 spikes: 71 ms
# network + gateway         8 ms  ########
# feature lookup (cache)   12 ms  ############
# model scoring             6 ms  ######
# rules + policy            3 ms  ###
# decision log (async)      0 ms
