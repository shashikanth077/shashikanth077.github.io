# -*- coding: utf-8 -*-
# ==========================================================================
# An AI-assisted development workflow [building-with-claude / Using assistants
# in development and research]
# ==========================================================================
# WHAT IT IS
# Use assistants where verification is cheap. A reliable loop: write or refine
# the specification (acceptance criteria, edge cases); ask the assistant to
# propose tests first; implement in small steps; run the tests, linter and
# type checker after each; review the diff line by line; commit with a message
# that says what changed and why. Delegate well-defined chores (boilerplate,
# refactors with tests, documentation, migration scripts); keep design
# decisions, security-sensitive code and anything you cannot verify under
# closer human review. Measure the effect with your own metrics (cycle time,
# review findings, escaped defects) rather than impressions.
#
# WHERE YOU USE IT
# The assistant's confidence is not evidence: only tests, types and reviews
# are.
#
# RUN IT:  python 01_dev-0.py
#

loop = ["write acceptance criteria", "ask for failing tests", "implement a small step", "run tests, lint, types", "review the diff", "commit"]
for i, s in enumerate(loop, 1):
    print(i, s)
review_more = ["security-sensitive code", "design decisions", "anything without tests"]
print(review_more)

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 1 write acceptance criteria
# 2 ask for failing tests
# 3 implement a small step
# 4 run tests, lint, types
# 5 review the diff
# 6 commit
# ['security-sensitive code', 'design decisions', 'anything without tests']
