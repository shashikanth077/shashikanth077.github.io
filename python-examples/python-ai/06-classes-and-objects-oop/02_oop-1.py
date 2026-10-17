# -*- coding: utf-8 -*-
# ==========================================================================
# __init__ and self [python-ai / Classes and objects (OOP)]
# ==========================================================================
# WHAT IT IS
# When you call Student("Maya", 90) Python creates an empty object, runs
# __init__ on it and hands it back. self is that new object: self.name = name
# stores data on it. Every instance method receives self automatically — that
# is why you don't pass it yourself.
#
# WHERE YOU USE IT
# self.weights and self.learning_rate, set up in __init__, are how a model
# keeps its state between fit and predict.
#
# RUN IT:  python 02_oop-1.py
#

class Student:
    def __init__(self, name, mark):
        self.name = name
        self.mark = mark

    def passed(self):
        return self.mark >= 50

student = Student("Maya", 90)
print(student.name)
print(student.passed())

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# Maya
# True
