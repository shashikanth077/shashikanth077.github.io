# -*- coding: utf-8 -*-
# ==========================================================================
# CTC: learning without alignments [speech-processing / Speech recognition]
# ==========================================================================
# WHAT IT IS
# Transcripts say what was spoken but not when. Connectionist temporal
# classification (CTC) lets the network output one symbol per frame from the
# alphabet plus a special blank (−), then collapses the sequence: merge
# repeated symbols, then delete blanks. "hh−e−ll−ll−oo" → "hello" (the blank
# between the two l-groups keeps the double "l"); "hhelllo" → "helo". Many
# frame-level paths give the same text: for T = 3 frames and the single label
# "a" there are 6 paths (a−−, −a−, −−a, aa−, −aa, aaa); for "ab" with T = 4
# there are 15. The CTC loss sums the probabilities of all valid paths and
# training maximises it, using dynamic programming.
#
# WHERE YOU USE IT
# CTC assumes outputs are independent given the input; a language model on top
# fixes that.
#
# RUN IT:  python 05_asr-4.py
#

import itertools

def collapse(path):
    out, prev = [], None
    for c in path:
        if c != prev and c != "-":
            out.append(c)
        prev = c
    return "".join(out)

print(collapse("hh-e-ll-ll-oo"), collapse("hhelllo"))
print(sum(collapse(p) == "a" for p in itertools.product("a-", repeat=3)))
print(sum(collapse(p) == "ab" for p in itertools.product("ab-", repeat=4)))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# hello helo
# 6
# 15
