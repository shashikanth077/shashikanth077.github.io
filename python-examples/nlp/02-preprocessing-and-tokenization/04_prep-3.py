# -*- coding: utf-8 -*-
# ==========================================================================
# Spelling and the edit distance [nlp / Preprocessing and tokenization]
# ==========================================================================
# WHAT IT IS
# Edit (Levenshtein) distance counts the minimum insertions, deletions and
# substitutions that turn one string into another. A table D[i][j] holds the
# distance between the first i letters of one word and the first j of the
# other: D[i][j] = min(D[i−1][j] + 1, D[i][j−1] + 1, D[i−1][j−1] + (letters
# differ)). "kitten" → "sitting" takes 3 edits (k→s, e→i, insert g). Spell
# checkers rank dictionary words by small distance and by how common they are;
# the same table underlies sequence alignment and word-error rate.
#
# WHERE YOU USE IT
# Dynamic programming turns an exponential search into n × m cheap cells.
#
# RUN IT:  python 04_prep-3.py
#

import numpy as np

def edit(a, b):
    D = np.zeros((len(a) + 1, len(b) + 1), int)
    D[:, 0] = range(len(a) + 1)
    D[0, :] = range(len(b) + 1)
    for i in range(1, len(a) + 1):
        for j in range(1, len(b) + 1):
            D[i, j] = min(D[i - 1, j] + 1, D[i, j - 1] + 1, D[i - 1, j - 1] + (a[i - 1] != b[j - 1]))
    return D

print(edit("cat", "cut").tolist())
print(edit("kitten", "sitting")[-1, -1])

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# [[0, 1, 2, 3], [1, 0, 1, 2], [2, 1, 1, 2], [3, 2, 2, 1]]
# 3
