# -*- coding: utf-8 -*-
# ==========================================================================
# System prompts, roles and multi-turn conversations [building-with-claude /
# The Claude API]
# ==========================================================================
# WHAT IT IS
# A conversation is a list of alternating user and assistant messages; the
# application appends each new turn and re-sends the whole list — Claude keeps
# no memory between calls. The system prompt holds the standing instructions:
# role, tone, rules, output format, what to do when unsure. Cost grows with
# the conversation: with a 500-token system prompt and 200 new tokens per
# turn, turn 10 sends 500 + 9 × 200 = 2,300 input tokens. Control it by
# summarising or dropping old turns, caching the stable prefix (next concepts)
# and keeping the system prompt specific rather than long.
#
# WHERE YOU USE IT
# Put stable content first (system prompt, reference material) and the
# changing question last: that also makes caching work.
#
# RUN IT:  python 04_api-3.py
#

messages = []
def turn(user_text, assistant_text):
    messages.append({"role": "user", "content": user_text})
    messages.append({"role": "assistant", "content": assistant_text})

for i in range(3):
    turn(f"question {i}", f"answer {i}")
print(len(messages), [m["role"] for m in messages])
system, per_turn = 500, 200
print([system + per_turn * t for t in (0, 4, 9)])

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 6 ['user', 'assistant', 'user', 'assistant', 'user', 'assistant']
# [500, 1300, 2300]
