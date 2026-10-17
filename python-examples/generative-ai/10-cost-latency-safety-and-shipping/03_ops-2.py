# -*- coding: utf-8 -*-
# ==========================================================================
# Throughput, batching and rate limits [generative-ai / Cost, latency, safety
# and shipping]
# ==========================================================================
# WHAT IT IS
# GPUs are efficient when they serve many requests at once: batching turns a
# memory-bound sequential task into a more compute-efficient one, raising
# tokens per second per GPU several times at the price of some latency; modern
# servers use continuous batching (new requests join a running batch).
# Providers apply rate limits (requests and tokens per minute). A limit of
# 200,000 tokens/minute with 2,500-token requests allows 80 requests/minute ≈
# 1.3 per second. Plan for bursts: queue and retry with exponential back-off
# (1 s, 2 s, 4 s, …) plus random jitter, and spread background work over time
# or use the provider's batch interface.
#
# WHERE YOU USE IT
# Handle 429 (rate limited) and 5xx errors gracefully: they are normal
# operating conditions.
#
# RUN IT:  python 03_ops-2.py
#

limit, per_request = 200000, 2500
print(limit // per_request, round(limit / per_request / 60, 2), "per second")
import random
random.seed(0)
print([round(2 ** k + random.random(), 2) for k in range(5)])

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 80 1.33 per second
# [1.84, 2.76, 4.42, 8.26, 16.51]
