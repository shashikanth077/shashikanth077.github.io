# machine-learning — Python examples

One small, commented script per concept. Run any file with `python <file>`.

| Concept | File |
|---|---|
| What machine learning is | `01-the-big-picture/01_big-0.py` |
| Data, information, knowledge, wisdom | `01-the-big-picture/02_big-1.py` |
| Always compare with a baseline | `01-the-big-picture/03_big-7.py` |
| Mean, median and mode | `02-statistics-you-need/01_stats-0.py` |
| Spread: range, variance and standard deviation | `02-statistics-you-need/02_stats-1.py` |
| Quartiles, IQR and shape | `02-statistics-you-need/03_stats-2.py` |
| Population, sample and inference | `02-statistics-you-need/04_stats-4.py` |
| Hypothesis testing: the four steps | `02-statistics-you-need/05_stats-5.py` |
| A t-test by hand | `02-statistics-you-need/06_stats-6.py` |
| Correlation is not causation | `02-statistics-you-need/07_stats-8.py` |
| A trustworthy table: the preparation checklist | `03-preparing-data/01_prep-0.py` |
| Encoding: label, ordinal and one-hot | `03-preparing-data/02_prep-1.py` |
| Min–max normalisation | `03-preparing-data/03_prep-2.py` |
| Standardisation: the z-score | `03-preparing-data/04_prep-3.py` |
| Imbalanced data: choosing a remedy | `03-preparing-data/05_prep-5.py` |
| SMOTE: a point between two minority neighbours | `03-preparing-data/06_prep-6.py` |
| Outliers: investigate before deleting | `03-preparing-data/07_prep-7.py` |
| Preprocessing leakage: fit on training only | `03-preparing-data/08_prep-8.py` |
| Euclidean distance: straight-line similarity | `04-distance-and-similarity/01_distance-0.py` |
| Manhattan, Minkowski, Chebyshev and Hamming | `04-distance-and-similarity/02_distance-1.py` |
| Cosine similarity: direction, not size | `04-distance-and-similarity/03_distance-2.py` |
| Why scaling changes what "near" means | `04-distance-and-similarity/04_distance-3.py` |
| Decision tree: learn useful questions | `05-decision-trees-and-ensembles/01_tree-0.py` |
| Gini impurity and the best split | `05-decision-trees-and-ensembles/02_tree-1.py` |
| Entropy and information gain | `05-decision-trees-and-ensembles/03_tree-2.py` |
| Comparing candidate splits: Gini and gain side by side | `05-decision-trees-and-ensembles/04_tree-3.py` |
| Random forest: a committee of different trees | `05-decision-trees-and-ensembles/05_tree-5.py` |
| Gradient boosting: add small corrections | `05-decision-trees-and-ensembles/06_tree-6.py` |
| Naive Bayes: prior times evidence | `06-probability-neighbours-and-margins/01_classic-0.py` |
| Laplace smoothing: no zero probabilities | `06-probability-neighbours-and-margins/02_classic-1.py` |
| Which Naive Bayes? Bernoulli, multinomial, Gaussian | `06-probability-neighbours-and-margins/03_classic-2.py` |
| k-nearest neighbours: ask the closest examples | `06-probability-neighbours-and-margins/04_classic-3.py` |
| kNN details: k, weights and scaling | `06-probability-neighbours-and-margins/05_classic-4.py` |
| SVM: the widest-margin boundary | `06-probability-neighbours-and-margins/06_classic-5.py` |
| Soft margin: the C trade-off and hinge loss | `06-probability-neighbours-and-margins/07_classic-6.py` |
| Kernels: curved boundaries from straight lines | `06-probability-neighbours-and-margins/08_classic-7.py` |
| Logistic regression: score → probability | `06-probability-neighbours-and-margins/09_classic-8.py` |
| The artificial neuron | `07-neural-networks/01_nn-0.py` |
| Activation functions | `07-neural-networks/02_nn-1.py` |
| Softmax: probabilities for several classes | `07-neural-networks/03_nn-2.py` |
| Multilayer perceptron: the forward pass | `07-neural-networks/04_nn-3.py` |
| Loss and one gradient step | `07-neural-networks/05_nn-4.py` |
| The training loop: gradient descent in action | `07-neural-networks/06_nn-5.py` |
| Epochs, batches and iterations | `07-neural-networks/07_nn-6.py` |
| PNN: classify by local class density (extension) | `07-neural-networks/08_nn-7.py` |
| Train, validation and test: three jobs | `08-evaluating-models-honestly/01_eval-0.py` |
| K-fold, stratified K-fold and leave-one-out | `08-evaluating-models-honestly/02_eval-1.py` |
| The confusion matrix: read the mistakes first | `08-evaluating-models-honestly/03_eval-2.py` |
| Precision, recall, specificity and F1 | `08-evaluating-models-honestly/04_eval-3.py` |
| Macro, weighted and micro averages | `08-evaluating-models-honestly/05_eval-4.py` |
| Thresholds: make the decision rule visible | `08-evaluating-models-honestly/06_eval-5.py` |
| ROC curve and AUC: ranking quality | `08-evaluating-models-honestly/07_eval-6.py` |
| Precision–recall curve and average precision | `08-evaluating-models-honestly/08_eval-7.py` |
| Log loss: reward honest probabilities | `08-evaluating-models-honestly/09_eval-8.py` |
| Grid search: compare settings fairly | `08-evaluating-models-honestly/10_eval-10.py` |
| Regression metrics: MAE, MSE, RMSE, R² | `08-evaluating-models-honestly/11_eval-12.py` |
| The curse of dimensionality | `09-seeing-and-reducing-data/01_viz-1.py` |
| PCA, step by step | `09-seeing-and-reducing-data/02_viz-2.py` |
| PCA geometry: the direction of most variance | `09-seeing-and-reducing-data/03_viz-3.py` |
| LDA versus PCA: supervised direction finding | `09-seeing-and-reducing-data/04_viz-4.py` |
| SVD and latent semantic analysis | `09-seeing-and-reducing-data/05_viz-6.py` |
| What clustering does | `10-clustering/01_cluster-0.py` |
| K-means: assign, average, repeat | `10-clustering/02_cluster-2.py` |
| K-means by hand: squared distances and SSE | `10-clustering/03_cluster-3.py` |
| Choosing K: the elbow | `10-clustering/04_cluster-4.py` |
| Silhouette: how well separated are the groups? | `10-clustering/05_cluster-5.py` |
| Hierarchical clustering: build a tree | `10-clustering/06_cluster-6.py` |
| Reading a dendrogram | `10-clustering/07_cluster-7.py` |
| Linkage changes the answer | `10-clustering/08_cluster-8.py` |
| DBSCAN calculations: count, then expand | `10-clustering/09_cluster-10.py` |
| K-medoids: a real example as the centre | `10-clustering/10_cluster-14.py` |
| MiniBatch and bisecting k-means | `10-clustering/11_cluster-15.py` |
| Fuzzy c-means: partly in both groups | `10-clustering/12_cluster-16.py` |
| Gaussian mixtures: probability-based groups | `10-clustering/13_cluster-17.py` |
| Mean shift: move toward the crowd | `10-clustering/14_cluster-18.py` |
| Spectral clustering: connected neighbours | `10-clustering/15_cluster-19.py` |
| OPTICS: density at several scales | `10-clustering/16_cluster-20.py` |
| HDBSCAN: persistent density groups | `10-clustering/17_cluster-21.py` |
| BIRCH: summarise before clustering | `10-clustering/18_cluster-22.py` |
| Affinity propagation: exemplars by message passing | `10-clustering/19_cluster-23.py` |
| K-modes and K-prototypes: beyond numbers | `10-clustering/20_cluster-24.py` |
| SOM, grid and subspace clustering | `10-clustering/21_cluster-25.py` |
| Evaluating clusters without fooling yourself | `10-clustering/22_cluster-27.py` |
| A small, understandable dataset | `11-text-mining/01_text-3.py` |
| Preparing text without destroying its meaning | `11-text-mining/02_text-4.py` |
| Bag of words: text as a table | `11-text-mining/03_text-5.py` |
| TF–IDF: make distinctive words count more | `11-text-mining/04_text-6.py` |
| Cosine similarity: do two messages point the same way? | `11-text-mining/05_text-7.py` |
| Information retrieval: a tiny search engine | `11-text-mining/06_text-8.py` |
| Information extraction and named-entity recognition | `11-text-mining/07_text-9.py` |
| Text classification: route a ticket to a known team | `11-text-mining/08_text-11.py` |
| Naive Bayes for text: a complete hand calculation | `11-text-mining/09_text-12.py` |
| Text clustering and topic models | `11-text-mining/10_text-13.py` |
| Embeddings and the connection to RAG | `11-text-mining/11_text-14.py` |
| Text length, language and chunking | `11-text-mining/12_text-15.py` |
| Association: which words occur together? | `11-text-mining/13_text-16.py` |
| A tiny text-classification project, from scratch | `11-text-mining/14_text-17.py` |
