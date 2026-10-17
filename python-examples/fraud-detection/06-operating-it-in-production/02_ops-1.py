# -*- coding: utf-8 -*-
# ==========================================================================
# Feedback loops and selection bias [fraud-detection / Operating it in
# production]
# ==========================================================================
# WHAT IT IS
# You only learn the truth about transactions you let through (a chargeback
# arrives) or reviewed (an analyst decides). A declined payment gives no
# label: you never learn whether it was fraud. Train only on labelled data and
# the model sees a world filtered by its own past decisions: the frauds it
# already catches vanish from the data, it appears to work perfectly, and its
# weaknesses stay invisible. This is a feedback loop with selection bias.
# Countermeasures: keep a small random exploration slice (approve a few
# would-be declines under strict value limits), use analyst-reviewed and
# challenged samples, track the apparent fraud rate separately from the true
# one, and use techniques that weight examples by how likely they were to be
# observed.
#
# WHERE YOU USE IT
# Budget a small, deliberate "cost of learning": a fraction of a basis point
# of exploration protects the model from decaying silently.
#
# RUN IT:  python 02_ops-1.py
#

n, fraud = 1000, 30                       # 3 % fraud
declined_fraud, declined_good = 25, 5     # the model declines 30 payments, 25 of them genuinely fraud
labelled = n - (declined_fraud + declined_good)          # only approved payments ever get a chargeback label
fraud_seen = fraud - declined_fraud
print("true fraud rate        :", fraud / n)
print("fraud rate in the data :", round(fraud_seen / labelled, 4), f"({fraud_seen} cases in {labelled} labelled)")
print("fraud the model already stops is invisible in training:", declined_fraud)

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# true fraud rate        : 0.03
# fraud rate in the data : 0.0052 (5 cases in 970 labelled)
# fraud the model already stops is invisible in training: 25
