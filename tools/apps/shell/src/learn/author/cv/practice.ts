import { py, type DrillDef, type QuestionDef } from "../build.js";

export const questions: QuestionDef[] = [
  /* images */
  ["img", 1, "List five computer-vision tasks.", "Classification, detection, segmentation, depth estimation, tracking/optical flow (also generation)."],
  ["img", 1, "How many numbers are in a 640 × 480 colour image?", "640 × 480 × 3 = 921,600."],
  ["img", 1, "Convert (200, 100, 50) to grayscale.", "0.299·200 + 0.587·100 + 0.114·50 = 124.2."],
  ["img", 1, "Contrast-stretch the value 90 in an image spanning 60–140 to 0–255.", "(90 − 60)/(140 − 60) × 255 ≈ 96."],
  ["img", 2, "How does histogram equalization work?", "Map each level through the normalised CDF: new = round((CDF − CDF_min)/(N − CDF_min) × (L − 1)), spreading crowded intensities."],
  ["img", 1, "PSNR for MSE = 100 with 8-bit images?", "10 log₁₀(255²/100) ≈ 28.1 dB."],
  ["img", 1, "How many grey levels does a 3-bit image have, and what does halving the resolution do to the pixel count?", "8 levels; the pixel count falls to a quarter."],
  /* filters */
  ["filt", 1, "Output size for a 6×6 image and a 3×3 kernel, no padding?", "4 × 4."],
  ["filt", 2, "Why is the Gaussian filter separable and why does it matter?", "It is an outer product of two 1-D Gaussians, so two 1-D passes replace one 2-D pass: 2k instead of k² multiplications per pixel."],
  ["filt", 1, "Mean versus median of a patch with one outlier of 255 among values 9–12?", "The mean (≈ 37.8) is dragged up; the median (11) ignores the outlier — the cure for salt-and-pepper noise."],
  ["filt", 2, "What does the Laplacian measure?", "A second derivative: the difference between a pixel and its neighbours; it responds at edges and corners and is zero on flat areas."],
  ["filt", 1, "Sobel Gx for a vertical step edge from 0 to 100?", "400 at the two columns straddling the step, 0 elsewhere; Gy = 0."],
  ["filt", 2, "List the four steps of the Canny detector.", "Gaussian smoothing, gradient magnitude and direction, non-maximum suppression, hysteresis thresholding."],
  ["filt", 2, "Multiplications per pixel for a 15 × 15 kernel directly and separably?", "225 versus 30."],
  /* segmentation (classic) */
  ["seg", 1, "What does Otsu's method maximise?", "The between-class variance w₀w₁(μ₀ − μ₁)² of the two groups created by the threshold."],
  ["seg", 1, "4-connected versus 8-connected components?", "8-connectivity also joins diagonal neighbours, so it gives equal or fewer components."],
  ["seg", 1, "What do erosion, dilation, opening and closing do?", "Erosion shrinks objects, dilation grows them; opening (erode then dilate) removes specks, closing (dilate then erode) fills gaps."],
  ["seg", 2, "How does the Hough transform find lines?", "Each edge point votes for all (ρ, θ) lines through it, ρ = x cos θ + y sin θ; peaks in the accumulator are lines."],
  ["seg", 1, "Centroid and area of the pixels (1,1), (1,2), (2,1), (2,2), (3,2)?", "Area 5, centroid (1.8, 1.6)."],
  ["seg", 2, "Why add coordinates to colour features in k-means segmentation?", "So that clusters are also spatially compact instead of grouping far-apart pixels of similar colour."],
  /* geometry */
  ["geom", 1, "Rotate (1, 0) by 30°.", "(cos 30°, sin 30°) = (0.866, 0.5)."],
  ["geom", 2, "Why homogeneous coordinates?", "They turn translation into matrix multiplication, so all affine transforms are 3×3 matrices that compose by multiplication."],
  ["geom", 2, "Bilinear interpolation at (0.25, 0.75) between corners 10, 20 / 30, 40?", "27.5."],
  ["geom", 1, "Project (1, 0.5, 5) m with f = 800 px and principal point (320, 240).", "(480, 320)."],
  ["geom", 2, "Depth from disparity: f = 700 px, B = 0.1 m, d = 14 px?", "Z = fB/d = 5 m."],
  ["geom", 2, "How many point pairs define a homography and how many degrees of freedom has it?", "Four pairs; eight degrees of freedom."],
  /* features */
  ["feat", 2, "Interpret Harris responses for λ = (2, 2), (2, 0.01), (0.01, 0.01).", "Corner (R = 3.2), edge (R < 0), flat (R ≈ 0)."],
  ["feat", 1, "Why use normalised cross-correlation for template matching?", "It ignores brightness and contrast changes: patches (1,2,3) and (2,4,6) or (51,52,53) give NCC = 1."],
  ["feat", 2, "Why does SIFT have 128 dimensions?", "4 × 4 spatial cells × 8 orientation bins."],
  ["feat", 2, "Apply the ratio test (threshold 0.75) to d₁ = 0.3, d₂ = 0.9 and to d₁ = 0.6, d₂ = 0.7.", "0.33 → accept; 0.86 → reject (ambiguous)."],
  ["feat", 2, "RANSAC iterations for a line with 50% inliers and 99% confidence?", "ln 0.01 / ln(1 − 0.5²) = 16.0 → 17 iterations (72 for a homography)."],
  ["feat", 1, "List the steps of image stitching.", "Detect and describe keypoints, match (ratio test), RANSAC homography, warp and interpolate, blend."],
  /* classification */
  ["cls", 1, "Difference between top-1 and top-5 accuracy?", "Top-1: the highest-probability class is correct; top-5: the correct class is among the five highest."],
  ["cls", 2, "Receptive field after conv3-pool2-conv3-pool2-conv3?", "3, 4, 8, 10, 18."],
  ["cls", 1, "Why do ResNets train so deep?", "Skip connections output F(x) + x, so gradients flow through the identity path."],
  ["cls", 1, "Name two augmentations that can hurt and why.", "Horizontal flip for text/digits and colour jitter when colour is the label: they change the true label."],
  ["cls", 2, "Trainable parameters for a 10-class head on 512 features?", "512 × 10 + 10 = 5,130."],
  ["cls", 2, "What does Grad-CAM show?", "Where the last convolutional features raised a class score: ReLU(Σ αₖAₖ) with αₖ the mean gradient."],
  /* detection */
  ["det", 1, "IoU of (0,0,10,10) and (5,5,15,15).", "25/175 = 0.143."],
  ["det", 2, "Run NMS (0.5) on A (0.9), B (0.8, IoU(A,B) = 0.68), C (0.7, no overlap).", "Keep A and C; B is suppressed."],
  ["det", 2, "How many numbers does a 13×13 grid with 3 anchors and 20 classes output?", "13 × 13 × 3 × (5 + 20) = 12,675."],
  ["det", 2, "Compute AP for outcomes TP, FP, TP, TP, FP with 4 ground-truth objects.", "0.25·1 + 0.25·0.75 + 0.25·0.75 = 0.625."],
  ["det", 2, "What does focal loss do?", "Multiplies cross-entropy by (1 − p)^γ so easy, confident examples (the many background anchors) contribute little."],
  ["det", 1, "One-stage versus two-stage detectors?", "Two-stage propose regions then classify (accurate); one-stage predict directly on a grid (fast)."],
  /* segmentation (deep) */
  ["sem", 1, "Semantic versus instance segmentation?", "Semantic labels each pixel with a class; instance also separates individual objects."],
  ["sem", 2, "Output size of a transposed convolution of a 4×4 map with k = 3, s = 2, p = 0?", "(4 − 1)·2 + 3 = 9."],
  ["sem", 2, "What do U-Net skip connections do?", "Concatenate high-resolution encoder features into the decoder, restoring detail lost by pooling."],
  ["sem", 1, "IoU and Dice for two 4-pixel masks sharing 2 pixels?", "IoU = 2/6 = 0.333; Dice = 4/8 = 0.5."],
  ["sem", 1, "Why is pixel accuracy misleading?", "Class imbalance: predicting only background can score 95% while finding nothing."],
  /* ViT */
  ["vit", 2, "Patches and tokens for a 224×224 image with 16×16 patches?", "196 patches, 197 tokens with [CLS]; each patch has 768 numbers."],
  ["vit", 2, "How does attention cost scale with tokens?", "Quadratically: N² similarity scores; 4× the tokens costs 16×."],
  ["vit", 2, "Describe CLIP's training objective.", "Contrastive: match each image to its caption within a batch by softmax over the N×N similarity matrix (both directions)."],
  ["vit", 2, "Name two self-supervised approaches.", "Contrastive learning (SimCLR/MoCo) and masked image modelling (MAE); also DINO self-distillation."],
  /* video */
  ["video", 2, "What is the aperture problem?", "One brightness-constancy equation with two unknowns (u, v): motion along an edge is ambiguous without more constraints, e.g. a window assumption."],
  ["video", 2, "Solve Lucas–Kanade for AᵀA = diag(2, 2), Aᵀb = (4, 2).", "(u, v) = (2, 1)."],
  ["video", 1, "Background update with α = 0.05: what does a small α do?", "Slow adaptation: ≈ 20 frames to absorb a change; stationary objects eventually fade into the background if α is large."],
  ["video", 2, "Describe tracking-by-detection.", "Predict tracks, detect, associate by IoU (Hungarian), update matched tracks, create and delete tracks."],
];

export const drills: DrillDef[] = [
  {
    t: "RGB to grayscale",
    q: "What does this print?",
    code: py`
import numpy as np
print(round(float(np.array([200, 100, 50]) @ [0.299, 0.587, 0.114]), 1))`,
    opts: [["124.2", true, "Green carries the largest weight."], ["116.7", false, "That is the plain average of the channels."], ["350", false, "Weights must be applied, not just a sum."]],
    path: ["0.299 × 200 = 59.8.", "0.587 × 100 = 58.7.", "0.114 × 50 = 5.7.", "Sum = 124.2."],
    why: "The weights reflect human sensitivity to colour.",
    watch: "Using the plain mean darkens green and brightens blue.",
    remember: "Y = 0.299R + 0.587G + 0.114B.",
  },
  {
    t: "Median versus mean",
    q: "What does this print?",
    code: py`
import numpy as np
p = np.array([10, 12, 11, 9, 255, 10, 11, 12, 10])
print(round(float(p.mean()), 1), float(np.median(p)))`,
    opts: [["37.8 11.0", true, "The outlier moves the mean, not the median."], ["11.0 37.8", false, "The mean is the larger number here."], ["37.8 255.0", false, "The median is the middle value, not the maximum."]],
    path: ["Sum = 340, 9 values → mean 37.8.", "Sorted middle value = 11."],
    why: "The median is robust to outliers.",
    watch: "Do not use a mean filter on salt-and-pepper noise.",
    remember: "Median filter → impulse noise.",
  },
  {
    t: "Sobel on a step edge",
    q: "What does this print?",
    code: py`
import numpy as np
img = np.zeros((3, 4))
img[:, 2:] = 100
Kx = np.array([[-1, 0, 1], [-2, 0, 2], [-1, 0, 1]])
print([float((img[:, c:c + 3] * Kx).sum()) for c in range(2)])`,
    opts: [["[400.0, 400.0]", true, "Both windows straddle the step."], ["[0.0, 400.0]", false, "Both windows contain the edge."], ["[100.0, 100.0]", false, "The kernel weights sum to 4 per side."]],
    path: ["Window 1 (columns 0–2): each row contributes 100, weighted 1 + 2 + 1 = 4 → 400.", "Window 2 columns 1–3: also 400."],
    why: "Gx measures the change across columns.",
    watch: "Sobel weights the centre row twice.",
    remember: "Step height × 4 for Sobel.",
  },
  {
    t: "Output size of a strided convolution",
    q: "What does this print?",
    code: py`
n, k, p, s = 7, 3, 1, 2
print((n + 2 * p - k) // s + 1)`,
    opts: [["4", true, "(7 + 2 − 3)//2 + 1."], ["7", false, "Only stride 1 with 'same' padding keeps the size."], ["5", false, "That is the stride-1, no-padding result."]],
    path: ["7 + 2 − 3 = 6.", "6 // 2 = 3.", "3 + 1 = 4."],
    why: "Stride skips positions.",
    watch: "Integer division matters.",
    remember: "⌊(n + 2p − k)/s⌋ + 1.",
  },
  {
    t: "Bilinear interpolation",
    q: "What does this print?",
    code: py`
x, y = 0.25, 0.75
print((1 - x) * (1 - y) * 10 + x * (1 - y) * 20 + (1 - x) * y * 30 + x * y * 40)`,
    opts: [["27.5", true, "A weighted blend of the four corners."], ["25.0", false, "That is the centre value."], ["30.0", false, "The nearest corner is not the answer."]],
    path: ["Weights: 0.1875 (top-left), 0.0625, 0.5625, 0.1875.", "0.1875·10 + 0.0625·20 + 0.5625·30 + 0.1875·40 = 27.5."],
    why: "Weights are the opposite areas.",
    watch: "x runs across columns, y down rows.",
    remember: "Four-corner weighted average.",
  },
  {
    t: "Pinhole projection",
    q: "What does this print?",
    code: py`
f, cx, cy = 800.0, 320.0, 240.0
X, Y, Z = 1.0, 0.5, 5.0
print(f * X / Z + cx, f * Y / Z + cy)`,
    opts: [["480.0 320.0", true, "u = fX/Z + cx, v = fY/Z + cy."], ["160.0 80.0", false, "Add the principal point."], ["800.0 400.0", false, "Divide by the depth Z."]],
    path: ["fX/Z = 160, + 320 = 480.", "fY/Z = 80, + 240 = 320."],
    why: "Image size falls with depth.",
    watch: "Z must be in the same units as X, Y.",
    remember: "u = fX/Z + cx.",
  },
  {
    t: "Stereo depth",
    q: "What does this print?",
    code: py`
f, B, d = 700.0, 0.1, 14.0
print(f * B / d)`,
    opts: [["5.0", true, "Z = fB/d."], ["0.2", false, "Divide fB by the disparity, not d by fB."], ["98.0", false, "Disparity is a divisor."]],
    path: ["fB = 70.", "70 / 14 = 5 metres."],
    why: "Depth is inversely proportional to disparity.",
    watch: "Disparity 0 means infinity.",
    remember: "Z = fB/d.",
  },
  {
    t: "Intersection over union",
    q: "What does this print?",
    code: py`
a, b = (0, 0, 10, 10), (5, 5, 15, 15)
inter = max(0, min(a[2], b[2]) - max(a[0], b[0])) * max(0, min(a[3], b[3]) - max(a[1], b[1]))
union = 100 + 100 - inter
print(inter, union, round(inter / union, 3))`,
    opts: [["25 175 0.143", true, "A 5×5 overlap over 175 in the union."], ["25 200 0.125", false, "The union subtracts the overlap once."], ["100 100 1.0", false, "The boxes only partly overlap."]],
    path: ["Overlap 5 × 5 = 25.", "Union = 100 + 100 − 25 = 175.", "IoU = 0.143."],
    why: "IoU divides the overlap by the combined area.",
    watch: "Do not double count the overlap.",
    remember: "IoU = I / (A + B − I).",
  },
  {
    t: "Dice and IoU",
    q: "What does this print?",
    code: py`
import numpy as np
a = np.array([1, 1, 1, 1, 0, 0])
b = np.array([0, 0, 1, 1, 1, 1])
i = int((a & b).sum())
print(i, round(i / (a.sum() + b.sum() - i), 3), round(2 * i / (a.sum() + b.sum()), 3))`,
    opts: [["2 0.333 0.5", true, "Two shared of four each."], ["2 0.5 0.333", false, "Dice is the larger of the two."], ["4 1.0 1.0", false, "Only two pixels are shared."]],
    path: ["Shared = 2.", "IoU = 2/(4 + 4 − 2) = 0.333.", "Dice = 4/8 = 0.5."],
    why: "Dice weights the overlap twice.",
    watch: "Dice ≥ IoU always.",
    remember: "Dice = 2I/(|A|+|B|).",
  },
  {
    t: "Number of ViT tokens",
    q: "What does this print?",
    code: py`
size, patch = 224, 16
n = (size // patch) ** 2
print(n, n + 1, patch * patch * 3)`,
    opts: [["196 197 768", true, "14 × 14 patches plus [CLS], 768 numbers each."], ["224 225 256", false, "Patches are 16 × 16 pixels."], ["14 15 768", false, "The grid is 14 × 14 = 196 patches."]],
    path: ["224 // 16 = 14.", "14² = 196 patches (+1 for [CLS]).", "16·16·3 = 768."],
    why: "Each patch becomes one token.",
    watch: "Channels multiply the patch size.",
    remember: "(H/P)·(W/P) tokens.",
  },
  {
    t: "RANSAC iterations",
    q: "What does this print?",
    code: py`
import math
print(math.ceil(math.log(0.01) / math.log(1 - 0.5 ** 2)))`,
    opts: [["17", true, "ln 0.01 / ln 0.75 = 16.0, rounded up."], ["4", false, "That is log base 10 of something else."], ["100", false, "Far fewer tries are needed for a line."]],
    path: ["1 − 0.5² = 0.75.", "ln 0.01 / ln 0.75 = 16.008.", "Round up → 17."],
    why: "Enough tries to draw one all-inlier sample with 99% probability.",
    watch: "Use s = 4 for a homography: 72.",
    remember: "N = ln(1 − p)/ln(1 − wˢ).",
  },
  {
    t: "Receptive field",
    q: "What does this print?",
    code: py`
r, j = 1, 1
for k, s in [(3, 1), (2, 2), (3, 1), (2, 2), (3, 1)]:
    r += (k - 1) * j
    j *= s
print(r)`,
    opts: [["18", true, "3, 4, 8, 10, 18."], ["9", false, "Pooling increases the jump and so the later growth."], ["7", false, "That is the receptive field of three stacked 3×3 convolutions without pooling."]],
    path: ["conv3: r = 3.", "pool: r = 4, j = 2.", "conv3: r = 8.", "pool: r = 10, j = 4.", "conv3: r = 18."],
    why: "The jump multiplies the contribution of later layers.",
    watch: "Include pooling layers.",
    remember: "r += (k − 1)·j; j *= stride.",
  },
];

export const codeLab: [string, string, string][] = [
  ["Histogram equalization from scratch", "Equalise a tiny 3-bit image.", py`
import numpy as np

img = np.array([[0, 1, 1, 2], [1, 2, 2, 3], [2, 3, 3, 4], [3, 4, 5, 7]])
cdf = np.bincount(img.ravel(), minlength=8).cumsum()
lut = np.round((cdf - cdf[cdf > 0].min()) / (img.size - cdf[cdf > 0].min()) * 7).astype(int)
print(lut[img].tolist())`],
  ["Convolution and Sobel edges", "Find the vertical edge of a step image.", py`
import numpy as np

img = np.zeros((6, 6))
img[:, 3:] = 100
Kx = np.array([[-1, 0, 1], [-2, 0, 2], [-1, 0, 1]])
gx = np.array([[(img[r:r + 3, c:c + 3] * Kx).sum() for c in range(4)] for r in range(4)])
print(gx[0].tolist(), int(np.abs(gx).argmax() % 4))`],
  ["Median filter versus mean filter", "Clean salt-and-pepper noise.", py`
import numpy as np

rng = np.random.default_rng(0)
img = np.full((20, 20), 100.0)
noisy = img.copy()
noisy[rng.random(img.shape) < 0.05] = 255
def filt(a, f):
    return np.array([[f(a[r:r + 3, c:c + 3]) for c in range(18)] for r in range(18)])
for name, f in (("mean", np.mean), ("median", np.median)):
    out = filt(noisy, f)
    print(name, round(float(np.abs(out - 100).mean()), 2))`],
  ["Otsu threshold", "Pick the threshold from a histogram.", py`
import numpy as np

hist = np.array([0, 5, 20, 5, 0, 0, 6, 18, 6, 0], float)
p = hist / hist.sum()
lv = np.arange(10)
best = max(range(1, 10), key=lambda t: (p[:t].sum() * p[t:].sum() * ((lv[:t] * p[:t]).sum() / max(p[:t].sum(), 1e-9) - (lv[t:] * p[t:]).sum() / max(p[t:].sum(), 1e-9)) ** 2))
print(best)`],
  ["IoU and NMS", "Suppress duplicate detections.", py`
import numpy as np

def iou(a, b):
    ix = max(0, min(a[2], b[2]) - max(a[0], b[0])); iy = max(0, min(a[3], b[3]) - max(a[1], b[1]))
    i = ix * iy
    return i / ((a[2]-a[0])*(a[3]-a[1]) + (b[2]-b[0])*(b[3]-b[1]) - i)

boxes = [(0, 0, 10, 10), (1, 1, 11, 11), (20, 20, 30, 30), (21, 19, 31, 29)]
scores = [0.9, 0.8, 0.7, 0.95]
order = np.argsort(scores)[::-1].tolist()
keep = []
while order:
    b = order.pop(0)
    keep.append(b)
    order = [i for i in order if iou(boxes[b], boxes[i]) <= 0.5]
print(keep)`],
  ["Rotate points with a matrix", "Rotate a square by 90 degrees.", py`
import numpy as np

square = np.array([[0, 0], [1, 0], [1, 1], [0, 1]], float)
t = np.radians(90)
R = np.array([[np.cos(t), -np.sin(t)], [np.sin(t), np.cos(t)]])
print((square @ R.T).round(2).tolist())`],
  ["Patchify an image", "Cut an image into ViT patches.", py`
import numpy as np

img = np.arange(4 * 4).reshape(4, 4)
patches = img.reshape(2, 2, 2, 2).transpose(0, 2, 1, 3).reshape(4, 4)
print(patches.tolist())`],
  ["Mean IoU", "Compute IoU per class for a segmentation prediction.", py`
import numpy as np

pred = np.array([[0, 0, 1, 1], [0, 2, 2, 1], [0, 2, 2, 1]])
true = np.array([[0, 0, 1, 1], [0, 0, 2, 1], [0, 2, 2, 2]])
ious = [float(((pred == c) & (true == c)).sum() / ((pred == c) | (true == c)).sum()) for c in range(3)]
print([round(i, 3) for i in ious], round(float(np.mean(ious)), 3))`],
];

export const glance: [string, string][] = [
  ["Pixels", "image = H × W × C array · Y = 0.299R + 0.587G + 0.114B · stretch (x − min)/(max − min)·255"],
  ["Equalization", "new = round((CDF − CDF_min)/(N − CDF_min) · (L − 1)) · PSNR = 10 log₁₀(255²/MSE)"],
  ["Filtering", "out(r,c) = Σ img·k · output size ⌊(n + 2p − k)/s⌋ + 1 · Gaussian separable: 2k vs k²"],
  ["Edges", "Sobel Kx = [−1 0 1; −2 0 2; −1 0 1] · magnitude √(Gx² + Gy²) · Canny: smooth, gradient, NMS, hysteresis"],
  ["Segmentation (classic)", "Otsu: maximise w₀w₁(μ₀ − μ₁)² · erosion/dilation/opening/closing · Hough ρ = x cosθ + y sinθ"],
  ["Geometry", "rotation [cos −sin; sin cos] · homogeneous 3×3 · bilinear = weighted 4 corners · u = fX/Z + cx · Z = fB/d"],
  ["Features", "Harris R = det M − k tr²M · NCC · SIFT 4×4×8 = 128 · ratio test d₁/d₂ < 0.75 · RANSAC N = ln(1−p)/ln(1−wˢ)"],
  ["CNN", "receptive field r += (k−1)·j, j *= s · conv params k²·Cin·Cout + Cout · ResNet F(x) + x"],
  ["Detection", "IoU = I/(A + B − I) · NMS · anchors g²·a·(5 + C) · AP = area under PR · focal (1 − p)^γ"],
  ["Segmentation (deep)", "IoU = |A∩B|/|A∪B| · Dice = 2|A∩B|/(|A|+|B|) · transposed conv (n−1)s + k − 2p"],
  ["ViT / CLIP", "tokens = (H/P)(W/P) + 1 · attention N² · CLIP softmax over N×N similarities"],
  ["Motion", "Iₓu + I_yv + I_t = 0 · Lucas–Kanade (AᵀA)[u v]ᵀ = −Aᵀ I_t · background B ← (1−α)B + αI"],
];

export const lists: [string, string[]][] = [
  ["Habits for reliable vision projects", ["Look at a hundred raw images before choosing a method", "Collect test images with the deployment camera and lighting", "Keep train, validation and test split by scene or device, not by frame", "Use the pretrained model's exact preprocessing", "Check labels for consistency before blaming the model", "Plot failures: the worst predictions teach the most"]],
  ["Debugging a model that does not work", ["Confirm channel order and value range (BGR/RGB, 0–255 / 0–1)", "Overfit a single batch first", "Visualise augmented inputs and the model's outputs", "Check that masks and boxes are aligned with the resized image", "Compare with a trivial baseline", "Inspect Grad-CAM for shortcut cues such as the background"]],
  ["Explaining your answer in an exam", ["Write the formula, substitute the numbers, compute, interpret", "State assumptions: padding, stride, units, IoU threshold", "Mention what happens at borders and with noise", "Say what the method cannot do (scale, rotation, occlusion)"]],
];

export const materials: [string, [string, string][]][] = [
  ["Free books and courses", [["Computer Vision: Algorithms and Applications — Szeliski", "https://szeliski.org/Book/"], ["Stanford CS231n: CNNs for Visual Recognition", "http://cs231n.stanford.edu/"], ["Multiple View Geometry — Hartley and Zisserman", "https://www.robots.ox.ac.uk/~vgg/hzbook/"]]],
  ["Libraries", [["OpenCV documentation", "https://docs.opencv.org/"], ["scikit-image", "https://scikit-image.org/docs/stable/"], ["torchvision models and datasets", "https://pytorch.org/vision/stable/"]]],
];
