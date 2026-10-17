# -*- coding: utf-8 -*-
# ==========================================================================
# Handoffs: guided multi-step workflows [building-with-claude / GitHub
# Copilot: instructions, agents, skills, sub-agents]
# ==========================================================================
# WHAT IT IS
# Handoffs connect agents into a workflow the user steers. In an agent's
# frontmatter, handoffs is a list; each entry has a label (the button text),
# the target agent, a prompt to send, send (false by default; true submits
# automatically) and an optional model. After the agent finishes a response,
# handoff buttons appear; choosing one switches to the target agent with the
# conversation context and the prompt prefilled. A classic chain: Planner →
# "Start implementation" → Implementer → "Review changes" → Reviewer. The user
# stays in control at every transition, which suits work where a person should
# inspect a plan before code is written.
#
# WHERE YOU USE IT
# Use handoffs when a human decision belongs between the phases; use subagents
# when the lead should delegate without waiting.
#
# RUN IT:  python 06_copilot-5.py
#

handoffs = {
    "planner": [{"label": "Start implementation", "agent": "implementer", "prompt": "Implement the plan above.", "send": False}],
    "implementer": [{"label": "Review changes", "agent": "reviewer", "prompt": "Review the changes just made.", "send": False}],
    "reviewer": [],
}
node, path = "planner", ["planner"]
while handoffs[node]:
    node = handoffs[node][0]["agent"]
    path.append(node)
print(" -> ".join(path))
print(sorted(handoffs["planner"][0]))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# planner -> implementer -> reviewer
# ['agent', 'label', 'prompt', 'send']
