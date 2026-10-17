# -*- coding: utf-8 -*-
# ==========================================================================
# Real-time fraud detection in one picture [fraud-detection / Frame the
# problem]
# ==========================================================================
# WHAT IT IS
# When you tap a card, the shop's bank asks the card issuer "may I take this
# payment?" and waits. Inside that wait, usually well under a quarter of a
# second, a fraud system looks at the transaction and everything known about
# the card, device and merchant, and answers approve, decline or step up (ask
# for an extra check, or send it to a person). It must be fast (the customer
# is standing at the till), right (a missed fraud costs money; a wrongly
# blocked customer costs a sale and trust) and always available (if it is
# down, payments stop or fraud walks in). That is the whole project: turn a
# stream of events into a score, turn the score into a decision, measure what
# it cost, and keep learning as fraudsters adapt. Below, a live feed of
# transactions: move the two thresholds and watch fraud stopped, good
# customers blocked and the net money saved change at once.
#
# WHERE YOU USE IT
# Everything in this track is built around that loop: stream → features →
# score → decision → outcome → retrain. The live lab is synthetic (fraud is
# boosted to a few percent so you can see it; real card fraud is closer to a
# tenth of a percent).
#
# RUN IT:  python 01_frame-0.py
#

def score(txn):
    """A toy risk score in [0, 1]: big amount, far from home, or a gift card."""
    s = 0.02
    if txn["amount"] > 500: s += 0.4
    if txn["country"] != txn["home"]: s += 0.3
    if txn["merchant"] == "gift cards": s += 0.2
    return min(s, 1.0)

def authorize(txn, review_at=0.4, decline_at=0.8):
    s = score(txn)
    if s >= decline_at: return "decline", s
    if s >= review_at: return "review", s
    return "approve", s

for t in [
    {"amount": 25,   "country": "FR", "home": "FR", "merchant": "grocery"},
    {"amount": 700,  "country": "FR", "home": "FR", "merchant": "electronics"},
    {"amount": 900,  "country": "US", "home": "FR", "merchant": "gift cards"},
]:
    print(authorize(t))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# ('approve', 0.02)
# ('review', 0.42000000000000004)
# ('decline', 0.9199999999999999)
