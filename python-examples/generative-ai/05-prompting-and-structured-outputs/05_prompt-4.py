# -*- coding: utf-8 -*-
# ==========================================================================
# Structured outputs and validation [generative-ai / Prompting and structured
# outputs]
# ==========================================================================
# WHAT IT IS
# Programs need data, not prose. Ask for JSON with a stated schema, give one
# example, and — most important — validate the result in code: parse it, check
# required keys and types, and retry or repair on failure. Many APIs offer
# constrained decoding or schema-bound output, which makes invalid JSON
# impossible by masking illegal tokens during generation. Keep fields small
# and unambiguous (enums rather than free text), and never execute or trust
# model output without checking it: a model can return a plausible but wrong
# value, an extra field or an injected instruction.
#
# WHERE YOU USE IT
# Count the failure rate of your parser on a few hundred real inputs: that
# number tells you whether you need retries.
#
# RUN IT:  python 05_prompt-4.py
#

import json

schema = {"summary": str, "urgency": str}
allowed = {"low", "medium", "high"}

def parse(text):
    try:
        data = json.loads(text)
    except json.JSONDecodeError:
        return None
    if not all(isinstance(data.get(k), t) for k, t in schema.items()) or data["urgency"] not in allowed:
        return None
    return data

print(parse('{"summary": "late order", "urgency": "high"}'))
print(parse('{"summary": "late order", "urgency": "very"}'), parse("Sure! Here is the JSON: {}"))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# {'summary': 'late order', 'urgency': 'high'}
# None None
