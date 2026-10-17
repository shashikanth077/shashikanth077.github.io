# -*- coding: utf-8 -*-
# ==========================================================================
# Large language models and what they change [nlp / LLMs, responsibility and
# trends]
# ==========================================================================
# WHAT IT IS
# Large language models are transformers with billions of parameters
# pretrained on enormous text and then aligned with human feedback to follow
# instructions. One model can classify, extract, summarise, translate and
# answer, steered by prompts instead of a separate trained system per task.
# That removes a lot of pipeline engineering but not the need for evaluation:
# you still need labelled test cases, error analysis, cost and latency
# budgets, and a plan for wrong or unsafe output.
#
# WHERE YOU USE IT
# Treat the LLM as a component with a measurable accuracy on your task, not as
# an oracle.
#
# RUN IT:  python 01_now-0.py
#

tasks = ["classify sentiment", "extract entities", "summarise", "translate", "answer questions"]
prompt = "Task: {task}\nText: {text}\nAnswer:"
print(prompt.format(task=tasks[1], text="Obama visited Vilnius"))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# Task: extract entities
# Text: Obama visited Vilnius
# Answer:
