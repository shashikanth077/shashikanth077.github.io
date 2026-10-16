import { P, bars, cells, compare, curve, hline, par, plot, pt, seg, vline } from "../../visuals/kit.js";
import { py, type ConceptDef } from "../build.js";
import { table } from "../ml/data.js";
import { rowflow } from "../nlp/util.js";

/* Every code example is plain Python/NumPy and is RUN by `npm run outputs -- computer-vision`. */

const grid = (rows: string[][]) => table(["", ...rows[0]!.map((_, i) => `c${i}`)], rows.map((r, i) => [`r${i}`, ...r]));

export const segm: ConceptDef[] = [
  {
    t: "Thresholding and Otsu's method",
    lv: 1,
    s: `The simplest segmentation turns a grayscale image into foreground and background: pixel = 1 if intensity ≥ T. A {{global}} threshold works if lighting is even; {{adaptive}} thresholds use the local mean when it is not. {{Otsu's method}} picks T automatically by maximising the between-class variance σ²_B = w₀ w₁ (μ₀ − μ₁)² of the two groups the threshold creates. For the bimodal histogram [0, 5, 20, 5, 0, 0, 6, 18, 6, 0] (dark peak at 2, bright peak at 7) any threshold from 4 to 6 separates the two modes with σ²_B = 6.25, far above a threshold placed inside a peak (T = 2: 1.11).`,
    r: `Otsu assumes two classes of roughly similar size; with a tiny foreground the threshold is biased.`,
    i: `Why does Otsu choose a threshold between the two peaks of a bimodal histogram?`,
    c: py`
import numpy as np

hist = np.array([0, 5, 20, 5, 0, 0, 6, 18, 6, 0], float)
p = hist / hist.sum()
levels = np.arange(10)
for t in range(2, 9):
    w0, w1 = p[:t].sum(), p[t:].sum()
    if w0 == 0 or w1 == 0:
        continue
    m0, m1 = (levels[:t] * p[:t]).sum() / w0, (levels[t:] * p[t:]).sum() / w1
    print(t, round(float(w0 * w1 * (m0 - m1) ** 2), 3))`,
    v: bars("Between-class variance for each candidate threshold of the bimodal histogram.", [["T = 2", "1.114"], ["T = 3", "5.207"], ["T = 4", "6.25"], ["T = 5", "6.25"], ["T = 6", "6.25"], ["T = 7", "5.042"], ["T = 8", "1.361"]], {
      max: 7,
    }),
  },
  {
    t: "Connected components and labelling",
    lv: 1,
    s: `After thresholding, which foreground pixels belong to the same object? {{Connected-component labelling}} gives every group of touching foreground pixels its own number. Touching can mean 4-connected (up, down, left, right) or 8-connected (also diagonals): two pixels that meet only at a corner are separate objects under 4-connectivity but one object under 8-connectivity. Once labelled, each component can be measured: area (pixel count), bounding box, centroid. The usual algorithm is a flood fill or a two-pass union–find.`,
    r: `Pick the connectivity to match the object: 8-connectivity for thin lines, 4 for blobs that should stay separate.`,
    i: `How many components do the pixels of the 5×5 image below form with 4- and with 8-connectivity?`,
    c: py`
import numpy as np

img = np.array([[1, 1, 0, 0, 0],
                [1, 0, 0, 1, 0],
                [0, 0, 1, 0, 0],
                [0, 0, 0, 0, 1],
                [1, 0, 0, 1, 1]])

def label(img, diag):
    steps = [(-1, 0), (1, 0), (0, -1), (0, 1)] + ([(-1, -1), (-1, 1), (1, -1), (1, 1)] if diag else [])
    lab, n = np.zeros(img.shape, int), 0
    for r in range(img.shape[0]):
        for c in range(img.shape[1]):
            if img[r, c] and not lab[r, c]:
                n += 1
                stack = [(r, c)]
                while stack:
                    y, x = stack.pop()
                    if 0 <= y < img.shape[0] and 0 <= x < img.shape[1] and img[y, x] and not lab[y, x]:
                        lab[y, x] = n
                        stack += [(y + dy, x + dx) for dy, dx in steps]
    return n, lab

print(label(img, False)[0], label(img, True)[0])
print(label(img, True)[1].tolist())`,
    v: compare("The same image under the two connectivity rules.", ["Components"], [
      ["4-connected", "5 (diagonal neighbours are separate)"],
      ["8-connected", "4 (the diagonal pair joins)"],
    ]),
  },
  {
    t: "Morphology: erosion and dilation",
    lv: 1,
    s: `Morphological operations probe a binary image with a small {{structuring element}}. {{Erosion}} keeps a pixel only if the whole element fits inside the foreground — objects shrink and thin protrusions vanish: a 3 × 3 square eroded by a 3 × 3 element leaves 1 pixel. {{Dilation}} sets a pixel if the element touches the foreground — objects grow and small holes close. {{Opening}} (erode then dilate) removes specks; {{closing}} (dilate then erode) fills gaps. The difference between dilation and erosion outlines the object.`,
    r: `Use opening to clean up thresholded noise and closing to join broken strokes, e.g. in text or cell masks.`,
    i: `What does a 3×3 erosion do to a 3×3 square and to an isolated pixel?`,
    c: py`
import numpy as np

B = np.zeros((7, 7), int)
B[1:4, 1:4] = 1
B[5, 5] = 1

def morph(a, op):
    p = np.pad(a, 1)
    f = np.min if op == "erode" else np.max
    return np.array([[f(p[r:r + 3, c:c + 3]) for c in range(a.shape[1])] for r in range(a.shape[0])])

opened = morph(morph(B, "erode"), "dilate")
print(B.sum(), morph(B, "erode").sum(), opened.sum())
print(opened.tolist())`,
    v: cells("Opening removes the isolated pixel and keeps the square.", grid([["0", "0", "0", "0", "0", "0", "0"], ["0", "1", "1", "1", "0", "0", "0"], ["0", "1", "1", "1", "0", "0", "0"], ["0", "1", "1", "1", "0", "0", "0"], ["0", "0", "0", "0", "0", "0", "0"], ["0", "0", "0", "0", "0", "1", "0"], ["0", "0", "0", "0", "0", "0", "0"]]), [
      ["A 3×3 square and a single noise pixel (10 foreground pixels in total)."],
      ["Erosion shrinks the square to its centre and deletes the isolated pixel.", [[2, 2, 2], [6, 5, 5]]],
      ["Dilation regrows the square: opening removed the noise and kept the object.", [[1, 1, 3], [2, 1, 3], [3, 1, 3]]],
    ]),
  },
  {
    t: "Finding lines: the Hough transform",
    lv: 2,
    s: `A line can be written ρ = x cos θ + y sin θ. Every edge pixel (x, y) votes for all (ρ, θ) pairs of lines through it; points on a common line all vote for the same cell, so peaks in the accumulator are lines. Four points (0,0), (1,1), (2,2), (3,3) lie on y = x: for θ = 135° each gives ρ = 0 — four votes in one cell, while other cells get at most 1–2. The method is robust to gaps and noise because it needs only a vote majority. Circles use a 3-parameter version (centre and radius).`,
    r: `Probabilistic Hough (sampling points) is the usual fast variant in practice.`,
    i: `Which (ρ, θ) cell collects the four votes for the points on y = x?`,
    c: py`
import numpy as np

points = [(0, 0), (1, 1), (2, 2), (3, 3)]
thetas = np.arange(0, 180, 45)
votes = {}
for x, y in points:
    for th in thetas:
        rho = round(x * np.cos(np.radians(th)) + y * np.sin(np.radians(th)), 2)
        votes[(rho, int(th))] = votes.get((rho, int(th)), 0) + 1
best = max(votes, key=votes.get)
print((float(best[0]), best[1]), votes[best])`,
    v: plot("The four points (0,0)…(3,3) and the line y = x that gets four votes.", {
      x: [-1, 4], y: [-1, 4], labels: ["x", "y"],
    }, [seg("-1", "-1", "4", "4", { c: "accent" }), pt("0", "0", { c: "warn" }), pt("1", "1", { c: "warn" }), pt("2", "2", { c: "warn" }), pt("3", "3", { c: "warn" })]),
  },
  {
    t: "Colour segmentation with k-means",
    lv: 2,
    s: `Treat each pixel as a point (R, G, B) and run {{k-means}}: choose k centres, assign every pixel to the nearest centre, move the centres to the mean of their pixels, repeat. The result groups pixels by colour: with k = 2 a red apple on a green background separates into two clusters, and replacing every pixel by its centre gives a "posterised" picture. Pixels far apart in the image but similar in colour end up together, which is why colour-only segmentation can be noisy; adding the (x, y) position to the feature vector makes regions spatially compact.`,
    r: `Convert to Lab or HSV first for distances that match human colour perception.`,
    i: `Why add pixel coordinates to the colour features?`,
    c: py`
import numpy as np

rng = np.random.default_rng(0)
red = rng.normal([200, 30, 30], 10, (50, 3))
green = rng.normal([40, 160, 50], 10, (50, 3))
X = np.vstack([red, green])
centres = X[[0, 60]].copy()
for _ in range(10):
    labels = np.argmin(((X[:, None] - centres[None]) ** 2).sum(axis=2), axis=1)
    centres = np.array([X[labels == k].mean(axis=0) for k in range(2)])
print(centres.round(0).tolist(), np.bincount(labels).tolist())`,
    v: rowflow("k-means colour segmentation.", ["Pixels as (R,G,B) points", "Pick k centres", "Assign each pixel to the nearest", "Move centres to the means", "Repeat until stable", "Recolour pixels by centre"], [
      "Each pixel becomes a 3-D point.",
      "For example k = 2 or 3.",
      "Nearest in colour space.",
      "Centre = average colour of its group.",
      "Assignments stop changing.",
      "The image is segmented into k colours.",
    ]),
  },
  {
    t: "Describing a region: area, centroid and shape",
    lv: 1,
    s: `Once a region is isolated, simple numbers describe it. {{Area}} = pixel count. {{Centroid}} = mean of the pixel coordinates. {{Bounding box}} = min and max coordinates. {{Perimeter}} counts boundary pixels. {{Circularity}} = 4π·area / perimeter² is 1 for a perfect circle and smaller for elongated shapes: a disc of radius 10 has area ≈ 314 and perimeter ≈ 62.8, circularity ≈ 1.0; a 1 × 100 strip has circularity ≈ 0.03. Such features feed classical inspection systems (is this screw the right size, is this cell round?).`,
    r: `Convert pixels to real units with the camera's scale (mm per pixel) before applying tolerances.`,
    i: `Compute the centroid and area of the region with pixel coordinates (1,1), (1,2), (2,1), (2,2), (3,2).`,
    c: py`
import numpy as np

pixels = np.array([(1, 1), (1, 2), (2, 1), (2, 2), (3, 2)])
print(len(pixels), pixels.mean(axis=0).tolist(), pixels.min(axis=0).tolist(), pixels.max(axis=0).tolist())
circ = lambda area, per: 4 * np.pi * area / per ** 2
print(round(float(circ(np.pi * 10 ** 2, 2 * np.pi * 10)), 2), round(float(circ(100, 202)), 3))`,
    v: compare("Simple region descriptors.", ["Definition", "Example value"], [
      ["Area", "number of pixels", "5"],
      ["Centroid", "mean (row, column)", "(1.8, 1.6)"],
      ["Bounding box", "min and max coordinates", "rows 1–3, columns 1–2"],
      ["Circularity", "4π·area / perimeter²", "1 for a circle"],
    ]),
  },
];

/* ------------------------------------------------------------------ */
export const geom: ConceptDef[] = [
  {
    t: "Geometric transforms: translate, scale, rotate",
    lv: 1,
    s: `Moving, resizing or turning an image maps every point (x, y) to a new place. {{Translation}}: (x + tₓ, y + t_y). {{Scaling}}: (sₓx, s_yy). {{Rotation}} by θ: (x cos θ − y sin θ, x sin θ + y cos θ); the point (1, 0) rotated by 30° lands at (0.866, 0.5). {{Rigid}} transforms (rotation + translation) preserve lengths and angles; {{similarity}} adds uniform scale; {{affine}} adds shear and non-uniform scale and keeps parallel lines parallel; {{projective}} (homography) does not even keep parallelism.`,
    r: `In image coordinates y points down, so a "counter-clockwise" formula appears clockwise on screen.`,
    i: `Rotate the point (1, 0) by 30°.`,
    c: py`
import numpy as np

t = np.radians(30)
R = np.array([[np.cos(t), -np.sin(t)], [np.sin(t), np.cos(t)]])
print((R @ [1, 0]).round(3).tolist(), round(float(np.linalg.det(R)), 3))
print(np.linalg.norm(R @ [3, 4]))`,
    v: plot("A point at angle 0 rotated by the chosen angle (unit circle).", {
      x: [-1.2, 1.2], y: [-1.2, 1.2], labels: ["x", "y"],
      params: [par("a", "rotation angle (degrees)", 0, 180, 5, 30)],
      readout: ["(1, 0) → ({cos(a*3.14159265/180):3}, {sin(a*3.14159265/180):3})"],
      steps: [["30°: (0.866, 0.5).", { a: 30 }], ["90°: (0, 1).", { a: 90 }]],
    }, [curve("sqrt(1-x*x)", { c: "muted", dash: true }), pt("1", "0", { c: "info" }), pt("cos(a*3.14159265/180)", "sin(a*3.14159265/180)", { c: "bad" })]),
  },
  {
    t: "Homogeneous coordinates and the 3×3 matrix",
    lv: 2,
    s: `Translation is not a matrix multiplication of (x, y) — but it becomes one if we add a coordinate: (x, y) → (x, y, 1). Then any similarity or affine transform is one 3 × 3 matrix, and transforms compose by multiplying matrices. M = [[2, 0, 5], [0, 2, 3], [0, 0, 1]] scales by 2 and shifts by (5, 3): the point (1, 1) becomes (7, 5). To invert a transform, invert the matrix. For a projective transform the last row is not (0, 0, 1) and you divide by the third coordinate at the end.`,
    r: `Order matters: rotate-then-translate differs from translate-then-rotate.`,
    i: `Apply M to the point (1, 1) in homogeneous coordinates.`,
    c: py`
import numpy as np

M = np.array([[2, 0, 5], [0, 2, 3], [0, 0, 1]], float)
print((M @ [1, 1, 1]).tolist())
T = np.array([[1, 0, 5], [0, 1, 3], [0, 0, 1]], float)
S = np.array([[2, 0, 0], [0, 2, 0], [0, 0, 1]], float)
print((T @ S @ [1, 1, 1]).tolist(), (S @ T @ [1, 1, 1]).tolist())`,
    v: cells("A 3×3 matrix acting on the homogeneous point (1, 1, 1).", [P("M", ["2 0 5", "0 2 3", "0 0 1"]), P("point", ["1", "1", "1"]), P("M · point", ["7", "5", "1"])], [
      ["The matrix scales by 2 and translates by (5, 3)."],
      ["Row 1: 2·1 + 0·1 + 5·1 = 7.", [[2, 0, 0]]],
      ["Row 2: 0·1 + 2·1 + 3·1 = 5; the last coordinate stays 1.", [[2, 1, 2]]],
    ]),
  },
  {
    t: "Interpolation: resampling between pixels",
    lv: 2,
    s: `After a transform the source position of an output pixel is rarely an integer, so we must estimate the intensity in between. {{Nearest-neighbour}} copies the closest pixel (fast, blocky). {{Bilinear}} blends the four surrounding pixels: with corner values 10 (top-left), 20, 30, 40 and a point at fractional offset (x, y) = (0.25, 0.75): value = (1−x)(1−y)10 + x(1−y)20 + (1−x)y·30 + xy·40 = 27.5. At the centre (0.5, 0.5) it is the average, 25. {{Bicubic}} uses 16 neighbours for smoother results. Use nearest for label images (masks), bilinear or bicubic for photos.`,
    r: `Interpolating label maps with bilinear invents labels that do not exist: always use nearest for masks.`,
    i: `Interpolate bilinearly at (0.25, 0.75) between corner values 10, 20, 30, 40.`,
    c: py`
def bilinear(x, y, tl=10, tr=20, bl=30, br=40):
    return (1 - x) * (1 - y) * tl + x * (1 - y) * tr + (1 - x) * y * bl + x * y * br

print(bilinear(0.25, 0.75), bilinear(0.5, 0.5), bilinear(0, 0), bilinear(1, 1))`,
    v: bars("Interpolated value at (x, y) between corners 10, 20 / 30, 40.", [["bilinear value", "(1-x)*(1-y)*10+x*(1-y)*20+(1-x)*y*30+x*y*40"], ["nearest neighbour", "10+10*floor(x+0.5)+20*floor(y+0.5)"]], {
      max: 45,
      params: [par("x", "x offset", 0, 1, 0.05, 0.25), par("y", "y offset", 0, 1, 0.05, 0.75)],
      readout: ["bilinear({x}, {y}) = {(1-x)*(1-y)*10+x*(1-y)*20+(1-x)*y*30+x*y*40:2}"],
      steps: [["(0.25, 0.75): 27.5.", { x: 0.25, y: 0.75 }], ["Centre: the average, 25.", { x: 0.5, y: 0.5 }]],
    }),
  },
  {
    t: "The pinhole camera model",
    lv: 1,
    s: `A camera maps the 3-D world onto the image plane. In the {{pinhole model}} a point (X, Y, Z) in camera coordinates projects to {{x = f·X/Z, y = f·Y/Z}}: distant objects (large Z) appear smaller. With focal length f = 800 pixels, a point 2 m to the side at depth 10 m lands 160 pixels from the centre; at depth 5 m it lands 320 pixels away. Adding the principal point (c_x, c_y) gives pixel coordinates u = f X/Z + c_x, v = f Y/Z + c_y; (1, 0.5, 5) with c = (320, 240) projects to (480, 320). Real lenses add distortion that calibration removes.`,
    r: `Depth is lost in projection: one image cannot tell a small near object from a large far one.`,
    i: `Project the point (1, 0.5, 5) m with f = 800 px and principal point (320, 240).`,
    c: py`
import numpy as np

f, cx, cy = 800.0, 320.0, 240.0
K = np.array([[f, 0, cx], [0, f, cy], [0, 0, 1]])
P = np.array([1.0, 0.5, 5.0])
u = K @ P
print((u[:2] / u[2]).tolist())
print(f * 2 / 10, f * 2 / 5)`,
    v: plot("Image offset of a point 2 m to the side against its depth.", {
      x: [1, 20], y: [0, 1600], labels: ["depth Z (m)", "pixels from the centre"],
      params: [par("f", "focal length (px)", 400, 1600, 100, 800)],
      readout: ["at Z = 10 m: {f*2/10:1} px; at Z = 5 m: {f*2/5:1} px"],
      steps: [["f = 800: 160 px at 10 m.", { f: 800 }], ["Longer focal length: larger image.", { f: 1600 }]],
    }, [curve("f*2/x", { c: "accent" }), pt("10", "f*2/10", { c: "bad" })]),
  },
  {
    t: "Stereo vision and depth from disparity",
    lv: 2,
    s: `Two cameras a distance B (the {{baseline}}) apart see the same point at slightly different horizontal positions; the difference is the {{disparity}} d. Triangulation gives {{Z = f·B / d}}. With f = 700 px, B = 0.1 m and d = 14 px: Z = 700 × 0.1 / 14 = 5 m. Nearby points have large disparity, far ones small, so depth precision falls quickly with distance: at d = 1 px the depth is 70 m, and an error of one pixel there is enormous. Finding which pixel matches which (stereo matching) is the hard part; textureless or repeated regions are ambiguous.`,
    r: `A wider baseline improves far-range accuracy but makes matching harder and the rig bulkier.`,
    i: `Compute the depth for f = 700 px, B = 0.1 m, d = 14 px.`,
    c: py`
f, B = 700.0, 0.1
for d in (50, 14, 7, 1):
    print(d, round(f * B / d, 2))`,
    v: plot("Depth against disparity: far objects have tiny disparities.", {
      x: [1, 50], y: [0, 70], labels: ["disparity d (px)", "depth Z (m)"],
      params: [par("B", "baseline B (m)", 0.05, 0.5, 0.05, 0.1)],
      readout: ["d = 14 px → Z = 700 × {B} / 14 = {700*B/14:2} m"],
      steps: [["B = 0.1 m: 5 m at 14 px.", { B: 0.1 }], ["B = 0.4 m: the same disparity means 20 m.", { B: 0.4 }]],
    }, [curve("700*B/x", { c: "accent" }), pt("14", "700*B/14", { c: "bad" })]),
  },
  {
    t: "Homography: mapping one plane to another",
    lv: 2,
    s: `Two views of a flat object (a document, a wall, a court) are related by a {{homography}}: a 3 × 3 matrix H with eight degrees of freedom. A point (x, y) maps to (x′, y′) = (h₁·p / h₃·p, h₂·p / h₃·p) with p = (x, y, 1) — the division is what makes it projective. Four point correspondences determine H. Uses: straightening a photographed document, stitching panoramas from a rotating camera, overlaying graphics on planes. For H = [[1, 0, 2], [0, 1, 3], [0.001, 0, 1]] the point (100, 50) maps to (102 / 1.1, 53 / 1.1) = (92.7, 48.2).`,
    r: `Use RANSAC to estimate H robustly when some correspondences are wrong.`,
    i: `How many point correspondences are needed to determine a homography and why?`,
    c: py`
import numpy as np

H = np.array([[1, 0, 2], [0, 1, 3], [0.001, 0, 1]])
p = H @ [100, 50, 1]
print(p.round(2).tolist(), (p[:2] / p[2]).round(1).tolist())
print(2 * 4, 9 - 1)`,
    v: compare("Transform families and their degrees of freedom.", ["Degrees of freedom", "Keeps"], [
      ["Translation", "2", "everything but position"],
      ["Rigid (rotation + translation)", "3", "lengths and angles"],
      ["Similarity (+ uniform scale)", "4", "angles, length ratios"],
      ["Affine", "6", "parallel lines"],
      ["Homography", "8", "straight lines only"],
    ]),
  },
];

/* ------------------------------------------------------------------ */
export const feat: ConceptDef[] = [
  {
    t: "Corners: the Harris detector",
    lv: 2,
    s: `Good features are places that can be located precisely: corners. Look at the 2 × 2 structure matrix M = Σ [[Iₓ², IₓI_y], [IₓI_y, I_y²]] over a window. Two large eigenvalues → a {{corner}} (intensity changes in every direction); one large, one small → an {{edge}}; both small → a {{flat}} area. Harris scores R = det M − k (trace M)² with k ≈ 0.05: M = diag(2, 2) gives R = 4 − 0.05·16 = 3.2 (corner), M = diag(2, 0.01) gives R ≈ −0.18 (edge), M ≈ 0 gives R ≈ 0 (flat). Corners are then picked as local maxima of R above a threshold.`,
    r: `Harris corners are rotation-invariant but not scale-invariant; SIFT/ORB add scale.`,
    i: `Classify the structure matrices diag(2, 2) and diag(2, 0.01) with the Harris response.`,
    c: py`
import numpy as np

for name, M in {"corner": np.diag([2.0, 2.0]), "edge": np.diag([2.0, 0.01]), "flat": np.diag([0.01, 0.01])}.items():
    R = np.linalg.det(M) - 0.05 * np.trace(M) ** 2
    print(name, np.linalg.eigvalsh(M).round(2).tolist(), round(float(R), 3))`,
    v: bars("Harris response for structure matrix diag(λ₁, λ₂).", [["R = λ₁λ₂ − 0.05(λ₁ + λ₂)²", "a*b-0.05*pow(a+b,2)"]], {
      max: 4,
      params: [par("a", "λ₁", 0, 2, 0.05, 2), par("b", "λ₂", 0, 2, 0.05, 2)],
      readout: ["λ₁ = {a}, λ₂ = {b} → R = {a*b-0.05*pow(a+b,2):2} (large positive = corner, negative = edge)"],
      steps: [["Both large: a corner.", { a: 2, b: 2 }], ["One small: an edge, R < 0.", { a: 2, b: 0.01 }], ["Both small: flat.", { a: 0.01, b: 0.01 }]],
    }),
  },
  {
    t: "Template matching and normalised cross-correlation",
    lv: 1,
    s: `To find a known small image (the template) inside a larger one, slide it over every position and measure the similarity. Raw correlation is fooled by brightness, so use {{normalised cross-correlation}}: subtract each patch's mean, divide by its norm, take the dot product; the result lies in [−1, 1] and ignores brightness and contrast changes. A patch (2, 4, 6) matches the template (1, 2, 3) perfectly: NCC = 1.0. It is simple and exact for fixed appearance, but fails under rotation, scale change or occlusion.`,
    r: `Good for UI testing and fixed-camera inspection; use features or learning for general objects.`,
    i: `Compute the NCC between (1, 2, 3) and (2, 4, 6) and between (1, 2, 3) and (3, 2, 1).`,
    c: py`
import numpy as np

def ncc(a, b):
    a, b = a - a.mean(), b - b.mean()
    return float((a * b).sum() / np.sqrt((a * a).sum() * (b * b).sum()))

t = np.array([1.0, 2.0, 3.0])
print(round(ncc(t, 2 * t), 3), round(ncc(t, t[::-1]), 3), round(ncc(t, t + 50), 3))`,
    v: compare("Similarity of a patch to the template (1, 2, 3).", ["NCC"], [
      ["(2, 4, 6) — twice as bright", "1.0"],
      ["(51, 52, 53) — shifted brightness", "1.0"],
      ["(3, 2, 1) — reversed", "−1.0"],
      ["(1, 3, 2) — different pattern", "0.5"],
    ]),
  },
  {
    t: "Local descriptors: SIFT, ORB and HOG",
    lv: 2,
    s: `A detected keypoint is described by a vector summarising its neighbourhood, so it can be matched in another image. {{SIFT}} finds scale-space extrema and builds a 128-number descriptor: 4 × 4 spatial cells × 8 gradient-orientation bins, normalised against lighting. {{ORB}} uses binary tests and is fast and free. {{HOG}} (histogram of oriented gradients) counts gradient directions inside cells of a window: a cell with strong vertical edges puts its weight in the 0° bin. HOG + a linear classifier was the classic pedestrian detector before deep learning.`,
    r: `Descriptors are designed to be invariant to small shifts, lighting changes and (SIFT) rotation and scale.`,
    i: `Why does SIFT have 128 dimensions?`,
    c: py`
import numpy as np

def hog_cell(gx, gy, bins=9):
    mag = np.hypot(gx, gy)
    ang = np.degrees(np.arctan2(gy, gx)) % 180
    hist = np.zeros(bins)
    for m, a in zip(mag.ravel(), ang.ravel()):
        hist[int(a // (180 / bins)) % bins] += m
    return hist

gx = np.array([[4.0, 4.0], [4.0, 4.0]])
gy = np.zeros((2, 2))
print(hog_cell(gx, gy).tolist(), 4 * 4 * 8)`,
    v: cells("A HOG cell with only horizontal gradients (vertical edges).", [P("orientation bin", ["0°", "20°", "40°", "60°", "80°", "100°", "120°", "140°", "160°"]), P("weight", ["16", "0", "0", "0", "0", "0", "0", "0", "0"])], [
      ["Nine orientation bins from 0° to 160°."],
      ["Four pixels each with gradient magnitude 4 at 0° vote 16 in total for the first bin.", [[1, 0, 0]]],
    ]),
  },
  {
    t: "Matching features: nearest neighbour and the ratio test",
    lv: 2,
    s: `To find the same point in two images, match each descriptor to its nearest neighbour in the other image by Euclidean (or Hamming) distance. Some matches are wrong because the feature is ambiguous. Lowe's {{ratio test}} keeps a match only if the best distance is clearly smaller than the second-best: d₁/d₂ < 0.75. d₁ = 0.3, d₂ = 0.9 → ratio 0.33: accept. d₁ = 0.6, d₂ = 0.7 → 0.86: reject (the second candidate is almost as good, so the choice is unreliable). Cross-checking (the match must be mutual) removes more errors.`,
    r: `After matching, still expect outliers: robust fitting (RANSAC) is the next step.`,
    i: `Apply the ratio test to the two matches above.`,
    c: py`
import numpy as np

pairs = [(0.3, 0.9), (0.6, 0.7), (0.2, 0.25)]
for d1, d2 in pairs:
    print(d1, d2, round(d1 / d2, 2), "accept" if d1 / d2 < 0.75 else "reject")`,
    v: bars("Ratio d₁/d₂ for the chosen distances (accept below 0.75).", [["ratio", "d1/d2"], ["threshold", "0.75"]], {
      max: 1.2,
      params: [par("d1", "best distance d₁", 0.05, 1, 0.05, 0.3), par("d2", "second-best d₂", 0.1, 1.2, 0.05, 0.9)],
      readout: ["ratio = {d1}/{d2} = {d1/d2:2}"],
      steps: [["A distinctive match: accept.", { d1: 0.3, d2: 0.9 }], ["Ambiguous: reject.", { d1: 0.6, d2: 0.7 }]],
    }),
  },
  {
    t: "RANSAC: fitting a model despite outliers",
    lv: 2,
    s: `Least squares is ruined by a few wrong matches. {{RANSAC}} repeatedly (1) draws the minimal number of points s needed to define the model (2 for a line, 4 for a homography), (2) fits the model, (3) counts the points that agree within a tolerance (inliers), and keeps the model with the most inliers. How many tries? With inlier fraction w and wanted success probability p, N = ln(1 − p) / ln(1 − wˢ): for a line (s = 2), w = 0.5 and p = 0.99 that is ln 0.01 / ln 0.75 = 16.0, so 17 tries; for a homography (s = 4) with the same w it is 72. The final model is refit on all inliers.`,
    r: `More outliers or a bigger model need many more iterations; check w with a quick estimate.`,
    i: `How many RANSAC iterations are needed for a line with 50% inliers and 99% confidence?`,
    c: py`
import numpy as np

n = lambda p, w, s: np.log(1 - p) / np.log(1 - w ** s)
print(round(float(n(0.99, 0.5, 2)), 1), int(np.ceil(n(0.99, 0.5, 2))), int(np.ceil(n(0.99, 0.5, 4))))
rng = np.random.default_rng(0)
x = np.arange(20.0)
y = 2 * x + 1 + rng.normal(0, 0.3, 20)
y[[3, 8, 15]] += 40
best = (0, None)
for _ in range(50):
    i, j = rng.choice(20, 2, replace=False)
    m = (y[j] - y[i]) / (x[j] - x[i])
    b = y[i] - m * x[i]
    inl = int((abs(y - (m * x + b)) < 1).sum())
    if inl > best[0]:
        best = (inl, (round(float(m), 2), round(float(b), 2)))
print(best)`,
    v: plot("Iterations needed against the inlier fraction (99% confidence).", {
      x: [0.2, 0.9], y: [0, 100], labels: ["inlier fraction w", "iterations N"],
      params: [par("s", "points per model s", 2, 8, 1, 2)],
      readout: ["w = 0.5: N = ln(0.01) / ln(1 − 0.5^{s}) = {ln(0.01)/ln(1-pow(0.5,s)):1}"],
      steps: [["Line (s = 2): about 17 tries.", { s: 2 }], ["Homography (s = 4): about 72.", { s: 4 }]],
    }, [curve("ln(0.01)/ln(1-pow(x,s))", { c: "accent" })]),
  },
  {
    t: "Putting it together: image stitching",
    lv: 2,
    s: `A panorama combines every idea of this area: detect keypoints and descriptors in two overlapping photos; match them with the ratio test; estimate the homography with RANSAC; warp one image into the other's frame with interpolation; blend the overlap to hide seams and exposure differences. Each step can fail in its own way (too few features in a blank sky, parallax from a moving camera, moving people), so the pipeline checks the number of inliers and refuses to stitch when it is too low.`,
    r: `The same pipeline underlies visual odometry, image registration and augmented reality.`,
    i: `List the steps of image stitching and a failure mode of each.`,
    c: py`
steps = ["detect keypoints", "describe", "match + ratio test", "RANSAC homography", "warp + interpolate", "blend"]
fails = ["blank regions", "lighting change", "repeated texture", "too few inliers", "parallax", "visible seams"]
for s, f in zip(steps, fails):
    print(f"{s:20s} -> {f}")`,
    v: rowflow("A panorama pipeline.", ["Two photos", "Keypoints + descriptors", "Matches (ratio test)", "Homography (RANSAC)", "Warp and blend", "Panorama"], [
      "Overlapping views.",
      "Corners and their descriptors.",
      "Keep distinctive matches.",
      "Robustly estimate the plane mapping.",
      "Resample, then hide the seam.",
      "One wide image.",
    ]),
  },
];

void [P, bars, cells, compare, curve, hline, par, plot, pt, seg, vline, rowflow];
