# -*- coding: utf-8 -*-
# ==========================================================================
# Short-term memory: managing the context window [agentic-ai / Memory and
# state]
# ==========================================================================
# WHAT IT IS
# Inside one task the model's memory is its context window, which fills up.
# Strategies: truncate tool output (first 2,000 characters plus a note "output
# truncated"); a sliding window of the last k steps; summarisation — compress
# older turns into a short note; and offloading large content to files or a
# store, keeping only a reference in the context. Replacing 8,000 tokens of
# history by a 500-token summary is a 16× compression, at the price of lost
# detail. Keep the original goal and key decisions pinned at the top, and put
# the most recent instructions at the end, where the model attends best.
#
# WHERE YOU USE IT
# Summaries lose facts silently: store the raw history elsewhere so you can
# recover details.
#
# RUN IT:  python 01_mem-0.py
#

history = [f"step {i}: " + "x" * 40 for i in range(12)]
window = history[-3:]
summary = f"Summary of steps 0-{len(history) - 4}: searched, read 2 files, found config path."
context = [summary] + window
print(len(history), "->", len(context), "items")
print(8000 / 500)

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 12 -> 4 items
# 16.0
