# -*- coding: utf-8 -*-
# ==========================================================================
# Evaluating QA: exact match and token F1 [nlp / Question answering and
# dialog]
# ==========================================================================
# WHAT IT IS
# Exact match (EM) is 1 only if the predicted answer equals a gold answer
# after normalising case, punctuation and articles. Token F1 gives partial
# credit: treat prediction and gold as bags of tokens. Gold "Vilnius",
# predicted "the city of Vilnius": EM = 0, but they share 1 token, so
# precision = 1/4, recall = 1/1, F1 = 0.4. Report both; EM is strict, F1
# forgives extra words. For generated answers human or model-assisted
# judgement of correctness and faithfulness is also needed.
#
# WHERE YOU USE IT
# Normalisation rules change EM noticeably, so publish them with the result.
#
# RUN IT:  python 03_qa-2.py
#

from collections import Counter

gold, pred = "Vilnius".lower().split(), "the city of Vilnius".lower().split()
common = sum((Counter(gold) & Counter(pred)).values())
p, r = common / len(pred), common / len(gold)
print(int(gold == pred), p, r, round(2 * p * r / (p + r), 2))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 0 0.25 1.0 0.4
