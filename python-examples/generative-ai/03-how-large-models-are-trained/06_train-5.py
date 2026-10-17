# -*- coding: utf-8 -*-
# ==========================================================================
# Emergent abilities and in-context learning [generative-ai / How large models
# are trained]
# ==========================================================================
# WHAT IT IS
# Larger, longer-trained models show abilities absent in small ones.
# In-context learning: shown a few examples in the prompt, the model performs
# a new task without any weight update — a form of learning at inference time.
# Instruction following, multi-step reasoning and code synthesis also improve
# sharply with scale. Some apparent "jumps" are artefacts of all-or-nothing
# metrics: measured by a smoother score the improvement is gradual. The
# practical consequence: much can be done by prompting, and capability must be
# measured on your task rather than inferred from size.
#
# WHERE YOU USE IT
# Bigger is not always better: a smaller model fine-tuned or prompted well can
# beat a general giant on a narrow task at a fraction of the cost.
#
# RUN IT:  python 06_train-5.py
#

examples = [("great film", "positive"), ("dull and slow", "negative")]
query = "a wonderful surprise"
prompt = "".join(f"Review: {t}\nSentiment: {l}\n\n" for t, l in examples) + f"Review: {query}\nSentiment:"
print(prompt)

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# Review: great film
# Sentiment: positive
#
# Review: dull and slow
# Sentiment: negative
#
# Review: a wonderful surprise
# Sentiment:
