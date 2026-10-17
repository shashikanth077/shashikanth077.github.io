# -*- coding: utf-8 -*-
# ==========================================================================
# Evaluating NER: entity-level F1 [nlp / Tagging and sequence labeling]
# ==========================================================================
# WHAT IT IS
# Token accuracy is misleading because most tokens are O. NER is scored at
# entity level: a predicted entity counts only if both its span AND type match
# a gold entity exactly. Gold: [Barack Obama PER][Vilnius LOC]. Predicted:
# [Obama PER][Vilnius LOC] — the first span is wrong, so TP = 1, FP = 1, FN =
# 1: precision 0.5, recall 0.5, F1 0.5. Partial-match variants exist but exact
# match is the standard (CoNLL).
#
# WHERE YOU USE IT
# Report F1 per entity type too: a good average can hide a type that never
# works.
#
# RUN IT:  python 05_tag-4.py
#

gold = {(0, 2, "PER"), (3, 4, "LOC")}
pred = {(1, 2, "PER"), (3, 4, "LOC")}
tp = len(gold & pred)
p, r = tp / len(pred), tp / len(gold)
print(tp, len(pred) - tp, len(gold) - tp, p, r, 2 * p * r / (p + r))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 1 1 1 0.5 0.5 0.5
