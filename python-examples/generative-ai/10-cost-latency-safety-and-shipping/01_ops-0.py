# -*- coding: utf-8 -*-
# ==========================================================================
# Cost: tokens in, tokens out [generative-ai / Cost, latency, safety and
# shipping]
# ==========================================================================
# WHAT IT IS
# LLM APIs bill per token, with output usually several times dearer than input
# (generation is sequential). Illustrative prices: 3 currency units per
# million input tokens and 15 per million output tokens. A request with 2,000
# input and 500 output tokens costs 2,000/10⁶ × 3 + 500/10⁶ × 15 = 0.006 +
# 0.0075 = 0.0135; at 100,000 requests per day that is 1,350 per day. Levers:
# shorter prompts, caching the shared prefix, smaller models for easy requests
# (routing), limiting output length, batching offline work at a discount, and
# retrieving fewer but better chunks.
#
# WHERE YOU USE IT
# Estimate cost per successful task, not per request: retries and failures are
# part of the price.
#
# RUN IT:  python 01_ops-0.py
#

price_in, price_out = 3.0, 15.0
tin, tout = 2000, 500
cost = tin / 1e6 * price_in + tout / 1e6 * price_out
print(round(cost, 4), round(cost * 100000, 1))
print(round((tin * 0.2) / 1e6 * price_in + tin * 0.8 / 1e6 * price_in * 0.1 + tout / 1e6 * price_out, 4), "with 80% of the prompt cached at 10% price")

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 0.0135 1350.0
# 0.0092 with 80% of the prompt cached at 10% price
