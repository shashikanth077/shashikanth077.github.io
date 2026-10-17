# -*- coding: utf-8 -*-
# ==========================================================================
# Dictionaries as training configuration [python-ai / Python in real AI work]
# ==========================================================================
# WHAT IT IS
# A config dict names every setting, so code reads config["lr"] instead of a
# magic position. Pass it around, save it to JSON and spread it with config.
# Keep the defaults in one dict and override only what you change — without
# mutating the defaults.
#
# WHERE YOU USE IT
# Reproducible experiments start with a config you can print, save and reload.
#
# RUN IT:  python 03_ai-2.py
#

defaults = {"epochs": 20, "batch_size": 32, "lr": 0.001}
overrides = {"lr": 0.01}
config = {**defaults, **overrides}
print(config)
print(defaults["lr"], config["lr"])

def train(epochs, batch_size, lr):
    return f"training {epochs} epochs at lr={lr}"

print(train(**config))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# {'epochs': 20, 'batch_size': 32, 'lr': 0.01}
# 0.001 0.01
# training 20 epochs at lr=0.01
