# -*- coding: utf-8 -*-
# ==========================================================================
# Train, validation and test: three jobs [machine-learning / Evaluating models
# honestly]
# ==========================================================================
# WHAT IT IS
# Each split has one job. The training data estimates the model's parameters.
# The validation data (usually via cross-validation) guides choices — depth,
# k, C, the threshold. The test data estimates the performance of the FINAL
# selected workflow and is used once. Example: 100 labelled emails, 40 Spam
# and 60 Normal. A stratified 80/20 split gives 80 development emails (32
# Spam, 48 Normal) and 20 test emails (8 Spam, 12 Normal). Tuning on the test
# set, even a little, makes the final score optimistic.
#
# WHERE YOU USE IT
# A holdout split is not "bad": its reliability depends on sample size and on
# whether the split mimics future use. Repeated customers need group splits;
# forecasting needs time splits.
#
# RUN IT:  python 01_eval-0.py
#

spam, normal, test_share = 40, 60, 0.2
test_spam, test_normal = int(spam * test_share), int(normal * test_share)
print(spam + normal - test_spam - test_normal, test_spam + test_normal)
print(spam - test_spam, normal - test_normal, test_spam, test_normal)

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 80 20
# 32 48 8 12
