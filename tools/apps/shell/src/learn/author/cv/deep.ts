import { P, bars, cells, compare, curve, hline, par, plot, pt, seg, vline } from "../../visuals/kit.js";
import { py, type ConceptDef } from "../build.js";
import { table } from "../ml/data.js";
import { rowflow } from "../nlp/util.js";

/* Every code example is plain Python/NumPy and is RUN by `npm run outputs -- computer-vision`. */

const BOXES = `
import numpy as np

def iou(a, b):
    ix = max(0, min(a[2], b[2]) - max(a[0], b[0]))
    iy = max(0, min(a[3], b[3]) - max(a[1], b[1]))
    inter = ix * iy
    union = (a[2] - a[0]) * (a[3] - a[1]) + (b[2] - b[0]) * (b[3] - b[1]) - inter
    return inter / union if union else 0.0`;

export const cls: ConceptDef[] = [
  {
    t: "Image classification: from pixels to a label",
    lv: 1,
    s: `A classifier maps an image to one of C classes. The deep-learning pipeline: resize and normalise the image, pass it through convolutional layers that build increasingly abstract features (edges → textures → parts → objects), flatten or globally pool, and finish with a softmax that gives C probabilities. Trained with cross-entropy on labelled images (ImageNet: 1.28 million images, 1,000 classes). The reported measures are {{top-1}} accuracy (the highest-probability class is right) and {{top-5}} accuracy (the right class is among the five highest).`,
    r: `Always evaluate on images collected like the deployment images: lighting, camera and background shift hurt more than model choice.`,
    i: `What is the difference between top-1 and top-5 accuracy?`,
    c: py`
import numpy as np

probs = np.array([[0.1, 0.6, 0.2, 0.05, 0.05], [0.3, 0.1, 0.25, 0.2, 0.15], [0.05, 0.05, 0.1, 0.7, 0.1]])
y = np.array([1, 2, 0])
order = np.argsort(-probs, axis=1)
print(float((order[:, 0] == y).mean()), float(np.mean([y[i] in order[i, :2] for i in range(3)])))`,
    v: rowflow("A CNN classifier.", ["Image", "Resize + normalise", "Convolutional features", "Global pooling", "Softmax", "Class probabilities"], [
      "A photo of any size.",
      "A fixed size such as 224 × 224, scaled inputs.",
      "Edges → textures → parts → objects.",
      "One vector per image.",
      "Turn scores into probabilities.",
      "Take the top-1 or the top-k.",
    ]),
  },
  {
    t: "Receptive fields: what a neuron can see",
    lv: 2,
    s: `The {{receptive field}} of a unit is the patch of the input that can influence it. Stacking convolutions grows it: r_new = r + (k − 1) × j where j is the distance between neighbouring units in input pixels (the "jump"), and strides or pooling multiply j. Network 3×3 conv → 2×2 pool → 3×3 conv → 2×2 pool → 3×3 conv: after the first conv r = 3 (j = 1); after pooling r = 4, j = 2; after the second conv r = 8; after pooling r = 10, j = 4; after the third conv r = 18. Deep layers therefore see large context — enough to recognise a whole object.`,
    r: `If the receptive field is smaller than the object, the network cannot see the whole thing: add depth, pooling or dilation.`,
    i: `Compute the receptive field after the layer sequence above.`,
    c: py`
layers = [("conv", 3, 1), ("pool", 2, 2), ("conv", 3, 1), ("pool", 2, 2), ("conv", 3, 1)]
r, j = 1, 1
for name, k, s in layers:
    r = r + (k - 1) * j
    j = j * s
    print(name, "receptive field", r, "jump", j)`,
    v: cells("Receptive field growth through the layers.", table(["layer", "conv 3×3", "pool 2×2", "conv 3×3", "pool 2×2", "conv 3×3"], [["receptive field", "3", "4", "8", "10", "18"], ["jump j", "1", "2", "2", "4", "4"]]), [
      ["Each convolution adds (k − 1) × j pixels."],
      ["Pooling barely changes r but doubles j, so later convolutions reach farther.", [[1, 2, 2], [2, 2, 2]]],
      ["After five layers each unit sees an 18 × 18 patch.", [[1, 5, 5]]],
    ]),
  },
  {
    t: "Famous CNN architectures",
    lv: 1,
    s: `{{LeNet}} (1998): the first practical CNN for digits. {{AlexNet}} (2012): deeper, ReLU, dropout and GPUs — won ImageNet by a wide margin and started the deep-learning era. {{VGG}}: only 3×3 convolutions stacked deeply (16–19 layers), simple but with 138 million parameters. {{Inception/GoogLeNet}}: parallel filter sizes in one block. {{ResNet}}: skip connections let networks reach 50–152 layers by learning residuals F(x) + x. {{EfficientNet}} scales depth, width and resolution together; {{MobileNet}} uses depthwise-separable convolutions to run on phones.`,
    r: `For a new project start from a pretrained ResNet or EfficientNet rather than designing a network.`,
    i: `Why do skip connections let ResNet be so deep?`,
    c: py`
def conv_params(k, cin, cout):
    return k * k * cin * cout + cout

def separable(k, cin, cout):
    return k * k * cin + cin * cout

print(conv_params(3, 128, 128), separable(3, 128, 128))`,
    v: compare("Landmark architectures and their key idea.", ["Year", "Key idea"], [
      ["LeNet", "1998", "convolution + pooling for digits"],
      ["AlexNet", "2012", "ReLU, dropout, GPUs; ImageNet breakthrough"],
      ["VGG", "2014", "deep stacks of 3×3 convolutions"],
      ["ResNet", "2015", "skip connections, 50–152 layers"],
      ["MobileNet / EfficientNet", "2017–19", "efficiency: separable convolutions, compound scaling"],
    ]),
  },
  {
    t: "Data augmentation",
    lv: 1,
    s: `Labelled images are expensive, so create more by applying label-preserving changes at training time: random flips, crops, rotations, scale, colour jitter, blur, cutout (erase a patch), mixup (blend two images and their labels). Each epoch the network sees different versions of the same photo, which acts as regularisation. Choose transformations that keep the label true: flipping a cat is fine, flipping a digit "6" into a "9"-like shape or a road sign's text is not. Four crops times two flips already multiplies the effective dataset size by 8.`,
    r: `Apply augmentation to training data only; validation and test images get the plain resize.`,
    i: `Give one augmentation that is harmful for digit recognition and explain why.`,
    c: py`
import numpy as np

img = np.arange(16).reshape(4, 4)
flipped = img[:, ::-1]
crops = [img[r:r + 3, c:c + 3] for r in range(2) for c in range(2)]
print(flipped[0].tolist(), len(crops) * 2)
alpha = 0.3
mix = alpha * img + (1 - alpha) * flipped
print(mix[0].round(1).tolist())`,
    v: compare("Augmentations and when they are safe.", ["Safe for", "Risky for"], [
      ["Horizontal flip", "animals, scenes", "text, digits, left/right-sensitive tasks"],
      ["Random crop / scale", "most objects", "tiny objects that may be cropped out"],
      ["Colour jitter", "general photos", "tasks where colour is the label (ripeness)"],
      ["Rotation", "satellite, microscopy", "upright objects like faces"],
    ]),
  },
  {
    t: "Transfer learning for images",
    lv: 1,
    s: `A network trained on ImageNet has learned general features — edges, textures, shapes — that help almost any image task. {{Transfer learning}}: reuse it. Option 1, {{feature extraction}}: freeze the convolutional base and train a new classifier head on your classes (for VGG16 with a 512-feature output and 10 classes: 512 × 10 + 10 = 5,130 trainable parameters instead of 14.7 million). Option 2, {{fine-tuning}}: also unfreeze the last blocks with a small learning rate. Few images (hundreds) → extract; more images or a very different domain → fine-tune more layers.`,
    r: `Use the same preprocessing (mean/std, size) that the pretrained model expects.`,
    i: `How many parameters are trained when only a 10-class head on 512 features is trained?`,
    c: py`
base = 14714688
head = 512 * 10 + 10
print(head, round(head / (base + head) * 100, 3))
for n_images in (200, 5000, 100000):
    plan = "feature extraction" if n_images < 1000 else "fine-tune last blocks" if n_images < 20000 else "fine-tune the whole model"
    print(n_images, plan)`,
    v: compare("How much to retrain.", ["Data", "Domain close to ImageNet?"], [
      ["Feature extraction (freeze base)", "hundreds of images", "yes"],
      ["Fine-tune last blocks", "thousands", "partly"],
      ["Fine-tune everything", "tens of thousands+", "no (medical, satellite)"],
    ]),
  },
  {
    t: "Looking inside a classifier: saliency and Grad-CAM",
    lv: 2,
    s: `Why did the network say "dog"? {{Saliency}} maps use the gradient of the class score with respect to the pixels: large magnitudes mark pixels that matter. {{Grad-CAM}} weights the last convolutional feature maps by the average gradient of the class score: heat = ReLU(Σ_k α_k A_k) with α_k = mean of ∂score/∂A_k. If map A₁ = [[1, 0], [0, 1]] has α = 2 and A₂ = [[0, 1], [1, 0]] has α = −1, the heat map is ReLU(2A₁ − A₂) = [[2, 0], [0, 2]]. Overlaying it on the image shows where the model looked — and exposes shortcuts, such as a classifier that looks at the background or a watermark.`,
    r: `Explanations are diagnostics, not proof: confirm with controlled tests (remove the region, see if the prediction changes).`,
    i: `Compute the Grad-CAM heat map for the two feature maps above.`,
    c: py`
import numpy as np

A = np.array([[[1, 0], [0, 1]], [[0, 1], [1, 0]]], float)
alpha = np.array([2.0, -1.0])
heat = np.maximum((alpha[:, None, None] * A).sum(axis=0), 0)
print(heat.tolist())`,
    v: cells("Grad-CAM: weighted sum of feature maps, then ReLU.", [P("A₁ (α = 2)", ["1", "0", "0", "1"]), P("A₂ (α = −1)", ["0", "1", "1", "0"]), P("heat = ReLU(2A₁ − A₂)", ["2", "0", "0", "2"])], [
      ["Each feature map is weighted by how much it raises the class score."],
      ["Where A₁ is active the heat is high (+2).", [[2, 0, 0], [2, 3, 3]]],
      ["A₂ pushes the score down, so those positions are clipped to 0.", [[2, 1, 2]]],
    ]),
  },
];

/* ------------------------------------------------------------------ */
export const det: ConceptDef[] = [
  {
    t: "Object detection: boxes and labels",
    lv: 1,
    s: `Detection answers "what and where": for every object the model outputs a {{bounding box}} (x₁, y₁, x₂, y₂ or centre, width, height), a class and a confidence score — and how many objects there are is unknown in advance. Two families: {{two-stage}} detectors (R-CNN, Faster R-CNN) first propose regions, then classify and refine them — accurate; {{one-stage}} detectors (YOLO, SSD, RetinaNet) predict boxes and classes directly on a grid — fast. Newer transformer detectors (DETR) predict a set of objects with no anchor boxes.`,
    r: `Choose by latency and accuracy needs: real-time video favours one-stage detectors.`,
    i: `Contrast one-stage and two-stage detectors.`,
    c: py`
detections = [
    {"box": (12, 20, 90, 140), "label": "person", "score": 0.93},
    {"box": (100, 60, 180, 130), "label": "dog", "score": 0.81},
]
for d in detections:
    x1, y1, x2, y2 = d["box"]
    print(d["label"], d["score"], "width", x2 - x1, "height", y2 - y1)`,
    v: compare("Two families of detectors.", ["Two-stage (Faster R-CNN)", "One-stage (YOLO, SSD)"], [
      ["Process", "propose regions, then classify", "predict boxes directly on a grid"],
      ["Accuracy", "usually higher", "slightly lower, improving"],
      ["Speed", "slower", "real time"],
    ]),
  },
  {
    t: "Intersection over union (IoU)",
    lv: 1,
    s: `How well does a predicted box match the true one? {{IoU = area of intersection / area of union}}. Boxes (0, 0, 10, 10) and (5, 5, 15, 15): the overlap is a 5 × 5 square (25), the union is 100 + 100 − 25 = 175, so IoU = 0.143. Identical boxes give 1, disjoint boxes 0. A detection usually counts as correct if IoU ≥ 0.5 with a ground-truth box of the same class (stricter: 0.75, or averaged over 0.5–0.95 as in COCO). IoU is also used to compare duplicate detections and to match tracks between frames.`,
    r: `IoU ignores where the boxes miss each other when they do not overlap; generalised IoU variants fix that for training losses.`,
    i: `Compute the IoU of (0,0,10,10) and (5,5,15,15).`,
    c: py`${BOXES}
print(round(iou((0, 0, 10, 10), (5, 5, 15, 15)), 3), iou((0, 0, 10, 10), (0, 0, 10, 10)), iou((0, 0, 10, 10), (20, 20, 30, 30)))
print(round(iou((0, 0, 10, 10), (1, 1, 11, 11)), 3))`,
    v: bars("Overlap of box A = (0,0,10,10) with a box of the same size shifted by d in x and y.", [["intersection", "pow(max(0,10-d),2)"], ["union", "200-pow(max(0,10-d),2)"], ["IoU × 100", "100*pow(max(0,10-d),2)/(200-pow(max(0,10-d),2))"]], {
      max: 200,
      params: [par("d", "shift d (pixels)", 0, 12, 1, 5)],
      readout: ["shift {d}: IoU = {pow(max(0,10-d),2)/(200-pow(max(0,10-d),2)):3}"],
      steps: [["Shift 5: IoU 0.143.", { d: 5 }], ["Shift 1: IoU 0.68 — a good match.", { d: 1 }]],
    }),
  },
  {
    t: "Non-maximum suppression",
    lv: 2,
    s: `Detectors fire several times around one object. {{NMS}} keeps the best box and deletes the near-duplicates: sort by score; take the top box; remove every remaining box of the same class whose IoU with it exceeds a threshold (typically 0.5); repeat. Boxes A = (0,0,10,10) score 0.9, B = (1,1,11,11) score 0.8, C = (20,20,30,30) score 0.7: IoU(A, B) = 81/119 = 0.68 > 0.5, so B is removed; C does not overlap and stays. Output: A and C. Too low a threshold deletes genuinely separate neighbouring objects (crowds); soft-NMS lowers scores instead of deleting.`,
    r: `Tune the threshold on your scene type: crowded scenes need a higher one.`,
    i: `Run NMS on the three boxes above with a threshold of 0.5.`,
    c: py`${BOXES}
boxes = [(0, 0, 10, 10), (1, 1, 11, 11), (20, 20, 30, 30)]
scores = [0.9, 0.8, 0.7]
order = np.argsort(scores)[::-1].tolist()
keep = []
while order:
    best = order.pop(0)
    keep.append(best)
    order = [i for i in order if iou(boxes[best], boxes[i]) <= 0.5]
print(keep, round(iou(boxes[0], boxes[1]), 3))`,
    v: rowflow("Non-maximum suppression.", ["Sort by score", "Keep the best box", "Delete overlaps (IoU > 0.5)", "Next best remaining", "Done"], [
      "A 0.9, B 0.8, C 0.7.",
      "A is kept.",
      "B overlaps A (IoU 0.68): removed.",
      "C does not overlap: kept.",
      "Final detections: A and C.",
    ]),
  },
  {
    t: "Anchors and grid predictions",
    lv: 2,
    s: `One-stage detectors divide the image into a grid and let every cell predict boxes. {{Anchor boxes}} are predefined shapes (a few widths and heights) placed at every cell; the network predicts offsets from an anchor: tₓ = (x − xₐ)/wₐ, t_w = ln(w / wₐ). A 13 × 13 grid with 3 anchors produces 13 × 13 × 3 = 507 candidate boxes, each with 4 offsets, an objectness score and C class scores: for C = 20 classes the output tensor has 13 × 13 × 3 × (5 + 20) = 12,675 numbers. Most candidates are background, which is why focal loss and hard-negative mining are used in training.`,
    r: `Anchor-free detectors (FCOS, CenterNet, YOLOv8) predict points or centres directly and drop the anchor design.`,
    i: `How many numbers does a 13×13 grid with 3 anchors and 20 classes output?`,
    c: py`
grid, anchors, classes = 13, 3, 20
print(grid * grid * anchors, grid * grid * anchors * (5 + classes))
xa, wa, x, w = 50.0, 40.0, 58.0, 60.0
print((x - xa) / wa, round(__import__("math").log(w / wa), 3))`,
    v: bars("Number of candidate boxes for the chosen grid and anchors.", [["candidates", "g*g*a"], ["output numbers (20 classes)", "g*g*a*25"]], {
      max: 30000,
      params: [par("g", "grid size", 7, 26, 1, 13), par("a", "anchors per cell", 1, 9, 1, 3)],
      readout: ["{g}×{g}×{a} = {g*g*a} candidate boxes"],
      steps: [["13 × 13 with 3 anchors: 507 candidates.", { g: 13, a: 3 }], ["A finer 26 × 26 grid: four times as many.", { g: 26, a: 3 }]],
    }),
  },
  {
    t: "Average precision and mAP",
    lv: 2,
    s: `Detection quality needs precision and recall together. Rank all detections of a class by score, mark each as true positive (IoU ≥ 0.5 with an unmatched ground truth) or false positive, and compute precision and recall down the list. With 4 ground-truth objects and the ranked outcomes TP, FP, TP, TP, FP: precision 1, 0.5, 0.667, 0.75, 0.6; recall 0.25, 0.25, 0.5, 0.75, 0.75. {{Average precision}} is the area under the precision–recall curve (with the precision envelope): 0.25 × 1 + 0.25 × 0.75 + 0.25 × 0.75 = 0.625. {{mAP}} is the mean AP over classes (and, in COCO, over IoU thresholds 0.5–0.95).`,
    r: `Always state the IoU threshold: mAP@0.5 is far easier than mAP@[0.5:0.95].`,
    i: `Compute AP for ranked outcomes TP, FP, TP, TP, FP with 4 ground-truth objects.`,
    c: py`
import numpy as np

tp = np.array([1, 0, 1, 1, 0])
ctp = np.cumsum(tp)
precision = ctp / np.arange(1, 6)
recall = ctp / 4
envelope = np.maximum.accumulate(precision[::-1])[::-1]
ap, prev = 0.0, 0.0
for r, p in zip(recall, envelope):
    if r > prev:
        ap += (r - prev) * p
        prev = r
print(precision.round(3).tolist(), recall.tolist(), round(ap, 3))`,
    v: cells("Precision and recall down the ranked detection list.", table(["rank", "1", "2", "3", "4", "5"], [["outcome", "TP", "FP", "TP", "TP", "FP"], ["precision", "1.00", "0.50", "0.67", "0.75", "0.60"], ["recall", "0.25", "0.25", "0.50", "0.75", "0.75"]]), [
      ["Each detection updates precision and recall."],
      ["Recall rises only at true positives.", [[1, 1, 1], [1, 3, 4]]],
      ["AP integrates the best precision available at each recall level: 0.625.", [[2, 1, 5]]],
    ]),
  },
  {
    t: "Training a detector: losses and imbalance",
    lv: 2,
    s: `A detector optimises several losses together: a {{classification}} loss (cross-entropy per box), a {{box regression}} loss (smooth-L1 or IoU-based) on matched anchors, and an {{objectness}} loss. Each anchor is matched to a ground-truth box if IoU > 0.5, to background if < 0.4. Because almost all anchors are background (hundreds versus a handful), the classification loss is dominated by easy negatives. {{Focal loss}} multiplies cross-entropy by (1 − p)^γ so confident correct predictions contribute almost nothing: with γ = 2 and p = 0.9 the loss shrinks by a factor 100; with p = 0.1 by 0.81.`,
    r: `Evaluate with the same NMS and score threshold you will use in deployment.`,
    i: `How much does focal loss (γ = 2) down-weight a well-classified example with p = 0.9?`,
    c: py`
import numpy as np

for p in (0.9, 0.5, 0.1):
    ce = -np.log(p)
    fl = (1 - p) ** 2 * ce
    print(p, round(float(ce), 3), round(float(fl), 4), round((1 - p) ** 2, 2))`,
    v: plot("Focal-loss factor (1 − p)^γ for the probability p of the true class.", {
      x: [0, 1], y: [0, 1.05], labels: ["probability of the true class p", "weight (1 − p)^γ"],
      params: [par("g", "γ", 0, 5, 0.5, 2)],
      readout: ["p = 0.9 → factor {pow(0.1,g):4}; p = 0.1 → factor {pow(0.9,g):3}"],
      steps: [["γ = 0: ordinary cross-entropy.", { g: 0 }], ["γ = 2: easy examples are ignored.", { g: 2 }]],
    }, [curve("pow(1-x,g)", { c: "accent" })]),
  },
  {
    t: "Detection in practice: speed, size and small objects",
    lv: 1,
    s: `Practical choices decide success. {{Resolution}}: small objects vanish after downsampling, so raise the input size or use feature pyramids that detect at several scales. {{Latency}}: measure frames per second on the real hardware; model size, input size and NMS all count. {{Data}}: label consistently (annotators disagree on box tightness), cover rare conditions (night, rain), and include background-only images to reduce false alarms. {{Thresholds}}: choose the score threshold from the cost of misses versus false alarms, not from the default 0.5.`,
    r: `A model's mAP on a benchmark does not predict its behaviour in your scene: build a small, honest test set from your own camera.`,
    i: `Why do small objects need special treatment?`,
    c: py`
frame, object_px = 1920, 24
for size in (320, 640, 1280):
    print(size, round(object_px * size / frame, 1), "px wide after resizing")`,
    v: compare("Tuning a detector for a real scene.", ["Problem", "Remedy"], [
      ["Small objects missed", "tiny after resizing", "higher resolution, feature pyramid, tiling"],
      ["Too slow", "model or input too big", "smaller backbone, lower resolution, quantisation"],
      ["False alarms", "background looks like objects", "add negative images, raise threshold"],
      ["Duplicate boxes", "NMS threshold too high", "tune NMS IoU"],
    ]),
  },
];

/* ------------------------------------------------------------------ */
export const sem: ConceptDef[] = [
  {
    t: "Semantic, instance and panoptic segmentation",
    lv: 1,
    s: `Segmentation labels pixels. {{Semantic}} segmentation gives every pixel a class (road, car, sky) but does not separate individual objects: two touching cars share one "car" region. {{Instance}} segmentation finds each object separately with its own mask (car 1, car 2). {{Panoptic}} segmentation combines both: countable "things" get instance masks, amorphous "stuff" (road, sky) gets a class region. Typical models: FCN and U-Net (semantic), Mask R-CNN (instance), Mask2Former (all three).`,
    r: `Pick the lightest form that answers the question: counting cars needs instances, estimating road area needs only semantic.`,
    i: `What does instance segmentation add to semantic segmentation?`,
    c: py`
import numpy as np

semantic = np.array([[0, 1, 1, 0, 1, 1]])
instance = np.array([[0, 1, 1, 0, 2, 2]])
print(sorted(set(semantic.ravel().tolist())), sorted(set(instance.ravel().tolist())))`,
    v: compare("Three levels of pixel labelling.", ["Output", "Separates objects?"], [
      ["Semantic", "class per pixel", "no"],
      ["Instance", "mask + class per object", "yes"],
      ["Panoptic", "instances for things, regions for stuff", "yes"],
    ]),
  },
  {
    t: "Encoder–decoder and U-Net",
    lv: 2,
    s: `Classifiers shrink the image to one label; segmentation must return to full resolution. {{Fully convolutional}} networks (FCN) keep spatial maps, and an {{encoder–decoder}} downsamples to capture context then upsamples to restore detail. {{U-Net}} adds {{skip connections}} that concatenate the encoder's high-resolution features onto the decoder at the same scale, so the sharp edges lost in pooling come back. Upsampling is done by interpolation or by {{transposed convolution}}, whose output size is (n − 1)·s + k − 2p: a 4 × 4 map with k = 3, s = 2, p = 0 becomes 9 × 9.`,
    r: `U-Net trains well with few images, which made it the default in biomedical segmentation.`,
    i: `What size is the output of a transposed convolution of a 4×4 map with k = 3, stride 2, no padding?`,
    c: py`
n, k, s, p = 4, 3, 2, 0
print((n - 1) * s + k - 2 * p)
import numpy as np
x = np.array([[1.0, 2.0], [3.0, 4.0]])
up = np.kron(x, np.ones((2, 2)))
print(up.tolist())`,
    v: rowflow("U-Net.", ["Image", "Encoder: conv + pool", "Bottleneck", "Decoder: upsample", "Skip connections", "Per-pixel classes"], [
      "Full-resolution input.",
      "Halve the size, double the channels.",
      "Most context, least detail.",
      "Restore the resolution step by step.",
      "Concatenate encoder features of the same size.",
      "A label for every pixel.",
    ]),
  },
  {
    t: "Segmentation metrics: pixel accuracy, IoU and Dice",
    lv: 1,
    s: `{{Pixel accuracy}} is misleading: if 95% of pixels are background, predicting "background" everywhere scores 95%. Use overlap measures per class. {{IoU (Jaccard)}} = |A ∩ B| / |A ∪ B|; {{Dice (F1)}} = 2|A ∩ B| / (|A| + |B|). Prediction mask A has 4 pixels, ground truth B has 4, they share 2: IoU = 2/6 = 0.333, Dice = 4/8 = 0.5. Dice is always at least IoU (Dice = 2·IoU / (1 + IoU)). Report mean IoU over classes (mIoU) and look at each class: a rare class can be at zero while the mean looks fine.`,
    r: `Dice is also the loss in many medical segmentation networks because it handles class imbalance better than cross-entropy.`,
    i: `Compute IoU and Dice for masks of 4 pixels each that share 2.`,
    c: py`
import numpy as np

a = np.array([[1, 1, 0], [1, 1, 0], [0, 0, 0]])
b = np.array([[0, 1, 1], [0, 1, 1], [0, 0, 0]])
inter = int((a & b).sum())
print(inter, round(inter / (a.sum() + b.sum() - inter), 3), round(2 * inter / (a.sum() + b.sum()), 3))
print(float((np.zeros((10, 10)) == np.zeros((10, 10))).mean()))`,
    v: bars("IoU and Dice against the number of shared pixels (two masks of 4 pixels each).", [["IoU", "k/(8-k)"], ["Dice", "2*k/8"]], {
      max: 1,
      params: [par("k", "shared pixels k", 0, 4, 1, 2)],
      readout: ["k = {k}: IoU = {k}/{8-k} = {k/(8-k):3}, Dice = {2*k/8:3}"],
      steps: [["Two shared pixels: IoU 0.333, Dice 0.5.", { k: 2 }], ["Perfect overlap: both 1.", { k: 4 }]],
    }),
  },
  {
    t: "Mask R-CNN: detection plus masks",
    lv: 2,
    s: `{{Mask R-CNN}} extends Faster R-CNN with a third branch. After the region proposal network and RoI alignment (which samples features at fractional positions with bilinear interpolation, avoiding the rounding of RoI pooling), each region gets (1) a class, (2) a refined box and (3) a small binary mask (e.g. 28 × 28) that is resized into the box. One mask per class is predicted and the one for the predicted class is used, so classes do not compete for pixels. It is the standard instance-segmentation baseline.`,
    r: `Mask quality depends on the RoI resolution; thin structures suffer from the 28 × 28 mask size.`,
    i: `What does RoI Align fix compared with RoI pooling?`,
    c: py`
def bilinear(x, y, tl=10, tr=20, bl=30, br=40):
    return (1 - x) * (1 - y) * tl + x * (1 - y) * tr + (1 - x) * y * bl + x * y * br

print(bilinear(0.3, 0.6), round(0.3 * 7))`,
    v: rowflow("Mask R-CNN.", ["Image", "Backbone features", "Region proposals", "RoI Align", "Class + box + mask heads", "Instances"], [
      "Input photo.",
      "Convolutional feature maps.",
      "Candidate boxes.",
      "Fixed-size features at exact positions.",
      "Three outputs per region.",
      "Each object with its own mask.",
    ]),
  },
  {
    t: "Segment anything and foundation models",
    lv: 1,
    s: `Foundation models are trained on huge datasets and reused. {{Segment Anything (SAM)}} takes an image and a prompt — a click, a box or text — and returns masks for the indicated object without task-specific training. Vision–language models pair an image encoder with a text encoder, so you can describe what to find ("the red car on the left"). Practical use: speed up labelling (click, correct, accept), bootstrap a dataset, or run zero-shot where no labels exist. Still verify on your own images: accuracy varies by domain, and fine structures and unusual modalities (medical, thermal) can fail.`,
    r: `Treat foundation-model masks as proposals for a human to check when errors are costly.`,
    i: `How can promptable segmentation reduce labelling effort?`,
    c: py`
import numpy as np

mask = np.zeros((6, 6), int)
mask[1:4, 2:5] = 1
points = [(2, 3)]
print(int(mask.sum()), all(mask[r, c] for r, c in points))`,
    v: compare("Task-specific versus promptable models.", ["Task-specific", "Promptable (SAM-style)"], [
      ["Training for a new object", "labelled data and training", "none: give a click or box"],
      ["Output", "fixed set of classes", "mask for whatever you point at"],
      ["Strength", "accurate in its domain", "general, fast to label"],
      ["Weakness", "limited to its classes", "needs checking in new domains"],
    ]),
  },
];

/* ------------------------------------------------------------------ */
export const vit: ConceptDef[] = [
  {
    t: "Vision Transformer: images as sequences of patches",
    lv: 2,
    s: `A {{Vision Transformer (ViT)}} treats an image like a sentence. Cut a 224 × 224 image into 16 × 16 patches: 14 × 14 = 196 patches, each with 16 × 16 × 3 = 768 numbers. A linear layer maps each patch to a token embedding (768 → 768: 590,592 parameters), a learned position embedding is added, a special [CLS] token is prepended (197 tokens), and a stack of transformer encoder layers with self-attention processes them. The [CLS] output feeds the classifier. Self-attention lets every patch see every other patch from the first layer, while a CNN builds context gradually.`,
    r: `ViTs need lots of data (or pretraining) because they lack the CNN's built-in bias towards locality and translation invariance.`,
    i: `How many patches and tokens does a 224×224 image with 16×16 patches produce?`,
    c: py`
import numpy as np

img_size, patch = 224, 16
n = (img_size // patch) ** 2
dim_in = patch * patch * 3
print(n, n + 1, dim_in, dim_in * 768 + 768)
rng = np.random.default_rng(0)
img = rng.random((224, 224, 3))
patches = img.reshape(14, 16, 14, 16, 3).transpose(0, 2, 1, 3, 4).reshape(196, 768)
print(patches.shape)`,
    v: bars("Tokens for the chosen image and patch size.", [["patches", "pow(s/p,2)"], ["attention pairs (tokens²)", "pow(pow(s/p,2)+1,2)/100"]], {
      max: 600,
      params: [par("s", "image size", 112, 448, 16, 224), par("p", "patch size", 8, 32, 8, 16)],
      readout: ["{s}/{p} = {s/p} → {pow(s/p,2)} patches (attention pairs shown ÷ 100)"],
      steps: [["224 / 16: 196 patches.", { s: 224, p: 16 }], ["Smaller patches (8): four times as many tokens.", { s: 224, p: 8 }]],
    }),
  },
  {
    t: "Self-attention cost and the CNN comparison",
    lv: 2,
    s: `Attention compares every token with every other: N tokens need N² similarity scores. With 196 patches that is 38,416 per head; with 8 × 8 patches (784 tokens) it is 614,656 — 16 times more for 4 times the tokens. This quadratic growth limits ViT resolution, so variants use windows (Swin), hierarchies or token pruning. A CNN's cost grows linearly with pixels but sees only a local neighbourhood in each layer. In practice: CNNs are strong and efficient with modest data; ViTs win with large-scale pretraining and are the backbone of modern multimodal models.`,
    r: `Hybrid designs (convolutional stem, transformer body) combine both strengths.`,
    i: `By how much does the attention cost grow when the number of tokens quadruples?`,
    c: py`
for n in (196, 784, 3136):
    print(n, n * n, n * n // 196 ** 2)`,
    v: plot("Attention score matrix size against the number of tokens.", {
      x: [0, 1000], y: [0, 1000000], labels: ["tokens N", "N² scores"],
      params: [par("n", "tokens", 100, 1000, 10, 196)],
      readout: ["N = {n} → {n*n} scores"],
      steps: [["196 tokens: 38,416.", { n: 196 }], ["784 tokens: 16× more.", { n: 784 }]],
    }, [curve("x*x", { c: "accent" }), pt("n", "n*n", { c: "bad" })]),
  },
  {
    t: "Contrastive image–text learning (CLIP)",
    lv: 2,
    s: `{{CLIP}} trains an image encoder and a text encoder together on hundreds of millions of image–caption pairs. In a batch of N pairs, build the N × N matrix of cosine similarities; the diagonal holds the matching pairs. A softmax over each row (and each column) with a cross-entropy loss pushes the diagonal up and everything else down. For a 2-pair batch with logits [[4, 1], [0, 3]]: row 1 gives P(correct) = e⁴/(e⁴ + e¹) = 0.953 and row 2 gives e³/(e⁰ + e³) = 0.953. At test time zero-shot classification compares an image with the text "a photo of a {class}" for every class and picks the best match.`,
    r: `Prompt wording changes accuracy; evaluate several templates and ensemble them.`,
    i: `Compute the probability of the correct caption for each image in the 2×2 logit matrix.`,
    c: py`
import numpy as np

logits = np.array([[4.0, 1.0], [0.0, 3.0]])
p = np.exp(logits) / np.exp(logits).sum(axis=1, keepdims=True)
print(p.round(3).tolist(), round(float(-np.log(np.diag(p)).mean()), 3))`,
    v: cells("Similarity matrix of two images (rows) and two captions (columns).", table(["", "caption 1", "caption 2"], [["image 1", "4", "1"], ["image 2", "0", "3"]]), [
      ["The diagonal holds the true pairs."],
      ["Row softmax: image 1 picks caption 1 with 0.953.", [[1, 1, 1]]],
      ["Image 2 picks caption 2 with 0.953.", [[2, 2, 2]]],
    ]),
  },
  {
    t: "Self-supervised learning from unlabelled images",
    lv: 2,
    s: `Labels are costly, unlabelled images are not. {{Self-supervised}} methods invent a task from the data itself. {{Contrastive}} learning (SimCLR, MoCo): two augmented views of the same image should have similar embeddings, views of different images dissimilar. {{Masked image modelling}} (MAE): hide 75% of the patches and reconstruct them. {{Self-distillation}} (DINO): a student matches a teacher's output on different crops. The pretrained encoder is then fine-tuned with few labels. With 1% of the labels a good self-supervised encoder often matches a fully supervised model trained from scratch on much more.`,
    r: `Pretrain on images from your own domain when it differs a lot from web photos (microscopy, satellite).`,
    i: `How does masked image modelling create its training signal?`,
    c: py`
import numpy as np

rng = np.random.default_rng(0)
patches = np.arange(16)
masked = rng.choice(16, size=12, replace=False)
visible = np.setdiff1d(patches, masked)
print(len(masked), len(masked) / 16, sorted(visible.tolist()))`,
    v: compare("Self-supervised recipes.", ["Task", "Needs negatives?"], [
      ["Contrastive (SimCLR, MoCo)", "make two views of one image similar", "yes"],
      ["Masked autoencoder (MAE)", "reconstruct hidden patches", "no"],
      ["Self-distillation (DINO)", "student matches teacher on other crops", "no"],
    ]),
  },
];

/* ------------------------------------------------------------------ */
export const video: ConceptDef[] = [
  {
    t: "Optical flow: motion between frames",
    lv: 2,
    s: `{{Optical flow}} estimates how each pixel moved between two frames. The brightness-constancy assumption gives one equation per pixel: Iₓu + I_yv + I_t = 0, with spatial gradients Iₓ, I_y, temporal change I_t and unknown velocity (u, v). One equation, two unknowns (the {{aperture problem}}) — so {{Lucas–Kanade}} assumes the whole window moves together and solves the least-squares system. Window values Iₓ = (1, 0, 1, 0), I_y = (0, 1, 0, 1), I_t = (−2, −1, −2, −1) give AᵀA = diag(2, 2) and Aᵀb = (4, 2): velocity (u, v) = (2, 1). Deep networks (RAFT) now give much better dense flow.`,
    r: `The system is solvable only where the window has gradients in two directions — corners, again.`,
    i: `Solve for (u, v) with the window values above.`,
    c: py`
import numpy as np

Ix, Iy, It = np.array([1.0, 0, 1, 0]), np.array([0, 1.0, 0, 1]), np.array([-2.0, -1, -2, -1])
A = np.stack([Ix, Iy], axis=1)
uv = np.linalg.lstsq(A, -It, rcond=None)[0]
print((A.T @ A).tolist(), uv.round(3).tolist())`,
    v: cells("The Lucas–Kanade normal equations for a four-pixel window.", [P("AᵀA", ["2 0", "0 2"]), P("Aᵀb = −Σ I·I_t", ["4", "2"]), P("(u, v)", ["2", "1"])], [
      ["Sum the products of gradients over the window."],
      ["Solve the 2×2 system: u = 4/2, v = 2/2.", [[2, 0, 1]]],
    ]),
  },
  {
    t: "Background subtraction and frame differencing",
    lv: 1,
    s: `With a fixed camera, moving objects are what changes. {{Frame differencing}} thresholds |frame_t − frame_{t−1}|; it finds edges of motion but misses slow or stopped objects. {{Background subtraction}} keeps a model of the empty scene — a running average B ← (1 − α)B + αI with a small α like 0.05 — and flags pixels where |I − B| exceeds a threshold. Static pixels at 100 with a moving object at 200: difference 100 → foreground. Shadows, lighting changes and swaying trees cause false foreground; Gaussian-mixture models and learned models handle them better.`,
    r: `Clean the mask with morphological opening, then label connected components to get moving objects.`,
    i: `Update a background pixel B = 100 with a new value I = 200 using α = 0.05.`,
    c: py`
import numpy as np

B = np.full(5, 100.0)
frames = [np.array([100, 100, 200, 100, 100.0])] * 3
for I in frames:
    mask = np.abs(I - B) > 30
    B = np.where(mask, B, 0.95 * B + 0.05 * I)
    print(mask.astype(int).tolist(), B.round(1).tolist())`,
    v: plot("A background pixel's running-average estimate when the scene changes from 100 to 200.", {
      x: [0, 100], y: [90, 210], labels: ["frames", "background estimate"],
      params: [par("a", "learning rate α", 0.01, 0.3, 0.01, 0.05)],
      readout: ["after 20 frames: {200-100*pow(1-a,20):1}"],
      steps: [["α = 0.05: adapts over ≈ 20 frames.", { a: 0.05 }], ["α = 0.3: adapts quickly, may absorb slow objects.", { a: 0.3 }]],
    }, [curve("200-100*pow(1-a,x)", { c: "accent" }), hline("200", { c: "muted", dash: true })]),
  },
  {
    t: "Tracking: association and the Kalman filter",
    lv: 2,
    s: `Tracking links detections across frames to give each object a persistent identity. Typical recipe (tracking-by-detection): {{predict}} where each track should be now (constant-velocity motion model), {{associate}} predictions with new detections (highest IoU, solved with the Hungarian algorithm), {{update}} the matched tracks, start tracks for unmatched detections and delete tracks that stay unmatched. A one-dimensional {{Kalman filter}} blends prediction and measurement: position 10, velocity 2 → predicted 12; the detector says 13; with gain K = 0.5 the new estimate is 12 + 0.5 × (13 − 12) = 12.5. Re-identification features help when objects cross or leave and return.`,
    r: `Tracker quality depends on detector quality: most identity switches begin with a missed or merged detection.`,
    i: `Predict and update the position with the Kalman gain 0.5 for the numbers above.`,
    c: py`
import numpy as np

x, v, z, K = 10.0, 2.0, 13.0, 0.5
pred = x + v
est = pred + K * (z - pred)
print(pred, est)
def iou(a, b):
    ix = max(0, min(a[2], b[2]) - max(a[0], b[0])); iy = max(0, min(a[3], b[3]) - max(a[1], b[1]))
    i = ix * iy
    return i / ((a[2]-a[0])*(a[3]-a[1]) + (b[2]-b[0])*(b[3]-b[1]) - i)
tracks = [(0, 0, 10, 10), (50, 50, 60, 60)]
dets = [(52, 51, 62, 61), (1, 1, 11, 11)]
print([max(range(2), key=lambda j: iou(t, dets[j])) for t in tracks])`,
    v: rowflow("Tracking by detection.", ["Predict tracks", "Detect in the new frame", "Associate (IoU, Hungarian)", "Update matched tracks", "Create / delete tracks"], [
      "Motion model says where each object should be.",
      "A detector finds objects.",
      "Match predictions to detections.",
      "Blend prediction and measurement.",
      "New objects start tracks; lost ones expire.",
    ]),
  },
];

void [P, bars, cells, compare, curve, hline, par, plot, pt, seg, vline, table, rowflow];
