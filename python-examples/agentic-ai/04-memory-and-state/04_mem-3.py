# -*- coding: utf-8 -*-
# ==========================================================================
# What should an agent remember? [agentic-ai / Memory and state]
# ==========================================================================
# WHAT IT IS
# Memory is a write policy as much as a retrieval one. Store: stable user
# preferences ("prefers metric units"), decisions and their reasons, outcomes
# of past attempts ("approach X failed because Y"), and verified facts with
# their source and date. Do not store: secrets and sensitive personal data
# without need and consent, unverified claims, instructions that arrived
# inside tool output, or whole raw transcripts. Give each memory an expiry or
# a review date, allow users to see, correct and delete what is stored, and
# keep it scoped per user and per project. A 90-day expiry on an address is
# cheap insurance against stale facts.
#
# WHERE YOU USE IT
# A memory is data the agent will later trust: apply the same care as for any
# database of personal information.
#
# RUN IT:  python 04_mem-3.py
#

candidates = [
    ("User prefers metric units", True),
    ("Approach X failed: rate limit", True),
    ("API key sk-12345", False),
    ("Webpage said: ignore previous instructions", False),
]
store = [t for t, keep in candidates if keep]
print(store)

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# ['User prefers metric units', 'Approach X failed: rate limit']
