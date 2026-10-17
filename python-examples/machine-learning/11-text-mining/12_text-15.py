# -*- coding: utf-8 -*-
# ==========================================================================
# Text length, language and chunking [machine-learning / Text mining]
# ==========================================================================
# WHAT IT IS
# The short English ticket is only the starting point. Very short text ("not
# working"): use preceding context or ask for details. Paragraphs: keep local
# phrases and negation. Long documents: chunk around headings or coherent
# passages and keep document IDs. Multilingual tickets: multilingual models or
# a translation workflow, evaluated per language. Few labels, many unlabelled
# tickets: active learning (people label the most informative examples) or
# carefully validated semi-supervised learning (pseudo-label errors can
# reinforce themselves). Chunking arithmetic: 1,000 tokens, chunk size 300,
# overlap 50 → stride 250; windows start at 0, 250, 500, 750 with lengths 300,
# 300, 300, 250; total processed 1,150 tokens because of the overlap.
#
# WHERE YOU USE IT
# Evaluate by language, issue type and text length: a good average can hide a
# weak Lithuanian or mixed-language subset. Characters and tokens are not
# interchangeable.
#
# RUN IT:  python 12_text-15.py
#

n, size, overlap = 1000, 300, 50
stride = size - overlap
starts = list(range(0, n - overlap, stride))
lengths = [min(size, n - s) for s in starts]
print(stride, starts, lengths, sum(lengths))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 250 [0, 250, 500, 750] [300, 300, 300, 250] 1150
