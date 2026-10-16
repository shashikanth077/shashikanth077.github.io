import { py, type DrillDef, type QuestionDef } from "../build.js";

export const questions: QuestionDef[] = [
  /* api */
  ["api", 1, "Which fields must every Messages API request contain, and where does the system prompt go?", "model, max_tokens and messages; the system prompt is the top-level system field (there is no system role inside messages)."],
  ["api", 1, "Name the four current model tiers and their intended use.", "Fable 5.1 (hardest reasoning and long-horizon agents), Opus 5.5 (agentic coding and knowledge work), Sonnet 5.5 (speed and intelligence), Haiku 5.5 (high-volume, latency-sensitive classification, extraction, routing)."],
  ["api", 1, "Cost of 100,000 requests of 2,000 input and 500 output tokens on Sonnet 5.5 ($2 / $10 per million)?", "$0.009 each → $900 (half that as a batch)."],
  ["api", 1, "Why is the API stateless and what does that mean for cost?", "Each request must carry the whole conversation, so input tokens grow every turn; summarise, trim or cache."],
  ["api", 2, "What is the event sequence of a streamed response?", "message_start, content_block_start, content_block_delta (text pieces), content_block_stop, message_delta (stop_reason, usage), message_stop."],
  ["api", 2, "Describe the tool-use round trip.", "Response with stop_reason tool_use and tool_use blocks → your code runs the tool → next request adds the assistant message and a user message with tool_result blocks carrying the same tool_use_id."],
  ["api", 2, "What do tool_choice 'any', 'tool' and disable_parallel_tool_use do?", "'any' forces some tool, 'tool' forces a named tool, disable_parallel_tool_use makes Claude call at most one tool per turn."],
  ["api", 2, "How does prompt caching price a write and a read?", "5-minute write 1.25× base input, 1-hour write 2×, read 0.1× (0.05× on Opus 5.5 and Sonnet 5.5, 0.025× on Fable 5.1); minimum cacheable length 512 tokens on current models."],
  ["api", 2, "A 10,000-token prefix is used 20 times on Sonnet 5.5. Cost with and without caching?", "$0.40 uncached versus about $0.044 with a 5-minute cache (≈ 9× cheaper)."],
  ["api", 1, "What does the Message Batches API offer?", "Asynchronous processing of many Messages requests (most batches finish in under an hour) at 50% lower cost."],
  ["api", 2, "Which errors do you retry and how?", "429, 5xx and overload with exponential back-off plus jitter and a cap; never 400 or 401."],
  /* sdk */
  ["sdk", 1, "Client SDK, Agent SDK, Claude Code and Managed Agents: who runs the loop?", "Client SDK: your code (or the tool runner); Agent SDK: a library running the Claude Code agent in your process; Claude Code: the terminal tool; Managed Agents: Anthropic's hosted harness."],
  ["sdk", 2, "Name four capabilities the Agent SDK provides.", "Built-in tools, permissions, hooks, subagents, MCP, sessions, skills/commands/memory loading, plugins."],
  ["sdk", 2, "How do you drive the agent from a language without an SDK?", "Run the CLI as a subprocess in headless mode: claude -p with --output-format json."],
  /* Claude Code */
  ["cc", 1, "Where do CLAUDE.md files live and which are shared?", "Managed policy (org), ~/.claude/CLAUDE.md (you), ./CLAUDE.md or ./.claude/CLAUDE.md (team, committed), ./CLAUDE.local.md (you, gitignored)."],
  ["cc", 1, "How large should a CLAUDE.md be and why?", "Under about 200 lines: longer files use more context and reduce adherence; move path-specific material to .claude/rules."],
  ["cc", 2, "Describe the structure and loading of a skill.", "A directory with SKILL.md (frontmatter + instructions) and optional files; descriptions are always in context, the body loads when used, supporting files only when referenced."],
  ["cc", 2, "Which skill frontmatter controls invocation?", "disable-model-invocation (only you can invoke), user-invocable: false (only Claude can), context: fork (run in a subagent), plus allowed-tools, model, paths."],
  ["cc", 2, "Where are subagents defined and which fields are required?", ".claude/agents/ (project) or ~/.claude/agents/ (user), plugins, managed settings; only name and description are required."],
  ["cc", 2, "What does a subagent see and return?", "Its own system prompt, the task brief, CLAUDE.md and preloaded skills — not your conversation; only its summary returns to the main conversation."],
  ["cc", 2, "Default limits for nested and concurrent subagents?", "Nesting up to three layers; 20 concurrent subagents (both configurable by environment variables)."],
  ["cc", 2, "CLAUDE.md, skill, subagent or hook: which for 'format every edited file'?", "A PostToolUse hook with an Edit|Write matcher: deterministic, not advisory."],
  ["cc", 2, "How do hooks decide permissions when several disagree?", "The most restrictive answer wins: deny, then defer, ask, allow."],
  ["cc", 1, "Describe a reliable coding loop with Claude Code.", "Explore, plan (review), code in small steps, verify with tests/lint/types, fix, commit on a branch, review the diff."],
  /* Copilot */
  ["copilot", 1, "Name the five Copilot customisation mechanisms.", "Custom instructions, prompt files, custom agents, Agent Skills, MCP servers."],
  ["copilot", 1, "How do you make an instruction apply only to Python files?", "A .github/instructions/*.instructions.md file with applyTo: '**/*.py' in its frontmatter."],
  ["copilot", 1, "Where do prompt files live and how do you run one?", ".github/prompts/*.prompt.md; type /name in chat (or Chat: Run Prompt); ${input:var} asks for values."],
  ["copilot", 2, "Where do custom agents live and which frontmatter property is required on GitHub?", ".github/agents/<name>.agent.md (org-level in the agents/ directory of .github or .github-private); description is required."],
  ["copilot", 2, "What are handoffs?", "Frontmatter entries (label, agent, prompt, send, model) that show buttons after a response to continue in another agent with context."],
  ["copilot", 2, "How do sub-agents work in Copilot?", "The main agent calls the agent tool (Run Subagent); the subagent has its own context, no chat history, is stateless, and returns a focused result; the coordinator's agents property lists allowed subagents."],
  ["copilot", 2, "Which properties control picker visibility and subagent callability?", "user-invocable (false hides it from the picker) and disable-model-invocation (true stops other agents from calling it)."],
  ["copilot", 2, "Nesting of sub-agents in VS Code?", "Off by default; chat.subagents.allowInvocationsFromSubagents enables it, to a maximum depth of five."],
  ["copilot", 2, "SKILL.md name and description rules?", "name: lowercase letters, digits, hyphens, ≤ 64 characters and equal to the directory name; description required, ≤ 1,024 characters."],
  ["copilot", 2, "Where can Copilot read project skills from?", ".github/skills/, .claude/skills/ and .agents/skills/ (personal: ~/.copilot/skills/, ~/.claude/skills/, ~/.agents/skills/)."],
  ["copilot", 2, "Skills or custom instructions: what differs?", "Instructions state always-applied standards; skills are on-demand procedures with scripts and resources, loaded progressively."],
  ["copilot", 2, "Why give the orchestrator no edit tool?", "It only plans and merges; keeping edits to the implementer limits damage and keeps each context small."],
  ["copilot", 2, "How do you use custom agents on GitHub itself?", "Select one in the agents panel or tab, assign an issue to Copilot with it, or use /agent in the Copilot CLI; the pull request notes the agent."],
  /* models */
  ["models", 1, "What happened to GitHub Models?", "It was fully retired on 30 July 2026 (playground, catalogue, inference API, BYOK); GitHub points to Microsoft Foundry and GitHub Copilot."],
  ["models", 2, "How do you stay portable across model providers?", "Hide the provider behind your own interface, keep model IDs and endpoints in configuration, keep prompts and tools in files, and keep a provider-independent evaluation set."],
  ["models", 1, "Bedrock ID of Claude Opus 5.5?", "anthropic.claude-opus-5-5 (the Claude API uses claude-opus-5-5)."],
  /* dev */
  ["dev", 1, "Steps of an assisted test-first loop?", "Specify, write failing tests, implement a small step, run tests/lint/types, review the diff, commit."],
  ["dev", 2, "Precision of a review agent with 40 comments of which 28 were accepted?", "0.70; if precision is low, tighten the checklist."],
  ["dev", 1, "Safeguards against fabricated citations?", "Open every reference, require quotes with locations, sample-check summaries against sources."],
  ["dev", 2, "Why verify packages an assistant suggests?", "Names may not exist or may be malicious look-alikes; verify existence, maintenance and identity before installing."],
  ["dev", 1, "Which files would you commit to make a team's assistant consistent?", "Instructions, prompt files, agents and skills (.github/…, CLAUDE.md, .claude/…), reviewed like code."],
];

export const drills: DrillDef[] = [
  {
    t: "Cost of a request",
    q: "What does this print?",
    code: py`
pin, pout = 2.0, 10.0
print(round(2000 / 1e6 * pin + 500 / 1e6 * pout, 4))`,
    opts: [["0.009", true, "0.004 for input plus 0.005 for output."], ["0.0045", false, "Output tokens are billed at their own, higher price."], ["9.0", false, "Divide token counts by a million."]],
    path: ["input: 2000/10⁶ × 2 = 0.004.", "output: 500/10⁶ × 10 = 0.005.", "total 0.009."],
    why: "Billing is per million tokens, separately for input and output.",
    watch: "Output is five times dearer than input here.",
    remember: "cost = tin·pin + tout·pout.",
  },
  {
    t: "Cost of a batch",
    q: "What does this print?",
    code: py`
per_request = 2000 / 1e6 * 2.0 + 500 / 1e6 * 10.0
print(round(per_request * 100000, 2), round(per_request * 100000 * 0.5, 2))`,
    opts: [["900.0 450.0", true, "Batch requests cost 50% less."], ["900.0 900.0", false, "The Batch API halves the price."], ["450.0 225.0", false, "The standard price of the workload is 900."]],
    path: ["0.009 × 100,000 = 900.", "Batch: × 0.5 = 450."],
    why: "Asynchronous work is discounted.",
    watch: "Batch results arrive later (most within an hour).",
    remember: "Batch = 50% off.",
  },
  {
    t: "Caching saving",
    q: "What does this print?",
    code: py`
base, tokens, n = 2.0, 10000, 20
unc = n * tokens / 1e6 * base
cached = tokens / 1e6 * base * 1.25 + (n - 1) * tokens / 1e6 * base * 0.05
print(round(unc, 2), round(cached, 3), round(unc / cached, 1))`,
    opts: [["0.4 0.044 9.1", true, "One write at 1.25× then 19 reads at 0.05×."], ["0.4 0.4 1.0", false, "Reads are far cheaper than fresh input."], ["0.4 0.05 8.0", false, "Include the 1.25× write."]],
    path: ["uncached: 20 × 10,000 × $2/10⁶ = 0.40.", "write: 0.025; 19 reads: 0.019.", "cached total 0.044."],
    why: "Cache reads cost a small fraction of base input.",
    watch: "The prefix must be identical and above the minimum length.",
    remember: "write 1.25×, read 0.05× (Sonnet 5.5).",
  },
  {
    t: "Conversation growth",
    q: "What does this print?",
    code: py`
system, per_turn = 500, 200
print(system + per_turn * 9, sum(system + per_turn * t for t in range(10)))`,
    opts: [["2300 14000", true, "Turn 10 resends all earlier turns."], ["700 7000", false, "The history grows every turn."], ["2300 23000", false, "Sum 500 + 200·t over ten turns."]],
    path: ["Turn 10: 500 + 9 × 200 = 2,300.", "Total: 10 × 500 + 200 × 45 = 14,000."],
    why: "The API is stateless: the history is re-sent.",
    watch: "Summarise or cache to flatten the curve.",
    remember: "turn n sends s + d(n − 1).",
  },
  {
    t: "Skill name rules",
    q: "What does this print?",
    code: py`
import re
ok = lambda name, folder: bool(re.fullmatch(r"[a-z0-9-]{1,64}", name)) and name == folder
print(ok("release-notes", "release-notes"), ok("Release_Notes", "release-notes"), ok("release-notes", "notes"))`,
    opts: [["True False False", true, "Lowercase letters, digits, hyphens, and it must equal the directory name."], ["True True True", false, "Underscores and capitals are invalid; the name must match the folder."], ["True False True", false, "A name that differs from the directory also fails."]],
    path: ["release-notes in release-notes: valid.", "Release_Notes: capital and underscore: invalid.", "name ≠ folder: invalid."],
    why: "An invalid name makes the skill silently fail to load.",
    watch: "Max 64 characters.",
    remember: "name = lowercase-hyphen = directory.",
  },
  {
    t: "Frontmatter parsing",
    q: "What does this print?",
    code: py`
import re
text = "---\nname: reviewer\ndescription: Reviews code\ntools: Read, Grep\n---\nBody"
m = re.match(r"---\n(.*?)\n---\n(.*)", text, re.S)
meta = dict(l.split(": ", 1) for l in m.group(1).splitlines())
print(sorted(meta), m.group(2))`,
    opts: [["['description', 'name', 'tools'] Body", true, "The header between --- lines, then the prompt body."], ["['name'] Body", false, "All header lines are keys."], ["['tools'] Reviews code", false, "The body is the text after the closing ---."]],
    path: ["The header holds three key: value lines.", "The remainder is the system prompt."],
    why: "Agent and skill files are YAML frontmatter plus Markdown.",
    watch: "Only name and description are required for Claude Code subagents.",
    remember: "--- header --- body.",
  },
  {
    t: "Subagent context saving",
    q: "What does this print?",
    code: py`
read, returned = 50000, 1000
print(read - returned, read // returned)`,
    opts: [["49000 50", true, "Only the summary enters the main context."], ["1000 50", false, "The saving is the difference."], ["50000 1", false, "The ratio is read divided by returned."]],
    path: ["Main context saved: 50,000 − 1,000 = 49,000.", "Ratio: 50×."],
    why: "Verbose work stays in the subagent's own window.",
    watch: "Each subagent still has its own token bill.",
    remember: "Subagents return summaries.",
  },
  {
    t: "Parallel subagent cost",
    q: "What does this print?",
    code: py`
agents, background = 4, 10000
print(agents * background)`,
    opts: [["40000", true, "Each subagent has its own context."], ["10000", false, "They do not share one context window."], ["4", false, "Multiply by the background tokens."]],
    path: ["4 agents × 10,000 tokens each = 40,000 input tokens."],
    why: "Contexts are separate, so shared background is paid repeatedly.",
    watch: "Cache the shared prefix where possible.",
    remember: "tokens ≈ agents × context.",
  },
  {
    t: "Always-on context",
    q: "What does this print?",
    code: py`
n, desc, body = 20, 100, 2000
print(n * desc, n * body)`,
    opts: [["2000 40000", true, "Skills load descriptions only until needed."], ["40000 40000", false, "Progressive disclosure keeps bodies out until used."], ["2000 2000", false, "20 bodies of 2,000 tokens would be 40,000."]],
    path: ["20 descriptions × 100 = 2,000 always loaded.", "20 bodies × 2,000 = 40,000 if all were loaded."],
    why: "Three-level loading keeps context small.",
    watch: "Write descriptions that say when to use the skill.",
    remember: "descriptions only until used.",
  },
  {
    t: "Delegation permissions",
    q: "What does this print?",
    code: py`
agents = {"lead": {"agents": ["worker"], "tools": ["agent"]}, "worker": {"disable-model-invocation": False}, "secret": {"disable-model-invocation": True}}
def can_call(lead, target):
    a = agents[lead]
    return "agent" in a["tools"] and target in a["agents"] and not agents[target].get("disable-model-invocation", False)
print(can_call("lead", "worker"), can_call("lead", "secret"))`,
    opts: [["True False", true, "The coordinator must list the agent, and the target must allow model invocation."], ["True True", false, "'secret' is not listed and forbids invocation."], ["False False", false, "The lead lists worker and has the agent tool."]],
    path: ["worker is listed, lead has the agent tool, worker allows invocation → True.", "secret is not listed and disables model invocation → False."],
    why: "Both the coordinator and the target must agree.",
    watch: "Include the agent tool when you set agents.",
    remember: "agents + agent tool + not disabled.",
  },
  {
    t: "Review precision",
    q: "What does this print?",
    code: py`
print(round(28 / 40, 2))`,
    opts: [["0.7", true, "Accepted comments over comments made."], ["0.28", false, "Divide by the 40 comments made."], ["1.43", false, "Precision cannot exceed 1."]],
    path: ["28 accepted of 40 made = 0.70."],
    why: "Precision says how many comments were useful.",
    watch: "Low precision means noise: tighten the checklist.",
    remember: "accepted / made.",
  },
];

export const codeLab: [string, string, string][] = [
  ["Build a Messages API request", "Assemble and print the JSON body of a request with a system prompt and one tool.", py`
import json

request = {
    "model": "claude-haiku-5-5",
    "max_tokens": 300,
    "system": "Answer in one sentence.",
    "tools": [{"name": "get_time", "description": "Get the current time in a city.",
               "input_schema": {"type": "object", "properties": {"city": {"type": "string"}}, "required": ["city"]}}],
    "messages": [{"role": "user", "content": "What time is it in Vilnius?"}],
}
print(sorted(request), len(json.dumps(request)))`],
  ["A tool-use loop with a scripted model", "Run the round trip with tool_use and tool_result blocks.", py`
registry = {"add": lambda a, b: a + b}

def scripted(messages):
    last = messages[-1]
    if last["role"] == "user" and isinstance(last["content"], str):
        return {"stop_reason": "tool_use", "content": [{"type": "tool_use", "id": "t1", "name": "add", "input": {"a": 2, "b": 3}}]}
    return {"stop_reason": "end_turn", "content": [{"type": "text", "text": "The sum is 5."}]}

messages = [{"role": "user", "content": "2 + 3?"}]
for _ in range(5):
    response = scripted(messages)
    if response["stop_reason"] != "tool_use":
        print(response["content"][0]["text"])
        break
    results = [{"type": "tool_result", "tool_use_id": b["id"], "content": str(registry[b["name"]](**b["input"]))} for b in response["content"] if b["type"] == "tool_use"]
    messages += [{"role": "assistant", "content": response["content"]}, {"role": "user", "content": results}]`],
  ["Cost tracker", "Aggregate usage and cost over several responses.", py`
prices = {"claude-sonnet-5-5": (2.0, 10.0)}
usages = [("claude-sonnet-5-5", 2000, 500), ("claude-sonnet-5-5", 1200, 300), ("claude-sonnet-5-5", 4000, 900)]
total = sum(i / 1e6 * prices[m][0] + o / 1e6 * prices[m][1] for m, i, o in usages)
print(round(total, 5), sum(i for _, i, _ in usages), sum(o for _, _, o in usages))`],
  ["Retry with back-off", "Retry a flaky call on 429 and 5xx only.", py`
import random

random.seed(2)
statuses = iter([429, 529, 200])
def call():
    return next(statuses)

attempts, waits = 0, []
while True:
    status = call()
    attempts += 1
    if status == 200:
        break
    if status not in {429, 500, 502, 503, 529} or attempts >= 5:
        break
    waits.append(round(min(2 ** attempts, 30) * (0.5 + random.random() / 2), 2))
print(status, attempts, waits)`],
  ["Validate agent and skill files", "Check names, descriptions and tool lists in frontmatter.", py`
import re

def parse(text):
    m = re.match(r"---\n(.*?)\n---\n", text, re.S)
    return dict(l.split(": ", 1) for l in m.group(1).splitlines()) if m else {}

files = {
    "agents/reviewer.agent.md": "---\nname: reviewer\ndescription: Reviews code\ntools: read, search\n---\nBody\n",
    "skills/Bad_Name/SKILL.md": "---\nname: Bad_Name\ndescription: x\n---\nBody\n",
}
for path, text in files.items():
    meta = parse(text)
    ok = bool(meta.get("description"))
    if path.endswith("SKILL.md"):
        ok = ok and bool(re.fullmatch(r"[a-z0-9-]{1,64}", meta["name"]))
    print(path, "ok" if ok else "invalid")`],
  ["Match instruction files to paths", "Decide which applyTo globs match which files.", py`
import fnmatch

rules = {"**/*.py": "python.instructions.md", "src/**/*.ts": "typescript.instructions.md", "docs/*.md": "docs.instructions.md"}
files = ["src/app/main.py", "src/web/app.ts", "docs/guide.md", "README.md"]
for f in files:
    print(f, [name for pat, name in rules.items() if fnmatch.fnmatch(f, pat)])`],
  ["Subagent delegation graph", "Resolve which agents may call which, with a depth limit.", py`
agents = {"lead": ["researcher", "implementer"], "researcher": ["searcher"], "implementer": [], "searcher": []}
def reachable(start, depth):
    out, frontier = [], [start]
    for _ in range(depth):
        frontier = [t for a in frontier for t in agents[a]]
        out += frontier
    return out
print(reachable("lead", 1), reachable("lead", 2))`],
  ["Context budget with and without subagents", "Compare main-context growth for a research-heavy task.", py`
files_tokens, summary_tokens, tasks = 50000, 800, 3
main_alone = files_tokens * tasks
with_subagents = summary_tokens * tasks
print(main_alone, with_subagents, round(main_alone / with_subagents, 1))`],
];

export const glance: [string, string][] = [
  ["Messages API", "POST /v1/messages · model, max_tokens, messages · system is top-level · stop_reason · usage"],
  ["Models", "claude-fable-5-1 $10/$50 · claude-opus-5-5 $4/$20 · claude-sonnet-5-5 $2/$10 · claude-haiku-5-5 from $0.10/$0.50 · 1M context · 128K output"],
  ["Cost", "tin/10⁶·pin + tout/10⁶·pout · batch −50% · cache write 1.25× (5 min) or 2× (1 h), read 0.1× (0.05× Opus/Sonnet 5.5) · min 512 tokens"],
  ["Tool use", "tools[name, description, input_schema] → tool_use (id) → tool_result (tool_use_id) · tool_choice auto/any/tool/none · strict: true"],
  ["Claude Code", "CLAUDE.md (≤ 200 lines) · .claude/skills/<name>/SKILL.md · .claude/agents/*.md (name, description, tools, model) · hooks in settings.json · depth 3, 20 concurrent"],
  ["Hooks", "events SessionStart · UserPromptSubmit · PreToolUse (can block) · PostToolUse · matcher Edit|Write · most restrictive decision wins"],
  ["Copilot files", ".github/copilot-instructions.md · .github/instructions/*.instructions.md (applyTo) · .github/prompts/*.prompt.md · .github/agents/*.agent.md · .github/skills/<name>/SKILL.md · AGENTS.md"],
  ["Copilot agents", "frontmatter description, name, tools, model, target, mcp-servers, handoffs, agents, user-invocable, disable-model-invocation · body ≤ 30,000 characters"],
  ["Copilot skills", "name = directory, lowercase-hyphen ≤ 64 · description ≤ 1,024 · progressive loading · context: fork (experimental)"],
  ["GitHub Models", "retired 30 July 2026 → Microsoft Foundry (catalogue), GitHub Copilot (workflows)"],
];

export const lists: [string, string[]][] = [
  ["Habits for production use of the Claude API", ["Keep the model ID, prompts and tool schemas in configuration, not scattered strings", "Stream user-facing answers", "Cache stable prefixes and batch offline work", "Log usage and cost per feature", "Retry only transient errors with back-off and jitter", "Run your evaluation set on every model or prompt change"]],
  ["Habits for agent configuration files", ["Give each agent one job and the minimum tools", "Write descriptions that say when to use the agent or skill", "Validate frontmatter in CI", "Keep CLAUDE.md and instruction files short and consistent", "Enforce critical rules with hooks, permissions or CI — not prose", "Review agent and skill changes like code"]],
  ["Explaining your answer in an exam", ["Name the file, its location and the frontmatter fields", "Substitute prices and token counts and show the arithmetic", "State what is in the context and what is not (subagents do not see your chat)", "Say what you would verify, and where a human stays in the loop"]],
];

export const materials: [string, [string, string][]][] = [
  ["Claude documentation", [["Models overview and pricing", "https://platform.claude.com/docs/en/models/overview"], ["Tool use overview", "https://platform.claude.com/docs/en/agents-and-tools/tool-use/overview"], ["Prompt caching", "https://platform.claude.com/docs/en/build-with-claude/prompt-caching"], ["Batch processing", "https://platform.claude.com/docs/en/build-with-claude/batch-processing"]]],
  ["Claude Code and the Agent SDK", [["Subagents", "https://code.claude.com/docs/en/sub-agents"], ["Skills", "https://code.claude.com/docs/en/skills"], ["Hooks guide", "https://code.claude.com/docs/en/hooks-guide"], ["Memory and CLAUDE.md", "https://code.claude.com/docs/en/memory"], ["Agent SDK overview", "https://code.claude.com/docs/en/agent-sdk/overview"]]],
  ["GitHub Copilot customisation", [["Custom agents in VS Code", "https://code.visualstudio.com/docs/copilot/customization/custom-agents"], ["Agent Skills", "https://code.visualstudio.com/docs/copilot/customization/agent-skills"], ["Prompt files", "https://code.visualstudio.com/docs/copilot/customization/prompt-files"], ["Custom instructions", "https://code.visualstudio.com/docs/copilot/customization/custom-instructions"], ["Subagents in VS Code", "https://code.visualstudio.com/docs/copilot/agents/subagents"], ["Creating custom agents on GitHub", "https://docs.github.com/en/copilot/how-tos/use-copilot-agents/coding-agent/create-custom-agents"]]],
  ["GitHub Models retirement", [["Changelog: GitHub Models is now retired", "https://github.blog/changelog/2026-07-30-github-models-is-now-retired/"]]],
];
