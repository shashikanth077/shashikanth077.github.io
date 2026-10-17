# -*- coding: utf-8 -*-
# ==========================================================================
# Where the field is going [nlp / LLMs, responsibility and trends]
# ==========================================================================
# WHAT IT IS
# Active directions: larger and more efficient models (distillation,
# quantisation, mixtures of experts); long context and retrieval instead of
# memorisation; multilingual and low-resource languages; multimodal models
# that read text together with images and speech; tool-using agents that call
# search, code and APIs; better evaluation (contamination-free benchmarks,
# model-based judges validated against humans); and attention to safety,
# privacy and energy use. Results arrive fast, so rely on papers' evaluation
# sections, reproducibility, and your own test set rather than headlines.
#
# WHERE YOU USE IT
# A useful habit: for every new method, ask what data it needs, what it costs
# to run, and how it fails.
#
# RUN IT:  python 04_now-3.py
#

trends = {"efficiency": "smaller, faster models", "retrieval": "grounded answers", "multimodal": "text + image + speech", "agents": "tool use and planning", "evaluation": "trustworthy benchmarks"}
for k, v in trends.items():
    print(f"{k:11s} {v}")

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# efficiency  smaller, faster models
# retrieval   grounded answers
# multimodal  text + image + speech
# agents      tool use and planning
# evaluation  trustworthy benchmarks
