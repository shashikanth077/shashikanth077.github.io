# -*- coding: utf-8 -*-
# ==========================================================================
# Estimating cost and budgeting a workload [building-with-claude / The Claude
# API]
# ==========================================================================
# WHAT IT IS
# Cost = input tokens × input price + output tokens × output price. With
# Sonnet 5.5 ($2 / $10 per million) a request of 2,000 input and 500 output
# tokens costs 2,000/10⁶ × 2 + 500/10⁶ × 10 = $0.004 + $0.005 = $0.009;
# 100,000 such requests cost $900. The same load on Haiku 5.5 would cost about
# $45, on Opus 5.5 $1,800. Output tokens are five times dearer than input
# here, so asking for shorter answers often saves more than shortening the
# prompt. Track the usage object of every response, aggregate cost per feature
# and per user, and set spending limits so a bug cannot run up a bill.
#
# WHERE YOU USE IT
# Estimate per successful task, including retries and agent loops, not just
# per request.
#
# RUN IT:  python 03_api-2.py
#

pin, pout = 2.0, 10.0
per_request = 2000 / 1e6 * pin + 500 / 1e6 * pout
print(round(per_request, 4), round(per_request * 100000, 2))
for out in (100, 500, 1000):
    print(out, round(2000 / 1e6 * pin + out / 1e6 * pout, 4))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 0.009 900.0
# 100 0.005
# 500 0.009
# 1000 0.014
