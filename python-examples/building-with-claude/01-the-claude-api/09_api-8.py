# -*- coding: utf-8 -*-
# ==========================================================================
# Batch processing: half price for asynchronous work [building-with-claude /
# The Claude API]
# ==========================================================================
# WHAT IT IS
# If nothing needs an answer right now — classifying a backlog, summarising
# documents, running an evaluation set — use the Message Batches API: you
# submit many Messages requests together, they are processed asynchronously
# (most batches finish in under an hour) and you retrieve the results later.
# Batch requests cost 50% less than standard calls. 100,000 requests of 2,000
# input and 500 output tokens on Sonnet 5.5 cost $900 normally and $450 as a
# batch. Batching combines with prompt caching for shared prefixes. Use it for
# offline, retry-tolerant work; keep the synchronous API for interactive
# features.
#
# WHERE YOU USE IT
# Design batch jobs so that each request has an id of your own: you match
# results to inputs by that id.
#
# RUN IT:  python 09_api-8.py
#

per_request = 2000 / 1e6 * 2.0 + 500 / 1e6 * 10.0
print(round(per_request * 100000, 2), round(per_request * 100000 * 0.5, 2))
batch = [{"custom_id": f"doc-{i}", "params": {"model": "claude-haiku-5-5", "max_tokens": 200,
          "messages": [{"role": "user", "content": f"Classify document {i}"}]}} for i in range(3)]
print([b["custom_id"] for b in batch])

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 900.0 450.0
# ['doc-0', 'doc-1', 'doc-2']
