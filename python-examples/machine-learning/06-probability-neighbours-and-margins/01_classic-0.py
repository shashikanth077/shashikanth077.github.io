# -*- coding: utf-8 -*-
# ==========================================================================
# Naive Bayes: prior times evidence [machine-learning / Probability,
# neighbours and margins]
# ==========================================================================
# WHAT IT IS
# P(class | clues) ∝ P(class) × Π P(clue | class). For a new email with offer
# = yes and links > 2.5 = yes, using Laplace smoothing (count + 1)/(rows + 2)
# for each yes/no clue: P(Spam) = 0.5, P(offer | Spam) = 4/6, P(links | Spam)
# = 5/6, so the Spam score is 0.5 × 4/6 × 5/6 = 10/36; for Normal, 0.5 × 2/6 ×
# 1/6 = 1/36. Normalise: P(Spam | clues) = 10/11 ≈ 0.9091. "Naive" = features
# are treated as independent given the class. Toggle the clues.
#
# WHERE YOU USE IT
# The 90.9% is the model's posterior under its assumptions, not a guarantee
# that 90.9% of similar emails are spam.
#
# RUN IT:  python 01_classic-0.py
#

n = 4
p_yes = lambda count: (count + 1) / (n + 2)
prior = 0.5
spam = prior * p_yes(3) * p_yes(4)
normal = prior * p_yes(1) * p_yes(0)
print(round(spam, 4), round(normal, 4))
print(round(spam / (spam + normal), 4))
spam2 = prior * (1 - p_yes(3)) * p_yes(4)
normal2 = prior * (1 - p_yes(1)) * p_yes(0)
print(round(spam2 / (spam2 + normal2), 4))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 0.2778 0.0278
# 0.9091
# 0.7143
