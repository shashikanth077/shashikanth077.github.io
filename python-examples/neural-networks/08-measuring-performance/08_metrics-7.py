# -*- coding: utf-8 -*-
# ==========================================================================
# Which metric should you use? [neural-networks / Measuring performance]
# ==========================================================================
# WHAT IT IS
# Start from the cost of a miss versus a false alarm. Spam filter: a miss lets
# spam in, a false alarm hides a useful email → precision and recall,
# threshold per product need. Fraud alert: missing fraud is costly, but
# investigators have limited capacity → recall, precision and costs. Digit
# reader: accuracy, macro F1 and the per-digit confusion matrix. Rare defect
# detection: recall and precision–recall analysis. There is no universally
# best metric: state the positive class, class balance, threshold, averaging
# method and the dataset the score was measured on.
#
# WHERE YOU USE IT
# Report enough detail that the number can be reproduced and interpreted.
#
# RUN IT:  python 08_metrics-7.py
#

costs = {"miss": 50.0, "false_alarm": 1.0}
fn, fp = 4, 8
print(fn * costs["miss"] + fp * costs["false_alarm"])
fn, fp = 10, 0
print(fn * costs["miss"] + fp * costs["false_alarm"])

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 208.0
# 500.0
