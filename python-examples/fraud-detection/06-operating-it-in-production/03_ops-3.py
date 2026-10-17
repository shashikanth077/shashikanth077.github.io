# -*- coding: utf-8 -*-
# ==========================================================================
# Privacy, regulation and fairness [fraud-detection / Operating it in
# production]
# ==========================================================================
# WHAT IT IS
# Fraud systems handle sensitive data, so design for it. Data minimisation:
# use only what you need, tokenise or hash card numbers and identifiers so
# analysts and models see tokens, not raw values. PCI DSS governs how card
# data is stored, processed and accessed. Privacy law (for example the GDPR in
# Europe) limits what you may collect, how long you keep it and may give
# people rights around automated decisions — keep humans able to review, and
# be able to explain a decision. In the EU, PSD2 requires strong customer
# authentication for most electronic payments, with exemptions that depend on
# a transaction's risk level, which ties directly to your scoring. Finally,
# test for unfair outcomes: error rates that differ by region, age group or
# new-versus-old customers can be both unethical and illegal, even when no
# protected attribute is a feature.
#
# WHERE YOU USE IT
# Involve legal and compliance early; log access to personal data; review
# fairness metrics (false-decline rate by segment) on the same dashboard as
# fraud loss.
#
# RUN IT:  python 03_ops-3.py
#

import hmac, hashlib
SECRET = b"rotate-me-and-keep-in-a-vault"          # in production: from a secrets manager, never in code

def token(card_number: str) -> str:
    """Keyed hash: stable for joins and features, useless without the key, not reversible."""
    return hmac.new(SECRET, card_number.encode(), hashlib.sha256).hexdigest()[:16]

print(token("4111111111111111"))
print(token("4111111111111111") == token("4111111111111111"))
print(token("4111111111111112"))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 083c39090c3986c4
# True
# 681410537628b453
