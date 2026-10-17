# -*- coding: utf-8 -*-
# ==========================================================================
# What LangChain is, and where it sits [langchain-langgraph-rag / LangChain:
# models, tools, runnables and agents]
# ==========================================================================
# WHAT IT IS
# LangChain is an open-source framework for building agents and LLM
# applications. Its current idea: Agent = Model + Harness, where the harness
# is the prompt, the tools and any middleware around the model loop. The entry
# point is create_agent, "a minimal, highly configurable harness"; models are
# created with init_chat_model or by a provider-prefixed string such as
# "anthropic:…". Install with pip install -qU langchain "langchain[anthropic]"
# (swap the extra for your provider). LangChain's agents are built on
# LangGraph, the lower-level orchestration runtime, which is where durable
# execution, human-in-the-loop and persistence come from. A third layer,
# integrations, wraps providers, embedding models and vector stores behind
# common interfaces so you can swap them.
#
# WHERE YOU USE IT
# Treat LangChain as convenience and portability, not magic: everything it
# does you could write by hand, as the earlier tracks show.
#
# RUN IT:  python 01_lc-0.py
#

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
print(REAL.strip().splitlines()[0])

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# integrations  common interfaces to providers, embedding models, vector stores
# langchain     create_agent, init_chat_model, prompts, retrievers, middleware
# langgraph     low-level runtime: state, graphs, checkpoints, interrupts
# from langchain.agents import create_agent
