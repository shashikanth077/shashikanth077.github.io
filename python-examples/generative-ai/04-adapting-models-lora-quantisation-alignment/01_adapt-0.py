# -*- coding: utf-8 -*-
# ==========================================================================
# Prompting, RAG or fine-tuning? [generative-ai / Adapting models: LoRA,
# quantisation, alignment]
# ==========================================================================
# WHAT IT IS
# Three levers adapt a model, from cheap to costly. Prompting: change the
# instructions and examples — minutes, no data, fully reversible. Retrieval
# (RAG): give the model relevant documents at question time — adds fresh and
# private knowledge, with citations. Fine-tuning: change the weights on your
# examples — teaches style, format, domain skills and reduces prompt length,
# but does not reliably add facts and needs data and upkeep. Order of attack:
# prompt first, add retrieval if the model lacks knowledge, fine-tune if
# behaviour or cost must change. Many systems combine all three.
#
# WHERE YOU USE IT
# Fine-tuning for facts is a common mistake: facts change and models forget;
# retrieve them instead.
#
# RUN IT:  python 01_adapt-0.py
#

needs = {
    "unknown or changing facts": "RAG",
    "output style / format": "prompting, then fine-tuning",
    "domain skill, short prompts, low cost": "fine-tuning a small model",
    "quick prototype": "prompting",
}
for k, v in needs.items():
    print(f"{k:38s} -> {v}")

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# unknown or changing facts              -> RAG
# output style / format                  -> prompting, then fine-tuning
# domain skill, short prompts, low cost  -> fine-tuning a small model
# quick prototype                        -> prompting
