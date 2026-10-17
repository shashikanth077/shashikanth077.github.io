# -*- coding: utf-8 -*-
# ==========================================================================
# Abstraction with abstract base classes [python-ai / Classes and objects
# (OOP)]
# ==========================================================================
# WHAT IT IS
# An abstract base class defines the methods every subclass must provide,
# without saying how. A subclass that skips an @abstractmethod can't be
# instantiated. The rest of the code then depends on one simple interface.
#
# WHERE YOU USE IT
# Define a Metric or Model interface once — fit, predict — and every
# implementation plugs into the same pipeline.
#
# RUN IT:  python 07_oop-6.py
#

from abc import ABC, abstractmethod

class PaymentGateway(ABC):
    @abstractmethod
    def pay(self, amount):
        ...

class CardPayment(PaymentGateway):
    def pay(self, amount):
        return f"Charged {amount} to card"

class Broken(PaymentGateway):
    pass

print(CardPayment().pay(25))
Broken()

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# Charged 25 to card
# TypeError: Can't instantiate abstract class Broken ...
