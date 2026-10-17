# -*- coding: utf-8 -*-
# ==========================================================================
# A small, understandable dataset [machine-learning / Text mining]
# ==========================================================================
# WHAT IT IS
# Start with six short support tickets so the vectors can be calculated by
# hand. The Billing, Delivery and Account labels are answers supplied by
# people (used for classification); for clustering hide that column and let
# the algorithm group the text vectors. Keep IDs for traceability but never
# use unique IDs as predictive features. Near-duplicate messages from one
# thread must not appear in both training and test sets — otherwise the model
# seems to generalise while merely recognising repeated text.
#
# WHERE YOU USE IT
# Collect authorised messages, remove identifiers from the modelling text,
# label using written rules, split by customer or thread, and fit
# preprocessing on training data only.
#
# RUN IT:  python 01_text-3.py
#

from collections import Counter

tickets = ["refund payment", "refund charge", "delivery late", "parcel delivery", "password login", "reset password"]
labels = ["Billing", "Billing", "Delivery", "Delivery", "Account", "Account"]
print(dict(Counter(labels)))
print([len(t.split()) for t in tickets])

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# {'Billing': 2, 'Delivery': 2, 'Account': 2}
# [2, 2, 2, 2, 2, 2]
