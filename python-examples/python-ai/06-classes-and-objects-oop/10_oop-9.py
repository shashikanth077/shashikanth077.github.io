# -*- coding: utf-8 -*-
# ==========================================================================
# Dataclasses [python-ai / Classes and objects (OOP)]
# ==========================================================================
# WHAT IT IS
# @dataclass writes __init__, __repr__ and __eq__ for you from annotated
# fields. Use field(default_factory=list) for mutable defaults and frozen=True
# for immutable records.
#
# WHERE YOU USE IT
# Configs such as TrainConfig(epochs=20, lr=0.001) are perfect dataclasses:
# typed, printable and comparable.
#
# RUN IT:  python 10_oop-9.py
#

from dataclasses import dataclass, field

@dataclass
class TrainConfig:
    epochs: int = 20
    lr: float = 0.001
    layers: list[int] = field(default_factory=lambda: [64, 32])

a = TrainConfig()
b = TrainConfig(lr=0.01)
print(a)
print(a == b)

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# TrainConfig(epochs=20, lr=0.001, layers=[64, 32])
# False
