# neural-networks — Python examples

One small, commented script per concept. Run any file with `python <file>`.

| Concept | File |
|---|---|
| Why neural networks | `01-why-neural-networks/01_start-0.py` |
| The neuron: weighted sum, bias, activation | `01-why-neural-networks/02_start-1.py` |
| Layers and the forward pass: one student, one prediction | `01-why-neural-networks/03_start-2.py` |
| Parameters and shapes: counting the weights | `01-why-neural-networks/04_start-4.py` |
| Why activations must be non-linear | `02-activation-functions/01_act-0.py` |
| Sigmoid: any score to a number between 0 and 1 | `02-activation-functions/02_act-1.py` |
| Tanh: a centred, signed signal | `02-activation-functions/03_act-2.py` |
| ReLU and its variants | `02-activation-functions/04_act-3.py` |
| Softmax: a probability share for every class | `02-activation-functions/05_act-4.py` |
| Saturation and the slope of an activation | `02-activation-functions/06_act-6.py` |
| What a loss function is — and how it differs from a metric | `03-loss-functions/01_loss-0.py` |
| Mean squared error (regression) | `03-loss-functions/02_loss-1.py` |
| Binary cross-entropy | `03-loss-functions/03_loss-2.py` |
| Categorical cross-entropy | `03-loss-functions/04_loss-3.py` |
| One-hot or integer labels, and why losses want logits | `03-loss-functions/05_loss-4.py` |
| The food-delivery story: learning y = w·x + b | `04-gradient-descent-and-backpropagation/01_learn-0.py` |
| Drawing the model: weight tilts the line, bias lifts it | `04-gradient-descent-and-backpropagation/02_learn-1.py` |
| Loss as a U-shaped curve | `04-gradient-descent-and-backpropagation/03_learn-2.py` |
| The derivative: the slope of the loss right now | `04-gradient-descent-and-backpropagation/04_learn-3.py` |
| The chain rule: follow the effect backwards | `04-gradient-descent-and-backpropagation/05_learn-4.py` |
| Gradient descent in motion | `04-gradient-descent-and-backpropagation/06_learn-5.py` |
| Learning rate: the size of each step | `04-gradient-descent-and-backpropagation/07_learn-6.py` |
| Epoch, batch size and iteration | `04-gradient-descent-and-backpropagation/08_learn-7.py` |
| Backpropagation through a hidden neuron | `04-gradient-descent-and-backpropagation/09_learn-8.py` |
| Training from scratch: batch gradient descent in NumPy | `04-gradient-descent-and-backpropagation/10_learn-9.py` |
| A whole network from scratch: learning XOR | `04-gradient-descent-and-backpropagation/11_learn-10.py` |
| Backpropagation versus the optimiser: SGD | `05-optimisers/01_opt-0.py` |
| Momentum: remember the direction | `05-optimisers/02_opt-1.py` |
| RMSprop: a step size for every parameter | `05-optimisers/03_opt-2.py` |
| Adam: direction memory plus adaptive scaling | `05-optimisers/04_opt-3.py` |
| SGD, RMSprop and Adam on the same landscape | `05-optimisers/05_opt-4.py` |
| Underfitting, good fit and overfitting | `06-overfitting-and-regularization/01_fit-0.py` |
| L1 and L2: a price tag on large weights | `06-overfitting-and-regularization/02_fit-1.py` |
| Weight decay: what L2 does to a weight | `06-overfitting-and-regularization/03_fit-2.py` |
| Early stopping and the best epoch | `06-overfitting-and-regularization/04_fit-3.py` |
| Dropout: practising with random absences | `06-overfitting-and-regularization/05_fit-4.py` |
| Batch normalization, step by step | `06-overfitting-and-regularization/06_fit-5.py` |
| Reading training curves like an engineer | `06-overfitting-and-regularization/07_fit-6.py` |
| Validation methods: who trains and who tests | `06-overfitting-and-regularization/08_fit-7.py` |
| Data leakage: the silent cheater | `06-overfitting-and-regularization/09_fit-8.py` |
| Words must become numbers: tokenize and index | `07-text-as-numbers/01_data-0.py` |
| Padding and truncation: equal-length sequences | `07-text-as-numbers/02_data-1.py` |
| One-hot and multi-hot encoding | `07-text-as-numbers/03_data-2.py` |
| Embeddings: a trainable lookup table | `07-text-as-numbers/04_data-3.py` |
| The IMDb project: two architectures | `07-text-as-numbers/05_data-4.py` |
| The confusion matrix: four possible outcomes | `08-measuring-performance/01_metrics-0.py` |
| Accuracy, and when it lies | `08-measuring-performance/02_metrics-1.py` |
| Precision, recall and specificity | `08-measuring-performance/03_metrics-2.py` |
| F1: the harmonic mean of precision and recall | `08-measuring-performance/04_metrics-3.py` |
| A threshold turns a score into a class | `08-measuring-performance/05_metrics-4.py` |
| ROC curve and AUC | `08-measuring-performance/06_metrics-5.py` |
| Multiclass: confusion matrix, macro, micro and weighted F1 | `08-measuring-performance/07_metrics-6.py` |
| Which metric should you use? | `08-measuring-performance/08_metrics-7.py` |
| Train, validation and test sets in numbers | `09-mnist-and-the-full-workflow/01_mnist-0.py` |
| From pixels to numbers: normalize and flatten | `09-mnist-and-the-full-workflow/02_mnist-1.py` |
| Shapes through the network | `09-mnist-and-the-full-workflow/03_mnist-2.py` |
| Count every trainable parameter | `09-mnist-and-the-full-workflow/04_mnist-3.py` |
| Compile, fit, evaluate, predict | `09-mnist-and-the-full-workflow/05_mnist-4.py` |
| A softmax classifier from scratch | `09-mnist-and-the-full-workflow/06_mnist-5.py` |
| Predicting a brand-new image correctly | `09-mnist-and-the-full-workflow/07_mnist-6.py` |
| One complete evaluation story | `09-mnist-and-the-full-workflow/08_mnist-7.py` |
| Why a CNN? Look at neighbouring pixels | `10-convolutional-networks/01_cnn-0.py` |
| Pixels are numbers; tensors have height × width × channels | `10-convolutional-networks/02_cnn-1.py` |
| 1-D convolution: slide a small window | `10-convolutional-networks/03_cnn-2.py` |
| 2-D convolution: multiply, then add | `10-convolutional-networks/04_cnn-3.py` |
| Kernels as feature detectors | `10-convolutional-networks/05_cnn-4.py` |
| Stride and padding: the output size formula | `10-convolutional-networks/06_cnn-5.py` |
| Channels, filters and counting convolution parameters | `10-convolutional-networks/07_cnn-6.py` |
| Pooling: keep the strongest evidence | `10-convolutional-networks/08_cnn-7.py` |
| A complete CNN and its parameter count | `10-convolutional-networks/09_cnn-8.py` |
| Training a CNN and reading its curves | `10-convolutional-networks/10_cnn-9.py` |
| CNNs for text: embeddings → Conv1D | `10-convolutional-networks/11_cnn-10.py` |
| LeNet, AlexNet, VGG16 and ResNet | `10-convolutional-networks/12_cnn-11.py` |
| Transfer learning with a pretrained VGG16 | `10-convolutional-networks/13_cnn-12.py` |
| A beginner project roadmap | `10-convolutional-networks/14_cnn-13.py` |
| What is an RNN? A network with memory | `11-recurrent-networks/01_rnn-0.py` |
| Unrolling an RNN through time | `11-recurrent-networks/02_rnn-1.py` |
| Sequence shapes: batch, time, features | `11-recurrent-networks/03_rnn-2.py` |
| Backpropagation through time and vanishing gradients | `11-recurrent-networks/04_rnn-3.py` |
| LSTM: a gated memory cell | `11-recurrent-networks/05_rnn-4.py` |
| GRU: fewer gates, one state | `11-recurrent-networks/06_rnn-5.py` |
| IMDb sentiment with an LSTM or GRU | `11-recurrent-networks/07_rnn-6.py` |
| SimpleRNN, LSTM or GRU? | `11-recurrent-networks/08_rnn-7.py` |
| Machine translation: encoder and decoder | `12-translation-and-attention/01_text-0.py` |
| Attention: query, key, value | `12-translation-and-attention/02_text-1.py` |
| Attention matrix and positional encoding | `12-translation-and-attention/03_text-2.py` |
| BLEU: scoring translations | `12-translation-and-attention/04_text-3.py` |
| Choosing the model family from the goal | `12-translation-and-attention/05_text-4.py` |
| Autoencoders: compress, then reconstruct | `13-autoencoders-vaes-and-gans/01_gen-0.py` |
| Capacity of the code: how many components to keep | `13-autoencoders-vaes-and-gans/02_gen-1.py` |
| An autoencoder in Keras terms: 784 → 32 → 784 | `13-autoencoders-vaes-and-gans/03_gen-2.py` |
| Latent space: not every point decodes to something real | `13-autoencoders-vaes-and-gans/04_gen-3.py` |
| Variational autoencoders: a distribution instead of a point | `13-autoencoders-vaes-and-gans/05_gen-4.py` |
| The VAE loss and the KL term | `13-autoencoders-vaes-and-gans/06_gen-5.py` |
| GANs: generator versus discriminator | `13-autoencoders-vaes-and-gans/07_gen-6.py` |
| The GAN losses in numbers | `13-autoencoders-vaes-and-gans/08_gen-7.py` |
| Generative versus discriminative models | `13-autoencoders-vaes-and-gans/09_gen-8.py` |
| Capstone projects and a study order | `13-autoencoders-vaes-and-gans/10_gen-9.py` |
