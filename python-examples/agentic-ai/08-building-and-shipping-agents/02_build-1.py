# -*- coding: utf-8 -*-
# ==========================================================================
# Agents as state machines and graphs [agentic-ai / Building and shipping
# agents]
# ==========================================================================
# WHAT IT IS
# As agents grow, a loop becomes hard to reason about. Model the process as a
# graph: nodes are steps (classify, retrieve, draft, check, approve), edges
# are transitions, and some edges are chosen by the model while most are fixed
# by code. Benefits: explicit control flow, per-node prompts and tools, easy
# to visualise and test, natural places for approvals and checkpoints, and a
# known set of paths to evaluate. A support agent might be: classify →
# (billing | technical | other) → retrieve → draft → policy check → (approve |
# send). The model decides within each node; the graph keeps the whole
# predictable.
#
# WHERE YOU USE IT
# Use as little autonomy as the task needs: make the graph tight where the
# process is known.
#
# RUN IT:  python 02_build-1.py
#

graph = {
    "classify": ["retrieve"],
    "retrieve": ["draft"],
    "draft": ["policy_check"],
    "policy_check": ["send", "draft"],
    "send": [],
}
def paths(node, seen=()):
    if node == "send":
        return [seen + (node,)]
    out = []
    for nxt in graph[node]:
        if nxt not in seen:
            out += paths(nxt, seen + (node,))
    return out
print(paths("classify"))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# [('classify', 'retrieve', 'draft', 'policy_check', 'send')]
