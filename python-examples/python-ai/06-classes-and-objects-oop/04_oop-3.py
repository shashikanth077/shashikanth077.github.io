# -*- coding: utf-8 -*-
# ==========================================================================
# Encapsulation and @property [python-ai / Classes and objects (OOP)]
# ==========================================================================
# WHAT IT IS
# Encapsulation keeps data behind methods that enforce the rules, so objects
# can't easily be put in an invalid state. Python uses conventions: _name
# means "internal", __name mangles the name, and @property gives controlled
# attribute-style access with validation. None of this is real security.
#
# WHERE YOU USE IT
# A learning-rate or temperature property that rejects invalid values stops a
# misconfigured experiment before it wastes GPU hours.
#
# RUN IT:  python 04_oop-3.py
#

class Thermostat:
    def __init__(self, temperature):
        self.temperature = temperature

    @property
    def temperature(self):
        return self._temperature

    @temperature.setter
    def temperature(self, value):
        if not 16 <= value <= 30:
            raise ValueError("Use 16 to 30")
        self._temperature = value

t = Thermostat(22)
t.temperature = 24
print(t.temperature)
t.temperature = 45

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 24
# ValueError: Use 16 to 30
