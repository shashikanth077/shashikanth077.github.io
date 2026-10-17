# -*- coding: utf-8 -*-
# ==========================================================================
# What generative AI is [generative-ai / Tokens, embeddings and context]
# ==========================================================================
# WHAT IT IS
# Generative AI models learn the distribution of data (text, images, audio,
# code) and sample new examples from it. A large language model (LLM) is
# trained on one simple task — predict the next token — on trillions of
# tokens, and from this emerge abilities nobody programmed: answering
# questions, summarising, translating, writing code. The same recipe (large
# model, huge data, self-supervision) powers image, audio and video
# generators. They are probabilistic: the same prompt can give different
# answers, and a fluent answer is not necessarily a true one.
#
# WHERE YOU USE IT
# Treat a model as a very capable but fallible component: design systems
# around its failure modes.
#
# RUN IT:  python 01_tok-0.py
#

import numpy as np

probs = {"Paris": 0.86, "Lyon": 0.07, "France": 0.04, "the": 0.03}
rng = np.random.default_rng(0)
print([str(rng.choice(list(probs), p=list(probs.values()))) for _ in range(6)])

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# ['Paris', 'Paris', 'Paris', 'Paris', 'Paris', 'Lyon']
