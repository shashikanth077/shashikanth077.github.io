# -*- coding: utf-8 -*-
# ==========================================================================
# Sequence labeling: HMM, CRF and neural taggers [nlp / Tagging and sequence
# labeling]
# ==========================================================================
# WHAT IT IS
# Tagging, NER, chunking and slot filling are all sequence labeling: one label
# per token, with dependencies between neighbouring labels. Three generations:
# the HMM models how words are generated (generative, independent features); a
# CRF models the probability of the whole tag sequence given the words
# (discriminative, any features, global normalisation, still decoded with
# Viterbi); a BiLSTM or transformer encoder reads the sentence in context,
# often with a CRF layer on top to forbid illegal tag transitions. Pretrained
# encoders with a softmax per token are today's default.
#
# WHERE YOU USE IT
# A CRF layer still helps when label constraints matter (BIO validity).
#
# RUN IT:  python 06_tag-5.py
#

legal = {("O", "B"), ("O", "O"), ("B", "I"), ("B", "O"), ("B", "B"), ("I", "I"), ("I", "O"), ("I", "B")}
def valid(tags):
    prev = "O"
    for t in tags:
        kind = t[0]
        if kind == "I" and prev == "O":
            return False
        prev = kind
    return True

print(valid(["B-PER", "I-PER", "O"]), valid(["O", "I-PER"]))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# True False
