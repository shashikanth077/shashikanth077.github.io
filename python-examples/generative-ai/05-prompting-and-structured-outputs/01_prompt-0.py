# -*- coding: utf-8 -*-
# ==========================================================================
# Anatomy of a good prompt [generative-ai / Prompting and structured outputs]
# ==========================================================================
# WHAT IT IS
# A prompt is the program you give a model. Reliable prompts contain: a role
# or context ("You are a support agent for …"), the task stated precisely, the
# input clearly delimited from the instructions (XML-style tags or triple
# quotes), the constraints (length, tone, what to avoid, what to do when
# unsure), the output format, and optionally examples. Vague ("make this
# better") gives vague results; specific ("rewrite in 3 bullet points for a
# non-technical manager, max 40 words each") gives usable ones. Say what to
# do, not only what not to do, and tell the model it may answer "I don't
# know".
#
# WHERE YOU USE IT
# Treat prompts as code: version them, review them and test them against a
# fixed set of cases.
#
# RUN IT:  python 01_prompt-0.py
#

parts = {
    "role": "You are a support agent for ACME.",
    "task": "Summarise the customer email below.",
    "input": "<email>My order 123 has not arrived...</email>",
    "constraints": "Max 3 bullet points. If information is missing, write 'unknown'.",
    "format": "Return JSON with keys summary and urgency.",
}
prompt = "\n".join(parts.values())
print(prompt)
print(len(prompt.split()), "words")

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# You are a support agent for ACME.
# Summarise the customer email below.
# <email>My order 123 has not arrived...</email>
# Max 3 bullet points. If information is missing, write 'unknown'.
# Return JSON with keys summary and urgency.
# 35 words
