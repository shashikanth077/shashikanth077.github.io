# -*- coding: utf-8 -*-
# ==========================================================================
# Vision-language tasks in practice [generative-ai / Multimodal and other
# media]
# ==========================================================================
# WHAT IT IS
# Typical uses of image-understanding models: captioning, visual question
# answering ("how many people are in the photo?"), document understanding
# (invoices, forms, tables, charts), OCR-free reading and UI/screenshot
# analysis. Practical advice: crop or tile large images so small text is
# legible; ask for structured output; verify numbers read from charts; and
# remember that models can miss small objects, miscount and misread unusual
# layouts. Do not use them for identity recognition of people and be careful
# with sensitive images (medical, children, private documents) — check the
# provider's data handling and your legal obligations.
#
# WHERE YOU USE IT
# Always keep a human review step for decisions based on images, such as
# medical or legal ones.
#
# RUN IT:  python 03_multi-2.py
#

chart_values = {"Q1": 12, "Q2": 18, "Q3": 15}
model_reading = {"Q1": 12, "Q2": 19, "Q3": 15}
errors = {k: abs(chart_values[k] - model_reading[k]) for k in chart_values}
print(errors, max(errors.values()))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# {'Q1': 0, 'Q2': 1, 'Q3': 0} 1
