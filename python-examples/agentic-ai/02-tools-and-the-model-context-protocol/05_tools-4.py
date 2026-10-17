# -*- coding: utf-8 -*-
# ==========================================================================
# Parallel tool calls and dependencies [agentic-ai / Tools and the Model
# Context Protocol]
# ==========================================================================
# WHAT IT IS
# When calls do not depend on each other, run them together: the model can
# request several tools in one turn (look up three customers; search two
# sources) and your code executes them concurrently. Latency becomes the
# slowest call, not the sum: calls of 2 s, 3 s and 1 s take 3 s in parallel
# instead of 6 s. Calls that need an earlier result (fetch the id, then fetch
# the order) must stay sequential. Return every result with the id of its
# request so the model can match them, and keep a cap on concurrency to
# respect rate limits.
#
# WHERE YOU USE IT
# Identify independent sub-tasks early: parallelism is the cheapest latency
# win in an agent.
#
# RUN IT:  python 05_tools-4.py
#

from concurrent.futures import ThreadPoolExecutor
import time

def slow(name_delay):
    name, delay = name_delay
    time.sleep(delay / 100)
    return name

jobs = [("a", 2), ("b", 3), ("c", 1)]
with ThreadPoolExecutor(max_workers=3) as pool:
    results = list(pool.map(slow, jobs))
print(results, max(d for _, d in jobs), sum(d for _, d in jobs))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# ['a', 'b', 'c'] 3 6
