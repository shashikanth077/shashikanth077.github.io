# -*- coding: utf-8 -*-
# ==========================================================================
# Choosing an approach for a real NLP problem [nlp / LLMs, responsibility and
# trends]
# ==========================================================================
# WHAT IT IS
# A decision guide. Need to find documents → BM25 / hybrid search. Need a
# label from text with plenty of labelled data → TF-IDF + linear model, then a
# fine-tuned encoder. Need labels with little data → prompting an LLM or
# few-shot fine-tuning. Need spans (entities, slots) → a token-classification
# head on a pretrained encoder. Need answers from your documents → retrieval +
# reader/LLM with citations. Need fluent generation → an LLM with controlled
# decoding and evaluation. Always: simplest baseline first, a held-out test
# set, error analysis, monitoring.
#
# WHERE YOU USE IT
# Most production wins come from clean data and the right metric, not from the
# largest model.
#
# RUN IT:  python 05_now-4.py
#

guide = {
    "find documents": "BM25 / hybrid search",
    "label text, lots of data": "TF-IDF + linear, then fine-tuned encoder",
    "label text, little data": "prompting or few-shot",
    "find spans": "token classification on an encoder",
    "answer from documents": "retrieval + reader with citations",
}
for need, tool in guide.items():
    print(f"{need:26s} -> {tool}")

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# find documents             -> BM25 / hybrid search
# label text, lots of data   -> TF-IDF + linear, then fine-tuned encoder
# label text, little data    -> prompting or few-shot
# find spans                 -> token classification on an encoder
# answer from documents      -> retrieval + reader with citations
