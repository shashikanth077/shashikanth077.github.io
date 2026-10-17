# -*- coding: utf-8 -*-
# ==========================================================================
# Skills, subagents, slash commands, hooks: which one? [building-with-claude /
# Claude Code: skills, subagents, hooks]
# ==========================================================================
# WHAT IT IS
# They solve different problems. A skill adds instructions (and scripts) to
# the current conversation when relevant, or runs in a forked subagent with
# context: fork. A subagent is a separate agent with its own prompt, tools and
# context window for focused or noisy work. A slash command is a saved prompt
# you trigger by name — the old .claude/commands/.md format still works but
# has been merged into skills, which are now preferred. A hook is a shell
# command (or a prompt or agent evaluation) run automatically at a lifecycle
# event — deterministic enforcement, not a suggestion. CLAUDE.md is always-on
# context. Rule of thumb: guidance → CLAUDE.md; reusable procedure → skill;
# isolation or specialist role → subagent; must-always-happen → hook.
#
# WHERE YOU USE IT
# If you find yourself writing "always" or "never" in CLAUDE.md for something
# critical, make it a hook or a permission rule.
#
# RUN IT:  python 05_cc-4.py
#

choose = {
    "project conventions every session needs": "CLAUDE.md",
    "a reusable procedure Claude applies when relevant": "skill (SKILL.md)",
    "a noisy investigation that should not fill the main context": "subagent",
    "format every edited file, no exceptions": "hook (PostToolUse)",
    "block writes to production config": "PreToolUse hook or permission rule",
}
for need, tool in choose.items():
    print(f"{need:58s} -> {tool}")

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# project conventions every session needs                    -> CLAUDE.md
# a reusable procedure Claude applies when relevant          -> skill (SKILL.md)
# a noisy investigation that should not fill the main context -> subagent
# format every edited file, no exceptions                    -> hook (PostToolUse)
# block writes to production config                          -> PreToolUse hook or permission rule
