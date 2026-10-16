import { P, bars, cells, compare, curve, hline, par, plot, pt, seg, vline } from "../../visuals/kit.js";
import { py, type ConceptDef } from "../build.js";
import { table } from "../ml/data.js";
import { rowflow } from "../nlp/util.js";

/* Every code example is plain Python and is RUN by `npm run outputs -- building-with-claude`.
   Facts about GitHub Copilot customisation were checked against the GitHub and VS Code
   documentation on 2026-10-16. These features evolve: confirm names and settings in the docs. */

const FM = `
import re

def parse_frontmatter(text):
    m = re.match(r"---\\n(.*?)\\n---\\n(.*)", text, re.S)
    if not m:
        return {}, text
    meta = {}
    for line in m.group(1).splitlines():
        if ":" in line:
            k, v = line.split(":", 1)
            meta[k.strip()] = v.strip()
    return meta, m.group(2)`;

export const copilot: ConceptDef[] = [
  {
    t: "The Copilot customisation map",
    lv: 1,
    s: `GitHub Copilot can be shaped at five levels, from always-on rules to specialist teammates. {{Custom instructions}}: guidance applied to every request (or to matching files). {{Prompt files}}: saved, reusable prompts you run with a slash command. {{Custom agents}}: named personas with their own instructions, tools and model, selectable or delegable. {{Agent Skills}}: folders of instructions, scripts and resources loaded only when relevant. {{MCP servers}}: external tools and data. Choose by how the knowledge should be applied: always (instructions), on request (prompt files), as a role (agents), on demand by relevance (skills), or as a capability (MCP). A small, well-chosen set beats a large pile.`,
    r: `Start with one instructions file; add prompt files for repeated tasks; add agents and skills when a role or procedure needs its own context and tools.`,
    i: `Which Copilot mechanism fits: team coding standards, a repeatable "write an API endpoint" task, a read-only reviewer role, a multi-step release procedure?`,
    c: py`
fit = {
    "team coding standards": ".github/copilot-instructions.md (always applied)",
    "repeatable 'write an API endpoint' task": ".github/prompts/create-api.prompt.md (run with /create-api)",
    "read-only reviewer role": ".github/agents/reviewer.agent.md (restricted tools)",
    "multi-step release procedure": ".github/skills/release/SKILL.md (loaded on demand)",
    "access to the issue tracker": "an MCP server",
}
for need, where in fit.items():
    print(f"{need:42s} -> {where}")`,
    v: compare("Five ways to customise Copilot.", ["Applied", "Lives in"], [
      ["Custom instructions", "always, or for matching files", ".github/copilot-instructions.md, .instructions.md"],
      ["Prompt files", "when you run /name", ".github/prompts/*.prompt.md"],
      ["Custom agents", "when selected or delegated to", ".github/agents/*.agent.md"],
      ["Agent Skills", "on demand, by relevance", ".github/skills/<name>/SKILL.md"],
      ["MCP servers", "as tools", "settings or the agent's mcp-servers"],
    ]),
  },
  {
    t: "Custom instructions: always-on guidance",
    lv: 1,
    s: `The simplest customisation is a Markdown file of instructions. {{.github/copilot-instructions.md}} at the repository root applies to every Copilot request in that repository (a personal version lives at ~/.copilot/copilot-instructions.md). Path-specific files go in {{.github/instructions/}} with the suffix {{.instructions.md}} and an {{applyTo}} glob in the frontmatter, for example applyTo: '**/*.py' for Python files only — optional name and description fields support on-demand discovery. The cross-agent {{AGENTS.md}} at the repository root is also read by Copilot and by other coding agents. Write short, concrete rules ("use pytest; never edit generated files"), keep them current and avoid contradicting yourself.`,
    r: `Instructions are always spent as context: move rarely needed material into skills or path-specific files.`,
    i: `How do you make an instruction apply only to Python files?`,
    c: py`${FM}
import fnmatch

instr = """---
description: Python conventions
applyTo: '**/*.py'
---
Use type hints. Run pytest before suggesting a commit.
"""
meta, body = parse_frontmatter(instr)
pattern = meta["applyTo"].strip("'")
files = ["src/app/main.py", "src/app/main.ts", "tests/test_api.py"]
print(pattern, [f for f in files if fnmatch.fnmatch(f, pattern)])`,
    v: compare("Instruction files.", ["Scope"], [
      [".github/copilot-instructions.md", "whole repository, every request"],
      [".github/instructions/*.instructions.md + applyTo", "only files matching the glob"],
      ["AGENTS.md (repository root)", "read by Copilot and other coding agents"],
      ["~/.copilot/copilot-instructions.md", "personal, all projects"],
    ]),
  },
  {
    t: "Prompt files: reusable slash commands",
    lv: 1,
    s: `A {{prompt file}} saves a prompt you run repeatedly. Put it in {{.github/prompts/}} with the suffix {{.prompt.md}}. Optional frontmatter: name (what you type after /), description, argument-hint, {{agent}} (ask, agent, plan or the name of a custom agent), model and {{tools}}. In the body, \${input:variableName:placeholder} asks the user for a value, \${selection} inserts the current selection, #file: references a file and Markdown links include workspace files. Run it by typing /name (optionally with extra text) in chat, with the Chat: Run Prompt command or with the play button in the editor. Prompt files are supported in local VS Code chat sessions. They turn "the prompt I paste every time" into a shared, reviewable team asset.`,
    r: `Keep prompt files short and parameterised; put the lasting rules in instructions, not in every prompt.`,
    i: `How does a prompt file ask the user for a value, and how do you run it?`,
    c: py`${FM}
import re

pf = """---
name: create-api
description: Scaffold a REST endpoint
agent: agent
tools: ['edit', 'search']
---
Create a REST endpoint for ${"$"}{input:resource:customers} following the project conventions.
"""
meta, body = parse_frontmatter(pf)
filled = re.sub(r"\$\{input:(\w+)(?::[^}]*)?\}", lambda m: {"resource": "orders"}[m.group(1)], body)
print(meta["name"], "->", "/" + meta["name"])
print(filled.strip())`,
    v: rowflow("Running a prompt file.", ["Type /create-api", "Variables prompted", "Body expanded", "Agent and tools chosen", "Model runs the task"], [
      "The file name or name field defines the command.",
      "${input:resource} asks you for a value.",
      "${selection} and #file: references are filled.",
      "From the agent and tools frontmatter.",
      "The same task, the same way, every time.",
    ]),
  },
  {
    t: "Custom agents: .agent.md",
    lv: 2,
    s: `A {{custom agent}} is a persona with its own instructions, tool set and model. Repository agents live in {{.github/agents/}} as {{<name>.agent.md}} (letters, digits, ., - and _ in the file name); organisation or enterprise agents sit in an agents/ directory at the root of the .github or .github-private repository. The YAML frontmatter has: {{description}} (required on GitHub; what the agent does), name (defaults to the file name), {{tools}} (aliases such as read, edit, search; omitted means all tools), model (IDE environments), {{target}} (vscode or github-copilot), mcp-servers (agent-specific MCP configuration) and, in VS Code, argument-hint, {{handoffs}}, {{agents}}, user-invocable, disable-model-invocation and hooks. The Markdown body is the agent's prompt, up to 30,000 characters.`,
    r: `Restrict tools to the minimum: a reviewer that cannot edit files cannot damage them.`,
    i: `Where does a repository custom agent live and which frontmatter property is required on GitHub?`,
    c: py`${FM}
import re

agent = """---
name: Reviewer
description: Reviews pull requests for correctness and security; never edits files.
tools: ['read', 'search']
---
You are a careful reviewer. List findings with file and line, most serious first.
"""
meta, body = parse_frontmatter(agent)
filename_ok = re.fullmatch(r"[A-Za-z0-9._-]+\.agent\.md", "reviewer.agent.md") is not None
print(sorted(meta), "description present:", "description" in meta, "file name ok:", filename_ok)
print(len(body), "characters of prompt (limit 30,000)")`,
    v: compare("Custom agent frontmatter.", ["Meaning"], [
      ["description", "what the agent does and is good at (required on GitHub)"],
      ["tools", "allowed tools or aliases; omitted = all tools"],
      ["model", "which model to use (IDEs)"],
      ["target", "vscode or github-copilot; omitted = both"],
      ["mcp-servers", "MCP servers only this agent uses"],
      ["handoffs / agents", "workflow buttons and allowed subagents (VS Code)"],
    ]),
  },
  {
    t: "Tools and MCP servers for an agent",
    lv: 2,
    s: `An agent can only act through its {{tools}}. The tools list can contain tool aliases (read, edit, search), tool sets, extension tools and MCP tools; use "server-name/*" for all tools of an MCP server or "server-name/tool-1" for one. If tools is omitted the agent can use every available tool — convenient, but broader than most roles need. MCP servers may come from repository settings or from the agent's own mcp-servers property, so a specialised agent (for example a database inspector) can have its server without exposing it to every agent. Apply the same discipline as for any integration: least privilege, read-only credentials where possible, review third-party servers, and never put secrets in the agent file.`,
    r: `Tool lists are the real security boundary of an agent; the instructions are only a request.`,
    i: `How do you give an agent all tools of one MCP server, and why not leave tools unset?`,
    c: py`
agents = {
    "reviewer": ["read", "search"],
    "implementer": ["read", "edit", "search", "terminal"],
    "db-inspector": ["read", "db-server/*"],
}
available = {"read", "edit", "search", "terminal", "db-server/query", "db-server/schema"}
def resolve(tools):
    out = set()
    for t in tools:
        if t.endswith("/*"):
            out |= {a for a in available if a.startswith(t[:-1])}
        elif t in available:
            out.add(t)
    return sorted(out)

for name, tools in agents.items():
    print(f"{name:13s} {resolve(tools)}")`,
    v: compare("Tool scoping.", ["Effect"], [
      ["tools omitted", "agent may use every tool: broad"],
      ["tools: ['read', 'search']", "read-only reviewer"],
      ["'server/*'", "all tools from one MCP server"],
      ["'server/tool-1'", "one specific MCP tool"],
      ["mcp-servers in the agent file", "server available only to this agent"],
    ]),
  },
  {
    t: "Handoffs: guided multi-step workflows",
    lv: 2,
    s: `Handoffs connect agents into a workflow the user steers. In an agent's frontmatter, {{handoffs}} is a list; each entry has a {{label}} (the button text), the target {{agent}}, a {{prompt}} to send, {{send}} (false by default; true submits automatically) and an optional model. After the agent finishes a response, handoff buttons appear; choosing one switches to the target agent with the conversation context and the prompt prefilled. A classic chain: Planner → "Start implementation" → Implementer → "Review changes" → Reviewer. The user stays in control at every transition, which suits work where a person should inspect a plan before code is written.`,
    r: `Use handoffs when a human decision belongs between the phases; use subagents when the lead should delegate without waiting.`,
    i: `Name the fields of a handoff and say what send: true does.`,
    c: py`
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
print(sorted(handoffs["planner"][0]))`,
    v: rowflow("A handoff workflow.", ["Planner answers", "Button: Start implementation", "Implementer works", "Button: Review changes", "Reviewer reports"], [
      "Produces a plan for you to read.",
      "You click; context and prompt are carried over.",
      "Edits files within its tool limits.",
      "You decide when to ask for a review.",
      "A read-only agent checks the result.",
    ]),
  },
  {
    t: "Sub-agents in Copilot",
    lv: 2,
    s: `A {{subagent}} is an agent the main agent calls for a focused piece of work. In VS Code the main agent delegates through the {{agent}} tool (shown as Run Subagent): you can ask in natural language ("use a subagent to research the auth flow") or let the agent delegate on its own. The subagent {{works in its own context}} and returns a focused result, so intermediate research stays out of the main conversation. It does not inherit the main chat history — the task must state the goal, context, allowed actions and expected result — and each invocation is stateless: follow-ups need a new invocation. A coordinator lists permitted subagents in its {{agents}} property (* for all, [] for none) and must include the agent tool in tools. To keep an agent usable only as a subagent, set user-invocable: false; to forbid other agents from calling it, set disable-model-invocation: true.`,
    r: `Write the delegation brief as if for a colleague who has seen nothing: goal, context, constraints, output format.`,
    i: `Which two properties control whether an agent shows in the picker and whether others may call it as a subagent?`,
    c: py`
agents = {
    "orchestrator": {"agents": ["researcher", "implementer", "tester"], "tools": ["agent", "read"]},
    "researcher": {"user-invocable": False, "tools": ["read", "search"]},
    "implementer": {"user-invocable": False, "tools": ["read", "edit"]},
    "tester": {"user-invocable": False, "tools": ["read", "terminal"], "disable-model-invocation": True},
}
def can_delegate(lead, target):
    a = agents[lead]
    allowed = a.get("agents", [])
    return "agent" in a.get("tools", []) and (allowed == ["*"] or target in allowed) and not agents[target].get("disable-model-invocation", False)

for t in ["researcher", "tester"]:
    print(t, "in picker:", agents[t].get("user-invocable", True), "| orchestrator may call:", can_delegate("orchestrator", t))`,
    v: compare("Controlling sub-agents.", ["Effect"], [
      ["agents: [a, b] on the coordinator", "only a and b may be used as subagents; '*' allows all, [] none"],
      ["agent tool in tools", "required if agents is set"],
      ["user-invocable: false", "hidden from the picker but usable as a subagent"],
      ["disable-model-invocation: true", "other agents cannot call it"],
      ["new context each time", "no chat history, no follow-up messages to the same subagent"],
    ]),
  },
  {
    t: "Designing a sub-agent team",
    lv: 2,
    s: `A concrete design for "implement a feature". {{Orchestrator}} (tools: agent, read; agents: researcher, implementer, tester): splits the task, writes a brief for each subagent, merges results, never edits code itself. {{Researcher}} (read, search; user-invocable: false): maps the relevant files and returns a 20-line summary. {{Implementer}} (read, edit): makes the change described in the brief. {{Tester}} (read, terminal): runs the test suite and reports failures. The files live in .github/agents/. Benefits: each context stays small (the researcher may read 50,000 tokens but returns 500), tools are minimal per role, and the orchestrator's context only grows by the summaries. Costs: more model calls, and a poor brief produces poor work — test the team on past tasks before relying on it.`,
    r: `Add subagents only where a context or tool boundary helps; for small tasks a single agent is faster and cheaper.`,
    i: `Why give the orchestrator no edit tool, and how much does the researcher save in the main context?`,
    c: py`
files = {
    ".github/agents/orchestrator.agent.md": "tools: [agent, read]; agents: [researcher, implementer, tester]",
    ".github/agents/researcher.agent.md": "tools: [read, search]; user-invocable: false",
    ".github/agents/implementer.agent.md": "tools: [read, edit]; user-invocable: false",
    ".github/agents/tester.agent.md": "tools: [read, terminal]; user-invocable: false",
}
for path, summary in files.items():
    print(f"{path:40s} {summary}")
read, returned = 50000, 500
print("main context grows by", returned, "instead of", read, "->", read // returned, "x smaller")`,
    v: rowflow("An orchestrated feature build.", ["Task", "Orchestrator writes briefs", "Researcher (read-only)", "Implementer (edit)", "Tester (terminal)", "Orchestrator merges + reports"], [
      "A feature request.",
      "Goal, context, constraints, expected output per subagent.",
      "Returns a short map of the code.",
      "Changes only what the brief says.",
      "Runs the tests, reports failures.",
      "You review the final result.",
    ]),
  },
  {
    t: "Agent Skills in Copilot",
    lv: 2,
    s: `{{Agent Skills}} are folders of instructions, scripts and resources that Copilot loads only when relevant. Project skills live in {{.github/skills/}}, .claude/skills/ or .agents/skills/; personal skills in ~/.copilot/skills/, ~/.claude/skills/ or ~/.agents/skills/ — each skill is a directory containing {{SKILL.md}}. Frontmatter: {{name}} (required: lowercase letters, numbers and hyphens, at most 64 characters, and it must match the directory name — an invalid name makes the skill silently fail to load), {{description}} (required, at most 1,024 characters; Copilot uses it to decide when to load the skill), plus argument-hint, user-invocable, disable-model-invocation and an experimental context: fork. Loading is progressive: discovery (name and description), then the SKILL.md body, then referenced files only when needed — so you can install many skills without filling the context. Skills teach a capability; custom instructions only state standards.`,
    r: `A skill that never triggers usually has a description that does not say when to use it.`,
    i: `Which two frontmatter fields are required for a skill and what rules apply to name?`,
    c: py`${FM}
import re

def check_skill(dirname, text):
    meta, _ = parse_frontmatter(text)
    problems = []
    name = meta.get("name", "")
    if not re.fullmatch(r"[a-z0-9-]{1,64}", name):
        problems.append("name must be lowercase letters, digits, hyphens, max 64")
    if name != dirname:
        problems.append("name must match the directory name")
    if not 0 < len(meta.get("description", "")) <= 1024:
        problems.append("description required, max 1024 characters")
    return problems or ["ok"]

good = "---\nname: release-notes\ndescription: Draft release notes. Use when preparing a release.\n---\nSteps...\n"
bad = "---\nname: Release_Notes\ndescription: x\n---\n"
print(check_skill("release-notes", good))
print(check_skill("release-notes", bad))`,
    v: rowflow("Three-level loading of a skill.", ["Discovery", "Instructions", "Resources"], [
      "Copilot reads name and description of every skill.",
      "The SKILL.md body enters the context when the task matches.",
      "Scripts and reference files load only when SKILL.md links to them.",
    ]),
  },
  {
    t: "Skills, agents, instructions or prompt files?",
    lv: 2,
    s: `A decision guide. {{Custom instructions}}: standards that should always hold ("use TypeScript strict mode") — cheap, but always in context. {{Prompt files}}: a task you trigger yourself and parameterise. {{Agent Skills}}: a procedure with scripts or reference material that should load only when relevant, and that also works across tools that read the SKILL.md format. {{Custom agents}}: a role with its own tools, model and persona, selectable in the UI or delegated to as a subagent. {{MCP}}: access to a system. Combine them: an agent can be restricted to read tools, follow the repository's instructions and load a skill for a procedure. Keep the number of always-on tokens small and the number of agent tools smaller still.`,
    r: `If a rule must hold every time, consider an enforcement mechanism (CI checks, branch protection, hooks) in addition to asking nicely.`,
    i: `Which mechanism fits a database-migration procedure with a helper script that is needed only occasionally?`,
    c: py`
descriptions, bodies, n = 100, 2000, 20
print("20 skills: always loaded", n * descriptions, "tokens of descriptions; all bodies would be", n * bodies)
print("20 instruction files of 2,000 tokens always applied:", n * bodies)
choice = {"always-true standard": "instructions", "occasional procedure with a script": "skill", "role with tools": "agent", "task you trigger": "prompt file"}
print(choice)`,
    v: bars("Always-on context: 20 items.", [["20 instruction files (2,000 tokens each)", "40000"], ["20 skills: descriptions only", "2000"]], {
      max: 42000,
    }),
  },
  {
    t: "Copilot coding agent, issues and organisation agents",
    lv: 2,
    s: `Custom agents work beyond the editor. On GitHub you can pick a custom agent in the agents panel or agents tab, assign an issue to Copilot with a chosen agent, or select one in the GitHub Copilot CLI (the /agent command or a command-line reference); pull requests note which custom agent did the work. Agents defined in an organisation or enterprise .github or .github-private repository (in its agents/ directory) are available across repositories, so a company can publish a vetted "security-reviewer" or "migration" agent once. Use the {{target}} property when an agent should exist only in VS Code or only on GitHub. Treat autonomous work like a contractor's: scoped tasks, branch protection, required reviews and passing checks before merge.`,
    r: `The agent proposes a pull request; people and CI decide whether it merges.`,
    i: `Where do organisation-wide custom agents live and how does a team see which agent did a pull request?`,
    c: py`
locations = {
    "repository": ".github/agents/<name>.agent.md",
    "organisation / enterprise": "<.github or .github-private repo>/agents/<name>.agent.md",
}
for scope, path in locations.items():
    print(f"{scope:26s} {path}")
checks = ["agent used is noted on the PR", "branch protection", "required reviews", "CI must pass"]
print(checks)`,
    v: compare("Where custom agents can run.", ["How you select it"], [
      ["VS Code chat", "agent picker, @-style selection, handoffs"],
      ["GitHub agents panel / tab", "choose the agent for a task"],
      ["Assign an issue to Copilot", "pick the custom agent; the PR notes it"],
      ["Copilot CLI", "/agent or reference it on the command line"],
    ]),
  },
  {
    t: "Worked example: files for a sub-agent team and a skill",
    lv: 2,
    s: `Here is the whole setup as files you could commit. {{.github/agents/orchestrator.agent.md}}: description "Plans a feature and delegates to specialists", tools [agent, read], agents [researcher, implementer, tester]. {{researcher.agent.md}}: tools [read, search], user-invocable: false. {{implementer.agent.md}}: tools [read, edit], user-invocable: false. {{tester.agent.md}}: tools [read, terminal], user-invocable: false. And a skill {{.github/skills/release-notes/SKILL.md}} (name release-notes, matching its directory) with a description that says when to use it. The script below parses every file, checks the rules from the documentation (description present, the orchestrator lists existing agents and has the agent tool, skill name rules) and prints the tree. Run something like this in CI so a typo does not silently disable an agent or skill.`,
    r: `Validate agent and skill files in CI: an invalid skill name fails silently and you only notice when it never triggers.`,
    i: `Which checks would a CI script run on .agent.md and SKILL.md files?`,
    c: py`${FM}
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
    print(p)`,
    v: cells("The committed files.", table(["file", "tools", "visibility"], [["orchestrator.agent.md", "agent, read", "picker"], ["researcher.agent.md", "read, search", "subagent only"], ["implementer.agent.md", "read, edit", "subagent only"], ["tester.agent.md", "read, terminal", "subagent only"], ["skills/release-notes/SKILL.md", "—", "loaded on demand"]]), [
      ["One orchestrator you talk to; three specialists it can call."],
      ["Specialists are hidden from the picker (user-invocable: false) but usable as subagents.", [[2, 2, 2], [3, 2, 2], [4, 2, 2]]],
      ["The skill loads only when a release task matches its description.", [[5, 2, 2]]],
    ]),
  },
];

/* ------------------------------------------------------------------ */
export const models: ConceptDef[] = [
  {
    t: "GitHub Models: retired on 30 July 2026",
    lv: 1,
    s: `A note first: GitHub Models — the hosted model catalogue, playground and inference API that let developers try and call models with a GitHub token — {{was fully retired on 30 July 2026}}; its playground, model catalogue, inference API and bring-your-own-key option are no longer available to anyone. GitHub's changelog points to {{Microsoft Foundry}} for a broad model catalogue and to {{GitHub Copilot}} for AI workflows on GitHub. Code that called the old inference endpoint (including GitHub Spark's llm() function) must move to another provider. This is why a track about building with models should teach {{portability}}: model services come and go, so isolate the provider behind your own interface.`,
    r: `Check the "last updated" date of tutorials: anything that tells you to call GitHub Models with a personal access token is out of date.`,
    i: `What happened to GitHub Models and what does GitHub recommend instead?`,
    c: py`
timeline = [("2026-07-01", "retirement announced"), ("2026-07-16", "brownout"), ("2026-07-23", "brownout"), ("2026-07-30", "fully retired")]
for date, event in timeline:
    print(date, event)
migration = ["find every call to the old inference endpoint", "choose a provider (Foundry, a direct API, Copilot features)", "swap behind an interface", "re-run your evaluation set"]
print(len(migration), "steps")`,
    v: rowflow("Migrating off a retired service.", ["Find usages", "Pick a provider", "Hide it behind an interface", "Swap the implementation", "Re-run evaluations"], [
      "Search code, workflows and docs.",
      "Based on models, cost, data terms.",
      "Your own small 'complete()' function.",
      "Change one module, not the whole app.",
      "Quality and cost may differ: measure.",
    ]),
  },
  {
    t: "Staying portable across model providers",
    lv: 2,
    s: `Treat the model as a replaceable dependency. Put calls behind a small interface of your own — complete(messages, tools, settings) → result with text, tool calls and usage — and keep provider details (endpoint, model id, authentication, request shape) in one adapter and in configuration. Keep prompts and tool schemas in files, not scattered strings; keep an evaluation set that can be run against any adapter; log tokens and cost in one format. Differences you must still handle: how system prompts and tools are expressed, token pricing and limits, streaming events, supported features (caching, batch, thinking). Test fallbacks, because a backup provider you never ran will not work on the day you need it.`,
    r: `Portability is not zero cost: use provider-specific features (caching, batch) deliberately, behind the interface.`,
    i: `What belongs in a provider adapter and what in your own interface?`,
    c: py`
class FakeClaude:
    def complete(self, messages):
        return {"text": "claude says hi", "usage": {"in": 20, "out": 5}}

class FakeOther:
    def complete(self, messages):
        return {"text": "other says hi", "usage": {"in": 22, "out": 6}}

def run(provider, messages):
    out = provider.complete(messages)
    return out["text"], out["usage"]

for name, p in {"claude": FakeClaude(), "other": FakeOther()}.items():
    print(name, run(p, [{"role": "user", "content": "hi"}]))`,
    v: compare("What to isolate.", ["In your interface", "In the adapter / config"], [
      ["Inputs", "messages, tools, settings", "provider request format"],
      ["Outputs", "text, tool calls, usage", "provider response parsing"],
      ["Identity", "logical model name", "model ID, endpoint, credentials"],
      ["Quality", "evaluation set and metrics", "—"],
    ]),
  },
  {
    t: "Using Claude through cloud platforms",
    lv: 1,
    s: `Claude is available directly from Anthropic and through cloud platforms, which matters for data residency, procurement and existing cloud commitments. The current models are offered on the Claude API, Amazon Bedrock, Google Cloud (Vertex AI), Microsoft Foundry and Claude Platform on AWS. Model identifiers differ: the Claude API uses claude-opus-5-5; Amazon Bedrock uses anthropic.claude-opus-5-5; Google Cloud and Microsoft Foundry use claude-opus-5-5 (Foundry deployments are named by you); Claude Platform on AWS uses the Claude API IDs. Features and rollout timing can differ by platform, so check the model page for the platform you use, and keep the ID in configuration.`,
    r: `Pick the platform for compliance and billing reasons, then test the exact features you depend on there.`,
    i: `Give the Bedrock ID for Claude Opus 5.5 and say why the ID belongs in configuration.`,
    c: py`
ids = {
    "Claude API": "claude-opus-5-5",
    "Amazon Bedrock": "anthropic.claude-opus-5-5",
    "Google Cloud": "claude-opus-5-5",
    "Microsoft Foundry": "claude-opus-5-5 (deployment name you choose)",
    "Claude Platform on AWS": "claude-opus-5-5",
}
for platform, model_id in ids.items():
    print(f"{platform:24s} {model_id}")`,
    v: compare("Platforms offering the current Claude models.", ["Model ID for Opus 5.5"], [
      ["Claude API", "claude-opus-5-5"],
      ["Amazon Bedrock", "anthropic.claude-opus-5-5"],
      ["Google Cloud", "claude-opus-5-5"],
      ["Microsoft Foundry", "claude-opus-5-5 (you name the deployment)"],
    ]),
  },
];

/* ------------------------------------------------------------------ */
export const dev: ConceptDef[] = [
  {
    t: "An AI-assisted development workflow",
    lv: 1,
    s: `Use assistants where verification is cheap. A reliable loop: write or refine the {{specification}} (acceptance criteria, edge cases); ask the assistant to propose {{tests}} first; implement in small steps; run the tests, linter and type checker after each; review the diff line by line; commit with a message that says what changed and why. Delegate well-defined chores (boilerplate, refactors with tests, documentation, migration scripts); keep design decisions, security-sensitive code and anything you cannot verify under closer human review. Measure the effect with your own metrics (cycle time, review findings, escaped defects) rather than impressions.`,
    r: `The assistant's confidence is not evidence: only tests, types and reviews are.`,
    i: `List the steps of a test-first loop with an assistant and what you keep for human review.`,
    c: py`
loop = ["write acceptance criteria", "ask for failing tests", "implement a small step", "run tests, lint, types", "review the diff", "commit"]
for i, s in enumerate(loop, 1):
    print(i, s)
review_more = ["security-sensitive code", "design decisions", "anything without tests"]
print(review_more)`,
    v: rowflow("A test-first loop.", ["Specification", "Failing tests", "Small implementation", "Checks pass?", "Human review", "Commit"], [
      "Acceptance criteria and edge cases.",
      "Tests that express them.",
      "One step at a time.",
      "Tests, linter, types.",
      "You read every changed line.",
      "A clear, reviewable change.",
    ]),
  },
  {
    t: "Code review and quality gates with agents",
    lv: 2,
    s: `A review agent is a read-only custom agent (or subagent) that checks changes against a checklist: correctness, error handling, tests, security (injection, secrets, unsafe deserialisation), performance, naming and docs. Make findings actionable: file, line, severity, why, a suggested fix. Run it as a pre-review pass, never as a replacement for human approval; track precision — if half the comments are noise, tighten the checklist or drop them. Use multiple narrow reviewers (security, tests, docs) in parallel instead of one vague one. Combine with deterministic gates that need no model: CI tests, static analysis, dependency and secret scanning, branch protection.`,
    r: `Count how many agent findings were accepted: that precision number decides whether the agent stays.`,
    i: `Compute the precision of a review agent that made 40 comments of which 28 were accepted.`,
    c: py`
made, accepted = 40, 28
print(round(accepted / made, 2), "precision")
findings = [{"file": "app.py", "line": 42, "severity": "high", "why": "SQL built from user input", "fix": "use parameters"}]
print(findings[0])`,
    v: compare("Gates around AI-written code.", ["Catches"], [
      ["Tests and type checks", "behavioural and interface errors"],
      ["Static analysis, secret and dependency scanning", "known vulnerability patterns, leaked keys"],
      ["Review agent (read-only)", "checklist issues, missing tests, style"],
      ["Human review", "design, intent, anything subtle"],
    ]),
  },
  {
    t: "Research workflows with assistants",
    lv: 1,
    s: `Assistants speed up research when you keep control of the evidence. Useful patterns: {{triage}} (summarise 50 abstracts and rank by relevance to a stated question), {{extraction}} (pull methods, datasets and numbers into a table with page references), {{comparison}} (differences between two methods), {{drafting}} (an outline or related-work section from sources you supply) and {{code for analysis}}. Rules: give the model the documents rather than relying on memory; require quotes or citations with locations and check a sample against the source; never cite a paper you have not opened (models can invent plausible references); record which tool, model and prompt produced each summary; and keep your own judgement for interpretation and claims.`,
    r: `Verify every reference exists and says what is claimed before it enters a paper or report.`,
    i: `Name three safeguards against fabricated citations in assisted research.`,
    c: py`
cited = ["Smith 2021", "Doe 2019", "Roe 2024"]
opened = {"Smith 2021", "Roe 2024"}
unverified = [c for c in cited if c not in opened]
print("not yet verified:", unverified)
sample = 10
checked_correct = 9
print(checked_correct / sample, "= share of sampled summaries that matched the source")`,
    v: compare("Research tasks and checks.", ["Check"], [
      ["Triage of abstracts", "spot-check ranking against your own reading"],
      ["Table of methods and numbers", "verify against the source pages"],
      ["Related-work draft", "open every cited paper"],
      ["Analysis code", "run on a case with a known answer"],
    ]),
  },
  {
    t: "Security of AI-assisted development",
    lv: 2,
    s: `New tools bring new risks. {{Secrets}}: never paste keys into prompts; use secret scanners and pre-commit checks; keep credentials out of agent files. {{Untrusted content}}: text in issues, web pages and dependencies can contain instructions that steer an agent (prompt injection): run agents with least privilege and without production credentials, and require approval for network access and destructive commands. {{Dependencies}}: assistants sometimes suggest packages that do not exist; attackers register such names — always verify a package exists, is maintained and is the intended one before installing. {{Generated code}}: review it as you would a stranger's pull request. {{Data}}: know what leaves your machine and the retention terms of each service.`,
    r: `Run coding agents in a container or sandbox with a scoped token: assume one of them will eventually follow a malicious instruction.`,
    i: `Why verify package names an assistant suggests?`,
    c: py`
suggested = ["requests", "fastjson-utils-pro", "numpy"]
known_registry = {"requests", "numpy", "pandas"}
print([p for p in suggested if p not in known_registry], "need verification before installing")
env = {"GITHUB_TOKEN": "scoped:contents-read", "PROD_DB_URL": None}
print({k: v for k, v in env.items() if v})`,
    v: compare("Risks and controls.", ["Control"], [
      ["Leaked secrets", "secret scanning, no keys in prompts or agent files"],
      ["Prompt injection via issues or web pages", "least privilege, approvals, sandbox"],
      ["Invented or malicious packages", "verify the package before install"],
      ["Unreviewed generated code", "tests, static analysis, human review"],
      ["Data leaving the machine", "know retention terms; mask sensitive data"],
    ]),
  },
  {
    t: "Rolling out assistants in a team",
    lv: 1,
    s: `Treat adoption as a change project. Start with a pilot team and a small set of tasks with clear success measures. Write short guidelines: what to delegate, what must be reviewed by a person, what data must never be shared. Share assets — instructions, prompt files, skills and agents — in the repository so everyone benefits and changes are reviewed. Provide training on prompting, verification and security; collect failures and add them to a shared evaluation set; track metrics (cycle time, review time, defects, developer satisfaction, cost per developer); and review them every quarter. Expect the benefit to differ between tasks and between developers: measure rather than assume.`,
    r: `Budget for the cost of reviewing AI-written changes: faster typing is not the same as faster delivery.`,
    i: `Which assets would you commit to the repository to make a team's assistant behave consistently?`,
    c: py`
assets = [".github/copilot-instructions.md", ".github/prompts/", ".github/agents/", ".github/skills/", "CLAUDE.md", ".claude/skills/", ".claude/agents/"]
for a in assets:
    print("commit:", a)
cost_per_dev, devs = 20, 50
print(cost_per_dev * devs, "per month for", devs, "developers at", cost_per_dev)`,
    v: rowflow("Adopting assistants.", ["Pilot", "Guidelines", "Shared assets", "Training", "Measure", "Review quarterly"], [
      "One team, clear tasks and success measures.",
      "What to delegate, review and never share.",
      "Instructions, prompts, agents and skills in version control.",
      "Prompting, verification, security.",
      "Cycle time, defects, cost, satisfaction.",
      "Adjust scope and rules from evidence.",
    ]),
  },
];

void [P, bars, cells, compare, curve, hline, par, plot, pt, seg, vline, table, rowflow];
