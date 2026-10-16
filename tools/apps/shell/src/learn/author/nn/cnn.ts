import { P, bars, cells, compare, curve, flow, par, plot, pt, vline } from "../../visuals/kit.js";
import { py, type ConceptDef } from "../build.js";
import { table } from "../ml/data.js";

/* Every code example is plain NumPy and is RUN by `npm run outputs -- neural-networks`. */

const rowflow = (takeaway: string, nodes: string[], notes: string[]) =>
  flow(takeaway, "row", nodes, nodes.slice(1).map((_, i): [number, number] => [i, i + 1]), nodes.slice(1).map((_, i) => i), [`${notes[0] ?? ""} ${notes[1] ?? ""}`.trim(), ...notes.slice(2)]);

const IMG = `
import numpy as np

I = np.array([[1, 2, 3, 1, 2, 3], [-1, 0, 3, 0, 1, 2], [1, 2, -3, 1, -1, 0],
              [-1, 2, 3, 0, -1, 3], [1, 0, -3, 1, 3, -2], [-2, 1, 0, 1, 2, 1]])
K = np.array([[0, 1, 0], [1, 0, 1], [1, 0, 1]])`;

export const cnn: ConceptDef[] = [
  {
    t: "Why a CNN? Look at neighbouring pixels",
    lv: 1,
    s: `A dense network flattens an image into 784 numbers and forgets which pixels were neighbours. A {{convolutional neural network}} keeps the grid: small filters slide over the image, reusing the SAME weights at every position to detect local patterns — edges first, then shapes, then objects. A 3×3 filter looks at only 9 pixels per channel. Output: feature maps combined by dense layers into class probabilities (softmax gives ten for MNIST). Far fewer weights, and a pattern learned in one corner works everywhere.`,
    r: `A filter is a tiny magnifying glass checking the same pattern at every location; backpropagation learns its values, you do not design them.`,
    i: `Why does a CNN need far fewer weights than a dense network on the same image?`,
    c: py`
dense_first = 784 * 100 + 100
conv_first = 3 * 3 * 1 * 32 + 32
print(dense_first, conv_first)`,
    v: rowflow("What a CNN does to an image.", ["Image 28×28×1", "Conv: local patterns", "Pool: shrink", "Conv: bigger patterns", "Flatten", "Dense", "Softmax: 10 probabilities"], [
      "Pixels are numbers on a grid.",
      "Small filters scan for edges and strokes.",
      "Pooling keeps the strongest evidence and halves the size.",
      "A second convolution combines edges into shapes.",
      "Flatten turns the maps into one vector.",
      "Dense layers combine features into scores.",
      "Softmax turns scores into class probabilities.",
    ]),
  },
  {
    t: "Pixels are numbers; tensors have height × width × channels",
    lv: 1,
    s: `A grayscale image is a matrix: 0 is black, 255 is white. A tensor is described as {{height × width × channels}}: a 28×28×1 MNIST digit, a 224×224×3 RGB input for VGG16. A 3×3 filter over an RGB image therefore has 3 × 3 × 3 = 27 weights (plus an optional bias) because one filter spans all input channels. Convolution is nothing more than multiplication and addition of these numbers.`,
    r: `Channel position differs across libraries (channels-last in Keras/TensorFlow, channels-first in PyTorch).`,
    i: `How many weights does one 3×3 filter have on an RGB image?`,
    c: py`
import numpy as np

gray = np.zeros((28, 28, 1))
rgb = np.zeros((224, 224, 3))
print(gray.shape, rgb.shape, gray.size, rgb.size)
print(3 * 3 * 3, 3 * 3 * 3 + 1)`,
    v: compare("Typical input tensors.", ["Shape", "Numbers per image"], [
      ["MNIST digit", "28 × 28 × 1", "784"],
      ["RGB photo (VGG16)", "224 × 224 × 3", "150,528"],
      ["3×3 filter on RGB", "3 × 3 × 3", "27 weights"],
    ]),
  },
  {
    t: "1-D convolution: slide a small window",
    lv: 1,
    s: `Start with a signal: sensor readings, audio samples, or word embeddings along a sentence. A kernel slides along it, computing a weighted sum at each stop. Signal [1, 2, 4, 5, 77, 11, 109] with kernel [0.2, 0.2, 0.2] gives 1.4, 2.2, 17.2, 18.6, 39.4 — a smoothing filter (note how it dilutes the spike 77). Deep-learning libraries implement cross-correlation (no kernel flip) and call it convolution. Output length = n − k + 1 = 7 − 3 + 1 = 5 with no padding.`,
    r: `Conv1D is the text and time-series version of the same idea.`,
    i: `Convolve [1,2,4,5,77,11,109] with [0.2,0.2,0.2].`,
    c: py`
import numpy as np

s = np.array([1, 2, 4, 5, 77, 11, 109], dtype=float)
k = np.array([0.2, 0.2, 0.2])
out = [float(s[i:i + 3] @ k) for i in range(len(s) - 2)]
print(np.round(out, 2).tolist(), len(out))`,
    v: cells("The window slides one step at a time.", [P("signal", ["1", "2", "4", "5", "77", "11", "109"]), P("output", ["1.4", "2.2", "17.2", "18.6", "39.4"])], [
      ["Signal and result."],
      ["Window 1 covers 1, 2, 4: 0.2·(1+2+4) = 1.4.", [[0, 0, 2], [1, 0, 0]]],
      ["Window 3 covers 4, 5, 77: 17.2.", [[0, 2, 4], [1, 2, 2]]],
      ["Window 5 covers 77, 11, 109: 39.4.", [[0, 4, 6], [1, 4, 4]]],
    ]),
  },
  {
    t: "2-D convolution: multiply, then add",
    lv: 2,
    s: `For a 2-D image the kernel slides left to right then down. At every stop multiply the covered entries by the kernel and add: {{out(r,c) = Σ in(r+i, c+j) × kernel(i,j) + bias}}. The lecture's example: a 6×6 input and kernel [[0,1,0],[1,0,1],[1,0,1]]. The first window [[1,2,3],[-1,0,3],[1,2,-3]] gives 0+2+0 + (−1)+0+3 + 1+0+(−3) = 2. The whole 4×4 feature map is [[2,6,1,5],[0,8,−2,5],[2,0,3,1],[−2,6,2,0]]. Size: (6 − 3)/1 + 1 = 4.`,
    r: `Trained kernels discover edges, curves and textures automatically.`,
    i: `Compute the first output value for the lecture's 6×6 example.`,
    c: py`${IMG}
out = np.array([[(I[r:r + 3, c:c + 3] * K).sum() for c in range(4)] for r in range(4)])
print(out.tolist())
print((I[0:3, 0:3] * K).sum(), (6 - 3) // 1 + 1)`,
    v: cells("Feature map from the lecture example (4×4).", table(["", "c1", "c2", "c3", "c4"], [["r1", "2", "6", "1", "5"], ["r2", "0", "8", "−2", "5"], ["r3", "2", "0", "3", "1"], ["r4", "−2", "6", "2", "0"]]), [
      ["Each cell is one dot product of the 3×3 window with the kernel."],
      ["Top-left window → 2.", [[1, 1, 1]]],
      ["The strongest response, 8, is at row 2, column 2.", [[2, 2, 2]]],
    ]),
  },
  {
    t: "Kernels as feature detectors",
    lv: 1,
    s: `Different kernels react to different patterns. A vertical-edge (Sobel) kernel [[−1,0,1],[−2,0,2],[−1,0,1]] responds to brightness changes across columns; its transpose finds horizontal edges. Average blur [1/9]… smooths; sharpen [[0,−1,0],[−1,5,−1],[0,−1,0]] boosts differences. On a 6×6 image whose right half is bright (left 0, right 1) the vertical Sobel gives 4 in the two columns that straddle the edge and 0 elsewhere. A CNN learns many such kernels, one per output channel.`,
    r: `These are hand-made demo filters; real CNNs learn theirs.`,
    i: `What does the vertical Sobel kernel output on a flat region and on a vertical edge?`,
    c: py`
import numpy as np

img = np.zeros((6, 6))
img[:, 3:] = 1
V = np.array([[-1, 0, 1], [-2, 0, 2], [-1, 0, 1]])
out = np.array([[(img[r:r + 3, c:c + 3] * V).sum() for c in range(4)] for r in range(4)])
print(out[0].tolist(), out.T[0].tolist())`,
    v: compare("Classic 3×3 kernels.", ["Kernel", "Effect"], [
      ["Vertical Sobel", "[−1 0 1; −2 0 2; −1 0 1]", "vertical edges"],
      ["Horizontal Sobel", "[−1 −2 −1; 0 0 0; 1 2 1]", "horizontal edges"],
      ["Average blur", "all entries 1/9", "smoothing"],
      ["Sharpen", "[0 −1 0; −1 5 −1; 0 −1 0]", "emphasise detail"],
    ]),
  },
  {
    t: "Stride and padding: the output size formula",
    lv: 2,
    s: `{{Stride}} is how far the filter jumps; {{padding}} adds border zeros. Output size = {{floor((n + 2p − k)/s) + 1}}. n = 6, k = 3: valid (p = 0), stride 1 → 4; stride 2 → floor(3/2)+1 = 2. "Same" padding (p = 1 for k = 3) keeps 6 at stride 1; at stride 2 it gives ceil(6/2) = 3, not 6. Move the sliders: each setting changes how many positions fit.`,
    r: `"Same" keeps the size only when stride is 1.`,
    i: `Output size for n = 6, k = 3, p = 0, stride 2?`,
    c: py`
import math

def out_size(n, k, p=0, s=1):
    return (n + 2 * p - k) // s + 1

print(out_size(6, 3), out_size(6, 3, 0, 2), out_size(6, 3, 1, 1), out_size(6, 3, 1, 2), math.ceil(6 / 2))`,
    v: plot("Output size against input size for the chosen kernel, padding and stride.", {
      x: [3, 20], y: [0, 20], labels: ["input size n", "output size"],
      params: [par("k", "kernel k", 1, 7, 2, 3), par("p", "padding p", 0, 3, 1, 0), par("s", "stride s", 1, 3, 1, 1)],
      readout: ["n = 6 → output = floor((6 + 2·{p} − {k})/{s}) + 1 = {floor((6+2*p-k)/s)+1}"],
      steps: [["Valid, stride 1: 4.", { k: 3, p: 0, s: 1 }], ["Same padding, stride 1: 6.", { k: 3, p: 1, s: 1 }], ["Same padding, stride 2: 3.", { k: 3, p: 1, s: 2 }]],
    }, [curve("floor((x+2*p-k)/s)+1", { c: "accent" }), pt("6", "floor((6+2*p-k)/s)+1", { c: "warn" })]),
  },
  {
    t: "Channels, filters and counting convolution parameters",
    lv: 2,
    s: `One filter spans every input channel and produces ONE feature map; F filters give F maps stacked into the output tensor. Parameters = {{k × k × C_in × F + F}}. 3×3, 1 input channel, 32 filters: 9 × 32 + 32 = 320. 3×3, 32 → 64: 9 × 32 × 64 + 64 = 18,496. 3×3 on RGB with 32 filters: 27 × 32 + 32 = 896. Note how few weights compared with a dense layer on the same image — and the count does not depend on image size.`,
    r: `Output depth equals the number of filters; kernel size and padding decide height and width.`,
    i: `Count the parameters of Conv2D(64, 3×3) on a 32-channel input.`,
    c: py`
def conv_params(k, c_in, f):
    return k * k * c_in * f + f

print(conv_params(3, 1, 32), conv_params(3, 32, 64), conv_params(3, 3, 32))`,
    v: bars("Parameters of one Conv2D layer for the chosen sizes.", [["weights", "k*k*cin*f"], ["biases", "f"]], {
      max: 20000,
      params: [par("k", "kernel k", 1, 7, 2, 3), par("cin", "input channels", 1, 64, 1, 32), par("f", "filters", 8, 128, 8, 64)],
      readout: ["{k}·{k}·{cin}·{f} + {f} = {k*k*cin*f+f} parameters"],
      steps: [["First MNIST layer (1 → 32): 320.", { k: 3, cin: 1, f: 32 }], ["Second layer (32 → 64): 18,496.", { k: 3, cin: 32, f: 64 }]],
    }),
  },
  {
    t: "Pooling: keep the strongest evidence",
    lv: 1,
    s: `Pooling shrinks height and width without learned weights. A 2×2 window with stride 2 keeps the maximum ({{max pooling}}) or the mean ({{average pooling}}). On the lecture's 6×6 input, max pooling gives [[2,3,3],[2,3,3],[1,1,3]] and average pooling [[0.5,1.75,2],[1,0.25,0.25],[0,−0.25,1]]. Max pooling preserves the strongest detection in each block and discards its exact position, giving limited tolerance to small shifts — not perfect invariance to every change.`,
    r: `Pooling has zero parameters; global average pooling can replace Flatten to shrink the dense layer.`,
    i: `Max-pool the first 2×2 block [[1,2],[−1,0]].`,
    c: py`${IMG}
blocks = I.reshape(3, 2, 3, 2)
print(blocks.max(axis=(1, 3)).tolist())
print(blocks.mean(axis=(1, 3)).tolist())`,
    v: compare("Max versus average pooling.", ["Max", "Average"], [
      ["Keeps", "strongest value", "mean of the block"],
      ["Block [[1,2],[−1,0]]", "2", "0.5"],
      ["Good for", "detecting presence of a feature", "smooth summaries"],
      ["Parameters", "0", "0"],
    ]),
  },
  {
    t: "A complete CNN and its parameter count",
    lv: 2,
    s: `The lecture's MNIST model: 28×28×1 → Conv2D(32, 3×3, same) → MaxPool(2) → Conv2D(64, 3×3, same) → MaxPool(2) → Flatten → Dense(100, ReLU) → Dense(10, softmax). Shapes: 28×28×32 → 14×14×32 → 14×14×64 → 7×7×64 → 3136 → 100 → 10. Parameters: 320 + 18,496 + (3136×100+100 = 313,700) + 1,010 = 333,526. The dense layer dominates — one reason modern CNNs replace Flatten with global average pooling. Convolution and pooling extract and compress features; dense layers combine them; softmax gives probabilities.`,
    r: `The dense hidden layer holds more than 94% of the parameters of this model.`,
    i: `What is the shape after the second MaxPool and how many parameters does Dense(100) then have?`,
    c: py`
conv = lambda k, c, f: k * k * c * f + f
flat = 7 * 7 * 64
layers_ = [conv(3, 1, 32), conv(3, 32, 64), flat * 100 + 100, 100 * 10 + 10]
print(flat, layers_, sum(layers_))`,
    v: rowflow("Shapes through the lecture's MNIST CNN.", ["28×28×1", "Conv 32 → 28×28×32", "Pool → 14×14×32", "Conv 64 → 14×14×64", "Pool → 7×7×64", "Flatten → 3136", "Dense 100", "Dense 10"], [
      "Input image.",
      "320 parameters.",
      "Half the width and height.",
      "18,496 parameters.",
      "Half again.",
      "Reshape only.",
      "313,700 parameters.",
      "1,010 parameters; total 333,526.",
    ]),
  },
  {
    t: "Training a CNN and reading its curves",
    lv: 1,
    s: `Training repeats forward pass → loss → backpropagation → optimiser update. The learning rate sets the step size, an epoch is one pass over the training examples, and the batch size is how many examples contribute to one step. With 60,000 images and batch 32 there are ceil(60000/32) = 1,875 updates per epoch. Watch validation loss, not only training accuracy: a growing gap means overfitting; dropout, augmentation and batch normalisation are the usual remedies.`,
    r: `More epochs do not always improve validation accuracy.`,
    i: `How many updates per epoch with 60,000 images and batch size 32?`,
    c: py`
import math

print(math.ceil(60000 / 32), math.ceil(48000 / 32))`,
    v: plot("Illustrative learning curves for an overfitting CNN.", {
      x: [0, 20], y: [0, 1.2], labels: ["epoch", "loss"],
      params: [par("e", "inspect epoch", 1, 20, 1, 8)],
      readout: ["epoch {e}: train {1/pow(e,0.8):3}, validation {1/pow(e,0.8)+0.05+0.004*pow(e-8,2)*step(e-8):3}"],
    }, [curve("1/pow(x,0.8)", { c: "info" }), curve("1/pow(x,0.8)+0.05+0.004*pow(x-8,2)*step(x-8)", { c: "bad" }), vline("e", { c: "muted" })]),
  },
  {
    t: "CNNs for text: embeddings → Conv1D",
    lv: 2,
    s: `For IMDb reviews: tokens → Embedding → Conv1D + ReLU → pooling → dense → sigmoid. A Conv1D kernel of width 2–5 slides over the sequence of embedding vectors, like looking at 2–5 consecutive words at once. With 200 tokens, kernel 5: 200 − 5 + 1 = 196 positions; 100 filters over embedding dimension 8 → 5×8×100 + 100 = 4,100 parameters. The model sees numeric vectors, never strings. When predicting new text, reuse the same vocabulary and preprocessing.`,
    r: `Fit any vocabulary on training text only; do not invent a new token-ID mapping at prediction time.`,
    i: `Parameters and output length of Conv1D(100, 5) on a 200 × 8 input?`,
    c: py`
import numpy as np

rng = np.random.default_rng(0)
x = rng.normal(size=(200, 8))
w = rng.normal(size=(5, 8, 100))
out = np.array([[np.sum(x[i:i + 5] * w[:, :, f]) for f in range(100)] for i in range(196)])
print(out.shape, w.size + 100)
print(np.maximum(out, 0).max(axis=0).shape)`,
    v: compare("Image CNN versus text CNN.", ["Conv2D", "Conv1D"], [
      ["Input", "H × W × C pixels", "L × D embeddings"],
      ["Slides over", "two directions", "one direction (the sequence)"],
      ["Kernel", "k × k × C", "k × D"],
      ["Pooling", "2×2 max", "1-D max or global max"],
    ]),
  },
  {
    t: "LeNet, AlexNet, VGG16 and ResNet",
    lv: 1,
    s: `{{LeNet}}: early CNN for digits (convolution, subsampling, fully connected). {{AlexNet}} (2012): showed deep CNNs work on large-scale ImageNet recognition. {{VGG16}}: repeated 3×3 convolutions with 16 learnable weight layers. {{ResNet}}: adds an identity shortcut so a layer learns a residual F(x) and outputs F(x) + x, letting very deep models train because gradients can flow along the shortcut. Example: x = 2, F(x) = 1.5 → output 3.5. A skip connection is not "skipping training".`,
    r: `Benchmark scores on ImageNet and human recognition are not the same comparison — avoid claims like "AlexNet beat humans".`,
    i: `What does a ResNet block output for x = 2 and F(x) = 1.5, and why does it help?`,
    c: py`
x, fx = 2.0, 1.5
print(fx + x)
print(0.5 ** 20, 1.0 ** 20)`,
    v: bars("A ResNet block: learned part, identity shortcut and their sum.", [["F(x)", "fx"], ["identity x", "x"], ["output F(x)+x", "fx+x"]], {
      max: 10,
      params: [par("x", "input x", 0, 5, 0.5, 2), par("fx", "learned F(x)", -3, 5, 0.5, 1.5)],
      readout: ["output = {fx} + {x} = {fx+x:1}"],
      steps: [["The lecture's example: 1.5 + 2 = 3.5.", { x: 2, fx: 1.5 }], ["If F(x) learns 0 the block is an identity.", { x: 2, fx: 0 }]],
    }),
  },
  {
    t: "Transfer learning with a pretrained VGG16",
    lv: 2,
    s: `Training millions of weights from scratch needs lots of data. {{Transfer learning}}: load a network pretrained on ImageNet, drop its classifier (include_top=False), {{freeze}} the convolutional base (trainable=False) and train a small new head on your own labelled images: preprocess_input → base(x, training=False) → GlobalAveragePooling → Dense(classes, softmax). Only the new head's weights change. Trade-offs: VGG16 is large and slow; consider ResNet or MobileNet when memory or latency matters. Optionally unfreeze the top blocks later with a small learning rate (fine-tuning).`,
    r: `Always use the pretrained model's own preprocessing; mismatched scaling silently ruins accuracy.`,
    i: `Why freeze the convolutional base and what is trained instead?`,
    c: py`
base_params = 14714688
head = 512 * 2 + 2
print(head, base_params + head, round(head / (base_params + head) * 100, 4))`,
    v: compare("Training from scratch versus transfer learning.", ["From scratch", "Transfer learning"], [
      ["Data needed", "large", "small to moderate"],
      ["Trainable weights", "millions", "small new head"],
      ["Speed", "slow", "fast"],
      ["Risk", "overfit on little data", "domain mismatch"],
    ]),
  },
  {
    t: "A beginner project roadmap",
    lv: 1,
    s: `Start with MNIST before camera photos: small, well understood, clear objective. 1) Load images and labels. 2) Split train / validation / test; tune only on validation. 3) Normalise (÷255) and shape (28×28×1). 4) Define Conv2D → ReLU → Pool → Conv2D → Pool → Dense. 5) Train with Adam + cross-entropy and plot train/validation curves. 6) Evaluate: confusion matrix, misclassified examples. 7) Improve: dropout, augmentation, batch normalisation, architecture changes. Start with one epoch to check the pipeline before long runs.`,
    r: `Seven habits: begin with pixel matrices, remember every position is a dot product, size is set by filter/padding/stride, depth by the filter count, pooling has no weights, watch validation loss, keep preprocessing identical at inference.`,
    i: `Why start with one epoch before long training runs?`,
    c: py`
steps = ["load", "split", "normalise", "define", "train", "evaluate", "improve"]
for i, s in enumerate(steps, 1):
    print(i, s)`,
    v: rowflow("From dataset to a presented model.", ["Load", "Split", "Normalise", "Define CNN", "Train", "Evaluate", "Improve"], [
      "MNIST: image matrix plus digit label.",
      "Tune only on validation.",
      "Pixel ÷ 255; shape 28×28×1.",
      "Conv → Pool → Conv → Pool → Dense.",
      "Adam + cross-entropy; plot curves.",
      "Confusion matrix and errors.",
      "Dropout, augmentation, batch norm.",
    ]),
  },
];
