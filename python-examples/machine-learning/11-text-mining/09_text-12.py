# -*- coding: utf-8 -*-
# ==========================================================================
# Naive Bayes for text: a complete hand calculation [machine-learning / Text
# mining]
# ==========================================================================
# WHAT IT IS
# Training corpus: Billing "refund refund payment" and "refund payment";
# Delivery "delivery late" and "delivery delivery late". Counts per class:
# Billing refund 3, payment 2; Delivery delivery 3, late 2; each class has 5
# word occurrences; vocabulary |V| = 4. P(word | class) = (count + α) / (total
# words + α|V|) with α = 1: denominator 5 + 4 = 9, so Billing: refund 4/9,
# payment 3/9, delivery 1/9, late 1/9; Delivery: refund 1/9, payment 1/9,
# delivery 4/9, late 3/9. Score(class) = P(class) × Π P(word | class)^count;
# priors 0.5. For "refund payment": Billing 0.5 × 4/9 × 3/9 = 6/81, Delivery
# 0.5 × 1/9 × 1/9 = 0.5/81 → P(Billing) = 6/6.5 = 12/13 ≈ 0.9231. For long
# documents add log probabilities. Change the words below.
#
# WHERE YOU USE IT
# "Naive" = words are treated as conditionally independent given the class.
# The 92.31% is the model's posterior under its assumptions, not a guarantee.
#
# RUN IT:  python 09_text-12.py
#

import numpy as np

vocab = ["refund", "payment", "delivery", "late"]
counts = {"Billing": np.array([3, 2, 0, 0]), "Delivery": np.array([0, 0, 3, 2])}
alpha = 1
def posterior(words):
    scores = {}
    for c, cnt in counts.items():
        p = (cnt + alpha) / (cnt.sum() + alpha * len(vocab))
        scores[c] = 0.5 * float(np.prod([p[vocab.index(w)] for w in words]))
    total = sum(scores.values())
    return {c: round(s / total, 4) for c, s in scores.items()}

print(posterior(["refund", "payment"]))
print(posterior(["delivery", "late", "late"]))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# {'Billing': 0.9231, 'Delivery': 0.0769}
# {'Billing': 0.027, 'Delivery': 0.973}
