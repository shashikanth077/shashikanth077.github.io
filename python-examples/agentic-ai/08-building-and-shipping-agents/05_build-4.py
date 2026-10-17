# -*- coding: utf-8 -*-
# ==========================================================================
# Coding agents: a worked design [agentic-ai / Building and shipping agents]
# ==========================================================================
# WHAT IT IS
# A software-engineering agent shows the ideas working together. Tools: read
# files, search code, edit files, run tests and commands (in a sandbox). Loop:
# understand the task, search the code, plan, edit, run the tests, read the
# failures, fix, repeat until the tests pass or the budget ends. Strengths: an
# objective critic (the test suite), a resettable environment (a git branch)
# and cheap verification — which is why coding agents work earlier and better
# than most others. Safeguards: work on a branch, never push to main directly,
# protect secrets, limit commands, review the diff before merging, and keep a
# record of every command. The human stays the reviewer.
#
# WHERE YOU USE IT
# Whatever the domain, look for the equivalent of tests: a cheap, objective
# way to check the agent's work.
#
# RUN IT:  python 05_build-4.py
#

steps = ["read task", "search code", "write plan", "edit files", "run tests", "read failures", "fix", "run tests", "open pull request for review"]
for i, s in enumerate(steps, 1):
    print(i, s)
print("verification steps:", sum("tests" in s for s in steps))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 1 read task
# 2 search code
# 3 write plan
# 4 edit files
# 5 run tests
# 6 read failures
# 7 fix
# 8 run tests
# 9 open pull request for review
# verification steps: 2
