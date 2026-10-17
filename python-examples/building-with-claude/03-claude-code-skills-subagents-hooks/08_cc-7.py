# -*- coding: utf-8 -*-
# ==========================================================================
# Workflows that work: explore, plan, code, verify [building-with-claude /
# Claude Code: skills, subagents, hooks]
# ==========================================================================
# WHAT IT IS
# Good results come from a repeatable loop, not a single mega-prompt. Explore:
# let Claude read the relevant code (or a read-only subagent) before changing
# anything. Plan: ask for a plan and review it — plan mode makes this
# explicit. Code: implement in small steps. Verify: give Claude a way to check
# its own work — run the tests, the linter, the type checker, a screenshot
# comparison — and have it fix failures; verification is the biggest quality
# lever. Commit in small, reviewable pieces on a branch. Keep the context
# clean: start a new session per task, use subagents for noisy research and
# summarise long sessions. Review the diff yourself: you stay responsible for
# what ships.
#
# WHERE YOU USE IT
# State the success check in the prompt ("done when npm test passes and the
# new test fails without the fix").
#
# RUN IT:  python 08_cc-7.py
#

loop = ["explore the code", "write a plan", "review the plan", "implement a small step", "run tests and linters", "fix failures", "commit on a branch", "review the diff"]
for i, step in enumerate(loop, 1):
    print(i, step)

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 1 explore the code
# 2 write a plan
# 3 review the plan
# 4 implement a small step
# 5 run tests and linters
# 6 fix failures
# 7 commit on a branch
# 8 review the diff
