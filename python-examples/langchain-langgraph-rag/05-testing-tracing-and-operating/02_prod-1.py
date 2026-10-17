# -*- coding: utf-8 -*-
# ==========================================================================
# Tracing and observability [langchain-langgraph-rag / Testing, tracing and
# operating]
# ==========================================================================
# WHAT IT IS
# An agent run is a tree: graph → node → model call → tool call. Tracing
# records every step with inputs, outputs, latency, tokens and cost, so you
# can see why an answer was wrong — which chunks were retrieved, what the
# model was told, which tool failed. LangChain's ecosystem offers LangSmith
# for tracing and evaluation, and any OpenTelemetry-compatible tool can do the
# same job; the principle is independent of the product. Practices: assign a
# run id per request and per thread, log prompt and tool versions, sample
# failures and expensive runs for review, track cost per solved task, success
# rate and p95 latency, mask personal data in traces, and keep the ability to
# replay a trace against a new prompt or model.
#
# WHERE YOU USE IT
# Turn tracing on from the first prototype: it is the cheapest debugging tool
# you will have.
#
# RUN IT:  python 02_prod-1.py
#

trace = [
    {"step": "rewrite_query", "input": "how fast do I get my money back", "output": "refund days"},
    {"step": "retrieve", "k": 2, "hits": [("refunds.md", 0.81), ("shipping.md", 0.22)]},
    {"step": "llm", "tokens_in": 640, "tokens_out": 48, "latency_ms": 920},
]
for t in trace:
    print(t["step"], {k: v for k, v in t.items() if k != "step"})
cost = 640 / 1e6 * 3 + 48 / 1e6 * 15
print(round(cost, 5))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# rewrite_query {'input': 'how fast do I get my money back', 'output': 'refund days'}
# retrieve {'k': 2, 'hits': [('refunds.md', 0.81), ('shipping.md', 0.22)]}
# llm {'tokens_in': 640, 'tokens_out': 48, 'latency_ms': 920}
# 0.00264
