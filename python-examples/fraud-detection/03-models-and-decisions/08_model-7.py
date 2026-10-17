# -*- coding: utf-8 -*-
# ==========================================================================
# More than yes or no: approve, step up, review, decline [fraud-detection /
# Models and decisions]
# ==========================================================================
# WHAT IT IS
# Real systems have more outputs than two. Approve the clearly good. Step up
# the uncertain with an extra check that a genuine customer passes in seconds
# and a fraudster usually cannot (3-D Secure, a one-time code, a biometric).
# Send a thin band to manual review when the payment can wait or is valuable
# enough. Decline the clearly bad, and sometimes block the card or account and
# call the customer. Each action has its own cost, success rate and customer
# annoyance, so the middle band between "approve" and "decline" is where good
# design pays: step-up converts many would-be false declines into approvals,
# and many would-be frauds into declines. Open the first lab again and widen
# the review band to feel the trade-off.
#
# WHERE YOU USE IT
# Treat friction as a budget: measure step-up pass and abandon rates per
# segment, and keep review volume within analyst capacity.
#
# RUN IT:  python 08_model-7.py
#

def action(score, amount, trusted_device):
    if score >= 0.9:
        return "decline + alert customer"
    if score >= 0.6:
        return "step up (one-time code)"
    if score >= 0.3 and amount > 300:
        return "manual review (hold goods)"
    if score >= 0.3 and not trusted_device:
        return "step up (one-time code)"
    return "approve"

for s, amt, trusted in [(0.05, 20, True), (0.35, 450, True), (0.35, 40, False), (0.7, 80, True), (0.95, 900, False)]:
    print(f"score {s:.2f} amount {amt:>3} trusted={str(trusted):<5} ->", action(s, amt, trusted))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# score 0.05 amount  20 trusted=True  -> approve
# score 0.35 amount 450 trusted=True  -> manual review (hold goods)
# score 0.35 amount  40 trusted=False -> step up (one-time code)
# score 0.70 amount  80 trusted=True  -> step up (one-time code)
# score 0.95 amount 900 trusted=False -> decline + alert customer
