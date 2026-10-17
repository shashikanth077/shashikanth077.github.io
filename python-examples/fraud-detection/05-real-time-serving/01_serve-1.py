# -*- coding: utf-8 -*-
# ==========================================================================
# The decision service: timeouts and fallbacks [fraud-detection / Real-time
# serving]
# ==========================================================================
# WHAT IT IS
# The decision service is a small, stateless, horizontally scaled service with
# strict rules: every dependency call has a short timeout (a few
# milliseconds), there are no unbounded retries on the hot path, and each
# dependency has a fallback. If the feature store is slow, score with what the
# event itself contains plus cached defaults, mark the decision degraded, and
# lean on rules and conservative step-up. If the model service is unreachable,
# fall back to the last good model in memory or to rules only. Count every
# degraded decision: a rising fallback rate is an incident even when customers
# do not notice. The run shows eight requests where two exceed the 25 ms
# lookup timeout.
#
# WHERE YOU USE IT
# Test fallbacks on purpose (chaos tests): kill the feature store and confirm
# decisions keep flowing, degraded but safe.
#
# RUN IT:  python 01_serve-1.py
#

TIMEOUT_MS = 25
lookup_ms = [12, 15, 9, 70, 14, 11, 95, 13]            # simulated feature-store latency per request

def decide(i, ms):
    if ms > TIMEOUT_MS:
        return "step up (rules only)", "DEGRADED"      # skip live features, be conservative
    return "model decision", "normal"

degraded = 0
for i, ms in enumerate(lookup_ms, 1):
    decision, mode = decide(i, ms)
    degraded += mode == "DEGRADED"
    print(f"request {i}: lookup {ms:>3} ms -> {decision:<22} [{mode}]")
print("degraded rate:", degraded / len(lookup_ms))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# request 1: lookup  12 ms -> model decision         [normal]
# request 2: lookup  15 ms -> model decision         [normal]
# request 3: lookup   9 ms -> model decision         [normal]
# request 4: lookup  70 ms -> step up (rules only)   [DEGRADED]
# request 5: lookup  14 ms -> model decision         [normal]
# request 6: lookup  11 ms -> model decision         [normal]
# request 7: lookup  95 ms -> step up (rules only)   [DEGRADED]
# request 8: lookup  13 ms -> model decision         [normal]
# degraded rate: 0.25
