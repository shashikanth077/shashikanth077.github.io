# -*- coding: utf-8 -*-
# ==========================================================================
# State and scratchpads [agentic-ai / Memory and state]
# ==========================================================================
# WHAT IT IS
# Not everything belongs in free text. Keep structured state outside the
# prompt and show the model a compact view: the task list with statuses,
# variables found so far, files touched, decisions made. A scratchpad (a notes
# file the agent edits) lets it track progress over hundreds of steps without
# carrying the whole transcript: "TODO: 1 done, 2 in progress, 3 pending;
# config path = /etc/app.ini". Structured state is also what makes resuming
# possible: after a crash or an approval pause, rebuild the context from the
# state, not from a lost conversation.
#
# WHERE YOU USE IT
# Make state serialisable (JSON) from day one: persistence, debugging and
# replay all depend on it.
#
# RUN IT:  python 03_mem-2.py
#

import json

state = {
    "goal": "fix failing test",
    "tasks": [{"id": 1, "text": "find test", "status": "done"}, {"id": 2, "text": "fix bug", "status": "in_progress"}, {"id": 3, "text": "run tests", "status": "pending"}],
    "facts": {"config_path": "/etc/app.ini"},
}
saved = json.dumps(state)
restored = json.loads(saved)
print(len(saved), restored["tasks"][1]["status"])
print(sum(t["status"] == "done" for t in restored["tasks"]), "of", len(restored["tasks"]), "done")

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 239 in_progress
# 1 of 3 done
