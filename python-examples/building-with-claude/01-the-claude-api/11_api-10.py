# -*- coding: utf-8 -*-
# ==========================================================================
# Errors, rate limits and reliability [building-with-claude / The Claude API]
# ==========================================================================
# WHAT IT IS
# A production client expects failures. Authentication errors (401) need a
# fix, not a retry; invalid requests (400) are bugs; rate limits (429) and
# overload or server errors (5xx, 529) are transient — retry with exponential
# back-off plus jitter (1, 2, 4, 8 … seconds, capped) and a maximum attempt
# count; honour any Retry-After hint. Set client-side timeouts, make retries
# idempotent (a repeated request must not repeat a side effect), and keep a
# fallback (a cheaper model, a queued job, a clear message). Log the request
# id returned by the API for support. Keep the API key in a secret store,
# never in source code or a browser.
#
# WHERE YOU USE IT
# Rate limits are a normal operating condition: queue work and spread bursts
# rather than failing users.
#
# RUN IT:  python 11_api-10.py
#

import random

retryable = {429, 500, 502, 503, 529}
def should_retry(status):
    return status in retryable

random.seed(1)
delays = [round(min(2 ** k, 30) * (0.5 + random.random() / 2), 2) for k in range(6)]
print([should_retry(s) for s in (401, 400, 429, 529)], delays)

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# [False, False, True, True] [0.57, 1.85, 3.53, 5.02, 11.96, 21.74]
