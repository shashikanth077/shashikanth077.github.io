# -*- coding: utf-8 -*-
# ==========================================================================
# Question answering: kinds of QA [nlp / Question answering and dialog]
# ==========================================================================
# WHAT IT IS
# Extractive QA: the answer is a span copied from a given passage ("Where is
# the Vilnius Gediminas Tower?" → "Vilnius"). Open-domain QA: first find
# relevant passages in a large collection, then read them. Generative QA: a
# model writes the answer, possibly using retrieved text. Knowledge-base QA
# translates the question to a query over structured data. Closed-book models
# answer from their weights alone and can be fluent yet wrong, so grounded
# approaches that cite sources are preferred when correctness matters.
#
# WHERE YOU USE IT
# Decide up front what to do when the answer is not in the sources: abstaining
# is a feature.
#
# RUN IT:  python 01_qa-0.py
#

passage = "Vilnius is the capital of Lithuania. It lies on the river Neris."
question = "What is the capital of Lithuania?"
answer = "Vilnius"
start = passage.index(answer)
print(answer, (start, start + len(answer)))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# Vilnius (0, 7)
