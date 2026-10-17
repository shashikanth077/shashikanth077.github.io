# -*- coding: utf-8 -*-
# ==========================================================================
# Polymorphism and duck typing [python-ai / Classes and objects (OOP)]
# ==========================================================================
# WHAT IT IS
# Polymorphism means one call, different behaviour depending on the object. In
# Python you don't need a shared parent: if an object has the method you call,
# it works ("if it quacks like a duck"). Callers stay free of if type == ...
# chains.
#
# WHERE YOU USE IT
# A training loop calls model.predict(x) on any model — scikit-learn, a neural
# network, a rule-based baseline — because each provides predict.
#
# RUN IT:  python 06_oop-5.py
#

class BikeDelivery:
    def fee(self, km):
        return 2 + km * 0.5

class CarDelivery:
    def fee(self, km):
        return 4 + km * 0.8

def show_fee(delivery, distance):
    return delivery.fee(distance)

print(show_fee(BikeDelivery(), 5))
print(show_fee(CarDelivery(), 5))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 4.5
# 8.0
