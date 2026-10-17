# -*- coding: utf-8 -*-
# ==========================================================================
# Messages and chat models [langchain-langgraph-rag / LangChain: models,
# tools, runnables and agents]
# ==========================================================================
# WHAT IT IS
# Modern chat models take a list of messages — system, human (user), AI
# (assistant) and tool messages — and return an AI message that may contain
# tool_calls. LangChain gives every provider the same interface, so a model
# object created with init_chat_model supports invoke (one answer), stream
# (tokens as they arrive), batch (many inputs) and bind_tools (attach tool
# schemas). A ToolMessage carries a tool's result back with the id of the
# call, exactly like the tool_use / tool_result pairs of the Claude API.
# Because the interface is uniform you can switch provider by changing a
# string in configuration — provided you re-run your evaluations, since models
# differ in tool-calling skill, limits and price.
#
# WHERE YOU USE IT
# Keep model identifiers in configuration and test every provider you claim to
# support.
#
# RUN IT:  python 02_lc-1.py
#

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
print(model.invoke(history).content)

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# add {'a': 2, 'b': 3}
# The result is 5.
