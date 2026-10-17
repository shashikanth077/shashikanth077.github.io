# -*- coding: utf-8 -*-
# ==========================================================================
# What a language model is [nlp / Language models and generation]
# ==========================================================================
# WHAT IT IS
# A language model assigns a probability to text: how likely is this sentence,
# or which word comes next? By the chain rule, P(w₁ … wₙ) = Π P(wᵢ | w₁ …
# wᵢ₋₁). Fluent English gets a high probability, word salad a low one.
# Language models power speech recognition, spelling correction, machine
# translation, autocomplete and — scaled up — text generation. The difference
# between systems is only how much of the history they can use and how they
# estimate the conditional probability.
#
# WHERE YOU USE IT
# Everything from n-gram counts to a large transformer answers the same
# question: what comes next?
#
# RUN IT:  python 01_lm-0.py
#

p_next = {"<s>": {"i": 1.0}, "i": {"like": 0.67, "love": 0.33}, "like": {"nlp": 0.5, "cats": 0.5}}
sentence = ["<s>", "i", "like", "nlp"]
p = 1.0
for a, b in zip(sentence, sentence[1:]):
    p *= p_next[a][b]
print(round(p, 4))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 0.335
