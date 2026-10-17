# -*- coding: utf-8 -*-
# ==========================================================================
# Sequence-to-sequence: one sequence in, another out [nlp /
# Sequence-to-sequence and transformers]
# ==========================================================================
# WHAT IT IS
# Translation, summarisation, paraphrase and dialog map one sequence to
# another of different length. A sequence-to-sequence model has an encoder
# that reads the source into hidden states and a decoder that writes the
# target one token at a time, each step conditioned on the source and on the
# tokens already produced. During training the decoder is fed the true
# previous word (teacher forcing); at test time it feeds back its own output.
# Squeezing everything into one vector forgets long inputs — the reason for
# attention.
#
# WHERE YOU USE IT
# Source and target lengths differ, so decoding needs an explicit
# end-of-sequence token.
#
# RUN IT:  python 01_s2s-0.py
#

source = "i love cats".split()
target = ["<s>", "j'aime", "les", "chats", "</s>"]
decoder_inputs, decoder_targets = target[:-1], target[1:]
print(list(zip(decoder_inputs, decoder_targets)))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# [('<s>', "j'aime"), ("j'aime", 'les'), ('les', 'chats'), ('chats', '</s>')]
