import { P, bars, cells, compare, curve, hline, par, plot, pt, seg, vline } from "../../visuals/kit.js";
import { py, type ConceptDef } from "../build.js";
import { table } from "../ml/data.js";
import { rowflow } from "../nlp/util.js";

/* Every code example is plain Python and is RUN by `npm run outputs -- building-with-claude`.
   Facts checked against the official Claude Code documentation on 2026-10-16. */

const FM = `
import re

def parse_frontmatter(text):
    """A tiny parser for the YAML subset used in agent and skill files (key: value lines)."""
    m = re.match(r"---\\n(.*?)\\n---\\n(.*)", text, re.S)
    if not m:
        return None, text
    meta = {}
    for line in m.group(1).splitlines():
        if ":" in line:
            k, v = line.split(":", 1)
            meta[k.strip()] = v.strip()
    return meta, m.group(2)`;

export const sdk: ConceptDef[] = [
  {
    t: "Four ways to build: client SDK, Agent SDK, Claude Code, Managed Agents",
    lv: 1,
    s: `Anthropic offers several layers; pick by who runs the agent loop. The {{Client SDK}} calls the Messages API directly: you write (or let the SDK's tool runner drive) the loop — maximum control. The {{Agent SDK}} (Python and TypeScript) embeds the Claude Code agent as a library in a process you operate, with built-in tools, permissions, sessions, hooks, subagents and MCP. The {{Claude Code CLI}} is the terminal tool for interactive development and one-off tasks. {{Managed Agents}} is a hosted agent harness: Anthropic runs the loop in a managed (or self-hosted) sandbox, which you configure through the API. Start at the highest layer that gives the control you need.`,
    r: `More control means more code to build and maintain: do not rebuild the agent loop, permissions and context management unless you need to.`,
    i: `Which layer would you use to embed a coding agent in your own service, and which to call the model with full control?`,
    c: py`
layers = {
    "Client SDK": ("you write the tool loop", "full control"),
    "Agent SDK": ("Claude Code's agent as a library", "tools, hooks, subagents built in"),
    "Claude Code CLI": ("terminal tool", "interactive development"),
    "Managed Agents": ("Anthropic hosts the loop and sandbox", "least code to run"),
}
for name, (what, gives) in layers.items():
    print(f"{name:16s} {what:38s} {gives}")`,
    v: compare("Choosing a layer.", ["Who runs the loop", "Best for"], [
      ["Client SDK", "your code", "custom apps needing full control"],
      ["Agent SDK", "a library in your process", "embedding a Claude Code–style agent"],
      ["Claude Code CLI", "the terminal tool", "daily interactive development"],
      ["Managed Agents", "Anthropic's hosted harness", "running agents without operating infrastructure"],
    ]),
  },
  {
    t: "The Agent SDK: what you get for free",
    lv: 2,
    s: `The {{Agent SDK}} exposes the machinery behind Claude Code in Python and TypeScript: built-in tools (read, write and edit files, run commands, search the web), the agent loop and context management, {{permissions}} (which tools run automatically and which need approval), {{hooks}} (code at lifecycle points), {{subagents}} for focused sub-tasks, {{MCP}} servers for external tools, {{sessions}} you can resume or fork, and project skills, commands and memory loaded from the .claude directories. To drive the same loop from another language run the CLI as a subprocess in headless mode (claude -p with --output-format json). Authenticate with an API key; third-party products may not offer claude.ai login.`,
    r: `Treat an Agent SDK deployment like any code-running agent: sandbox it, scope its permissions and log what it does.`,
    i: `Name four capabilities the Agent SDK provides beyond a plain Messages API call.`,
    c: py`
capabilities = ["built-in tools", "permissions", "hooks", "subagents", "MCP servers", "sessions", "skills / commands / memory", "plugins"]
print(len(capabilities), "capabilities:", ", ".join(capabilities))
headless = ["claude", "-p", "Summarise the failing tests", "--output-format", "json"]
print(" ".join(headless))`,
    v: rowflow("Agent SDK structure.", ["Your application", "Agent SDK", "Agent loop + tools", "Permissions + hooks", "MCP servers", "Result / session"], [
      "A Python or TypeScript service.",
      "Library that runs the Claude Code agent.",
      "Reads files, runs commands, calls the model.",
      "Gate risky actions; run your code at events.",
      "External tools and data.",
      "Output you use; a session you can resume.",
    ]),
  },
  {
    t: "Choosing between prompt, tool runner, SDK and platform",
    lv: 2,
    s: `A decision ladder for the API user. One-shot generation or classification: a single Messages call (batch it if offline). A model that must call your functions: tool use with the loop in your code, or the SDK's {{tool runner}} that executes tools and returns results for you. A coding or file-editing agent: the Agent SDK or Claude Code. Long-running work you do not want to host: Managed Agents. External systems through a standard interface: {{MCP}} (a connector in the API, or servers in Claude Code and the Agent SDK). Whatever you pick, define the evaluation set first, track cost per task, and keep human approval for irreversible actions.`,
    r: `Climb one rung at a time and measure; most products need fewer layers than the first design suggests.`,
    i: `Give the right layer for: a nightly document classifier, a chat assistant that checks order status, a code-fixing agent.`,
    c: py`
needs = {
    "nightly document classifier": "Messages API via the Batch API",
    "chat assistant that checks order status": "Messages API with tool use (your tools)",
    "code-fixing agent in our CI": "Agent SDK or Claude Code in a sandbox",
    "agent we do not want to host": "Managed Agents",
}
for k, v in needs.items():
    print(f"{k:42s} -> {v}")`,
    v: rowflow("A ladder of complexity.", ["Single call", "Batch", "Tool use", "Agent SDK / Claude Code", "Managed Agents"], [
      "One request, one answer.",
      "Offline work at half price.",
      "Your functions, loop in your code or the tool runner.",
      "File-editing and command-running agents.",
      "Hosted, long-running agents.",
    ]),
  },
];

/* ------------------------------------------------------------------ */
export const cc: ConceptDef[] = [
  {
    t: "CLAUDE.md: persistent project instructions",
    lv: 1,
    s: `Every Claude Code session starts with a fresh context; {{CLAUDE.md}} carries what you would otherwise re-explain. Locations (broadest to most specific): managed policy (organisation-wide), {{~/.claude/CLAUDE.md}} (your preferences for all projects), {{./CLAUDE.md}} or ./.claude/CLAUDE.md (team-shared, committed), and {{./CLAUDE.local.md}} (personal, gitignored). Files above the working directory load at launch; those in subdirectories load on demand. Use @path/to/file to import other files. Run /init to generate a starting file. Keep each file under about 200 lines and write concrete, verifiable instructions ("run npm test before committing"), because Claude treats CLAUDE.md as context, not enforced configuration — enforcement belongs in hooks and permissions.`,
    r: `If two instructions contradict each other Claude may pick either: review CLAUDE.md files regularly for conflicts and stale advice.`,
    i: `Where would you put team build rules and where your personal sandbox URLs?`,
    c: py`
locations = [
    ("managed policy", "organisation-wide", True),
    ("~/.claude/CLAUDE.md", "you, all projects", False),
    ("./CLAUDE.md", "team, committed", True),
    ("./CLAUDE.local.md", "you, this project (gitignored)", False),
]
for path, scope, shared in locations:
    print(f"{path:22s} {scope:34s} shared={shared}")
claude_md = ["# Build", "- Run npm test before committing", "- Node 22", "@docs/architecture.md"]
print(len(claude_md), "lines; imports:", [l for l in claude_md if l.startswith("@")])`,
    v: compare("Where instructions live.", ["Scope", "Shared with the team?"], [
      ["Managed policy", "all users in the organisation", "yes"],
      ["~/.claude/CLAUDE.md", "you, in every project", "no"],
      ["./CLAUDE.md", "this project", "yes (committed)"],
      ["./CLAUDE.local.md", "you, this project", "no (gitignored)"],
    ]),
  },
  {
    t: "Skills: reusable know-how loaded on demand",
    lv: 2,
    s: `A {{skill}} is a folder with a {{SKILL.md}} file — YAML frontmatter plus Markdown instructions — and optional scripts and reference files. Locations: ~/.claude/skills/<name>/SKILL.md (all your projects), .claude/skills/<name>/SKILL.md (this repository, committed), plugins, and managed enterprise settings. The frontmatter fields are optional, but {{description}} matters most: Claude reads it to decide when to load the skill. Other fields include name (defaults to the directory), disable-model-invocation (only you can invoke it, as /name), user-invocable: false (only Claude can), allowed-tools, model, context: fork (run in a subagent) and paths (activate for matching files). Skills use {{progressive disclosure}}: the descriptions are always in context, the SKILL.md body loads when used, and supporting files only when SKILL.md points to them — so many skills cost little context.`,
    r: `Keep SKILL.md under about 500 lines and push detail into referenced files; write the description as "when to use this".`,
    i: `Why can many skills be installed without filling the context window?`,
    c: py`${FM}
skill = """---
name: release-notes
description: Draft release notes from merged pull requests. Use when asked to prepare a release.
disable-model-invocation: false
---
1. List merged PRs since the last tag.
2. Group by label.
3. Write the notes in docs/RELEASE.md.
"""
meta, body = parse_frontmatter(skill)
print(sorted(meta))
print(len(body.splitlines()), "instruction lines")
print("always in context: ~", 20 * 100, "tokens for 20 descriptions; bodies load only when used")`,
    v: rowflow("Progressive disclosure.", ["Session starts", "Descriptions in context", "Task matches a description", "SKILL.md body loads", "Reference file read", "Script executed"], [
      "No skill content loaded yet.",
      "Only name + description of every skill.",
      "Claude (or you via /name) selects a skill.",
      "The full instructions enter the conversation.",
      "Only if SKILL.md links to it.",
      "Scripts run; they are not loaded as text.",
    ]),
  },
  {
    t: "Subagents: delegating with a clean context",
    lv: 2,
    s: `A {{subagent}} is a specialised assistant defined by a Markdown file — frontmatter plus a system prompt body — in .claude/agents/ (project), ~/.claude/agents/ (all projects), a plugin's agents/ directory or managed settings. Only {{name}} and {{description}} are required; useful fields: tools (allow-list) and disallowedTools, model (sonnet, opus, haiku, fable, a full model ID or inherit), permissionMode, maxTurns, skills (preload), mcpServers, hooks, memory, isolation: worktree and effort. Each subagent runs in its {{own context window}} with its own system prompt, tools and permissions and does not see your conversation: verbose work (reading 50,000 tokens of files) stays in its window and only a short summary returns to the main conversation. Claude delegates automatically by matching the task to the description ("use proactively" helps), or you invoke one by name, with an @-mention, or for a whole session with claude --agent <name>.`,
    r: `Give each subagent one clear job and the minimum tools: a read-only reviewer cannot accidentally edit code.`,
    i: `What does a subagent not see, and what comes back to the main conversation?`,
    c: py`${FM}
agent = """---
name: code-reviewer
description: Reviews code for quality and security. Use proactively after code changes.
tools: Read, Glob, Grep
model: sonnet
---
You are a code reviewer. Report specific, actionable findings.
"""
meta, body = parse_frontmatter(agent)
required = {"name", "description"}
print(required <= set(meta), meta["tools"], meta["model"])
print("context kept out of the main window:", 50000 - 1000, "tokens")`,
    v: bars("Tokens added to the main context after reading 50,000 tokens of files.", [["main agent reads files itself", "50000"], ["subagent returns a summary", "1000"]], {
      max: 52000,
    }),
  },
  {
    t: "Subagents that spawn subagents, and parallel work",
    lv: 2,
    s: `Subagents can themselves delegate: by default they nest up to {{three layers}} below the main conversation (CLAUDE_CODE_MAX_SUBAGENT_SPAWN_DEPTH changes it), and up to {{20 subagents}} can run concurrently (CLAUDE_CODE_MAX_CONCURRENT_SUBAGENTS). To stop a particular subagent from spawning more, leave the Agent tool out of its tools list or add it to disallowedTools. Parallel subagents suit independent investigations: security review, test coverage and documentation checks of the same change run side by side, and the lead merges the findings. Remember the costs: each subagent has its own context and token bill — four parallel agents reading the same 10,000-token background use 40,000 input tokens — and results arrive as summaries, so the brief you give each one must carry its goal, context and expected output.`,
    r: `Parallelise independent, expensive investigations; keep short, dependent steps in the main conversation.`,
    i: `How deep can subagents nest by default, and how do you prevent a subagent from spawning others?`,
    c: py`
depth_limit, concurrent_limit = 3, 20
print("nesting depth:", depth_limit, "| concurrent subagents:", concurrent_limit)
agents = 4
background = 10000
print(agents * background, "input tokens when", agents, "agents each read", background)
reviewer = {"name": "reviewer", "tools": ["Read", "Grep"], "disallowedTools": ["Agent"]}
print("can spawn others:", "Agent" in reviewer["tools"] and "Agent" not in reviewer["disallowedTools"])`,
    v: compare("Limits and costs of subagent fan-out.", ["Default", "How to change it"], [
      ["Nesting depth", "3 layers below the main conversation", "CLAUDE_CODE_MAX_SUBAGENT_SPAWN_DEPTH"],
      ["Concurrent subagents", "20 per session", "CLAUDE_CODE_MAX_CONCURRENT_SUBAGENTS"],
      ["Spawning by one subagent", "allowed within the depth", "omit Agent from tools or disallow it"],
      ["Token cost", "each has its own context", "pass compact briefs, use cheaper models"],
    ]),
  },
  {
    t: "Skills, subagents, slash commands, hooks: which one?",
    lv: 2,
    s: `They solve different problems. A {{skill}} adds instructions (and scripts) to the current conversation when relevant, or runs in a forked subagent with context: fork. A {{subagent}} is a separate agent with its own prompt, tools and context window for focused or noisy work. A {{slash command}} is a saved prompt you trigger by name — the old .claude/commands/*.md format still works but has been merged into skills, which are now preferred. A {{hook}} is a shell command (or a prompt or agent evaluation) run automatically at a lifecycle event — deterministic enforcement, not a suggestion. {{CLAUDE.md}} is always-on context. Rule of thumb: guidance → CLAUDE.md; reusable procedure → skill; isolation or specialist role → subagent; must-always-happen → hook.`,
    r: `If you find yourself writing "always" or "never" in CLAUDE.md for something critical, make it a hook or a permission rule.`,
    i: `Which mechanism would you use to guarantee that tests run after every file edit, and which to package a release-notes procedure?`,
    c: py`
choose = {
    "project conventions every session needs": "CLAUDE.md",
    "a reusable procedure Claude applies when relevant": "skill (SKILL.md)",
    "a noisy investigation that should not fill the main context": "subagent",
    "format every edited file, no exceptions": "hook (PostToolUse)",
    "block writes to production config": "PreToolUse hook or permission rule",
}
for need, tool in choose.items():
    print(f"{need:58s} -> {tool}")`,
    v: compare("Extension mechanisms in Claude Code.", ["Loaded when", "Enforced?"], [
      ["CLAUDE.md", "every session", "no — context only"],
      ["Skill", "when relevant or invoked", "no — guidance with tools"],
      ["Subagent", "when delegated to", "own tools and permissions"],
      ["Hook", "at a lifecycle event", "yes — deterministic"],
    ]),
  },
  {
    t: "Hooks: deterministic control at lifecycle events",
    lv: 2,
    s: `Hooks run your own commands at fixed points, so certain things always happen regardless of what the model decides. They are configured in a {{settings file}} (~/.claude/settings.json for you, .claude/settings.json for the project) as a hooks block: an event name, a {{matcher}} (for tools, a pattern such as "Edit|Write"; empty matches all) and the command. Events include SessionStart, UserPromptSubmit (before a prompt is processed), {{PreToolUse}} (before a tool call — it can block it), PostToolUse (after), Notification and Stop. Typical uses: run a formatter after every edit, block writes to protected paths, log every command for audit, re-inject project context after compaction, notify you when input is needed. When several hooks decide on a permission, the most restrictive answer wins (deny, then defer, ask, allow).`,
    r: `Use a hook, not a CLAUDE.md sentence, for anything that must never be skipped.`,
    i: `Which event and matcher would you use to run Prettier after file edits?`,
    c: py`
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
print(sorted(settings["hooks"]))`,
    v: rowflow("A hook in the tool lifecycle.", ["Claude decides to edit a file", "PreToolUse hooks", "Allowed?", "Tool runs", "PostToolUse hooks", "Result back to Claude"], [
      "A tool call is proposed.",
      "Your script inspects the call and can block it.",
      "Most restrictive decision wins.",
      "The edit happens.",
      "Format, test or log.",
      "Claude sees the outcome (and any hook output).",
    ]),
  },
  {
    t: "Permissions, settings and MCP in Claude Code",
    lv: 2,
    s: `Control what Claude may do without asking. {{Permission rules}} in settings allow or deny tools and commands (allow Bash(npm test), deny reads of .env files); permission modes range from asking for each action to plan-only and auto-accept edits; settings files exist at managed, user, project and local levels with the narrower scope overriding where allowed. {{MCP servers}} add tools: configure them per user or project (committed .mcp.json for a team) and scope each to the minimum. Third-party servers run with your permissions and their text enters the model's context, so review them like dependencies. In headless or CI use, grant only the tools the job needs and run in a sandbox or container without production credentials.`,
    r: `Start restrictive and add allow rules for commands you approve repeatedly; never blanket-allow shell access on a machine with secrets.`,
    i: `Why is a blanket allow rule for shell commands risky, and what narrower rule would you write for running tests?`,
    c: py`
allow = ["Bash(npm test)", "Bash(git status)", "Read(src/**)"]
deny = ["Read(.env)", "Bash(rm -rf *)"]
def decide(action):
    if action in deny:
        return "deny"
    return "allow" if action in allow else "ask"

for a in ["Bash(npm test)", "Read(.env)", "Bash(curl http://x)"]:
    print(f"{a:22s} -> {decide(a)}")`,
    v: compare("Layers of control.", ["Example"], [
      ["Permission rules", "allow Bash(npm test); deny Read(.env)"],
      ["Permission mode", "ask each time, accept edits, plan only"],
      ["Hooks", "block writes to protected paths"],
      ["MCP scoping", "only the servers and tools the project needs"],
      ["Sandbox / container", "no production credentials, limited network"],
    ]),
  },
  {
    t: "Workflows that work: explore, plan, code, verify",
    lv: 1,
    s: `Good results come from a repeatable loop, not a single mega-prompt. {{Explore}}: let Claude read the relevant code (or a read-only subagent) before changing anything. {{Plan}}: ask for a plan and review it — plan mode makes this explicit. {{Code}}: implement in small steps. {{Verify}}: give Claude a way to check its own work — run the tests, the linter, the type checker, a screenshot comparison — and have it fix failures; verification is the biggest quality lever. {{Commit}} in small, reviewable pieces on a branch. Keep the context clean: start a new session per task, use subagents for noisy research and summarise long sessions. Review the diff yourself: you stay responsible for what ships.`,
    r: `State the success check in the prompt ("done when npm test passes and the new test fails without the fix").`,
    i: `Name the steps of the loop and the single biggest quality lever.`,
    c: py`
loop = ["explore the code", "write a plan", "review the plan", "implement a small step", "run tests and linters", "fix failures", "commit on a branch", "review the diff"]
for i, step in enumerate(loop, 1):
    print(i, step)`,
    v: rowflow("An effective coding loop.", ["Explore", "Plan", "Code a small step", "Verify (tests, lint, types)", "Fix failures", "Review and commit"], [
      "Read before changing.",
      "A reviewed plan prevents wrong turns.",
      "Small steps are easier to check.",
      "Objective feedback.",
      "Loop until the checks pass.",
      "You approve what ships.",
    ]),
  },
  {
    t: "Plugins, packaging and team rollout",
    lv: 2,
    s: `To share a setup, package it as a {{plugin}}: a bundle of skills, subagents, hooks, commands and MCP servers that others install, with plugin skills namespaced as /plugin-name:skill-name. Commit project-level files (.claude/skills, .claude/agents, CLAUDE.md, .mcp.json, shared settings) so every developer and CI job gets the same behaviour; keep personal preferences in CLAUDE.local.md and user settings. For an organisation, managed settings enforce policy (allowed tools, MCP servers, instructions). Roll out in stages: a pilot team, written guidelines for what to delegate and what to review, a shared prompt and skill library, tracked metrics (cycle time, review findings, defects) and an incident path for misbehaviour.`,
    r: `Version your skills and agents like code: review changes, test them on a fixed set of tasks and document the owner.`,
    i: `What belongs in the committed project files and what in personal settings?`,
    c: py`
project_files = [".claude/skills/", ".claude/agents/", "CLAUDE.md", ".mcp.json", ".claude/settings.json"]
personal = ["CLAUDE.local.md", "~/.claude/CLAUDE.md", "~/.claude/settings.json", "~/.claude/skills/"]
print("committed:", project_files)
print("personal :", personal)`,
    v: compare("Where configuration lives.", ["Shared via"], [
      ["Project skills, agents, CLAUDE.md, .mcp.json", "version control"],
      ["Personal preferences", "user-level files, not committed"],
      ["Organisation policy", "managed settings"],
      ["Reusable bundle", "plugin (namespaced skills)"],
    ]),
  },
];

void [P, bars, cells, compare, curve, hline, par, plot, pt, seg, vline, table, rowflow];
