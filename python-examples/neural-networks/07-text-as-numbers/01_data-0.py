# -*- coding: utf-8 -*-
# ==========================================================================
# Words must become numbers: tokenize and index [neural-networks / Text as
# numbers]
# ==========================================================================
# WHAT IT IS
# A network multiplies numbers by weights, so the sentence "This movie was
# amazing" must be converted. Step 1: lowercase and tokenize into words. Step
# 2: map each known word to an integer ID from a vocabulary (unknown words get
# a special OOV ID, padding gets 0). With a demo vocabulary this=5, movie=6,
# was=7, amazing=8: the sentence is [5, 6, 7, 8]. IDs are labels, not
# magnitudes — amazing=8 is not "bigger" than movie=6.
#
# WHERE YOU USE IT
# The real IMDb dataset in Keras uses a frequency-ranked index; the demo IDs
# here are only for teaching.
#
# RUN IT:  python 01_data-0.py
#

vocab = {"<pad>": 0, "<start>": 1, "<oov>": 2, "this": 5, "movie": 6, "was": 7, "amazing": 8, "and": 9, "funny": 10}
sentence = "This movie was amazing and boring"
ids = [vocab.get(w, vocab["<oov>"]) for w in sentence.lower().split()]
print(ids)

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# [5, 6, 7, 8, 9, 2]
