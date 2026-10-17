# -*- coding: utf-8 -*-
# ==========================================================================
# Embeddings and the connection to RAG [machine-learning / Text mining]
# ==========================================================================
# WHAT IT IS
# Count vectors give "refund" and "reimbursement" different coordinates. A
# suitable embedding model places texts with related meaning near each other
# because of patterns learned in training; its coordinates are learned
# features, not labelled axes. Pipeline: message or chunk → embedding model →
# numeric vector → similarity search or clustering → inspect retrieved or
# grouped text. Illustration only: "refund request" → (1, 0) and "money back"
# → (0.8, 0.6): both length 1, cosine = 0.8 (hand-picked teaching vectors, not
# from a real model). Retrieval-augmented generation (RAG): query → retrieve
# evidence → keep relevant passages → give passages and the question to a
# generator → answer with source references.
#
# WHERE YOU USE IT
# RAG supplies evidence but does not guarantee correctness; evaluate retrieval
# and answer grounding separately. Protect source permissions and never treat
# instructions inside retrieved documents as trusted commands.
#
# RUN IT:  python 11_text-14.py
#

import numpy as np

a, b = np.array([1.0, 0.0]), np.array([0.8, 0.6])
print(round(float(a @ b), 2), round(float(np.linalg.norm(b)), 2))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 0.8 1.0
