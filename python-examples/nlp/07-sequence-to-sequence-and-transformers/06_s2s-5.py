# -*- coding: utf-8 -*-
# ==========================================================================
# Pretraining, fine-tuning and prompting [nlp / Sequence-to-sequence and
# transformers]
# ==========================================================================
# WHAT IT IS
# Modern NLP has three ways to use a pretrained language model. Fine-tuning
# updates (some of) the weights on labelled task data: best accuracy, needs
# data and compute. Feature extraction freezes the model and trains a small
# head on its vectors: cheap. Prompting adds instructions and examples to the
# input and changes no weights: zero or few labelled examples, fastest to try,
# less predictable. Choose by data, latency, cost and privacy; start with
# prompting or a small baseline and measure before investing in fine-tuning.
#
# WHERE YOU USE IT
# A prompt is part of your system: version it, test it on a fixed evaluation
# set, and re-test when the model changes.
#
# RUN IT:  python 06_s2s-5.py
#

options = {
    "prompting": {"labelled examples": 0, "weights changed": False},
    "feature extraction": {"labelled examples": 1000, "weights changed": False},
    "fine-tuning": {"labelled examples": 10000, "weights changed": True},
}
for k, v in options.items():
    print(k, v)

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# prompting {'labelled examples': 0, 'weights changed': False}
# feature extraction {'labelled examples': 1000, 'weights changed': False}
# fine-tuning {'labelled examples': 10000, 'weights changed': True}
