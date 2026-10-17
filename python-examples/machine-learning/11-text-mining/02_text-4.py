# -*- coding: utf-8 -*-
# ==========================================================================
# Preparing text without destroying its meaning [machine-learning / Text
# mining]
# ==========================================================================
# WHAT IT IS
# Cleaning depends on the task. Keep the original securely, normalise
# whitespace and Unicode, tokenise, optionally remove stop words or reduce
# words to stems/lemmas, then create features. Caution everywhere:
# lower-casing can hurt entity recognition; do not remove "not" blindly
# ("payment received" versus "payment not received"); a stem like "connect"
# may not be a dictionary word; n-grams keep phrases ("not refunded") but
# multiply features. "It is not bad" and "It is bad" must stay
# distinguishable, and "Great, another payment failure" may be sarcasm.
#
# WHERE YOU USE IT
# The code uses a simple transparent tokeniser, not a production multilingual
# one. Pretrained models expect their own input format.
#
# RUN IT:  python 02_text-4.py
#

import re

msg = "My PAYMENT was not refunded for order AB123!!!"
tokens = re.findall(r"[a-z0-9]+", msg.lower())
print(tokens)
stop = {"my", "was", "for", "the", "a"}
kept = [t for t in tokens if t not in stop]
print(kept)
print(list(zip(kept, kept[1:])))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# ['my', 'payment', 'was', 'not', 'refunded', 'for', 'order', 'ab123']
# ['payment', 'not', 'refunded', 'order', 'ab123']
# [('payment', 'not'), ('not', 'refunded'), ('refunded', 'order'), ('order', 'ab123')]
