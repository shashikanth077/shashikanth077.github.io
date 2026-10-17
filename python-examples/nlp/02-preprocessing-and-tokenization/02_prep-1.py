# -*- coding: utf-8 -*-
# ==========================================================================
# Tokenization: choosing the units [nlp / Preprocessing and tokenization]
# ==========================================================================
# WHAT IT IS
# A token is the unit the model sees. Splitting on spaces is a start, but
# English needs more care: "don't" → "do" + "n't", "New York" is one name,
# "e-mail" and "U.S.A." contain punctuation, and languages such as Chinese or
# Thai have no spaces at all. Tokenizers can work at word, sub-word or
# character level. Word tokens are readable but make a huge vocabulary with
# unknown words; character tokens never fail but make sequences long;
# sub-words sit in between.
#
# WHERE YOU USE IT
# The tokenizer is part of the model: swapping it silently changes every
# downstream number.
#
# RUN IT:  python 02_prep-1.py
#

import re

s = "Don't visit New York, e-mail me at 5pm!"
print(s.split())
print(re.findall(r"\w+(?:'\w+)?|[^\w\s]", s))
print(list("NLP"))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# ["Don't", 'visit', 'New', 'York,', 'e-mail', 'me', 'at', '5pm!']
# ["Don't", 'visit', 'New', 'York', ',', 'e', '-', 'mail', 'me', 'at', '5pm', '!']
# ['N', 'L', 'P']
