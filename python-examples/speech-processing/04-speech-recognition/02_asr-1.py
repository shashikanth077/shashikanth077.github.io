# -*- coding: utf-8 -*-
# ==========================================================================
# Word error rate [speech-processing / Speech recognition]
# ==========================================================================
# WHAT IT IS
# ASR is scored by word error rate: WER = (S + D + I) / N, the minimum number
# of substituted, deleted and inserted words (found by the same edit-distance
# table used for spelling) divided by the number of reference words. Reference
# "the cat sat on the mat" (N = 6) and hypothesis "the cat sit on mat": one
# substitution (sat → sit) and one deletion (the) give WER = 2/6 = 33.3%. WER
# can exceed 100% if there are many insertions. Related: character error rate
# for languages without spaces. Normalise case, punctuation and numbers before
# scoring or you will measure formatting, not recognition.
#
# WHERE YOU USE IT
# A 5% WER on read speech may be 30% on a noisy phone call: always quote the
# test set.
#
# RUN IT:  python 02_asr-1.py
#

def wer(ref, hyp):
    r, h = ref.split(), hyp.split()
    D = [[i + j if i * j == 0 else 0 for j in range(len(h) + 1)] for i in range(len(r) + 1)]
    for i in range(1, len(r) + 1):
        for j in range(1, len(h) + 1):
            D[i][j] = min(D[i - 1][j] + 1, D[i][j - 1] + 1, D[i - 1][j - 1] + (r[i - 1] != h[j - 1]))
    return D[-1][-1] / len(r)

print(round(wer("the cat sat on the mat", "the cat sit on mat"), 3))
print(wer("hello world", "hello world"), wer("hi", "oh hi there you"))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 0.333
# 0.0 3.0
