# -*- coding: utf-8 -*-
# ==========================================================================
# Zero-shot and few-shot prompting [generative-ai / Prompting and structured
# outputs]
# ==========================================================================
# WHAT IT IS
# Zero-shot: only instructions. Few-shot: add a handful of worked examples,
# which show the format, label set and tone better than words. Choose examples
# that are representative, varied and correct; order can matter; and cover the
# hard cases. Each example costs tokens: 5 examples of 60 tokens add 300
# tokens to every request (at 10,000 requests/day that is 3 million extra
# input tokens per day). If many examples are needed, consider fine-tuning
# instead or dynamically retrieving the most similar examples for each query.
#
# WHERE YOU USE IT
# A wrong example is worse than none: models copy mistakes in the examples
# faithfully.
#
# RUN IT:  python 02_prompt-1.py
#

examples, tokens_each, requests = 5, 60, 10000
extra = examples * tokens_each
print(extra, extra * requests)
shots = [("great", "positive"), ("awful", "negative")]
print("".join(f"Text: {t}\nLabel: {l}\n" for t, l in shots) + "Text: fine\nLabel:")

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 300 3000000
# Text: great
# Label: positive
# Text: awful
# Label: negative
# Text: fine
# Label:
