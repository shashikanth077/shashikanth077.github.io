# -*- coding: utf-8 -*-
# ==========================================================================
# Dialog systems: understanding, state and response [nlp / Question answering
# and dialog]
# ==========================================================================
# WHAT IT IS
# A task-oriented dialog system (book a table, check an order) is a pipeline.
# Natural-language understanding extracts the user's intent (book_table) and
# slots (party size, time) — intent classification plus slot filling with BIO
# tags. Dialog state tracking keeps the slots collected so far; the policy
# decides the next action (ask for the missing slot, confirm, call the booking
# API); natural-language generation writes the reply. Open-domain chatbots use
# a large language model for the whole loop but still need safety rules,
# memory and grounding.
#
# WHERE YOU USE IT
# Measure task success rate and turns-to-completion, not just whether replies
# sound fluent.
#
# RUN IT:  python 05_qa-4.py
#

state = {"intent": None, "party": None, "time": None}
def update(state, nlu):
    state.update({k: v for k, v in nlu.items() if v is not None})
    missing = [k for k, v in state.items() if v is None]
    return f"Ask for {missing[0]}" if missing else "Book the table"

print(update(state, {"intent": "book_table", "party": 4, "time": None}))
print(update(state, {"intent": None, "party": None, "time": "19:00"}))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# Ask for time
# Book the table
