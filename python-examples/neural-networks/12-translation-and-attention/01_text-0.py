# -*- coding: utf-8 -*-
# ==========================================================================
# Machine translation: encoder and decoder [neural-networks / Translation and
# attention]
# ==========================================================================
# WHAT IT IS
# Seq2Seq translation uses two recurrent networks: an encoder reads the source
# words ("I love cats") into hidden states; a decoder generates the target
# ("J'aime les chats") one word at a time, each prediction conditioned on the
# words already generated and the encoded source. Squeezing the whole source
# into one fixed-size vector forgets the early words of long sentences.
# Attention (Bahdanau, 2014) lets the decoder look back at all encoder states
# and learn where to focus at each output word.
#
# WHERE YOU USE IT
# Teacher forcing during training feeds the true previous word to the decoder;
# at test time it uses its own predictions.
#
# RUN IT:  python 01_text-0.py
#

source = "i love cats".split()
target = ["j'aime", "les", "chats"]
print(len(source), len(target), "lengths differ")

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 3 3 lengths differ
