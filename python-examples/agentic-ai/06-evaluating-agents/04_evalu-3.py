# -*- coding: utf-8 -*-
# ==========================================================================
# Cost, latency and the value of a solved task [agentic-ai / Evaluating
# agents]
# ==========================================================================
# WHAT IT IS
# Judge an agent economically: cost per solved task = total cost of all runs ÷
# number of successes. An agent costing 0.40 per run that succeeds 80% of the
# time costs 0.50 per solved task; a cheaper agent at 0.15 per run with 50%
# success costs 0.30 — but if each failure needs 10 minutes of human clean-up
# the picture changes. Add latency (a 5-minute agent may be fine for a report,
# not for a chat reply) and the cost of mistakes. Compare with the baseline it
# replaces (a person, a script). A cheaper model that succeeds less often is
# not automatically cheaper once retries and fixes are counted.
#
# WHERE YOU USE IT
# Plot success rate against cost for several model and prompt choices and pick
# a point on the frontier.
#
# RUN IT:  python 04_evalu-3.py
#

for cost, rate in ((0.40, 0.8), (0.15, 0.5)):
    print(cost, rate, round(cost / rate, 2))
cleanup_minutes, hourly = 10, 30
print(round(0.15 / 0.5 + (1 - 0.5) / 0.5 * cleanup_minutes / 60 * hourly, 2))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 0.4 0.8 0.5
# 0.15 0.5 0.3
# 5.3
