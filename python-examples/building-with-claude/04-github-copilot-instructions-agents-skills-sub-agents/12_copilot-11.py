# -*- coding: utf-8 -*-
# ==========================================================================
# Worked example: files for a sub-agent team and a skill [building-with-claude
# / GitHub Copilot: instructions, agents, skills, sub-agents]
# ==========================================================================
# WHAT IT IS
# Here is the whole setup as files you could commit.
# .github/agents/orchestrator.agent.md: description "Plans a feature and
# delegates to specialists", tools [agent, read], agents [researcher,
# implementer, tester]. researcher.agent.md: tools [read, search],
# user-invocable: false. implementer.agent.md: tools [read, edit],
# user-invocable: false. tester.agent.md: tools [read, terminal],
# user-invocable: false. And a skill .github/skills/release-notes/SKILL.md
# (name release-notes, matching its directory) with a description that says
# when to use it. The script below parses every file, checks the rules from
# the documentation (description present, the orchestrator lists existing
# agents and has the agent tool, skill name rules) and prints the tree. Run
# something like this in CI so a typo does not silently disable an agent or
# skill.
#
# WHERE YOU USE IT
# Validate agent and skill files in CI: an invalid skill name fails silently
# and you only notice when it never triggers.
#
# RUN IT:  python 12_copilot-11.py
#

import re

def parse_frontmatter(text):
    m = re.match(r"---\n(.*?)\n---\n(.*)", text, re.S)
    if not m:
        return {}, text
    meta = {}
    for line in m.group(1).splitlines():
        if ":" in line:
            k, v = line.split(":", 1)
            meta[k.strip()] = v.strip()
    return meta, m.group(2)
import re

files = {
    ".github/agents/orchestrator.agent.md": "---\nname: orchestrator\ndescription: Plans a feature and delegates to specialists\ntools: ['agent', 'read']\nagents: ['researcher', 'implementer', 'tester']\n---\nSplit the task, write a brief per subagent, merge the results.\n",
    ".github/agents/researcher.agent.md": "---\nname: researcher\ndescription: Maps relevant code and returns a short summary\ntools: ['read', 'search']\nuser-invocable: false\n---\nRead only. Return at most 20 lines.\n",
    ".github/agents/implementer.agent.md": "---\nname: implementer\ndescription: Makes the change described in the brief\ntools: ['read', 'edit']\nuser-invocable: false\n---\nChange only what the brief says.\n",
    ".github/agents/tester.agent.md": "---\nname: tester\ndescription: Runs the test suite and reports failures\ntools: ['read', 'terminal']\nuser-invocable: false\n---\nRun tests; report, do not fix.\n",
    ".github/skills/release-notes/SKILL.md": "---\nname: release-notes\ndescription: Draft release notes from merged pull requests. Use when preparing a release.\n---\nList merged PRs, group by label, write docs/RELEASE.md.\n",
}
metas = {p: parse_frontmatter(t)[0] for p, t in files.items()}
names = {m["name"] for p, m in metas.items() if p.endswith(".agent.md")}
problems = []
for p, m in metas.items():
    if "description" not in m:
        problems.append(p + ": description missing")
    if p.endswith("SKILL.md"):
        folder = p.split("/")[-2]
        if m["name"] != folder or not re.fullmatch(r"[a-z0-9-]{1,64}", m["name"]):
            problems.append(p + ": bad skill name")
lead = metas[".github/agents/orchestrator.agent.md"]
listed = set(re.findall(r"[a-z]+", lead["agents"]))
if not listed <= names or "agent" not in lead["tools"]:
    problems.append("orchestrator references unknown agents or lacks the agent tool")
print(sorted(names), problems or "all checks passed")
for p in files:
    print(p)

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# ['implementer', 'orchestrator', 'researcher', 'tester'] all checks passed
# .github/agents/orchestrator.agent.md
# .github/agents/researcher.agent.md
# .github/agents/implementer.agent.md
# .github/agents/tester.agent.md
# .github/skills/release-notes/SKILL.md
