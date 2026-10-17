# -*- coding: utf-8 -*-
# ==========================================================================
# Layering lists, rules and models [fraud-detection / Models and decisions]
# ==========================================================================
# WHAT IT IS
# A production decision is a short pipeline, not one model. Allow-lists
# (trusted customers and recurring bills) and deny-lists (known-bad devices,
# cards, emails) short-circuit the easy cases. Hard rules enforce policy and
# law — sanctions, velocity ceilings, regulatory limits. The model score ranks
# everything else. A policy layer turns the score into an action using
# thresholds by segment, amount and channel, and applies business overrides
# ("never decline a card on our VIP list without a call"). Every layer writes
# a reason to the decision log, so each outcome can be explained, audited and
# replayed. Keep the order stable and the layers simple: the model should
# carry the nuance.
#
# WHERE YOU USE IT
# Log (decision, score, which layer decided, feature snapshot, model and rule
# versions) for every transaction: it powers reason codes, audits, disputes
# and retraining.
#
# RUN IT:  python 09_model-8.py
#

DENY_DEVICES = {"d_bad1"}
ALLOW_CARDS = {"c_vip"}

def decide(txn, score):
    if txn["device"] in DENY_DEVICES:
        return "decline", "deny-list: known bad device"
    if txn["card"] in ALLOW_CARDS and score < 0.9:
        return "approve", "allow-list: trusted customer"
    if txn["amount"] > 5000:
        return "review", "rule: very large amount"
    if score >= 0.8: return "decline", f"model score {score:.2f}"
    if score >= 0.4: return "step up", f"model score {score:.2f}"
    return "approve", f"model score {score:.2f}"

tests = [({"device": "d_bad1", "card": "c1", "amount": 20}, 0.1), ({"device": "d1", "card": "c_vip", "amount": 20}, 0.5),
         ({"device": "d1", "card": "c2", "amount": 9000}, 0.1), ({"device": "d1", "card": "c3", "amount": 90}, 0.55)]
for txn, score in tests:
    print(decide(txn, score))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# ('decline', 'deny-list: known bad device')
# ('approve', 'allow-list: trusted customer')
# ('review', 'rule: very large amount')
# ('step up', 'model score 0.55')
