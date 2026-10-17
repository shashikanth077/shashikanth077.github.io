# -*- coding: utf-8 -*-
# ==========================================================================
# Intent detection and slot filling [nlp / Question answering and dialog]
# ==========================================================================
# WHAT IT IS
# Understanding a command has two sub-tasks solved together. Intent detection
# is sentence classification: "Book a table for four at 7" → book_table. Slot
# filling is sequence labelling with BIO tags: tokens "for four at 7" → O
# B-party O B-time. The same encoder can produce both outputs (a joint model),
# so the intent can help resolve ambiguous slots. Normalisation then turns
# "four" into 4 and "7" into 19:00. Errors here propagate to every later
# stage, which is why dialog data is annotated with both layers.
#
# WHERE YOU USE IT
# Keep a fallback intent and a confidence threshold: asking a clarifying
# question beats a confident wrong action.
#
# RUN IT:  python 06_qa-5.py
#

tokens = "Book a table for four at 7".split()
tags = ["O", "O", "O", "O", "B-party", "O", "B-time"]
slots = {t[2:]: w for w, t in zip(tokens, tags) if t.startswith("B-")}
print(slots)

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# {'party': 'four', 'time': '7'}
