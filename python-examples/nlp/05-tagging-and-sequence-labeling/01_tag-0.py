# -*- coding: utf-8 -*-
# ==========================================================================
# Part-of-speech tagging [nlp / Tagging and sequence labeling]
# ==========================================================================
# WHAT IT IS
# Part-of-speech (POS) tagging labels every word with its grammatical class:
# noun (N), verb (V), determiner (D), adjective (A), preposition (P)… The same
# word can take different tags: "can" is a verb in "we can go" and a noun in
# "a can of soup", and "book" is a noun or a verb. A tagger therefore needs
# context. Tagsets differ (a small universal set of ~17 tags, or the Penn
# Treebank's 45), and the output feeds parsers, lemmatizers and information
# extraction.
#
# WHERE YOU USE IT
# Modern taggers reach about 97% accuracy on news text; the remaining errors
# are mostly ambiguous words and unseen domains.
#
# RUN IT:  python 01_tag-0.py
#

lexicon = {"the": ["D"], "dog": ["N"], "barks": ["V", "N"], "can": ["V", "N"], "book": ["N", "V"]}
sentence = "the dog barks".split()
print([(w, lexicon[w]) for w in sentence])
print(sum(len(lexicon[w]) > 1 for w in lexicon), "of", len(lexicon), "words are ambiguous")

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# [('the', ['D']), ('dog', ['N']), ('barks', ['V', 'N'])]
# 3 of 5 words are ambiguous
