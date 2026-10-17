# -*- coding: utf-8 -*-
# ==========================================================================
# Beyond polarity: aspects, negation and sarcasm [nlp / Sentiment and text
# classification]
# ==========================================================================
# WHAT IT IS
# Real sentiment is harder than counting good and bad words. Aspect-based
# analysis scores each target separately: "great food but terrible service" is
# positive for food and negative for service. Negation flips polarity ("not
# good"), a trick bag-of-words misses unless you add bigrams or mark words
# after "not". Sarcasm ("Oh great, another delay") needs context and world
# knowledge. Domain also matters: "unpredictable" is good for a thriller and
# bad for a car.
#
# WHERE YOU USE IT
# Test on a hand-built set of hard cases (negation, sarcasm, comparisons) in
# addition to the random test split.
#
# RUN IT:  python 05_cls-4.py
#

lex = {"good": 1, "great": 2, "bad": -1, "awful": -2}
score = lambda s: sum(lex.get(w, 0) for w in s.split())

def with_negation(s):
    total, flip = 0, False
    for w in s.split():
        if w in ("not", "never"):
            flip = True
            continue
        total += -lex.get(w, 0) if flip else lex.get(w, 0)
        flip = False
    return total

print(score("not good"), with_negation("not good"), with_negation("never great"))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 1 -1 -2
