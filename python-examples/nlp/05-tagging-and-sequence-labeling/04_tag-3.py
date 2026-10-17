# -*- coding: utf-8 -*-
# ==========================================================================
# Named entity recognition and BIO tags [nlp / Tagging and sequence labeling]
# ==========================================================================
# WHAT IT IS
# Named entity recognition (NER) finds spans that name people (PER),
# organisations (ORG), locations (LOC), dates and so on. It is cast as tagging
# with the BIO scheme: B-X begins an entity of type X, I-X continues it, O is
# outside. "Barack Obama visited Vilnius" → B-PER I-PER O B-LOC. An I-tag may
# only follow a B- or I- tag of the same type, which a decoder can enforce.
# NER feeds knowledge graphs, search and question answering.
#
# WHERE YOU USE IT
# Ambiguity is the hard part: "Washington" can be a person, a city or a state;
# "Apple" an ORG or a fruit.
#
# RUN IT:  python 04_tag-3.py
#

tokens = "Barack Obama visited Vilnius".split()
tags = ["B-PER", "I-PER", "O", "B-LOC"]
spans, start = [], None
for i, t in enumerate(tags + ["O"]):
    if t.startswith("B-") or t == "O":
        if start is not None:
            spans.append((" ".join(tokens[start:i]), tags[start][2:]))
            start = None
        if t.startswith("B-"):
            start = i
print(spans)

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# [('Barack Obama', 'PER'), ('Vilnius', 'LOC')]
