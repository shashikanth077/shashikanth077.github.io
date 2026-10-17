# -*- coding: utf-8 -*-
# ==========================================================================
# Copilot coding agent, issues and organisation agents [building-with-claude /
# GitHub Copilot: instructions, agents, skills, sub-agents]
# ==========================================================================
# WHAT IT IS
# Custom agents work beyond the editor. On GitHub you can pick a custom agent
# in the agents panel or agents tab, assign an issue to Copilot with a chosen
# agent, or select one in the GitHub Copilot CLI (the /agent command or a
# command-line reference); pull requests note which custom agent did the work.
# Agents defined in an organisation or enterprise .github or .github-private
# repository (in its agents/ directory) are available across repositories, so
# a company can publish a vetted "security-reviewer" or "migration" agent
# once. Use the target property when an agent should exist only in VS Code or
# only on GitHub. Treat autonomous work like a contractor's: scoped tasks,
# branch protection, required reviews and passing checks before merge.
#
# WHERE YOU USE IT
# The agent proposes a pull request; people and CI decide whether it merges.
#
# RUN IT:  python 11_copilot-10.py
#

locations = {
    "repository": ".github/agents/<name>.agent.md",
    "organisation / enterprise": "<.github or .github-private repo>/agents/<name>.agent.md",
}
for scope, path in locations.items():
    print(f"{scope:26s} {path}")
checks = ["agent used is noted on the PR", "branch protection", "required reviews", "CI must pass"]
print(checks)

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# repository                 .github/agents/<name>.agent.md
# organisation / enterprise  <.github or .github-private repo>/agents/<name>.agent.md
# ['agent used is noted on the PR', 'branch protection', 'required reviews', 'CI must pass']
