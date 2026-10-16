import { P, bars, cells, compare, curve, hline, par, plot, pt, seg, vline } from "../../visuals/kit.js";
import { py, type ConceptDef } from "../build.js";
import { table } from "../ml/data.js";
import { rowflow } from "../nlp/util.js";

/* Every code example is plain Python/NumPy and is RUN by `npm run outputs -- computer-vision`. */

const CONV = `
import numpy as np

def conv2d(img, k):
    h, w = k.shape
    return np.array([[(img[r:r + h, c:c + w] * k).sum() for c in range(img.shape[1] - w + 1)] for r in range(img.shape[0] - h + 1)])`;

export const img: ConceptDef[] = [
  {
    t: "What computer vision is",
    lv: 1,
    s: `{{Computer vision}} extracts meaning from images and video: what is in the picture ({{classification}}), where it is ({{detection}}), which pixels belong to it ({{segmentation}}), how far away it is (depth), how it moves (tracking, optical flow) and how to create images ({{generation}}). Classical methods use hand-designed steps — filters, edges, features — grounded in geometry and physics; modern ones learn the steps from data with deep networks. The two are complementary: pre-processing, geometry and evaluation still rely on classical ideas.`,
    r: `Most production systems mix both: classical code for cameras, calibration and post-processing, neural networks for recognition.`,
    i: `Name five computer-vision tasks and one application of each.`,
    c: py`
tasks = {
    "classification": "is this a defect?",
    "detection": "where are the cars?",
    "segmentation": "which pixels are road?",
    "depth": "how far is the obstacle?",
    "tracking": "follow a player across frames",
}
for k, v in tasks.items():
    print(f"{k:15s} {v}")`,
    v: compare("The main vision tasks and their outputs.", ["Output", "Example"], [
      ["Classification", "one label per image", "cat or dog"],
      ["Detection", "boxes + labels", "pedestrians in a street scene"],
      ["Segmentation", "a label per pixel", "tumour outline in a scan"],
      ["Depth / 3-D", "distance per pixel or point cloud", "robot navigation"],
      ["Tracking / flow", "motion over time", "sports analytics"],
    ]),
  },
  {
    t: "An image is an array of numbers",
    lv: 1,
    s: `A grayscale image is a matrix of intensities, usually 8-bit integers from 0 (black) to 255 (white); a colour image has three channels (red, green, blue), so its shape is {{height × width × 3}}. A 1920 × 1080 colour photo holds 1920 × 1080 × 3 = 6,220,800 numbers. Rows run top to bottom, so the pixel at (row r, column c) is img[r, c] — the origin is the top-left corner and y points down. Every vision algorithm is, in the end, arithmetic on these arrays.`,
    r: `Watch the conventions: libraries differ in channel order (OpenCV uses BGR) and in data type (uint8 0–255 versus float 0–1).`,
    i: `How many numbers does a 640 × 480 colour image contain?`,
    c: py`
import numpy as np

img = np.array([[0, 64, 128], [192, 255, 32]], dtype=np.uint8)
print(img.shape, img.dtype, img[1, 0], img.min(), img.max())
rgb = np.zeros((480, 640, 3), dtype=np.uint8)
print(rgb.shape, rgb.size)
print(np.uint8(250) + np.uint8(10), 250 + 10)`,
    v: cells("A 2×3 grayscale image: each cell is one pixel intensity.", [P("row 0", ["0", "64", "128"]), P("row 1", ["192", "255", "32"])], [
      ["Two rows and three columns of 8-bit values."],
      ["Black is 0, white is 255.", [[0, 0, 0], [1, 1, 1]]],
      ["img[1, 0] is row 1, column 0: 192.", [[1, 0, 0]]],
    ]),
  },
  {
    t: "Colour spaces: RGB, grayscale and HSV",
    lv: 1,
    s: `RGB matches how sensors and displays work, but its channels mix brightness and colour. {{Grayscale}} keeps brightness using weights that reflect human vision — green counts most: {{Y = 0.299 R + 0.587 G + 0.114 B}}. A pixel (200, 100, 50) has Y = 59.8 + 58.7 + 5.7 = 124.2. {{HSV}} separates hue (which colour), saturation (how pure) and value (brightness), which makes "find all red things whatever the lighting" simple. Other spaces: Lab (perceptual distances), YCbCr (video).`,
    r: `Converting to grayscale throws information away; for tasks where colour matters (ripe fruit, traffic lights) keep it.`,
    i: `Convert the pixel (200, 100, 50) to grayscale.`,
    c: py`
import colorsys

import numpy as np

pixel = np.array([200, 100, 50])
print(round(float(pixel @ [0.299, 0.587, 0.114]), 1))
h, s, v = colorsys.rgb_to_hsv(*(pixel / 255))
print(round(h * 360), round(s, 2), round(v, 2))`,
    v: bars("Contribution of each channel to the grayscale value of (200, 100, 50).", [["0.299 × R", "0.299*r"], ["0.587 × G", "0.587*g"], ["0.114 × B", "0.114*b"], ["Y", "0.299*r+0.587*g+0.114*b"]], {
      max: 255,
      params: [par("r", "red", 0, 255, 5, 200), par("g", "green", 0, 255, 5, 100), par("b", "blue", 0, 255, 5, 50)],
      readout: ["Y = {0.299*r+0.587*g+0.114*b:1}"],
      steps: [["The example pixel: Y = 124.2.", { r: 200, g: 100, b: 50 }], ["Pure green is much brighter than pure blue.", { r: 0, g: 255, b: 0 }]],
    }),
  },
  {
    t: "Histograms and contrast",
    lv: 1,
    s: `An image's {{histogram}} counts how many pixels have each intensity. A dark, low-contrast photo has all its pixels bunched into a narrow range. {{Contrast stretching}} rescales linearly: out = (x − min)/(max − min) × 255; for a pixel 90 in an image spanning 60–140 that gives 96. {{Gamma correction}} brightens or darkens mid-tones with out = 255 (x/255)^γ: γ < 1 brightens, γ > 1 darkens. Always inspect the histogram: clipped bars at 0 or 255 mean lost detail.`,
    r: `Apply contrast changes for display or as a pre-processing step; for learning, a network usually copes with raw but normalised pixels.`,
    i: `Stretch the value 90 in an image whose intensities range from 60 to 140.`,
    c: py`
import numpy as np

x = np.array([60, 90, 100, 140], dtype=float)
print(((x - x.min()) / (x.max() - x.min()) * 255).round().astype(int).tolist())
for g in (0.5, 1.0, 2.2):
    print(g, round(255 * (128 / 255) ** g))`,
    v: plot("Gamma curve: output against input intensity.", {
      x: [0, 255], y: [0, 255], labels: ["input", "output"],
      params: [par("g", "gamma γ", 0.3, 3, 0.1, 0.5)],
      readout: ["input 128 → output {255*pow(128/255,g):1}"],
      steps: [["γ = 0.5: shadows are lifted.", { g: 0.5 }], ["γ = 1: no change.", { g: 1 }], ["γ = 2.2: darker mid-tones.", { g: 2.2 }]],
    }, [curve("x", { c: "muted", dash: true }), curve("255*pow(x/255,g)", { c: "accent" })]),
  },
  {
    t: "Histogram equalization",
    lv: 2,
    s: `{{Equalization}} spreads the intensities so the histogram becomes roughly flat, using the cumulative distribution (CDF): new(v) = round( (CDF(v) − CDF_min) / (N − CDF_min) × (L − 1) ). A 4 × 4 image with 3-bit levels (0–7) has histogram [1, 3, 4, 4, 2, 1, 0, 1], CDF [1, 4, 8, 12, 14, 15, 15, 16]; with CDF_min = 1 the mapping is 0→0, 1→1, 2→3, 3→5, 4→6, 5→7, 7→7. Pixel 2 (the most common level region) is stretched to 3, level 3 to 5: contrast has increased where most pixels live. CLAHE applies this tile by tile with a clipping limit to avoid amplifying noise.`,
    r: `Equalization can over-enhance noise in flat regions; CLAHE is the usual remedy.`,
    i: `Compute the CDF and the equalised value of intensity 3 for the histogram above.`,
    c: py`
import numpy as np

img = np.array([[0, 1, 1, 2], [1, 2, 2, 3], [2, 3, 3, 4], [3, 4, 5, 7]])
hist = np.bincount(img.ravel(), minlength=8)
cdf = hist.cumsum()
cdf_min = cdf[cdf > 0].min()
lut = np.round((cdf - cdf_min) / (img.size - cdf_min) * 7).astype(int)
print(hist.tolist(), cdf.tolist())
print(lut.tolist())
print(lut[img].tolist())`,
    v: cells("Histogram, CDF and the equalising mapping for the 3-bit image.", table(["level", "0", "1", "2", "3", "4", "5", "6", "7"], [["count", "1", "3", "4", "4", "2", "1", "0", "1"], ["CDF", "1", "4", "8", "12", "14", "15", "15", "16"], ["new level", "0", "1", "3", "5", "6", "7", "7", "7"]]), [
      ["The CDF accumulates the counts."],
      ["Levels with many pixels have steep CDF steps.", [[2, 3, 4]]],
      ["Mapping: level 3 → 5, level 4 → 6: the crowded middle is spread out.", [[3, 4, 5]]],
    ]),
  },
  {
    t: "Noise: salt-and-pepper, Gaussian, shot",
    lv: 1,
    s: `Real images are noisy. {{Salt-and-pepper}} noise sets a few pixels to 0 or 255 (dead pixels, transmission errors). {{Gaussian}} noise adds a small random value to every pixel (sensor electronics); its standard deviation σ measures the damage. {{Shot}} noise comes from counting photons: its variance grows with brightness, which is why dark photos look grainy. The quality measure PSNR = 10 log₁₀(255²/MSE) compares a processed image with the clean original; noise of σ = 10 gives MSE ≈ 100 and PSNR ≈ 28 dB.`,
    r: `Choose the denoiser to match the noise: a median filter for salt-and-pepper, a Gaussian or non-local means for Gaussian noise.`,
    i: `Compute the PSNR for an MSE of 100 with 8-bit images.`,
    c: py`
import numpy as np

rng = np.random.default_rng(0)
clean = np.full((100, 100), 120.0)
noisy = clean + rng.normal(0, 10, clean.shape)
mse = float(((noisy - clean) ** 2).mean())
print(round(mse, 1), round(10 * np.log10(255 ** 2 / mse), 1))
sp = clean.copy()
sp[rng.random(clean.shape) < 0.05] = 255
print(round(float((sp == 255).mean()), 3))`,
    v: plot("PSNR against the noise standard deviation σ (8-bit, MSE = σ²).", {
      x: [1, 60], y: [10, 50], labels: ["noise σ", "PSNR (dB)"],
      params: [par("s", "noise σ", 1, 60, 1, 10)],
      readout: ["σ = {s} → MSE {s*s} → PSNR {10*log10(255*255/(s*s)):1} dB"],
      steps: [["σ = 10: about 28 dB.", { s: 10 }], ["σ = 40: heavily degraded, 16 dB.", { s: 40 }]],
    }, [curve("10*log10(255*255/(x*x))", { c: "accent" }), pt("s", "10*log10(255*255/(s*s))", { c: "bad" })]),
  },
  {
    t: "Sampling and quantization",
    lv: 1,
    s: `Digitising an image means {{sampling}} (measuring the light at a grid of positions — the resolution) and {{quantization}} (rounding each measurement to one of 2^b levels — the bit depth). With b = 8 there are 256 grey levels; with b = 3 only 8, which causes visible banding. Halving the resolution cuts the pixel count to a quarter. File size follows directly: 1920 × 1080 × 3 bytes ≈ 6.2 MB uncompressed. Too few samples cause aliasing (jagged edges, moiré), which is why images are blurred slightly before being downsampled.`,
    r: `Resolution is a cost–accuracy trade-off: a model on 224 × 224 inputs is far cheaper than on 1024 × 1024 and often accurate enough.`,
    i: `How many grey levels do 3-bit and 8-bit quantization give, and how many bytes is a 1920 × 1080 RGB image?`,
    c: py`
import numpy as np

x = np.linspace(0, 255, 6)
for bits in (3, 8):
    levels = 2 ** bits
    q = np.round(x / 255 * (levels - 1)) / (levels - 1) * 255
    print(bits, levels, q.round().astype(int).tolist())
print(1920 * 1080 * 3, (1920 // 2) * (1080 // 2) * 3)`,
    v: plot("Quantization of a smooth ramp: fewer bits mean larger steps.", {
      x: [0, 255], y: [0, 255], labels: ["input intensity", "quantized output"],
      params: [par("b", "bits per pixel", 1, 8, 1, 3)],
      readout: ["{pow(2,b)} grey levels, step size {255/(pow(2,b)-1):1}"],
      steps: [["3 bits: eight steps.", { b: 3 }], ["8 bits: indistinguishable from smooth.", { b: 8 }]],
    }, [curve("x", { c: "muted", dash: true }), curve("floor(x/255*(pow(2,b)-1)+0.5)/(pow(2,b)-1)*255", { c: "accent" })]),
  },
];

/* ------------------------------------------------------------------ */
export const filt: ConceptDef[] = [
  {
    t: "Convolution: sliding a kernel",
    lv: 1,
    s: `A {{filter}} replaces every pixel by a weighted sum of its neighbourhood, with the weights stored in a small matrix, the {{kernel}}. Slide it over the image, multiply, add: out(r, c) = Σ img(r + i, c + j) · k(i, j). Image processing libraries mean correlation when they say convolution (no kernel flip). The output is smaller than the input by (kernel size − 1) unless the border is padded. The same operation, with learned kernels, is the building block of convolutional neural networks.`,
    r: `Padding choices (zeros, reflect, replicate) matter at the border: zero-padding creates dark rims.`,
    i: `What size is the output for a 6 × 6 image and a 3 × 3 kernel without padding?`,
    c: py`${CONV}
img = np.arange(25).reshape(5, 5).astype(float)
k = np.ones((3, 3)) / 9
out = conv2d(img, k)
print(out.shape)
print(out.round(1).tolist())`,
    v: cells("A 3×3 averaging kernel at the first position of a 5×5 ramp image.", [P("rows 0–2, cols 0–2", ["0 1 2", "5 6 7", "10 11 12"]), P("kernel", ["1/9 1/9 1/9", "1/9 1/9 1/9", "1/9 1/9 1/9"]), P("output pixel", ["= mean = 6"])], [
      ["Multiply the 3×3 patch by the kernel and add."],
      ["Every weight is 1/9, so the output is the mean of the nine pixels: 6.", [[2, 0, 0]]],
    ]),
  },
  {
    t: "Blurring: box and Gaussian filters",
    lv: 1,
    s: `Blurring averages neighbours to suppress noise. A {{box filter}} gives equal weight to a k × k square. A {{Gaussian filter}} weights pixels by exp(−d²/2σ²), so near pixels count more and the result is smoother and free of blocky artefacts; the 3 × 3 kernel for σ = 1 is about [[0.075, 0.124, 0.075], [0.124, 0.204, 0.124], [0.075, 0.124, 0.075]] (weights sum to 1). Larger σ blurs more but also destroys fine detail and edges. Gaussian kernels are {{separable}}: a 2-D blur equals a 1-D blur along rows then along columns, cutting the cost from k² to 2k multiplications per pixel.`,
    r: `Blurring before edge detection or downsampling is standard practice: it removes noise and prevents aliasing.`,
    i: `Why is the Gaussian filter separable and why does that help?`,
    c: py`
import numpy as np

x = np.array([-1.0, 0.0, 1.0])
g = np.exp(-x ** 2 / 2)
g /= g.sum()
k2 = np.outer(g, g)
print(g.round(3).tolist())
print(k2.round(3).tolist(), round(float(k2.sum()), 3))
print(3 * 3, 3 + 3, 15 * 15, 15 + 15)`,
    v: plot("1-D Gaussian weights for the chosen σ (the kernel is sampled at integer offsets).", {
      x: [-5, 5], y: [0, 0.5], labels: ["offset from the centre pixel", "weight"],
      params: [par("s", "σ", 0.5, 3, 0.25, 1)],
      readout: ["centre weight ≈ {1/(sqrt(2*3.14159265)*s):3}; larger σ spreads weight over more neighbours"],
      steps: [["σ = 1: mostly the nearest neighbours.", { s: 1 }], ["σ = 3: a wide, strong blur.", { s: 3 }]],
    }, [curve("exp(-x*x/(2*s*s))/(sqrt(2*3.14159265)*s)", { c: "accent" })]),
  },
  {
    t: "The median filter and salt-and-pepper noise",
    lv: 1,
    s: `The {{median filter}} replaces each pixel by the median of its neighbourhood — a non-linear operation. A flat patch [[10, 12, 11], [9, 255, 10], [11, 12, 10]] contains one hot pixel (255). The mean of the nine values is 37.8, so a blur smears the outlier into its neighbours; the median is 11, so the outlier disappears completely and edges stay sharp. That is why the median filter is the standard cure for salt-and-pepper noise, while Gaussian blur suits Gaussian noise.`,
    r: `Median filtering costs more than a convolution (sorting) but is robust to outliers.`,
    i: `Compute the mean and the median of the 3×3 patch above.`,
    c: py`
import numpy as np

patch = np.array([[10, 12, 11], [9, 255, 10], [11, 12, 10]])
print(round(float(patch.mean()), 1), float(np.median(patch)))
rng = np.random.default_rng(0)
img = np.full((20, 20), 100.0)
img[rng.random(img.shape) < 0.05] = 255
def median3(a):
    return np.array([[np.median(a[r:r + 3, c:c + 3]) for c in range(a.shape[1] - 2)] for r in range(a.shape[0] - 2)])
print(int((img == 255).sum()), int((median3(img) == 255).sum()))`,
    v: bars("Filter outputs for the centre pixel as its (outlier) value grows; the other eight pixels are 9–12.", [["mean of the nine pixels", "(85+o)/9"], ["median of the nine pixels", "11"]], {
      max: 40,
      params: [par("o", "centre pixel value", 12, 255, 1, 255)],
      readout: ["centre = {o}: mean = {(85+o)/9:1}, median = 11 whatever the outlier is"],
      steps: [["The hot pixel 255: mean 37.8, median 11.", { o: 255 }], ["No outlier (value 12): both agree.", { o: 12 }]],
    }),
  },
  {
    t: "Sharpening and the Laplacian",
    lv: 2,
    s: `The {{Laplacian}} kernel [[0, 1, 0], [1, −4, 1], [0, 1, 0]] measures how different a pixel is from its neighbours (a second derivative): it is zero on flat areas and ramps and responds at edges and corners. {{Sharpening}} adds some of that detail back: sharpened = original − α·Laplacian. With α = 1 the kernel [[0, −1, 0], [−1, 5, −1], [0, −1, 0]] results. {{Unsharp masking}} does the same by subtracting a blurred copy: out = img + amount × (img − blur). Too much sharpening amplifies noise and produces halos.`,
    r: `Because the Laplacian is a second derivative it is very noise-sensitive; blur first (Laplacian of Gaussian).`,
    i: `Apply the Laplacian to a flat patch and to a patch with a bright centre.`,
    c: py`
import numpy as np

lap = np.array([[0, 1, 0], [1, -4, 1], [0, 1, 0]])
flat = np.full((3, 3), 50)
spot = flat.copy()
spot[1, 1] = 90
print(int((flat * lap).sum()), int((spot * lap).sum()))
sharp = np.array([[0, -1, 0], [-1, 5, -1], [0, -1, 0]])
print(int((spot * sharp).sum()))`,
    v: cells("Laplacian response at a bright centre pixel.", [P("patch", ["50 50 50", "50 90 50", "50 50 50"]), P("Laplacian", ["0 1 0", "1 −4 1", "0 1 0"]), P("response", ["200 − 360 = −160"])], [
      ["On a flat patch the response is 0."],
      ["Four neighbours contribute 4 × 50 = 200, the centre −4 × 90 = −360: response −160.", [[2, 0, 0]]],
    ]),
  },
  {
    t: "Image gradients and the Sobel operator",
    lv: 1,
    s: `An edge is a place where intensity changes quickly, so edges are found with the {{gradient}}: ∂I/∂x (change across columns) and ∂I/∂y (change down rows). The {{Sobel}} kernels combine a derivative with a little smoothing: Kx = [[−1, 0, 1], [−2, 0, 2], [−1, 0, 1]] and Ky = Kxᵀ. On a 6 × 6 image that is 0 on the left half and 100 on the right, Gₓ is 0, 400, 400, 0 across the first row and G_y is 0 everywhere. The {{magnitude}} √(Gₓ² + G_y²) says how strong the edge is, the {{direction}} atan2(G_y, Gₓ) says which way it points.`,
    r: `Edge strength depends on contrast; normalise or threshold relative to the image.`,
    i: `What are Gₓ and G_y for a vertical step edge, and what does the magnitude look like?`,
    c: py`${CONV}
img = np.zeros((6, 6))
img[:, 3:] = 100
Kx = np.array([[-1, 0, 1], [-2, 0, 2], [-1, 0, 1]])
gx, gy = conv2d(img, Kx), conv2d(img, Kx.T)
print(gx[0].tolist(), gy[0].tolist())
print(np.hypot(gx, gy)[0].tolist())
print(round(float(np.degrees(np.arctan2(gy[0, 1], gx[0, 1]))), 1))`,
    v: cells("Sobel response on a vertical step edge (left half 0, right half 100).", table(["", "x=0", "x=1", "x=2", "x=3"], [["Gₓ", "0", "400", "400", "0"], ["G_y", "0", "0", "0", "0"], ["magnitude", "0", "400", "400", "0"]]), [
      ["The step lies between columns 2 and 3 of the original image."],
      ["Only the two output columns that straddle the step respond.", [[1, 2, 3], [3, 2, 3]]],
      ["G_y is zero: nothing changes down the rows.", [[2, 1, 4]]],
    ]),
  },
  {
    t: "Canny edge detection",
    lv: 2,
    s: `Canny's detector turns noisy gradients into thin, connected edges in four steps. (1) {{Smooth}} with a Gaussian. (2) Compute gradient magnitude and direction. (3) {{Non-maximum suppression}}: keep a pixel only if it is the largest along the gradient direction, thinning ridges to one pixel. (4) {{Hysteresis thresholding}}: pixels above a high threshold are strong edges; pixels between the low and high thresholds are kept only if connected to a strong edge. With thresholds (50, 150), a pixel of 120 survives if it touches a pixel of 200 but not otherwise. This suppresses noise while keeping real, connected contours.`,
    r: `A common starting point is high = 2–3 × low; tune on your images.`,
    i: `Describe the four steps of Canny and what hysteresis achieves.`,
    c: py`
import numpy as np

mag = np.array([0, 40, 120, 200, 130, 60, 0])
low, high = 50, 150
strong = mag >= high
weak = (mag >= low) & ~strong
keep = strong.copy()
for _ in range(3):
    for i in range(1, len(mag) - 1):
        if weak[i] and (keep[i - 1] or keep[i + 1]):
            keep[i] = True
print(strong.astype(int).tolist(), keep.astype(int).tolist())`,
    v: rowflow("Canny edge detection.", ["Image", "Gaussian smoothing", "Gradient magnitude + direction", "Non-maximum suppression", "Hysteresis thresholds", "Edge map"], [
      "Input photo.",
      "Reduce noise.",
      "Sobel gives strength and direction.",
      "Thin ridges to one pixel.",
      "Keep weak edges only if linked to strong ones.",
      "Thin, connected contours.",
    ]),
  },
  {
    t: "Separable filters and cost",
    lv: 2,
    s: `A 2-D kernel is {{separable}} if it is an outer product of two 1-D vectors, k = a bᵀ; then convolving with k equals convolving rows with b and columns with a. A k × k kernel costs k² multiplications per pixel directly but only 2k separably: for k = 15 that is 225 versus 30. The Gaussian and box filters are separable; Sobel is too: [[1], [2], [1]] times [−1, 0, 1]. For large kernels the FFT (convolution = pointwise product in the frequency domain) is faster still. Efficiency matters because vision code runs on millions of pixels, often in real time.`,
    r: `Check separability with the matrix rank: a separable kernel has rank 1.`,
    i: `How many multiplications per pixel does a 15 × 15 kernel need directly and as a separable pair?`,
    c: py`${CONV}
a, b = np.array([1.0, 2.0, 1.0]), np.array([-1.0, 0.0, 1.0])
K = np.outer(a, b)
img = np.random.default_rng(0).random((8, 8))
direct = conv2d(img, K)
rows = np.array([[(img[r, c:c + 3] * b).sum() for c in range(6)] for r in range(8)])
both = np.array([[(rows[r:r + 3, c] * a).sum() for c in range(6)] for r in range(6)])
print(K.tolist(), int(np.linalg.matrix_rank(K)), bool(np.allclose(direct, both)))
print(15 * 15, 2 * 15)`,
    v: plot("Multiplications per pixel for a k × k kernel: direct versus separable.", {
      x: [1, 31], y: [0, 400], labels: ["kernel size k", "multiplications"],
      params: [par("k", "k", 3, 31, 2, 15)],
      readout: ["k = {k}: direct {k*k}, separable {2*k}"],
      steps: [["k = 3: both are cheap.", { k: 3 }], ["k = 15: 225 versus 30.", { k: 15 }]],
    }, [curve("x*x", { c: "bad", label: "direct" }), curve("2*x", { c: "good", label: "separable" }), pt("k", "k*k", { c: "bad" }), pt("k", "2*k", { c: "good" })]),
  },
];

void [bars, hline, seg, vline, P, compare];
