# nlp — Python examples

One small, commented script per concept. Run any file with `python <file>`.

| Concept | File |
|---|---|
| What NLP is, and where text comes from | `01-text-sources-and-retrieval/01_src-0.py` |
| The NLP pipeline from raw text to answer | `01-text-sources-and-retrieval/02_src-1.py` |
| Information retrieval: the inverted index | `01-text-sources-and-retrieval/03_src-2.py` |
| TF-IDF: weigh words by how special they are | `01-text-sources-and-retrieval/04_src-3.py` |
| Ranking with cosine similarity | `01-text-sources-and-retrieval/05_src-4.py` |
| BM25: the ranking function behind most search | `01-text-sources-and-retrieval/06_src-5.py` |
| Evaluating retrieval: precision, recall and rank metrics | `01-text-sources-and-retrieval/07_src-6.py` |
| Cleaning and normalising text | `02-preprocessing-and-tokenization/01_prep-0.py` |
| Tokenization: choosing the units | `02-preprocessing-and-tokenization/02_prep-1.py` |
| Stop words, stemming and lemmatization | `02-preprocessing-and-tokenization/03_prep-2.py` |
| Spelling and the edit distance | `02-preprocessing-and-tokenization/04_prep-3.py` |
| N-grams: remembering a little context | `02-preprocessing-and-tokenization/05_prep-4.py` |
| Sub-word tokenization with byte-pair encoding | `02-preprocessing-and-tokenization/06_prep-5.py` |
| Vocabulary, unknown words and padding | `02-preprocessing-and-tokenization/07_prep-6.py` |
| Bag of words: counting what is there | `03-text-representations/01_repr-0.py` |
| Sparse versus dense: why embeddings exist | `03-text-representations/02_repr-1.py` |
| Cosine similarity between word vectors | `03-text-representations/03_repr-2.py` |
| Word2vec: learning vectors from context | `03-text-representations/04_repr-3.py` |
| Analogies in embedding space | `03-text-representations/05_repr-4.py` |
| Sentence and document vectors | `03-text-representations/06_repr-5.py` |
| Contextual embeddings: one word, many vectors | `03-text-representations/07_repr-6.py` |
| Text classification: the task and its variants | `04-sentiment-and-text-classification/01_cls-0.py` |
| Naive Bayes for sentiment, by hand | `04-sentiment-and-text-classification/02_cls-1.py` |
| Logistic regression on text features | `04-sentiment-and-text-classification/03_cls-2.py` |
| Evaluating a classifier: precision, recall, F1 | `04-sentiment-and-text-classification/04_cls-3.py` |
| Beyond polarity: aspects, negation and sarcasm | `04-sentiment-and-text-classification/05_cls-4.py` |
| Building a domain-specific classifier | `04-sentiment-and-text-classification/06_cls-5.py` |
| Part-of-speech tagging | `05-tagging-and-sequence-labeling/01_tag-0.py` |
| Hidden Markov models: tags as hidden states | `05-tagging-and-sequence-labeling/02_tag-1.py` |
| The Viterbi algorithm: the best tag sequence | `05-tagging-and-sequence-labeling/03_tag-2.py` |
| Named entity recognition and BIO tags | `05-tagging-and-sequence-labeling/04_tag-3.py` |
| Evaluating NER: entity-level F1 | `05-tagging-and-sequence-labeling/05_tag-4.py` |
| Sequence labeling: HMM, CRF and neural taggers | `05-tagging-and-sequence-labeling/06_tag-5.py` |
| What a language model is | `06-language-models-and-generation/01_lm-0.py` |
| Bigram models from counts | `06-language-models-and-generation/02_lm-1.py` |
| Smoothing: giving unseen n-grams a chance | `06-language-models-and-generation/03_lm-2.py` |
| Perplexity: how surprised is the model? | `06-language-models-and-generation/04_lm-3.py` |
| Neural language models and the softmax | `06-language-models-and-generation/05_lm-4.py` |
| Generating text: temperature, top-k and top-p | `06-language-models-and-generation/06_lm-5.py` |
| Evaluating language models and generated text | `06-language-models-and-generation/07_lm-6.py` |
| Sequence-to-sequence: one sequence in, another out | `07-sequence-to-sequence-and-transformers/01_s2s-0.py` |
| Attention: looking back at the source | `07-sequence-to-sequence-and-transformers/02_s2s-1.py` |
| Decoding: greedy versus beam search | `07-sequence-to-sequence-and-transformers/03_s2s-2.py` |
| Machine translation and its evaluation | `07-sequence-to-sequence-and-transformers/04_s2s-3.py` |
| Transformers, BERT and GPT | `07-sequence-to-sequence-and-transformers/05_s2s-4.py` |
| Pretraining, fine-tuning and prompting | `07-sequence-to-sequence-and-transformers/06_s2s-5.py` |
| Question answering: kinds of QA | `08-question-answering-and-dialog/01_qa-0.py` |
| Extractive QA: predicting the answer span | `08-question-answering-and-dialog/02_qa-1.py` |
| Evaluating QA: exact match and token F1 | `08-question-answering-and-dialog/03_qa-2.py` |
| Retrieval-augmented question answering | `08-question-answering-and-dialog/04_qa-3.py` |
| Dialog systems: understanding, state and response | `08-question-answering-and-dialog/05_qa-4.py` |
| Intent detection and slot filling | `08-question-answering-and-dialog/06_qa-5.py` |
| Large language models and what they change | `09-llms-responsibility-and-trends/01_now-0.py` |
| Hallucination, grounding and evaluation | `09-llms-responsibility-and-trends/02_now-1.py` |
| Bias, privacy and responsible NLP | `09-llms-responsibility-and-trends/03_now-2.py` |
| Where the field is going | `09-llms-responsibility-and-trends/04_now-3.py` |
| Choosing an approach for a real NLP problem | `09-llms-responsibility-and-trends/05_now-4.py` |
