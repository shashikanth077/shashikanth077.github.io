# -*- coding: utf-8 -*-
# ==========================================================================
# Contextual embeddings: one word, many vectors [nlp / Text representations]
# ==========================================================================
# WHAT IT IS
# A static embedding gives "bank" one vector whatever the sentence. Contextual
# embeddings (ELMo, BERT and its successors) compute a different vector for
# each occurrence from the whole sentence: "river bank" and "bank loan" end up
# far apart. They come from deep networks pretrained to predict masked or next
# words on enormous text, then fine-tuned on the task. This is the shift that
# made pretraining the default in NLP.
#
# WHERE YOU USE IT
# Using a pretrained encoder as a frozen feature extractor is cheap; full
# fine-tuning usually gives more accuracy.
#
# RUN IT:  python 07_repr-6.py
#

import numpy as np

static = {"bank": np.array([0.5, 0.5])}
context_shift = {"river": np.array([-0.4, 0.3]), "loan": np.array([0.4, -0.3])}
for c, s in context_shift.items():
    print("bank near", c, (static["bank"] + s).round(2).tolist())

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# bank near river [0.1, 0.8]
# bank near loan [0.9, 0.2]
