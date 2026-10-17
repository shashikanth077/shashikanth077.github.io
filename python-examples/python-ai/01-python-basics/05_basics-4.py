# -*- coding: utf-8 -*-
# ==========================================================================
# Strings and f-strings [python-ai / Python basics]
# ==========================================================================
# WHAT IT IS
# Strings are ordered sequences of characters. They index and slice like lists
# but are immutable. f-strings embed values directly, with formatting such as
# :.2f. The everyday methods are strip(), lower(), split(), join() and
# replace().
#
# WHERE YOU USE IT
# Cleaning text, building file names like model_v2_epoch10.pt and formatting
# metrics in logs all use string handling. NLP starts with lower(), strip()
# and split().
#
# RUN IT:  python 05_basics-4.py
#

text = "  Hello, AI World  "
clean = text.strip().lower()
words = clean.split()
print(words)
print(clean[0], clean[-5:])
score = 0.87654
print(f"Accuracy: {score:.2f}")

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# ['hello,', 'ai', 'world']
# h world
# Accuracy: 0.88
