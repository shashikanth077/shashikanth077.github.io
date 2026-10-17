# -*- coding: utf-8 -*-
# ==========================================================================
# Prompt templates and structured output [langchain-langgraph-rag / LangChain:
# models, tools, runnables and agents]
# ==========================================================================
# WHAT IT IS
# A prompt template turns variables into messages: "Summarise {text} in {n}
# bullet points." Keeping the template separate from the data makes prompts
# reusable, testable and versionable. To get data rather than prose, ask the
# model for structured output: define a schema (a Pydantic class or a typed
# dict), pass it to the model, and receive a validated object — the framework
# uses the provider's tool-calling or JSON mode under the hood and parses the
# result. Always validate: a model can still return a wrong value that fits
# the schema. Combine the two: template → model with structured output → typed
# object your code can trust to have the right fields.
#
# WHERE YOU USE IT
# Version your templates with the code; a prompt change is a behaviour change
# and needs the evaluation set.
#
# RUN IT:  python 04_lc-3.py
#

import json

template = "Summarise the text in {n} bullet points. Return JSON with keys 'bullets' (list) and 'tone' (string).\nText: {text}"
prompt = template.format(n=2, text="LangGraph models agents as graphs with state and checkpoints.")
print(prompt.splitlines()[0])
model_output = '{"bullets": ["Agents are graphs", "State is checkpointed"], "tone": "neutral"}'
data = json.loads(model_output)
ok = isinstance(data.get("bullets"), list) and isinstance(data.get("tone"), str)
print(ok, len(data["bullets"]))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# Summarise the text in 2 bullet points. Return JSON with keys 'bullets' (list) and 'tone' (string).
# True 2
