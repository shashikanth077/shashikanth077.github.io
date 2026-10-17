# -*- coding: utf-8 -*-
# ==========================================================================
# Latency: time to first token and tokens per second [generative-ai / Cost,
# latency, safety and shipping]
# ==========================================================================
# WHAT IT IS
# Users feel two delays: the time to first token (TTFT — the prompt is
# processed in parallel, so it grows with prompt length) and the generation
# speed (tokens per second — sequential, one token at a time, limited by
# memory bandwidth). A 500-token answer at 50 tokens/s takes 10 s after a 0.8
# s TTFT: 10.8 s in total. Streaming the answer as it is generated makes the
# wait feel short, because reading starts at once. Reduce latency with shorter
# outputs, a smaller or faster model, prompt caching, speculative decoding (a
# small model drafts, the big one verifies) and parallel calls for independent
# sub-tasks.
#
# WHERE YOU USE IT
# Report p50 and p95 latency; the slow tail is what users remember.
#
# RUN IT:  python 02_ops-1.py
#

ttft, tps, n = 0.8, 50, 500
print(ttft + n / tps)
print(round(ttft + 100 / tps, 1), round(ttft + 1000 / tps, 1))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 10.8
# 2.8 20.8
