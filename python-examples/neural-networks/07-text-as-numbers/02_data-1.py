# -*- coding: utf-8 -*-
# ==========================================================================
# Padding and truncation: equal-length sequences [neural-networks / Text as
# numbers]
# ==========================================================================
# WHAT IT IS
# Batches are rectangular tensors, so every review must have the same length.
# Choose a fixed length (here 10): shorter sequences are padded with the PAD
# ID 0, longer ones are truncated. A 4-token review [5,6,7,8] becomes
# [5,6,7,8,0,0,0,0,0,0]. Padding is usually masked or ignored by the model so
# it does not count as information. Pad at the end ("post") or beginning
# ("pre") consistently.
#
# WHERE YOU USE IT
# A very long fixed length wastes compute; a short one throws information
# away. Pick it from the length distribution of the training reviews.
#
# RUN IT:  python 02_data-1.py
#

def pad(seq, length=10, value=0):
    return (seq + [value] * length)[:length]

print(pad([5, 6, 7, 8]))
print(pad(list(range(1, 14))))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# [5, 6, 7, 8, 0, 0, 0, 0, 0, 0]
# [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
