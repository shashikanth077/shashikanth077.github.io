# -*- coding: utf-8 -*-
# ==========================================================================
# The token cost of multi-agent systems [agentic-ai / Multi-agent systems]
# ==========================================================================
# WHAT IT IS
# Every agent has its own context, so shared background is paid for
# repeatedly. A research task with a lead and five workers, each reading
# 10,000 tokens of instructions and background and producing 2,000 tokens,
# reads 6 × 10,000 = 60,000 input tokens and writes 12,000 — often several
# times the cost of a single agent doing the same work sequentially, in
# exchange for speed and focus. Control it: pass compact briefs instead of
# full context, cache the shared prefix, use small models for simple workers,
# limit the number of workers and rounds, and measure cost per solved task
# rather than per call.
#
# WHERE YOU USE IT
# Multi-agent systems are worth their cost on valuable, parallelisable tasks;
# they are wasteful on small ones.
#
# RUN IT:  python 04_multi-3.py
#

agents, context, out = 6, 10000, 2000
print(agents * context, agents * out)
shared_cached = context + (agents - 1) * 0.1 * context
print(shared_cached, "token-equivalents with a cached 10,000-token prefix at 10% price")

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 60000 12000
# 15000.0 token-equivalents with a cached 10,000-token prefix at 10% price
