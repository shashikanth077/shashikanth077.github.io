import { P, bars, cells, compare, curve, hline, par, plot, pt, seg, vline } from "../../visuals/kit.js";
import { py, type ConceptDef } from "../build.js";
import { table } from "../ml/data.js";
import { LIB, rowflow } from "./lib.js";

/* Every code example is plain Python and is RUN by `npm run outputs -- langchain-langgraph-rag`.
   LangChain, LangGraph and the vector databases are NOT installed here: the examples use tiny
   stand-ins that mirror the real interfaces (see lib.ts). Real API names were checked against
   the official LangChain, LangGraph and pgvector documentation on 2026-10-16. */

export const lc: ConceptDef[] = [
  {
    t: "What LangChain is, and where it sits",
    lv: 1,
    s: `{{LangChain}} is an open-source framework for building agents and LLM applications. Its current idea: {{Agent = Model + Harness}}, where the harness is the prompt, the tools and any middleware around the model loop. The entry point is {{create_agent}}, "a minimal, highly configurable harness"; models are created with {{init_chat_model}} or by a provider-prefixed string such as "anthropic:…". Install with pip install -qU langchain "langchain[anthropic]" (swap the extra for your provider). LangChain's agents are built on {{LangGraph}}, the lower-level orchestration runtime, which is where durable execution, human-in-the-loop and persistence come from. A third layer, integrations, wraps providers, embedding models and vector stores behind common interfaces so you can swap them.`,
    r: `Treat LangChain as convenience and portability, not magic: everything it does you could write by hand, as the earlier tracks show.`,
    i: `How are LangChain, LangGraph and the integrations related?`,
    c: py`
layers = {
    "integrations": "common interfaces to providers, embedding models, vector stores",
    "langchain": "create_agent, init_chat_model, prompts, retrievers, middleware",
    "langgraph": "low-level runtime: state, graphs, checkpoints, interrupts",
}
for name, role in layers.items():
    print(f"{name:13s} {role}")
REAL = '''
from langchain.agents import create_agent

def get_weather(city: str) -> str:
    """Get weather for a given city."""
    return f"It's always sunny in {city}!"

agent = create_agent(model="provider:model-name", tools=[get_weather], system_prompt="You are a helpful assistant")
result = agent.invoke({"messages": [{"role": "user", "content": "Weather in Vilnius?"}]})
'''
print(REAL.strip().splitlines()[0])`,
    v: compare("The layers.", ["What it gives you"], [
      ["langchain", "create_agent, init_chat_model, retrievers, prompts, middleware"],
      ["langgraph", "stateful graphs, durable execution, human-in-the-loop, memory"],
      ["integrations", "providers, embedding models and vector stores behind common interfaces"],
    ]),
  },
  {
    t: "Messages and chat models",
    lv: 1,
    s: `Modern chat models take a list of {{messages}} — system, human (user), AI (assistant) and tool messages — and return an AI message that may contain {{tool_calls}}. LangChain gives every provider the same interface, so a model object created with init_chat_model supports invoke (one answer), stream (tokens as they arrive), batch (many inputs) and bind_tools (attach tool schemas). A ToolMessage carries a tool's result back with the id of the call, exactly like the tool_use / tool_result pairs of the Claude API. Because the interface is uniform you can switch provider by changing a string in configuration — provided you re-run your evaluations, since models differ in tool-calling skill, limits and price.`,
    r: `Keep model identifiers in configuration and test every provider you claim to support.`,
    i: `What does a ToolMessage carry and how does it relate to the model's tool_calls?`,
    c: py`
from dataclasses import dataclass, field

@dataclass
class Message:
    role: str
    content: str = ""
    tool_calls: list = field(default_factory=list)
    tool_call_id: str = ""

class FakeChatModel:
    def invoke(self, messages):
        last = messages[-1]
        if last.role == "human":
            return Message("ai", tool_calls=[{"id": "c1", "name": "add", "args": {"a": 2, "b": 3}}])
        return Message("ai", content=f"The result is {last.content}.")

model = FakeChatModel()
history = [Message("system", "Be brief."), Message("human", "2 + 3?")]
ai = model.invoke(history)
print(ai.tool_calls[0]["name"], ai.tool_calls[0]["args"])
history += [ai, Message("tool", "5", tool_call_id=ai.tool_calls[0]["id"])]
print(model.invoke(history).content)`,
    v: rowflow("A tool-calling exchange as messages.", ["system", "human", "ai (tool_calls)", "tool (result)", "ai (answer)"], [
      "Standing instructions.",
      "The user's question.",
      "The model requests a tool call with an id.",
      "A ToolMessage with the result and the call id.",
      "The final text answer.",
    ]),
  },
  {
    t: "Runnables and the | operator (LCEL)",
    lv: 2,
    s: `LangChain's composition model is the {{Runnable}}: an object with invoke, batch and stream (and async versions). Runnables are chained with the pipe operator — the LangChain Expression Language, {{LCEL}}: prompt | model | parser. A dict inside a pipe becomes a {{parallel}} branch: every key's runnable receives the same input and the results are collected into a dict. A plain Python function is wrapped with RunnableLambda. Anything composed this way gets synchronous, asynchronous, batch and streaming behaviour automatically. The idea is the same as Unix pipes or functional composition: small steps with one input and one output, combined into a pipeline.`,
    r: `LCEL is most useful for fixed pipelines; for loops, branching and state use LangGraph.`,
    i: `What does a dict of runnables inside a pipe do?`,
    c: py`${LIB}
clean = Runnable(lambda s: s.strip().lower())
count = Runnable(lambda s: len(s.split()))
shout = Runnable(lambda s: s.upper())
chain = clean | {"words": count, "loud": shout}
print(chain.invoke("  Hello LangChain World "))
print(chain.batch(["a b", "c d e"]))`,
    v: rowflow("A pipeline with a parallel branch.", ["input", "clean", "parallel branch", "words / loud", "dict result"], [
      "A raw string.",
      "A Runnable step.",
      "A dict of runnables: each gets the same input.",
      "Both branches run on the cleaned text.",
      "{'words': 3, 'loud': 'HELLO LANGCHAIN WORLD'}.",
    ]),
  },
  {
    t: "Prompt templates and structured output",
    lv: 1,
    s: `A {{prompt template}} turns variables into messages: "Summarise {text} in {n} bullet points." Keeping the template separate from the data makes prompts reusable, testable and versionable. To get data rather than prose, ask the model for {{structured output}}: define a schema (a Pydantic class or a typed dict), pass it to the model, and receive a validated object — the framework uses the provider's tool-calling or JSON mode under the hood and parses the result. Always validate: a model can still return a wrong value that fits the schema. Combine the two: template → model with structured output → typed object your code can trust to have the right fields.`,
    r: `Version your templates with the code; a prompt change is a behaviour change and needs the evaluation set.`,
    i: `Why separate a prompt template from the data it is filled with?`,
    c: py`
import json

template = "Summarise the text in {n} bullet points. Return JSON with keys 'bullets' (list) and 'tone' (string).\nText: {text}"
prompt = template.format(n=2, text="LangGraph models agents as graphs with state and checkpoints.")
print(prompt.splitlines()[0])
model_output = '{"bullets": ["Agents are graphs", "State is checkpointed"], "tone": "neutral"}'
data = json.loads(model_output)
ok = isinstance(data.get("bullets"), list) and isinstance(data.get("tone"), str)
print(ok, len(data["bullets"]))`,
    v: compare("Free text versus structured output.", ["Free text", "Structured output"], [
      ["Result", "a string to parse", "a validated object"],
      ["Failure mode", "format drift", "schema violations (retry or repair)"],
      ["Use for", "chat, drafting", "extraction, routing, tool arguments"],
    ]),
  },
  {
    t: "Tools: functions the model can call",
    lv: 1,
    s: `In LangChain a {{tool}} is a plain Python function with type hints and a docstring: the name, the docstring and the parameter types become the schema the model sees, so write them for the model (what it does, when to use it, units). You pass the functions in a list — tools=[get_weather] to create_agent, or llm.bind_tools(tools) for a bare model. When the model replies with tool_calls, the framework (or your node) runs each function with the arguments and returns the results as ToolMessages. Good tool hygiene from the agentic track applies unchanged: few, narrow, well-described tools; validated arguments; errors returned as text; least privilege.`,
    r: `The docstring is the interface: if a human could not tell when to call the tool from it, the model cannot either.`,
    i: `Where does the schema a model sees for a tool come from?`,
    c: py`
import inspect

def get_weather(city: str, units: str = "celsius") -> str:
    """Get the current weather for a city. Use for any question about weather now."""
    return f"4 degrees ({units}) in {city}"

sig = inspect.signature(get_weather)
schema = {"name": get_weather.__name__, "description": get_weather.__doc__, "parameters": {p: str(v.annotation.__name__) for p, v in sig.parameters.items()}}
print(schema)
print(get_weather("Vilnius"))`,
    v: compare("What the framework reads from a function.", ["Becomes"], [
      ["Function name", "tool name"],
      ["Docstring", "description: when and why to call it"],
      ["Type hints and parameters", "argument schema"],
      ["Return value", "ToolMessage content for the model"],
    ]),
  },
  {
    t: "create_agent: the loop in one call",
    lv: 2,
    s: `{{create_agent}} wraps the loop you built by hand in the agentic track: call the model with the messages and tools; if it returns tool_calls, run them and append ToolMessages; repeat until the model answers without tool calls. You supply the model, the tools, the system prompt and optional {{middleware}} — hooks that run around model calls and tool calls to add behaviour such as summarising long histories, requiring human approval for sensitive tools, redacting data or limiting calls. The result of invoke is a dict whose messages list holds the whole trajectory; the last message is the answer. Because it runs on LangGraph, the agent can be given a checkpointer to remember a conversation per thread and can be interrupted for approval.`,
    r: `Start with create_agent; drop to a hand-built LangGraph when you need control over the exact steps.`,
    i: `Name what create_agent needs and what the result's messages list contains.`,
    c: py`
def create_agent(model, tools, max_steps=5):
    registry = {t.__name__: t for t in tools}
    def invoke(inputs):
        messages = list(inputs["messages"])
        for _ in range(max_steps):
            ai = model(messages)
            messages.append(ai)
            if not ai.get("tool_calls"):
                break
            for call in ai["tool_calls"]:
                messages.append({"role": "tool", "tool_call_id": call["id"], "content": str(registry[call["name"]](**call["args"]))})
        return {"messages": messages}
    return type("Agent", (), {"invoke": staticmethod(invoke)})

def add(a: int, b: int) -> int:
    """Add two integers."""
    return a + b

def scripted_model(messages):
    if messages[-1]["role"] == "user":
        return {"role": "ai", "tool_calls": [{"id": "c1", "name": "add", "args": {"a": 20, "b": 22}}]}
    return {"role": "ai", "content": "The answer is " + messages[-1]["content"], "tool_calls": []}

agent = create_agent(scripted_model, [add])
result = agent.invoke({"messages": [{"role": "user", "content": "20 + 22?"}]})
print([m["role"] for m in result["messages"]], result["messages"][-1]["content"])`,
    v: rowflow("What create_agent runs for you.", ["messages in", "model call", "tool_calls?", "run tools", "append ToolMessages", "final answer"], [
      "The user's request and your system prompt.",
      "Chat model with the tools attached.",
      "If none, the loop ends.",
      "Your functions execute.",
      "Results go back into the history.",
      "The last AI message.",
    ]),
  },
  {
    t: "Middleware: behaviour around the agent loop",
    lv: 2,
    s: `{{Middleware}} lets you change what happens before or after a model call or a tool call without rewriting the loop. Typical uses: {{summarise}} history when it exceeds a token budget, {{require approval}} before tools with side effects, {{redact}} sensitive data in prompts and outputs, {{limit}} the number of model or tool calls, {{retry}} flaky calls, and switch models dynamically (a cheap model for easy steps). Order matters: each layer wraps the next, so put guards (limits, redaction) outside and optimisations inside. Because middleware is code, test it like code: given this history, does it trim to the budget? Given this tool call, does it stop for approval?`,
    r: `Put the safety-critical checks in middleware or in the tools themselves, not only in the prompt.`,
    i: `Give three uses of middleware around an agent.`,
    c: py`
def call_limit(max_calls):
    state = {"n": 0}
    def wrap(call):
        def inner(x):
            state["n"] += 1
            if state["n"] > max_calls:
                return "stopped: call limit reached"
            return call(x)
        return inner
    return wrap

def redact(call):
    return lambda text: call(text.replace("4111 1111 1111 1111", "<card>"))

model_call = lambda text: "model saw: " + text
guarded = call_limit(2)(redact(model_call))
print([guarded("pay with 4111 1111 1111 1111") for _ in range(3)])`,
    v: compare("Middleware ideas.", ["Effect"], [
      ["Summarise", "keeps the history inside the token budget"],
      ["Human approval", "pauses before sensitive tool calls"],
      ["Redaction", "removes personal data before it reaches the model or logs"],
      ["Call limits", "stop runaway loops and cost"],
      ["Retries / fallbacks", "handle transient errors, switch model"],
    ]),
  },
  {
    t: "When to use LangChain — and when not to",
    lv: 1,
    s: `Use it when you want {{provider and store portability}} (swap models, embedding models and vector stores behind one interface), ready-made pieces (splitters, retrievers, agents, middleware), tracing and evaluation tooling in the same ecosystem, and LangGraph's persistence and human-in-the-loop for long-running agents. Skip or minimise it for a single model call, a tiny script, or when the abstraction hides detail you need (exact request fields, a provider feature such as prompt caching). Pin versions — the API has changed across major releases, so tutorials older than the current docs may not run. Whatever you choose, keep your prompts, tools and evaluation set independent of the framework.`,
    r: `Read the framework's source for the pieces you rely on: when something misbehaves you will end up there.`,
    i: `Give two reasons to use LangChain and two to avoid it for a given project.`,
    c: py`
checks = {
    "one model call, no tools": "call the provider SDK directly",
    "swap providers or vector stores often": "LangChain integrations",
    "long-running, stateful, human-in-the-loop agent": "LangGraph",
    "need a provider-specific feature (caching, batch)": "provider SDK behind your own interface",
}
for need, choice in checks.items():
    print(f"{need:50s} -> {choice}")`,
    v: compare("Framework or direct SDK?", ["Pick"], [
      ["One call, small script", "provider SDK"],
      ["Portability across providers and stores", "LangChain integrations"],
      ["Stateful, long-running, approvals", "LangGraph"],
      ["Provider-specific features", "SDK behind your own interface"],
    ]),
  },
];

void [P, bars, cells, compare, curve, hline, par, plot, pt, seg, vline, table, rowflow, LIB];
