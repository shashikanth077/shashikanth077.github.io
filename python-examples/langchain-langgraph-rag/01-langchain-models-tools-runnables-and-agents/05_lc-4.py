# -*- coding: utf-8 -*-
# ==========================================================================
# Tools: functions the model can call [langchain-langgraph-rag / LangChain:
# models, tools, runnables and agents]
# ==========================================================================
# WHAT IT IS
# In LangChain a tool is a plain Python function with type hints and a
# docstring: the name, the docstring and the parameter types become the schema
# the model sees, so write them for the model (what it does, when to use it,
# units). You pass the functions in a list — tools=[get_weather] to
# create_agent, or llm.bind_tools(tools) for a bare model. When the model
# replies with tool_calls, the framework (or your node) runs each function
# with the arguments and returns the results as ToolMessages. Good tool
# hygiene from the agentic track applies unchanged: few, narrow,
# well-described tools; validated arguments; errors returned as text; least
# privilege.
#
# WHERE YOU USE IT
# The docstring is the interface: if a human could not tell when to call the
# tool from it, the model cannot either.
#
# RUN IT:  python 05_lc-4.py
#

import inspect

def get_weather(city: str, units: str = "celsius") -> str:
    """Get the current weather for a city. Use for any question about weather now."""
    return f"4 degrees ({units}) in {city}"

sig = inspect.signature(get_weather)
schema = {"name": get_weather.__name__, "description": get_weather.__doc__, "parameters": {p: str(v.annotation.__name__) for p, v in sig.parameters.items()}}
print(schema)
print(get_weather("Vilnius"))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# {'name': 'get_weather', 'description': 'Get the current weather for a city. Use for any question about weather now.', 'parameters': {'city': 'str', 'units': 'str'}}
# 4 degrees (celsius) in Vilnius
