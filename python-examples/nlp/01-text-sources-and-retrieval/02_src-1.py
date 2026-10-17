# -*- coding: utf-8 -*-
# ==========================================================================
# The NLP pipeline from raw text to answer [nlp / Text sources and retrieval]
# ==========================================================================
# WHAT IT IS
# A classic system is a chain: collect → clean → tokenize → represent → model
# → evaluate → deploy and monitor. Cleaning removes markup and fixes encoding;
# tokenization cuts text into units; representation turns tokens into numbers
# (counts, TF-IDF, embeddings); the model classifies, tags, ranks or
# generates; evaluation uses held-out data and the right metric. Modern
# systems often replace several middle stages with one pretrained network, but
# the same stages still exist inside it — and you still have to evaluate.
#
# WHERE YOU USE IT
# Keep the pipeline reproducible: the exact cleaning and tokenizer used in
# training must be applied at prediction time.
#
# RUN IT:  python 02_src-1.py
#

def clean(text):
    return " ".join(text.lower().split())

def tokenize(text):
    return text.split()

raw = "  The CAT   sat  on the mat "
print(tokenize(clean(raw)))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# ['the', 'cat', 'sat', 'on', 'the', 'mat']
