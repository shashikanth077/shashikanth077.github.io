# -*- coding: utf-8 -*-
# ==========================================================================
# Information extraction and named-entity recognition [machine-learning / Text
# mining]
# ==========================================================================
# WHAT IT IS
# Convert a sentence into structured fields: "Asha paid €20 for order AB123 on
# 12 September 2026." → person Asha (NER), amount 20 and currency EUR (pattern
# plus normalisation), order_id AB123 (an order-ID pattern or a domain-trained
# model), date 2026-09-12 (date recognition and normalisation). NER finds
# spans of people, organisations and places; relation extraction links them
# ("Asha paid €20 for AB123") — finding all entities does not reveal which
# amount belongs to which order. Measure quality under an exact span-and-type
# rule: reference 10 entities, extractor returns 8, 6 correct → precision 6/8
# = 0.75, recall 6/10 = 0.60, F1 = 2·6/(8 + 10) = 0.667.
#
# WHERE YOU USE IT
# An order ID is a domain field, not a standard NER label. "Tomorrow" needs
# the message timestamp and time zone to become a date. Validate extracted
# values against records and keep uncertainty when a field is ambiguous.
#
# RUN IT:  python 07_text-9.py
#

import re

text = "Asha paid €20 for order AB123 on 12 September 2026."
order = re.search(r"\b[A-Z]{2}\d{3}\b", text).group()
amount = re.search(r"€(\d+)", text).group(1)
print({"order_id": order, "amount": int(amount), "currency": "EUR"})
tp, returned, reference = 6, 8, 10
print(tp / returned, tp / reference, round(2 * tp / (returned + reference), 3))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# {'order_id': 'AB123', 'amount': 20, 'currency': 'EUR'}
# 0.75 0.6 0.667
