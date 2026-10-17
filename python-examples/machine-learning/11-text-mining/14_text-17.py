# -*- coding: utf-8 -*-
# ==========================================================================
# A tiny text-classification project, from scratch [machine-learning / Text
# mining]
# ==========================================================================
# WHAT IT IS
# Put the lessons together with the six-per-class toy corpus (Billing,
# Delivery, Account): build the vocabulary on TRAINING text only, count words
# per class, classify new messages with smoothed Naive Bayes in log space.
# This is a deliberately tiny demonstration, NOT an accuracy benchmark: the
# three test messages are too few and too similar to the training text. A
# production project needs a larger representative labelled set, realistic
# held-out threads or future tickets, language-specific checks, error
# analysis, model versioning and an explicit review policy.
#
# WHERE YOU USE IT
# For a thesis or portfolio start with a reproducible TF–IDF baseline and
# error analysis; add embeddings or generation only when they improve a
# measured task.
#
# RUN IT:  python 14_text-17.py
#

import numpy as np
from collections import Counter

train_text = ["refund payment", "refund charge", "payment charged twice", "refund money", "card payment problem", "charge refund request",
              "delivery late", "parcel delayed", "delivery missing", "late parcel", "package delivery problem", "parcel not arrived",
              "password login", "reset password", "login failed", "account locked", "password reset request", "cannot login account"]
y = ["Billing"] * 6 + ["Delivery"] * 6 + ["Account"] * 6
vocab = sorted({w for t in train_text for w in t.split()})
counts = {c: Counter() for c in dict.fromkeys(y)}
for t, c in zip(train_text, y):
    counts[c].update(t.split())

def predict(text, alpha=1.0):
    scores = {}
    for c, cnt in counts.items():
        total = sum(cnt.values()) + alpha * len(vocab)
        scores[c] = np.log(1 / 3) + sum(np.log((cnt[w] + alpha) / total) for w in text.split() if w in vocab)
    return max(scores, key=scores.get)

for t in ["payment refund please", "delivery parcel late", "password login problem", "refund my payment"]:
    print(t, "->", predict(t))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# payment refund please -> Billing
# delivery parcel late -> Delivery
# password login problem -> Account
# refund my payment -> Billing
