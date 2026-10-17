# -*- coding: utf-8 -*-
# ==========================================================================
# Composition: has-a [python-ai / Classes and objects (OOP)]
# ==========================================================================
# WHAT IT IS
# Composition builds an object out of other objects ("has-a") instead of
# extending a class ("is-a"). It is more flexible because you can swap the
# parts. A good rule: inheritance for true subtypes, composition for
# everything else.
#
# WHERE YOU USE IT
# A Pipeline has a scaler and a model; it doesn't inherit from either. Swap
# the model and nothing else changes.
#
# RUN IT:  python 08_oop-7.py
#

from dataclasses import dataclass, field

@dataclass
class CartItem:
    name: str
    price: float
    quantity: int = 1

@dataclass
class ShoppingCart:
    items: list[CartItem] = field(default_factory=list)

    def add(self, item):
        self.items.append(item)

    def total(self):
        return sum(i.price * i.quantity for i in self.items)

cart = ShoppingCart()
cart.add(CartItem("Notebook", 4.50, 2))
cart.add(CartItem("Pen", 1.20, 3))
print(round(cart.total(), 2))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 12.6
