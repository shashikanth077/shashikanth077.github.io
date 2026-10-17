# -*- coding: utf-8 -*-
# ==========================================================================
# Retrieval-augmented generation: the idea [generative-ai /
# Retrieval-augmented generation]
# ==========================================================================
# WHAT IT IS
# A model's knowledge is frozen at training time and does not include your
# private documents. RAG fetches relevant passages at question time and puts
# them into the prompt: (1) index documents — split into chunks, embed, store;
# (2) retrieve the chunks closest to the question; (3) generate an answer
# instructed to use only those chunks and to cite them. Advantages: up-to-date
# and private knowledge without retraining, traceable sources, access control
# per document. Limits: the answer can only be as good as retrieval — if the
# right chunk is not found, the model guesses.
#
# WHERE YOU USE IT
# Evaluate retrieval and generation separately: most RAG failures are
# retrieval failures.
#
# RUN IT:  python 01_rag-0.py
#

chunks = ["Refunds are issued within 14 days.", "Shipping is free above 50 EUR.", "Support is open on weekdays."]
question = "How long do refunds take?"
context = "\n".join(f"[{i + 1}] {c}" for i, c in enumerate(chunks[:1]))
print(f"Answer using only the sources below and cite them.\n{context}\nQuestion: {question}")

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# Answer using only the sources below and cite them.
# [1] Refunds are issued within 14 days.
# Question: How long do refunds take?
