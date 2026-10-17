# -*- coding: utf-8 -*-
# ==========================================================================
# Rolling out assistants in a team [building-with-claude / Using assistants in
# development and research]
# ==========================================================================
# WHAT IT IS
# Treat adoption as a change project. Start with a pilot team and a small set
# of tasks with clear success measures. Write short guidelines: what to
# delegate, what must be reviewed by a person, what data must never be shared.
# Share assets — instructions, prompt files, skills and agents — in the
# repository so everyone benefits and changes are reviewed. Provide training
# on prompting, verification and security; collect failures and add them to a
# shared evaluation set; track metrics (cycle time, review time, defects,
# developer satisfaction, cost per developer); and review them every quarter.
# Expect the benefit to differ between tasks and between developers: measure
# rather than assume.
#
# WHERE YOU USE IT
# Budget for the cost of reviewing AI-written changes: faster typing is not
# the same as faster delivery.
#
# RUN IT:  python 05_dev-4.py
#

assets = [".github/copilot-instructions.md", ".github/prompts/", ".github/agents/", ".github/skills/", "CLAUDE.md", ".claude/skills/", ".claude/agents/"]
for a in assets:
    print("commit:", a)
cost_per_dev, devs = 20, 50
print(cost_per_dev * devs, "per month for", devs, "developers at", cost_per_dev)

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# commit: .github/copilot-instructions.md
# commit: .github/prompts/
# commit: .github/agents/
# commit: .github/skills/
# commit: CLAUDE.md
# commit: .claude/skills/
# commit: .claude/agents/
# 1000 per month for 50 developers at 20
