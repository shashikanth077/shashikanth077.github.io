# -*- coding: utf-8 -*-
# ==========================================================================
# Guardrails, moderation and safe use [generative-ai / Cost, latency, safety
# and shipping]
# ==========================================================================
# WHAT IT IS
# A production system surrounds the model with controls. Input checks: block
# or route abusive, off-topic or sensitive requests; detect prompt injection
# patterns. Output checks: moderation classifiers for harmful content,
# validators for format, PII detectors that mask personal data, a groundedness
# check against the sources. Policies: what the assistant must refuse, when to
# hand over to a human, and what is logged. Limits: rate limits, spending
# caps, least-privilege tools. Test with red-team prompts before launch and
# monitor in production; tune thresholds on both false blocks (annoying) and
# false allows (risky).
#
# WHERE YOU USE IT
# Safety is a system property: no single filter is enough, and none is
# permanent.
#
# RUN IT:  python 04_ops-3.py
#

import re

def mask_pii(text):
    text = re.sub(r"[\w.]+@[\w.]+", "<EMAIL>", text)
    return re.sub(r"\b\d{3}[- ]\d{3,4}\b", "<PHONE>", text)

print(mask_pii("Contact anna.k@example.com or call 555-1234."))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# Contact <EMAIL> or call <PHONE>.
