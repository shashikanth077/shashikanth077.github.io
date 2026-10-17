# -*- coding: utf-8 -*-
# ==========================================================================
# Sub-word tokenization with byte-pair encoding [nlp / Preprocessing and
# tokenization]
# ==========================================================================
# WHAT IT IS
# Byte-pair encoding (BPE) starts from characters and repeatedly merges the
# most frequent adjacent pair into a new symbol. Corpus: low ×5, lower ×2,
# newest ×6, widest ×3. Counting pairs gives the merges (t, </w>) → "t</w>" (9
# times), then (s, t</w>) → "st</w>" (9), then (e, st</w>) → "est</w>" (9),
# then (o, w) → "ow" (7) and (l, ow) → "low" (7). Frequent words become single
# tokens, rare words are split into pieces, and no word is ever unknown — the
# idea behind the tokenizers of modern language models.
#
# WHERE YOU USE IT
# Vocabulary size is a hyper-parameter: more merges mean shorter sequences but
# bigger embedding tables.
#
# RUN IT:  python 06_prep-5.py
#

from collections import Counter

corpus = Counter({"l o w </w>": 5, "l o w e r </w>": 2, "n e w e s t </w>": 6, "w i d e s t </w>": 3})

def pair_counts(c):
    p = Counter()
    for word, f in c.items():
        s = word.split()
        for a, b in zip(s, s[1:]):
            p[(a, b)] += f
    return p

for _ in range(5):
    p = pair_counts(corpus)
    best = max(p, key=lambda k: (p[k], k))
    print(best, p[best])
    merged = Counter()
    for word, f in corpus.items():
        merged[word.replace(" ".join(best), "".join(best))] += f
    corpus = merged
print(list(corpus))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# ('t', '</w>') 9
# ('s', 't</w>') 9
# ('e', 'st</w>') 9
# ('o', 'w') 7
# ('l', 'ow') 7
# ['low </w>', 'low e r </w>', 'n e w est</w>', 'w i d est</w>']
