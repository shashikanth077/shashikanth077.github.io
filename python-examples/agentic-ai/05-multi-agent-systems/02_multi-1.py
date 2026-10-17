# -*- coding: utf-8 -*-
# ==========================================================================
# Handoffs and communication [agentic-ai / Multi-agent systems]
# ==========================================================================
# WHAT IT IS
# Agents must pass work without losing meaning. A good handoff states the goal
# in one sentence, supplies the context the next agent needs (not the whole
# transcript), says what output format to return, and names constraints and
# the deadline. Messages should be structured (fields, not free-form chat) and
# sizeable work should travel by reference (a file or record id) rather than
# being pasted. Shared state — a task board or a document — gives every agent
# the same view; a mediator avoids many-to-many chatter: n agents talking to
# each other need n(n−1)/2 channels (45 for ten agents), but a single
# orchestrator needs n.
#
# WHERE YOU USE IT
# Most multi-agent failures are communication failures: ambiguity in the
# brief, missing context or unstructured results.
#
# RUN IT:  python 02_multi-1.py
#

n = 10
print(n * (n - 1) // 2, n)
handoff = {
    "goal": "Summarise the 5 latest incident reports",
    "context": ["reports/2025-06/"],
    "return_format": {"summary": "str", "risks": "list[str]"},
    "deadline_s": 120,
}
print(handoff["goal"], "|", handoff["return_format"])

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 45 10
# Summarise the 5 latest incident reports | {'summary': 'str', 'risks': 'list[str]'}
