# -*- coding: utf-8 -*-
# ==========================================================================
# Hooks: deterministic control at lifecycle events [building-with-claude /
# Claude Code: skills, subagents, hooks]
# ==========================================================================
# WHAT IT IS
# Hooks run your own commands at fixed points, so certain things always happen
# regardless of what the model decides. They are configured in a settings file
# (~/.claude/settings.json for you, .claude/settings.json for the project) as
# a hooks block: an event name, a matcher (for tools, a pattern such as
# "Edit|Write"; empty matches all) and the command. Events include
# SessionStart, UserPromptSubmit (before a prompt is processed), PreToolUse
# (before a tool call — it can block it), PostToolUse (after), Notification
# and Stop. Typical uses: run a formatter after every edit, block writes to
# protected paths, log every command for audit, re-inject project context
# after compaction, notify you when input is needed. When several hooks decide
# on a permission, the most restrictive answer wins (deny, then defer, ask,
# allow).
#
# WHERE YOU USE IT
# Use a hook, not a CLAUDE.md sentence, for anything that must never be
# skipped.
#
# RUN IT:  python 06_cc-5.py
#

import json

settings = {
    "hooks": {
        "PostToolUse": [
            {"matcher": "Edit|Write", "hooks": [{"type": "command", "command": 'npx prettier --write "$FILE"'}]}
        ],
        "PreToolUse": [
            {"matcher": "Edit|Write", "hooks": [{"type": "command", "command": ".claude/hooks/protect-config.sh"}]}
        ],
    }
}
print(json.dumps(settings, indent=1)[:200])
print(sorted(settings["hooks"]))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# {
#  "hooks": {
#   "PostToolUse": [
#    {
#     "matcher": "Edit|Write",
#     "hooks": [
#      {
#       "type": "command",
#       "command": "npx prettier --write \"$FILE\""
#      }
#     ]
#    }
#   ],
#   "PreToolUse
# ['PostToolUse', 'PreToolUse']
