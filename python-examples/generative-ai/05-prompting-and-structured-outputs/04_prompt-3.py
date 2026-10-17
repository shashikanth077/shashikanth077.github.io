# -*- coding: utf-8 -*-
# ==========================================================================
# System prompts, roles and conversation state [generative-ai / Prompting and
# structured outputs]
# ==========================================================================
# WHAT IT IS
# Chat models take a list of messages with roles: system (standing
# instructions: persona, rules, format), user and assistant. The model has no
# memory between requests: the application re-sends the history each turn, so
# cost grows with the conversation: turn n sends all previous turns. With a
# 500-token system prompt and 200 new tokens per turn (user + assistant) the
# input at turn 10 is 500 + 9 × 200 = 2,300 tokens, and the total input over
# ten turns is 10 × 500 + 200 × (0 + 1 + … + 9) = 14,000 tokens. Techniques:
# summarise old turns, drop irrelevant ones, cache the unchanging prefix, and
# keep the system prompt short and specific.
#
# WHERE YOU USE IT
# Never put secrets in a prompt: users can often coax the model into repeating
# its instructions.
#
# RUN IT:  python 04_prompt-3.py
#

system, per_turn = 500, 200
inputs = [system + per_turn * t for t in range(10)]
print(inputs[-1], sum(inputs))
print(sum(system for _ in range(10)), sum(per_turn * t for t in range(10)))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 2300 14000
# 5000 9000
